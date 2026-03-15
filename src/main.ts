import { catchError, concatMap, delay, filter, map, mergeMap, switchMap, tap } from "rxjs/operators";
import { INaturalistService } from "./inaturalist.service";
import { defer, forkJoin, Observable, of } from "rxjs";
import { WhatGrowsNativeHereService } from "./whatgrowsnativehere.service";
import { PlantData } from "./models";
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
            // launch the taxa and the observations side by side
            mergeMap((name) => forkJoin([
                defer(() => iNaturalistService.getTaxa(name)),
                defer(() => iNaturalistService.getObservation(name)),
            ])),
            tap(([taxaJson, obsJson]) => {
                if (taxaJson?.results?.at(0)?.default_photo?.url != null) {
                    taxaJson.results.at(0)!.default_photo!.url = taxaJson.results.at(0)!.default_photo!.url!.replace('square', 'original');
                }

                for (const result of obsJson.results!) {
                    result.photos!.forEach(photo => {
                        photo.url = photo.url!.replace('square', 'original');
                    });
                }
            }),
            map(([json, obsJson]) => {
                return { plant, json, obsJson };  // <-- all available here
            }),
        )
    ),
    map(({ plant, json, obsJson }) => {
        if (json != null) {
            // TODO use this
            const taxaImages$ = fromFetch<ArrayBuffer>(json!.results![0].default_photo!.url!, {
                selector: (response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
                    }
                    return response.arrayBuffer() as Promise<ArrayBuffer>;
                },
            }).pipe(ImageService.CreateImageAndThumbnail());

        }

        const obsImageGroups$ = [];
        // TODO start a image thumbnail creation for each photo within each observation within this loop
        obsJson.results!.forEach(obs => {
            const imageGroup$: Observable<[Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>]>[] = [];
            // todo a forkjoin of photo requests per observable? 
            // todo a forkjoin of all observable photo requests total to get all of the finished ones
            obs.photos!.forEach(photo => {
                const image$ = fromFetch<ArrayBuffer>(photo.url!, {
                    selector: (response) => {
                        if (!response.ok) {
                            throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
                        }
                        return response.arrayBuffer() as Promise<ArrayBuffer>;
                    },
                }).pipe(ImageService.CreateImageAndThumbnail());

                imageGroup$.push(image$);
            });
            obsImageGroups$.push(imageGroup$);
        });

        // TODO upload to tigris with naming schema set / metadata somehow 
    }),
    catchError((err) => { console.error(err); return of(); })
).subscribe();

// TODO make sure to credit those with cc-by and even cc-0 cuz i luv yall save dat metadata

