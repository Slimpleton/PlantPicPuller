import { catchError, concatMap, delay, filter, map, mergeMap, retry, startWith, switchMap } from "rxjs/operators";
import { INaturalistService } from "./inaturalist.service";
import { defer, EMPTY, forkJoin, Observable, of, pipe, Subject, timer, UnaryFunction } from "rxjs";
import { WhatGrowsNativeHereService } from "./whatgrowsnativehere.service";
import { CsvObservation, CsvObservationPhoto, CsvTaxon, Photo, PlantData, ProcessedObservationPhotoAndMetadata, ProcessedPhotoGroup, ProcessedTaxonPhotoAndMetadata } from "./models";
import { fromFetch } from "rxjs/fetch";
import { ImageService } from "./image.service";
import fs from 'fs';
import { put } from "@tigrisdata/storage";
export const timeBetweenRequestMs = 5_000;
export function retryExponential<T>(): UnaryFunction<Observable<T>, Observable<T>> {
    return pipe(retry({
        count: 3,
        delay: (_, retryCount) => timer(timeBetweenRequestMs * Math.pow(3, retryCount))
    }));
}
const iNaturalistService = new INaturalistService();
const mySiteService = new WhatGrowsNativeHereService();

const CSV_TAXON_KEYS: (keyof CsvTaxon)[] = [
    'acceptedSymbol', 'id', 'name', 'preferred_common_name', 'colors',
    'photo_id', 'photo_attribution', 'photo_license_code', 'photo_url'
];
const taxonCsvHeader: string = CSV_TAXON_KEYS.join(',');
const taxonCsvName: string = getCsvName('TAXON');
const taxonCsvWriter: Subject<CsvTaxon> = new Subject<CsvTaxon>();
const taxonFileStream = fs.createWriteStream(taxonCsvName);

taxonCsvWriter.pipe(
    startWith(null),
    map((row: CsvTaxon | null) =>
        row === null ?
            taxonCsvHeader + '\r\n'
            : `${row.acceptedSymbol},${row.id},${row.name},${row.preferred_common_name},${row.colors?.join('|')},${row.photo_id},${row.photo_attribution},${row.photo_license_code},${row.photo_url}\r\n`
    )).subscribe({
        next: (line) => taxonFileStream.write(line),
        error: (err) => console.error(err),
        complete: () => taxonFileStream.close(),
    });


const CSV_OBSERVATION_KEYS: (keyof CsvObservation)[] = ['acceptedSymbol', 'id', 'uuid', 'observed_on', 'license_code', 'location',
    'user_name', 'user_id', 'user_icon_url'];
const observationCsvHeader: string = CSV_OBSERVATION_KEYS.join(',');
const observationCsvName = getCsvName('OBSERVATIONS');
const observationCsvWriter: Subject<CsvObservation> = new Subject<CsvObservation>();
const observationFileStream = fs.createWriteStream(observationCsvName);

observationCsvWriter.pipe(
    startWith(null),
    map((row: CsvObservation | null) =>
        row === null ? observationCsvHeader + '\r\n' :
            `${row.acceptedSymbol},${row.id},${row.uuid},${row.observed_on},${row.license_code},${row.location},${row.user_name},${row.user_id},${row.user_icon_url}`
    )).subscribe({
        next: (line) => observationFileStream.write(line),
        error: (err) => console.error(err),
        complete: () => observationFileStream.close(),
    });

const CSV_OBSERVATION_PHOTO_KEYS: (keyof CsvObservationPhoto)[] = ['acceptedSymbol', 'observation_id',
    'id', 'url', 'attribution', 'license_code'];
const observationPhotoCsvHeader: string = CSV_OBSERVATION_PHOTO_KEYS.join(',');
const observationPhotoCsvName = getCsvName('OBSERVATION_PHOTOS');
const observationPhotoCsvWriter: Subject<CsvObservationPhoto> = new Subject<CsvObservationPhoto>();
const observationPhotoFileStream = fs.createWriteStream(observationPhotoCsvName);

