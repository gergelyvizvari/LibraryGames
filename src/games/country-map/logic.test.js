import { describe, expect, it } from 'vitest';
import { makeRng } from '../../kit/random';
import { places } from './content';
import { HEIGHT, WIDTH } from './outline';
import { ROUNDS, dotChoices, dotCount, kmBetween, pickRound, placesFor, pointsForKm, toMap } from './logic';
describe('country map', () => {
    it('puts every place inside the map', () => {
        for (const p of places.hu) {
            const [x, y] = toMap(p.at);
            expect(x).toBeGreaterThan(0);
            expect(x).toBeLessThan(WIDTH);
            expect(y).toBeGreaterThan(0);
            expect(y).toBeLessThan(HEIGHT);
        }
    });
    it('knows real distances', () => {
        const bp = places.hu.find((p) => p.name === 'Budapest');
        const db = places.hu.find((p) => p.name === 'Debrecen');
        expect(kmBetween(bp.at, db.at)).toBeGreaterThan(180);
        expect(kmBetween(bp.at, db.at)).toBeLessThan(205);
    });
    it('asks ten different places per round at every level', () => {
        const rng = makeRng(2);
        for (let level = 1; level <= 10; level++) {
            const round = pickRound(rng, places.hu, level);
            expect(round).toHaveLength(ROUNDS);
            expect(new Set(round).size).toBe(ROUNDS);
        }
    });
    it('offers the asked place among well spread dots', () => {
        const rng = makeRng(5);
        for (const target of places.hu) {
            const dots = dotChoices(rng, placesFor(places.hu, 1), target, dotCount(3));
            expect(dots[0]).toBe(target);
            expect(dots.length).toBeGreaterThanOrEqual(6);
            for (let i = 0; i < dots.length; i++)
                for (let j = i + 1; j < dots.length; j++)
                    expect(kmBetween(dots[i].at, dots[j].at)).toBeGreaterThan(30);
        }
    });
    it('scores closer taps higher', () => {
        expect(pointsForKm(10)).toBeGreaterThan(pointsForKm(40));
        expect(pointsForKm(40)).toBeGreaterThan(pointsForKm(70));
        expect(pointsForKm(200)).toBe(0);
    });
});
