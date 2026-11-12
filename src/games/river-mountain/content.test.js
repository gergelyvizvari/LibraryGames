import { describe, expect, it } from 'vitest';
import { features, names } from './content';
describe('river & mountain hunt content', () => {
    it('has plenty of unique features of every kind, inside the map', () => {
        expect(new Set(features.map((f) => f.id)).size).toBe(features.length);
        expect(features.length).toBeGreaterThanOrEqual(40);
        for (let l = 1; l <= 10; l++)
            expect(features.filter((f) => f.minLevel <= l).length).toBeGreaterThanOrEqual(20);
        for (const k of ['river', 'mountain', 'sea', 'lake'])
            expect(features.some((f) => f.kind === k && f.minLevel === 1)).toBe(true);
        for (const f of features)
            for (const [lon, lat] of [f.at, ...(f.line ?? [])]) {
                expect(lon).toBeGreaterThanOrEqual(-21);
                expect(lon).toBeLessThanOrEqual(43);
                expect(lat).toBeGreaterThanOrEqual(34);
                expect(lat).toBeLessThanOrEqual(71.2);
            }
    });
    describe.each(Object.entries(names))('%s', (_, list) => {
        it('names every feature once', () => {
            expect(Object.keys(list).sort()).toEqual(features.map((f) => f.id).sort());
            const values = Object.values(list);
            expect(new Set(values).size).toBe(values.length);
            values.forEach((v) => expect(v).toBe(v.normalize('NFC')));
        });
    });
});
