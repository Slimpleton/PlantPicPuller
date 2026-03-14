export interface Observation {

}

export class INaturalistService {
    private static readonly _BASE_URL: string = 'https://api.inaturalist.org/v1/'
    public constructor() { }

    public async getObservation(scientificName: string): Promise<Response> {
        const perPageAmount: number = 200;
        const params = new URLSearchParams ({
            'iconic_taxa': 'Plantae',
            'quality_grade': 'research',
            'license': 'cc0,cc-by',
            'photo_license': 'cc0,cc-by',
            'taxon_name': scientificName,
            'per_page': String(perPageAmount),
            'order_by':'created_at'
        });

        const url: URL = new URL(`${INaturalistService._BASE_URL}observations?${params}`);
        return fetch(url);
    }
}