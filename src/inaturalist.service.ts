import { fromFetch } from 'rxjs/fetch';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { Observation, ObservationsResponse, TaxaShowResponse } from './models';

export class INaturalistService {
    private static readonly _BASE_URL: string = 'https://api.inaturalist.org/v1/'
    public constructor() { }

    public getObservation(scientificName: string): Observable<ObservationsResponse> {
        const perPageAmount: number = 15;

        return this.getTaxon(scientificName).pipe(
            switchMap((id: number) => {
                const params = new URLSearchParams({
                    'quality_grade': 'research',
                    'photos': true.toString(),
                    'native': true.toString(),
                    'license': 'cc0,cc-by',
                    'photo_license': 'cc0,cc-by',
                    'taxon_id': String(id),
                    'per_page': String(perPageAmount),
                    'order_by': 'votes',
                    'order': 'desc',
                });

                const url: URL = new URL(`${INaturalistService._BASE_URL}observations?${params}`);
                return fromFetch<ObservationsResponse>(url.toString(), {
                    selector: (response) => {
                        if (!response.ok) {
                            throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
                        }
                        return response.json() as Promise<ObservationsResponse>;
                    },
                });
            }));
    }

    public getTaxa(scientificName: string): Observable<TaxaShowResponse | null> {
        const perPageAmount: number = 1;

        return this.getTaxon(scientificName).pipe(
            switchMap((id: number) => {
                if (Number.isNaN(id))
                    return of(null);

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
                return fromFetch<TaxaShowResponse>(url.toString(),
                    {
                        selector: (response) => {
                            if (!response.ok) {
                                throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
                            }
                            return response.json() as Promise<TaxaShowResponse>;
                        }
                    });
            })
        );
    }

    // TODO subspecies struggle with the regular taxa endpoint, swap to observations for those instead somehow?? detect subspecies difference in strings 
    private getTaxon(scientificName: string): Observable<number> {
        const taxaParams = new URLSearchParams({
            'q': scientificName,
            'rank': 'species',
            'is_active': 'true',
            'per_page': '1'
        });
        return fromFetch(`${INaturalistService._BASE_URL}taxa?${taxaParams}`).pipe(
            switchMap((res: any) => res.json()),
            // if theres a subspecies, this results[0] is gonna be undefined / null
            map((json: any) => json.results[0].id),
            catchError((err) => { console.error('scientificName: ' + scientificName, err); return of(NaN); }));
    }
}