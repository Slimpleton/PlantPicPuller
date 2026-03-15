import { defer, forkJoin, Observable, pipe, switchMap, UnaryFunction } from "rxjs";
import sharp from "sharp";

export class ImageService {
    public constructor() { }

    public static CreateImageAndThumbnail() :  UnaryFunction<Observable<ArrayBuffer>, Observable<[Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>]>> {
        const maxThumbnailWidthPx = 400;

        return pipe(
            switchMap((buffer) => forkJoin([
                defer(() => sharp(buffer).avif({ quality: 100 }).toBuffer()),
                defer(() => sharp(buffer).resize(maxThumbnailWidthPx, null, { fit: 'inside' }).avif({ quality: 90 }).toBuffer())
            ])),
        )
    }
}