observationPhotoCsvWriter.pipe(
    startWith(null),
    map((row: CsvObservationPhoto | null) =>
        row == null ? observationPhotoCsvHeader + '\r\n'
            : `${row.acceptedSymbol},${row.observation_id},${row.id},${row.url},${row.attribution},${row.license_code}\r\n`
    )).subscribe({
        next: (line) => observationPhotoFileStream.write(line),
        error: (err) => console.error(err),
        complete: () => observationPhotoFileStream.close(),
    });

const concurrentPlantsProcessing = 3;
// TAXA is good for one best photo, maybe do a secondary set of photos from observations for each? 

mySiteService.getPlantData().pipe(
    mergeMap((x: readonly PlantData[]) => x),
    mergeMap((plant: PlantData) =>
        of(plant.scientificName).pipe(
            switchMap((name) => iNaturalistService.getTaxonForId(name)),
            // launch the taxa and the observations side by side
            switchMap((id) =>
                of(id).pipe(
                    switchMap(() => iNaturalistService.getTaxa(id)),
                    delay(timeBetweenRequestMs),
                    switchMap((taxaJson) =>
                        iNaturalistService.getObservation(id).pipe(
                            map((obsJson) => ({ taxaJson, obsJson })))),
                    delay(timeBetweenRequestMs),
                )),
            map(({ taxaJson, obsJson }) => {
                const taxaResult = taxaJson?.results?.[0];
                if (taxaResult?.default_photo?.url) {
                    taxaResult.default_photo.url = taxaResult.default_photo.url.replace('square', 'original');
                }

                for (const result of obsJson.results ?? []) {
                    // remove photos that dont have the correct photo license so we dont save them at this point
                    result.photos = result.photos?.filter((x) => x.license_code == 'cc-by' || x.license_code == 'cc0');
                    result.photos?.forEach(photo => {
                        if (photo.url) photo.url = photo.url.replace('square', 'original');
                    });

                }

                return { plant, taxaJson, obsJson };
            }),
            catchError((err) => {
                console.error(`Failed for ${plant.scientificName}:`, err);
                return EMPTY;
            })), concurrentPlantsProcessing),
    filter(({ plant, taxaJson, obsJson }) => {
        const photoFound = !!taxaJson?.results?.[0]?.default_photo?.url;
        if (!photoFound)
            console.warn(`No taxa photo for ${plant.scientificName}`);
        return photoFound;
    }),
    concatMap(({ plant, taxaJson, obsJson }) => {
        const symbol = plant.acceptedSymbol;
        const taxaResult = taxaJson?.results?.[0];

        const resolvedTaxa$ = taxaResult?.default_photo?.url
            ? fromFetch<ArrayBuffer>(taxaResult.default_photo.url, {
                selector: ImageService.getArrayBuffer,
            }).pipe(
                ImageService.CreateImageAndThumbnail(),
                map(images => ImageService.toProcessedTaxonPhoto(images, taxaResult)),
                concatMap(taxa => {
                    taxa = taxa as ProcessedTaxonPhotoAndMetadata;
                    const [fullUrl, thumbUrl] = getTigrisTaxonPhotoUrls(symbol, taxa);
                    return forkJoin([
                        defer(() => put(fullUrl, taxa.images![0], { multipart: true })),
                        defer(() => put(thumbUrl, taxa.images![1], { multipart: true })),
                    ]).pipe(map(([fullSizeUpload, thumbnailUpload]) => {
                        if (fullSizeUpload.error) throw new Error(`Full size upload failed for ${fullUrl}: ${fullSizeUpload.error.message}`);
                        if (thumbnailUpload.error) throw new Error(`Thumbnail upload failed for ${thumbUrl}: ${thumbnailUpload.error.message}`);

                        return ({ ...taxa, taxaResult, url: fullUrl });
                    }));
                })
            )
            : of(null);

        const resolvedObs$ = obsJson.results!.length > 0
            ? forkJoin(
                obsJson.results!.map(obs => {
                    const photoStreams = (obs.photos ?? []).map((photo, i) =>
                        fromFetch<ArrayBuffer>(photo.url!, { selector: ImageService.getArrayBuffer }).pipe(
                            ImageService.CreateImageAndThumbnail(),
                            concatMap((group: ProcessedPhotoGroup) => {
                                const processed = { ...obs, imageGroups: [group] } as ProcessedObservationPhotoAndMetadata;
                                const [fullUrl, thumbUrl] = getTigrisObservationPhotoUrls(symbol, processed, photo);
                                return forkJoin([
                                    defer(() => put(fullUrl, group![0], { multipart: true })),
                                    defer(() => put(thumbUrl, group![1], { multipart: true })),
                                ]).pipe(map(([fullSizeUpload, thumbnailUpload]) => {
                                    if (fullSizeUpload.error) throw new Error(`Full size upload failed for ${fullUrl}: ${fullSizeUpload.error.message}`);
                                    if (thumbnailUpload.error) throw new Error(`Thumbnail upload failed for ${thumbUrl}: ${thumbnailUpload.error.message}`);

                                    return ({ ...photo, url: fullUrl })
                                }));
                            })
                        )
                    );
                    return photoStreams.length > 0
                        ? forkJoin(photoStreams).pipe(
                            map(uploadedPhotos => ({ ...obs, photos: uploadedPhotos }))
                        )
                        : of({ ...obs, photos: [] });
                })
            )
            : of([]);

        return forkJoin({ taxa: resolvedTaxa$, obsGroups: resolvedObs$ }).pipe(
            map(({ taxa, obsGroups }) => ({ plant, taxa, obsGroups }))
        );
    }),
    // now the final concatMap is just CSV writes, all uploads already done
    concatMap(({ plant, taxa, obsGroups }) => {
        const symbol = plant.acceptedSymbol;

        if (taxa) {
            taxonCsvWriter.next({
                acceptedSymbol: symbol,
                id: taxa.taxaResult?.id,
                name: taxa.taxaResult?.name,
                preferred_common_name: taxa.taxaResult?.preferred_common_name,
                colors: taxa.taxaResult?.colors,
                photo_id: taxa.id,
                photo_attribution: taxa.attribution,
                photo_license_code: taxa.license_code,
                photo_url: taxa.url,
            });
        }

        for (const obs of obsGroups) {
            observationCsvWriter.next({
                acceptedSymbol: symbol,
                id: obs.id,
                uuid: obs.uuid,
                observed_on: obs.observed_on,
                license_code: obs.license_code,
                location: obs.location,
                user_name: obs.user?.name,
                user_id: obs.user?.id,
                user_icon_url: obs.user?.icon_url,
            });

            obs.photos?.forEach(photo => {
                observationPhotoCsvWriter.next({
                    acceptedSymbol: symbol,
                    observation_id: obs.id!,
                    id: photo.id,
                    url: photo.url,  // already the tigris url
                    attribution: photo.attribution,
                    license_code: photo.license_code,
                });
            });
        }
        return of(plant);
    }),
    // store metadata in csv
    catchError((err) => { console.error(err); return EMPTY; })
).subscribe({
    next: (plant) => console.log(`got to the end for ${plant.acceptedSymbol} aka ${plant.scientificName}/${plant.commonName}`),
    error: (err) => console.error(err),
    complete: () => {
        console.log('fin');
        taxonCsvWriter.complete();
        observationCsvWriter.complete();
        observationPhotoCsvWriter.complete();
    }
});


function getCsvName(category: string): string {
    return `./assets/INaturalist_${category}_${Date.now()}.csv`;
}

function getTigrisTaxonPhotoUrls(symbol: string, metaData: ProcessedTaxonPhotoAndMetadata): [string, string] {
    const ext = '.avif';
    const fullSizeUrl = `${symbol}_taxon_${metaData.id}`;
    const thumbnailUrl = fullSizeUrl + '_tb';
    return [fullSizeUrl + ext, thumbnailUrl + ext];
}

function getTigrisObservationPhotoUrls(symbol: string, metaData: ProcessedObservationPhotoAndMetadata, photo: Photo): [string, string] {
    const ext = '.avif';
    const fullSizeUrl = `${symbol}_obs_${metaData.id}_${photo.id}`;
    const thumbnailUrl = fullSizeUrl + '_tb';
    return [fullSizeUrl + ext, thumbnailUrl + ext];
}

// TODO make sure to credit those with cc-by and even cc-0 cuz i luv yall save dat metadata

