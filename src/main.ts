// TODO get images from inaturalist
// use sharp to convert to avif format and make size srcsets for performance

import { INaturalistService } from "./inaturalist.service";

// upload to tigris with naming schema set / metadata somehow 
const service = new INaturalistService();
const scientificName: string = 'Plagiobothrys Acanthocarpus'
service.getObservation(scientificName).then(x => console.log(x));