import { from, map, Observable, switchMap } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { PlantData } from "./models";

export class WhatGrowsNativeHereService {
    public constructor() { }

    public getPlantData(): Observable<Readonly<PlantData[]>> {
        return fromFetch('https://whatgrowsnativehere.us.com/api/FileData/plantdata').pipe(
            switchMap(response => {
                if (!response.ok)
                    throw new Error(response.status + ' | ' + response.statusText);
                return from(response.text());
            }),
            map(text => text
                .split('\n')
                .filter(line => line.trim())
                .flatMap(line => JSON.parse(line) as PlantData[])
                .map(val => WhatGrowsNativeHereService.parsePlantData(val))
            )
        );
    }

    private static parsePlantData(raw: PlantData) {
        return Object.freeze({
            ...raw,
            nativeStateAndProvinceCodes: new Set(raw.nativeStateAndProvinceCodes ?? []),
            growthHabit: new Set(raw.growthHabit ?? []),
            duration: new Set(raw.duration ?? []),
            stateAndProvince: new Set(raw.stateAndProvince ?? []),
        })
    }
}