import { defer, forkJoin, Observable, pipe, switchMap, UnaryFunction } from "rxjs";
import sharp from "sharp";
import { Observation, ProcessedObservationPhoto, ProcessedPhotoGroup, ProcessedTaxonPhoto, TaxonPhoto } from "./models";

export class ImageService {
    public constructor() { }

    public static CreateImageAndThumbnail(): UnaryFunction<Observable<ArrayBuffer>, Observable<[fullImage: Buffer<ArrayBufferLike>, thumbnail: Buffer<ArrayBufferLike>]>> {
        const maxThumbnailWidthPx = 400;

        return pipe(
            switchMap((buffer) => forkJoin([
                defer(() => sharp(buffer).avif({ quality: 100 }).toBuffer()),
                defer(() => sharp(buffer).resize(maxThumbnailWidthPx, null, { fit: 'inside' }).avif({ quality: 90 }).toBuffer())
            ])),
        )
    }

    public static getArrayBuffer(response: Response) {
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
        }
        return response.arrayBuffer() as Promise<ArrayBuffer>;
    }

    public static toProcessedTaxonPhoto(
        images: ProcessedPhotoGroup | null,
        taxonPhoto: TaxonPhoto | null
    ): ProcessedTaxonPhoto | null {
        if (!taxonPhoto)
            return null;
        const { id, attribution, license_code, url } = taxonPhoto;
        return { images: images, id, attribution, license_code, url };
    }

    public static toProcessedObservationPhoto(
        imageGroups$: Observable<ProcessedPhotoGroup>[],
        observationPhoto: Observation): ProcessedObservationPhoto {
        return { imageGroups$, ...observationPhoto };
    }
}