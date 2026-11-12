import { describe, expect, it } from 'vitest';
import { places } from './content';
import { placesFor } from './logic';
describe.each(Object.entries(places))('country map places (%s)', (_, list) => {
    it('has at least 20 places at every level and 30 in total', () => {
        for (let level = 1; level <= 10; level++)
            expect(placesFor(list, level).length).toBeGreaterThanOrEqual(20);
        expect(list.length).toBeGreaterThanOrEqual(30);
    });
    it('names every place once, NFC normalised', () => {
        expect(new Set(list.map((p) => p.name)).size).toBe(list.length);
        for (const p of list)
            expect(p.name).toBe(p.name.normalize('NFC'));
    });
    it('keeps every place inside Hungary', () => {
        for (const { at: [lon, lat] } of list) {
            expect(lon).toBeGreaterThan(16.1);
            expect(lon).toBeLessThan(22.9);
            expect(lat).toBeGreaterThan(45.7);
            expect(lat).toBeLessThan(48.6);
        }
    });
});
