import { catchError, concatMap, delay, map, mergeMap, switchMap, tap } from "rxjs/operators";
import { INaturalistService } from "./inaturalist.service";
import { defer, of } from "rxjs";
import { WhatGrowsNativeHereService } from "./whatgrowsnativehere.service";
import { PlantData } from "./models";

// upload to tigris with naming schema set / metadata somehow 
const iNaturalistService = new INaturalistService();
const mySiteService = new WhatGrowsNativeHereService();
const timeBetweenSpeciesRequestBundlesMs = 1_000;
// TODO get all scientific names of the native plants to use for pulling observations to cycle thru
// TODO limit api hits to 1 per second

// TAXA is good for one best photo, maybe do a secondary set of photos from observations for each? 
// prob a way to do both the requests at once and combine the results

// TODO use my websites api for all plants to cycle thru each one, debounce each subsequent request at 1s

mySiteService.getPlantData().pipe(
    mergeMap((x: readonly PlantData[]) => x),
    map((x: PlantData) => x.scientificName),
    concatMap((x: string) =>
        of(x).pipe(
            delay(timeBetweenSpeciesRequestBundlesMs),  // delay per item, not globally
            mergeMap((name) => iNaturalistService.getTaxa(name))
        )
    ),
    mergeMap((x: Response) => defer(() => x.json())),
    tap((json: any) => {
        console.log('json', json);
        json.results.forEach((observation: any) => {
            if (observation.default_photo != null) {
                observation.default_photo.url = observation.default_photo.url.replace('square', 'original');
            }
            console.log('observation', observation);
        });
    }),
    catchError((err) => { console.error(err); return of(); })
).subscribe();

// TODO use sharp to convert to avif format and make size srcsets for performance


