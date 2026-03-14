import { fromFetch } from 'rxjs/fetch';
import { map, Observable, switchMap } from 'rxjs';

export class INaturalistService {
    private static readonly _BASE_URL: string = 'https://api.inaturalist.org/v1/'
    public constructor() { }

    public getObservation(scientificName: string): Observable<Response> {
        const perPageAmount: number = 25;

        return this.getTaxon(scientificName).pipe(
            switchMap((id) => {
                const params = new URLSearchParams({
                    'quality_grade': 'research',
                    'license': 'cc0,cc-by',
                    'photo_license': 'cc0,cc-by',
                    'taxon_id': String(id),
                    'per_page': String(perPageAmount),
                    'order_by': 'votes',
                    'order': 'desc',
                });
        
                const url: URL = new URL(`${INaturalistService._BASE_URL}observations?${params}`);
                return fromFetch(url.toString());
            }));
    }

    public getTaxa(scientificName: string): Observable<Response> {
        const perPageAmount: number = 25;

        return this.getTaxon(scientificName).pipe(
            switchMap((id: number) =>{
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
                return fromFetch(url.toString());
            })
        );
    }

    private getTaxon(scientificName: string): Observable<number> {
        const taxaParams = new URLSearchParams({
            'q': scientificName,
            'rank': 'species',
            'is_active': 'true',
            'per_page': '1'
        });
        return fromFetch(`${INaturalistService._BASE_URL}taxa?${taxaParams}`).pipe(
            switchMap((res) => res.json()),
            map((json) => json.results[0].id));
    }
}