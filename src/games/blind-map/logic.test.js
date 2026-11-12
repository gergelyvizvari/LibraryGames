import { describe, expect, it } from 'vitest';
import worldData from 'world-atlas/countries-110m.json';
import { makeRng } from '../../kit/random';
import { countries, names } from './content';
import { pickQuestions, pointsFor } from './logic';
describe('blind map', () => {
    it('every country exists in the map data', () => {
        const atlas = new Set(worldData.objects.countries.geometries.map((g) => g.properties.name));
        countries.forEach((c) => expect(atlas.has(c.atlas), c.atlas).toBe(true));
        // A wrong tap can land on any country, so Hungarian names every one of them.
        atlas.forEach((name) => expect(names.hu?.[name], name).toBeTruthy());
    });
    it('picks ten different countries', () => {
        const rng = makeRng(2);
        for (let level = 1; level <= 10; level++) {
            const q = pickQuestions(rng, level);
            expect(q).toHaveLength(10);
            expect(new Set(q.map((c) => c.atlas)).size).toBe(10);
            q.forEach((c) => expect(c.minLevel).toBeLessThanOrEqual(level));
        }
    });
    it('has no duplicates and enough countries that level 1 is not the same every time', () => {
        expect(new Set(countries.map((c) => c.atlas)).size).toBe(countries.length);
        expect(countries.filter((c) => c.minLevel <= 1).length).toBeGreaterThanOrEqual(15);
    });
    it('rewards first tries', () => {
        expect(pointsFor(0, 1)).toBeGreaterThan(pointsFor(1, 1));
        expect(pointsFor(3, 1)).toBe(0);
    });
});
