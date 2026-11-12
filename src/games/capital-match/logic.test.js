import { describe, expect, it } from 'vitest';
import { makeRng } from '../../kit/random';
import { countries } from './content';
import { makeQuestions, optionCount } from './logic';
describe('capital match', () => {
    it('asks ten different countries with the right capital once among the options', () => {
        const rng = makeRng(4);
        for (let level = 1; level <= 10; level++) {
            const qs = makeQuestions(rng, countries.en, level);
            expect(qs).toHaveLength(10);
            expect(new Set(qs.map((q) => q.country.name)).size).toBe(10);
            qs.forEach((q) => {
                expect(q.options).toHaveLength(optionCount(level));
                expect(new Set(q.options).size).toBe(q.options.length);
                expect(q.options.filter((o) => o === q.country.capital)).toHaveLength(1);
            });
        }
    });
    it('has no duplicate countries and at least 15 to pick from at level 1', () => {
        expect(new Set(countries.en.map((c) => c.iso)).size).toBe(countries.en.length);
        expect(countries.en.filter((c) => c.minLevel <= 1).length).toBeGreaterThanOrEqual(15);
        expect(countries.en.length).toBeGreaterThanOrEqual(100);
    });
    it('picks wrong answers from the same continent at higher levels', () => {
        const rng = makeRng(7);
        const byCapital = new Map(countries.en.map((c) => [c.capital, c]));
        makeQuestions(rng, countries.en, 8).forEach((q) => {
            const near = q.options.filter((o) => byCapital.get(o).continent === q.country.continent);
            expect(near.length).toBeGreaterThanOrEqual(3);
        });
    });
    it.each(Object.entries(countries))('has every country and a different capital for each in %s', (_, list) => {
        expect(list.map((c) => c.iso)).toEqual(countries.en.map((c) => c.iso));
        expect(new Set(list.map((c) => c.name)).size).toBe(list.length);
        expect(new Set(list.map((c) => c.capital)).size).toBe(list.length);
    });
});
