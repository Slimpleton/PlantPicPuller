import { catchError, concatMap, delay, map, mergeMap, switchMap } from "rxjs/operators";
import { INaturalistService } from "./inaturalist.service";
import { defer, forkJoin, of } from "rxjs";
import { WhatGrowsNativeHereService } from "./whatgrowsnativehere.service";
import { PlantData, ProcessedObservationPhoto } from "./models";
import { fromFetch } from "rxjs/fetch";
import { ImageService } from "./image.service";

const iNaturalistService = new INaturalistService();
const mySiteService = new WhatGrowsNativeHereService();
const timeBetweenSpeciesRequestBundlesMs = 2_000;

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
            }),
        )
    ),
    map(({ plant, taxaJson, obsJson }) => {
        // Taxa image (optional)
        const taxaImage$ = taxaJson?.results?.[0]?.default_photo?.url
            ? fromFetch<ArrayBuffer>(taxaJson.results[0].default_photo.url, {
                selector: ImageService.getArrayBuffer,
            }).pipe(ImageService.CreateImageAndThumbnail())
            : of(null);

        // One forkJoin per observation (all photos in that obs in parallel)
        // TODO rethink this, it makes pairing the license metadata to each individual image difficult
        const processedObsPhotos: ProcessedObservationPhoto[] = obsJson.results!.map(obs =>
            ImageService.toProcessedObservationPhoto(
                (obs.photos ?? []).map(photo =>
                    fromFetch<ArrayBuffer>(photo.url!, { selector: ImageService.getArrayBuffer })
                        .pipe(ImageService.CreateImageAndThumbnail())
                ),
                obs,
            )
        );
        return {
            plant: plant,
            taxaImages: ImageService.toProcessedTaxonPhoto(taxaImage$, taxaJson?.results?.[0] ?? null),
            obsImageGroups: processedObsPhotos,
        };
    }),
    switchMap(({ plant, taxaImages, obsImageGroups: obsImageGroups$ }) => {
        const symbol = plant.acceptedSymbol;
        if (!taxaImages) {

        }
        // TODO use the plant info and each of the generated images /metadata to create a url for each and premade csv rows to insert/create
        return of();
    }),
    // TODO how to store the name of each file and how it maps to each species. 
    // prob need a csv map or json? maybe a csv column thats delimited diff 
    // store metadata in csv
    // TODO upload to tigris with naming schema set / metadata somehow 
    catchError((err) => { console.error(err); return of(); })
).subscribe({
    next: () => console.log('got to the end'),
    error: (err) => console.error(err),
});




// TODO make sure to credit those with cc-by and even cc-0 cuz i luv yall save dat metadata

