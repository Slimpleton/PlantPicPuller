import { catchError, concatMap, delay, map, mergeMap, switchMap } from "rxjs/operators";
import { INaturalistService } from "./inaturalist.service";
import { defer, forkJoin, of } from "rxjs";
import { WhatGrowsNativeHereService } from "./whatgrowsnativehere.service";
import { PlantData } from "./models";
import sharp from "sharp";
import { fromFetch } from "rxjs/fetch";

const iNaturalistService = new INaturalistService();
const mySiteService = new WhatGrowsNativeHereService();
const timeBetweenSpeciesRequestBundlesMs = 1_000;
const maxThumbnailWidthPx = 400;

// TAXA is good for one best photo, maybe do a secondary set of photos from observations for each? 
// prob a way to do both the requests at once and combine the results

mySiteService.getPlantData().pipe(
    mergeMap((x: readonly PlantData[]) => x),
    concatMap((plant: PlantData) =>
        of(plant.scientificName).pipe( // TODO perhaps have to split up handling for these if i detect subspecies... could require a separate query
            delay(timeBetweenSpeciesRequestBundlesMs),
            mergeMap((name) => iNaturalistService.getTaxa(name)),
            mergeMap((x: Response) => defer(() => x.json())),
            map((json: any) => {
                console.log(json);
                // HACK only expecting one result rn, will change??
                if (json.results[0].default_photo != null)
                    json.results[0].default_photo.url = json.results[0].default_photo.url.replace('square', 'original');
                return { plant, json };  // <-- both available here
            }),
        )
    ),
    map(({ plant, json }) => {
        const images$ = fromFetch(json.results[0].default_photo.url).pipe(
            switchMap((response) => defer(() => response.arrayBuffer())),
            switchMap((buffer) => forkJoin([
                defer(() => sharp(buffer).avif({ quality: 100 }).toBuffer()),
                defer(() => sharp(buffer).resize(maxThumbnailWidthPx, null, { fit: 'inside' }).avif({ quality: 90 }).toBuffer())
            ])),
            map(([imgBuffer, thumbnailBuffer]) => {
                // TODO upload at this point?? we have the avifs saved in the proper quality / format / size 
            }),
            // TODO upload to tigris with naming schema set / metadata somehow 
        )
    }),
    catchError((err) => { console.error(err); return of(); })
).subscribe();

// TODO make sure to credit those with cc-by and even cc-0 cuz i luv yall save dat metadata

