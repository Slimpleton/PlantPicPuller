import { defer, forkJoin, Observable, pipe, switchMap, UnaryFunction } from "rxjs";
import sharp from "sharp";
import { ProcessedPhotoGroup, ProcessedTaxonPhotoAndMetadata, TaxonPhoto } from "./models";

export class ImageService {
    public constructor() {
        const concThreads = 4;
        sharp.concurrency(concThreads);
    }

    public static CreateImageAndThumbnail(): UnaryFunction<Observable<ArrayBuffer>, Observable<[fullImage: Buffer<ArrayBufferLike>, thumbnail: Buffer<ArrayBufferLike>]>> {
        const maxThumbnailWidthPx = 400;

        return pipe(
            switchMap((buffer) => forkJoin([
                defer(() => sharp(buffer).avif({ quality: 100 }).toBuffer()),
                defer(() => sharp(buffer).resize(maxThumbnailWidthPx, null, { fit: 'inside' }).avif({ quality: 80 }).toBuffer())
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
    ): ProcessedTaxonPhotoAndMetadata | null {
        if (!taxonPhoto)
            return null;
        const { id, attribution, license_code, url } = taxonPhoto;
        return { images: images, id, attribution, license_code, url };
    }
}