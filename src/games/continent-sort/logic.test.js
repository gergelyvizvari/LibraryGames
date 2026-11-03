import { describe, expect, it } from 'vitest';
import { makeRng } from '../../kit/random';
import { items } from './content';
import { CONTINENTS, classify } from './continents';
import { coloured, pickItems, pointsFor, poolForLevel, QUESTIONS, showLabels } from './logic';
describe('continent rules', () => {
    it.each([
        ['Hungary', 19, 47, 'europe'],
        ['Iceland', -18, 65, 'europe'],
        ['Crete', 24.9, 35.2, 'europe'],
        ['Cyprus', 33, 35, 'asia'],
        ['Turkey', 35, 39, 'asia'],
        ['Egypt', 30, 26, 'africa'],
        ['Eritrea', 38.8, 15.3, 'africa'],
        ['Saudi Arabia', 44.5, 24, 'asia'],
        ['Madagascar', 47, -19, 'africa'],
        ['Panama', -80, 8.5, 'northAmerica'],
        ['Colombia', -73, 4, 'southAmerica'],
        ['Greenland', -40, 74, 'northAmerica'],
        ['New Guinea', 145, -6, 'oceania'],
        ['Borneo', 114, 1, 'asia'],
        ['Fiji', -179.5, -17, 'oceania'],
        ['New Zealand', 172, -41, 'oceania'],
    ])('%s', (_, lon, lat, want) => expect(classify(lon, lat)).toBe(want));
    it('splits Russia at the Urals and keeps Antarctica apart', () => {
        expect(classify(40, 56, 'Russia')).toBe('europe');
        expect(classify(97, 61, 'Russia')).toBe('asia');
        expect(classify(-175, 66, 'Russia')).toBe('asia');
        expect(classify(0, -80, 'Antarctica')).toBe('antarctica');
    });
});
describe('continent sort logic', () => {
    it('has plenty of items at every level, on every continent', () => {
        for (let l = 1; l <= 10; l++)
            expect(poolForLevel(l).length).toBeGreaterThanOrEqual(20);
        for (const c of CONTINENTS)
            expect(items.filter((i) => i.continent === c).length).toBeGreaterThanOrEqual(4);
        expect(poolForLevel(1).length).toBeLessThan(poolForLevel(5).length);
    });
    it('picks ten different items, never three in a row from one continent', () => {
        for (let s = 1; s <= 40; s++) {
            const level = (s % 10) + 1;
            const picked = pickItems(makeRng(s), level);
            expect(picked).toHaveLength(QUESTIONS);
            expect(new Set(picked.map((p) => p.id)).size).toBe(QUESTIONS);
            picked.forEach((p) => expect(p.minLevel).toBeLessThanOrEqual(level));
            for (let i = 2; i < picked.length; i++)
                expect(picked[i].continent === picked[i - 1].continent && picked[i].continent === picked[i - 2].continent).toBe(false);
        }
    });
    it('helps more at the first levels', () => {
        expect(showLabels(1)).toBe(true);
        expect(showLabels(3)).toBe(false);
        expect(coloured(4)).toBe(true);
        expect(coloured(8)).toBe(false);
    });
    it('scores the first try, speed and streaks', () => {
        expect(pointsFor(0, 1, 1)).toBeGreaterThan(pointsFor(0, 8, 1));
        expect(pointsFor(0, 8, 4)).toBeGreaterThan(pointsFor(0, 8, 1));
        expect(pointsFor(1, 1, 0)).toBe(5);
        expect(pointsFor(2, 1, 0)).toBe(0);
    });
});
