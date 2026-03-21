import { catchError, concatMap, delay, filter, map, mergeMap, switchMap } from "rxjs/operators";
import { INaturalistService } from "./inaturalist.service";
import { defer, EMPTY, forkJoin, of } from "rxjs";
import { WhatGrowsNativeHereService } from "./whatgrowsnativehere.service";
import { PlantData, ProcessedObservationPhoto, ProcessedPhotoGroup } from "./models";
import { fromFetch } from "rxjs/fetch";
import { ImageService } from "./image.service";

const iNaturalistService = new INaturalistService();
const mySiteService = new WhatGrowsNativeHereService();
const timeBetweenSpeciesRequestBundlesMs = 3_000;

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
                    result.photos?.forEach(photo => {
                        if (photo.url) photo.url = photo.url.replace('square', 'original');
                    });
                }

                return { plant, taxaJson, obsJson };
            }))),
    filter(({ plant, taxaJson, obsJson }) => taxaJson?.results?.[0] != null),
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
    filter(({ plant, taxa, obsGroups }) => taxa != null),
    switchMap(({ plant, taxa, obsGroups }) => {

        const symbol = plant.acceptedSymbol;

        // TODO use the plant info and each of the generated images /metadata to create a url for each and premade csv rows to insert/create
        return of();
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




// TODO make sure to credit those with cc-by and even cc-0 cuz i luv yall save dat metadata

