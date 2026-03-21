import { fromFetch } from 'rxjs/fetch';
import { catchError, map, Observable, of, switchMap, throwError } from 'rxjs';
import { Observation, ObservationsResponse, TaxaShowResponse } from './models';

export class INaturalistService {
    private static readonly _BASE_URL: string = 'https://api.inaturalist.org/v1/'
    public constructor() { }

    public getObservation(scientificName: string): Observable<ObservationsResponse> {
        const perPageAmount: number = 15;

        return this.getTaxon(scientificName).pipe(
            switchMap((id: number) => {
                // TODO handle not finding taxon for subspecies

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
                return fromFetch<ObservationsResponse>(url.toString(), {
                    selector: (response) => {
                        if (!response.ok) {
                            throw new Error(`HTTP error: ${response.status} ${response.statusText} ${url}`);
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
                // TODO handle not finding taxon for subspecies
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
                                throw new Error(`HTTP error: ${response.status} ${response.statusText} ${url}`);
                            }
                            return response.json() as Promise<TaxaShowResponse>;
                        }
                    });
            })
        );
    }

    // TODO subspecies struggle with the regular taxa endpoint, swap to observations for those instead somehow?? detect subspecies difference in strings 
    private getTaxon(scientificName: string): Observable<number> {
        const isSubspecies = scientificName.trim().split(/\s+/).length >= 3;
        // todo maybe just fall back to parent for subspecies??? idk man its tough out here

        const taxaParams = new URLSearchParams({
            'q': scientificName,
            'rank': isSubspecies ? 'subspecies' : 'species',
            'is_active': 'true',
            'per_page': '1'
        });
        
        return fromFetch(`${INaturalistService._BASE_URL}taxa?${taxaParams}`).pipe(
            switchMap((res: any) => res.json()),
            // if theres a subspecies, this results[0] is gonna be undefined / null
            map((json: any) => {
                const id = json.results[0]?.id;
                if (id == null) throw new Error('Invalid number');
                return id as number;
            }),
     
            catchError((err) => { console.error('scientificName: ' + scientificName, err); return of(Number.NaN); }));
    }
}