import { describe, expect, it } from 'vitest';
import { makeRng } from '../../kit/random';
import { beeCount, flightMs, legCount, makeTurn, pointsFor, positionAt, spreadPoints, targetCount } from './logic';
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
describe('busy bees logic', () => {
    it('starts easy and gets harder', () => {
        expect(beeCount(1)).toBe(3);
        expect(targetCount(1)).toBe(1);
        expect(beeCount(10)).toBe(8);
        expect(targetCount(10)).toBe(2);
        for (let l = 1; l < 10; l++) {
            expect(beeCount(l + 1)).toBeGreaterThanOrEqual(beeCount(l));
            expect(legCount(l + 1)).toBeGreaterThanOrEqual(legCount(l));
        }
        expect(flightMs(1)).toBeLessThan(3000);
        expect(flightMs(10)).toBeLessThan(5000);
    });
    it('keeps resting bees apart and inside the meadow', () => {
        const rng = makeRng(7);
        for (let k = 0; k < 200; k++) {
            const pts = spreadPoints(rng, 8);
            for (const p of pts) {
                expect(p.x).toBeGreaterThan(0.1);
                expect(p.x).toBeLessThan(0.9);
                expect(p.y).toBeGreaterThan(0.1);
                expect(p.y).toBeLessThan(0.9);
            }
            for (let i = 0; i < pts.length; i++)
                for (let j = i + 1; j < pts.length; j++)
                    expect(dist(pts[i], pts[j])).toBeGreaterThan(0.2);
        }
    });
    it('makes a turn with a path per bee and distinct targets', () => {
        for (let level = 1; level <= 10; level++) {
            const turn = makeTurn(makeRng(level * 31), level);
            expect(turn.paths).toHaveLength(beeCount(level));
            turn.paths.forEach((p) => expect(p).toHaveLength(legCount(level) + 1));
            expect(new Set(turn.targets).size).toBe(targetCount(level));
            turn.targets.forEach((t) => expect(t).toBeLessThan(beeCount(level)));
        }
    });
    it('moves smoothly from the first stop to the last', () => {
        const path = [{ x: 0.2, y: 0.2 }, { x: 0.8, y: 0.5 }, { x: 0.5, y: 0.8 }];
        expect(positionAt(path, 0, 1000)).toMatchObject({ x: 0.2, y: 0.2, dir: 1 });
        expect(positionAt(path, 1000, 1000)).toMatchObject({ x: 0.8, y: 0.5 });
        expect(positionAt(path, 5000, 1000)).toMatchObject({ x: 0.5, y: 0.8, dir: -1 });
        const mid = positionAt(path, 500, 1000);
        expect(mid.x).toBeCloseTo(0.5);
        expect(mid.y).toBeCloseTo(0.35);
    });
    it('scores more for higher levels and streaks', () => {
        expect(pointsFor(1, 1)).toBe(12);
        expect(pointsFor(5, 1)).toBeGreaterThan(pointsFor(1, 1));
        expect(pointsFor(1, 4)).toBeGreaterThan(pointsFor(1, 1));
        expect(pointsFor(1, 50)).toBe(pointsFor(1, 6));
    });
});
