import { switchMap, tap } from "rxjs/operators";
import { INaturalistService } from "./inaturalist.service";
import { defer } from "rxjs";

// upload to tigris with naming schema set / metadata somehow 
const service = new INaturalistService();
const scientificName: string = 'Plagiobothrys Acanthocarpus';

// TODO get all scientific names of the native plants to use for pulling observations to cycle thru
// TODO limit api hits to 1 per second

// TAXA is good for one best photo, maybe do a secondary set of photos from observations for each? 
// prob a way to do both the requests at once and combine the results
service.getTaxa(scientificName).pipe(
    switchMap((x: Response) => defer(() => x.json())),
    tap((json: any) => {
        json.results.forEach((observation: any) => {
            if (observation.default_photo != null){
                observation.default_photo.url =  observation.default_photo.url.replace('square', 'original');
            }
        });
    }),
).subscribe();

// TODO use sharp to convert to avif format and make size srcsets for performance
