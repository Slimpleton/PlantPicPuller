import { fromFetch } from 'rxjs/fetch';
import { catchError, EMPTY, Observable, of, switchMap } from 'rxjs';
import { ObservationsResponse, TaxaShowResponse } from './models';
import { retryExponential } from './main';

export class INaturalistService {
    private static readonly _BASE_URL: string = 'https://api.inaturalist.org/v1/'
    public constructor() { }

    public getObservation(id: number): Observable<ObservationsResponse> {

        if (Number.isNaN(id)) return EMPTY;

        const perPageAmount: number = 15;
        const params = new URLSearchParams({
            'quality_grade': 'research',
            'photos': true.toString(),
            'native': true.toString(),
            'captive': false.toString(),
            'geo': true.toString(),
            'license': 'cc0,cc-by',
            'photo_license': 'cc0,cc-by',
            'taxon_id': String(id),
            'per_page': String(perPageAmount),
            'order_by': 'votes',
            'order': 'desc',
        });

        const url: URL = new URL(`${INaturalistService._BASE_URL}observations?${params}`);
        return fromFetch(url.toString()).pipe(
            retryExponential(),
            switchMap((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status} ${response.statusText} ${url}`);
                }
                return response.json() as Promise<ObservationsResponse>;
            }),
            catchError((err) => {
                console.error(`getObservation failed for id ${id}:`, err);
                return EMPTY;
            })
        );
    }

    public getTaxa(id: number): Observable<TaxaShowResponse | null> {
        const perPageAmount: number = 1;
        // TODO handle not finding taxon for subspecies
        if (Number.isNaN(id))
            return EMPTY;

        const params = new URLSearchParams({
            'quality_grade': 'research',
            'license': 'cc0,cc-by',
            'photo_license': 'cc0,cc-by',
            'taxon_id': String(id),
            'per_page': String(perPageAmount),
            'order_by': 'votes',
            'order': 'desc',
        });

        const url: URL = new URL(`${INaturalistService._BASE_URL}taxa?${params}`);
        return fromFetch(url.toString()).pipe(
            retryExponential(),
            switchMap((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status} ${response.statusText} ${url}`);
                }
                return response.json() as Promise<TaxaShowResponse>;
            }),
            catchError((err) => {
                console.error(`getTaxa failed for id ${id}:`, err);
                return EMPTY;
            })
        );
    }

    public getTaxonForId(scientificName: string): Observable<number> {
        const cleanedName = scientificName
            .replace(/\b(var|subsp|ssp|f|cv)\.\s*/gi, '')
            .trim();

        return this.getTaxonByName(cleanedName);
    }

    private getTaxonByName(name: string): Observable<number> {
        const words = name.trim().split(/\s+/);

        // Nothing left to try
        if (words.length === 0) {
            return of(Number.NaN);
        }

        const taxaParams = new URLSearchParams({
            'q': name,
            'is_active': 'true',
            'per_page': '1'
        });

        return fromFetch(`${INaturalistService._BASE_URL}taxa/autocomplete?${taxaParams}`).pipe(
            retryExponential(),
            switchMap((res: any) => res.json()),
            switchMap((json: any) => {
                const result = json.results?.[0] ?? null;

                if (result == null) {
                    console.warn(`No taxon found for "${name}", skipping`);
                    return EMPTY;
                }

                // Sanity check: make sure the match isn't suspiciously unrelated
                const matchedName: string = (result.matched_term ?? result.name ?? '').toLowerCase();
                const firstWord = name.split(' ')[0].toLowerCase();
                if (!matchedName.includes(firstWord)) {
                    console.warn(`Suspicious match: queried "${name}", got "${matchedName}", skipping`);
                    return EMPTY;
                }

                return of(result.id as number);
            }),
            catchError((err) => {
                console.error('name: ' + name, err);
                return EMPTY;
            }),
        );
    }
}