import { catchError, concatMap, delay, filter, map, mergeMap, startWith, switchMap, tap } from "rxjs/operators";
import { INaturalistService } from "./inaturalist.service";
import { defer, EMPTY, forkJoin, of, Subject } from "rxjs";
import { WhatGrowsNativeHereService } from "./whatgrowsnativehere.service";
import { CsvObservation, CsvObservationPhoto, CsvTaxon, PlantData, ProcessedPhotoGroup } from "./models";
import { fromFetch } from "rxjs/fetch";
import { ImageService } from "./image.service";
import fs from 'fs';

const iNaturalistService = new INaturalistService();
const mySiteService = new WhatGrowsNativeHereService();
const timeBetweenSpeciesRequestBundlesMs = 3_000;

const CSV_TAXON_KEYS: (keyof CsvTaxon)[] = [
    'id', 'name', 'preferred_common_name', 'colors',
    'photo_id', 'photo_attribution', 'photo_license_code', 'photo_url'
];
const taxonCsvHeader: string = CSV_TAXON_KEYS.join(',');
const taxonCsvName: string = getCsvName('TAXON');
const taxonCsvWriter: Subject<CsvTaxon> = new Subject<CsvTaxon>();
const taxonFileStream = fs.createWriteStream(taxonCsvName);

taxonCsvWriter.pipe(
    startWith(null),
    map((row: CsvTaxon | null) => {
        if (row === null) return taxonCsvHeader + '\r\n';
        return `${row.id},${row.name},${row.preferred_common_name},${row.colors?.join('|')},${row.photo_id},${row.photo_attribution},${row.photo_license_code},${row.photo_url}\r\n`
    })
).subscribe({
    next: (line) => taxonFileStream.write(line),
    error: (err) => console.error(err),
    complete: () => taxonFileStream.close(),
});


// TODO 
const CSV_OBSERVATION_KEYS: (keyof CsvObservation)[] = ['id'];
const observationCsvHeader: string = CSV_OBSERVATION_KEYS.join(',');
const observationCsvName = getCsvName('OBSERVATIONS');
const observationCsvWriter: Subject<CsvObservation> = new Subject<CsvObservation>(); // TODO type
const observationFileStream = fs.createWriteStream(observationCsvName);

observationCsvWriter.pipe(
    startWith(null),
    map((row: CsvObservation | null) => {
        if (row === null) return observationCsvHeader + '\r\n';


        // TODO make the observationCsv into the correct format
    })
).subscribe({
    next: (line) => observationFileStream.write(line),
    error: (err) => console.error(err),
    complete: () => observationFileStream.close(),
});

// TODO
const CSV_OBSERVATION_PHOTO_KEYS: (keyof CsvObservationPhoto)[] = ['id'];
const observationPhotoCsvHeader: string = CSV_OBSERVATION_PHOTO_KEYS.join(',');
const observationPhotoCsvName = getCsvName('OBSERVATION_PHOTOS');
const observationPhotoCsvWriter : Subject<CsvObservationPhoto> = new Subject<CsvObservationPhoto>();
const observationPhotoFileStream = fs.createWriteStream(observationPhotoCsvName);

observationPhotoCsvWriter.pipe(
    startWith(null),
    map((row: unknown | null) => {
        if (row == null) return observationPhotoCsvHeader + '\r\n';

        // TODO actual row
    })
).subscribe({
    next: (line) => observationPhotoFileStream.write(line),
    error: (err) => console.error(err),
    complete: () => observationPhotoFileStream.close(),
});
// TAXA is good for one best photo, maybe do a secondary set of photos from observations for each? 
// prob a way to do both the requests at once and combine the results

mySiteService.getPlantData().pipe(
    mergeMap((x: readonly PlantData[]) => x),
    concatMap((plant: PlantData) =>
        of(plant.scientificName).pipe(
            delay(timeBetweenSpeciesRequestBundlesMs),
            switchMap((name) => iNaturalistService.getTaxonForId(name)),
            // launch the taxa and the observations side by side
            mergeMap((id) => forkJoin([
                defer(() => iNaturalistService.getTaxa(id)),
                defer(() => iNaturalistService.getObservation(id)),
            ])),
            map(([taxaJson, obsJson]) => {
                const taxaResult = taxaJson?.results?.[0];
                if (taxaResult?.default_photo?.url) {
                    taxaResult.default_photo.url = taxaResult.default_photo.url.replace('square', 'original');
                }

                for (const result of obsJson.results ?? []) {
                    // TODO remove photos that dont have the correct photo license so we dont save them at this point
                    result.photos = result.photos?.filter((x) => x.license_code == 'cc-by' || x.license_code == 'cc0');
                    result.photos?.forEach(photo => {
                        if (photo.url) photo.url = photo.url.replace('square', 'original');
                    });

                }

                return { plant, taxaJson, obsJson };
            }))),
    tap(({ plant, taxaJson }) => {
        if (!taxaJson?.results?.[0]?.default_photo?.url) {
            console.warn(`No taxa photo for ${plant.scientificName}`);
        }
    }),
    filter(({ plant, taxaJson, obsJson }) => !!taxaJson?.results?.[0]?.default_photo?.url),
    concatMap(({ plant, taxaJson, obsJson }) => {
        const taxaResult = taxaJson?.results?.[0];

        const resolvedTaxa$ = taxaResult?.default_photo?.url
            ? fromFetch<ArrayBuffer>(taxaResult.default_photo.url, {
                selector: ImageService.getArrayBuffer,
            }).pipe(
                ImageService.CreateImageAndThumbnail(),
                map(images => ImageService.toProcessedTaxonPhoto(images, taxaResult)),
            )
            : of(null);

        const resolvedObs$ = obsJson.results!.length > 0
            ? forkJoin(
                obsJson.results!.map(obs => {
                    const photoStreams = (obs.photos ?? []).map(photo =>
                        fromFetch<ArrayBuffer>(photo.url!, { selector: ImageService.getArrayBuffer })
                            .pipe(ImageService.CreateImageAndThumbnail())
                    );
                    return photoStreams.length > 0
                        ? forkJoin(photoStreams).pipe(
                            map(imageGroups => ({ ...obs, imageGroups }))
                        )
                        : of({ ...obs, imageGroups: [] as ProcessedPhotoGroup[] });
                })
            )
            : of([]);

        return forkJoin({ taxa: resolvedTaxa$, obsGroups: resolvedObs$ }).pipe(
            map(({ taxa, obsGroups }) => ({ plant, taxa, obsGroups }))
        );
    }),
    concatMap(({ plant, taxa, obsGroups }) => {
        const symbol = plant.acceptedSymbol;

        return EMPTY;
        // TODO use the plant info and each of the generated images /metadata to create a url for each and premade csv rows to insert/create
    }),
    // TODO how to store the name of each file and how it maps to each species. 
    // prob need a csv map or json? maybe a csv column thats delimited diff 
    // store metadata in csv
    // TODO upload to tigris with naming schema set / metadata somehow 
    catchError((err) => { console.error(err); return EMPTY; })
).subscribe({
    next: () => console.log('got to the end'),
    error: (err) => console.error(err),
});


function getCsvName(category: string): string {
    return `../assets/INaturalist_${category}_${Date.now()}.csv`;
}


// TODO make sure to credit those with cc-by and even cc-0 cuz i luv yall save dat metadata

