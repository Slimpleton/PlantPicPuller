// TODO get images from inaturalist
// use sharp to convert to avif format and make size srcsets for performance
interface Photo {
    id: number;
    license_code: string;
    url: string;
    attribution: string;
    flags: [];
    moderator_actions: [];
    hidden: boolean;
}

import { switchMap, tap } from "rxjs/operators";
import { INaturalistService } from "./inaturalist.service";
import { defer } from "rxjs";

// upload to tigris with naming schema set / metadata somehow 
const service = new INaturalistService();
const scientificName: string = 'Plagiobothrys Acanthocarpus';

// TODO get all scientific names of the native plants to use for pulling observations to cycle thru

service.getObservation(scientificName).pipe(
    switchMap((x: Response) => defer(() => x.json())),
    tap((json: any) => {
        json.results.forEach((observation: any) => {
            if (observation.photos != null)
                observation.photos.forEach((photo: Photo) => {
                   photo.url = photo.url.replace('square', 'original');
                });
            console.log(observation.photos);
        });
    }),
).subscribe();

// TODO limit api hits to 1 per second