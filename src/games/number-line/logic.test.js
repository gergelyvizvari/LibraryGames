import { describe, expect, it } from 'vitest';
import { makeRng } from '../../kit/random';
import { accuracyFor, jumpText, makeQuestion, pathOf, pointsFor, showsLabel, specFor, WINDOW } from './logic';
describe('number line questions', () => {
    it('keeps every stop on the line and inside the shown window', () => {
        for (let level = 1; level <= 10; level++) {
            const s = specFor(level);
            const rng = makeRng(level * 31);
            let at = 0;
            for (let i = 0; i < 300; i++) {
                const q = makeQuestion(rng, level, at);
                const path = pathOf(q);
                expect(q.jumps).toHaveLength(s.steps);
                expect(q.end).toBe(path[path.length - 1]);
                expect(q.end).not.toBe(q.start);
                for (const j of q.jumps) {
                    expect(Math.abs(j)).toBeGreaterThanOrEqual(s.minJump);
                    expect(Math.abs(j)).toBeLessThanOrEqual(s.maxJump);
                    if (!s.back)
                        expect(j).toBeGreaterThan(0);
                }
                expect(q.lo).toBeGreaterThanOrEqual(0);
                expect(q.lo + WINDOW).toBeLessThanOrEqual(s.max);
                for (const p of path) {
                    expect(p).toBeGreaterThanOrEqual(q.lo);
                    expect(p).toBeLessThanOrEqual(q.lo + WINDOW);
                }
                at = q.end;
            }
        }
    });
    it('continues from where the frog landed, and goes both ways', () => {
        const rng = makeRng(2);
        let at = 4;
        const dirs = new Set();
        for (let i = 0; i < 50; i++) {
            const q = makeQuestion(rng, 3, at);
            expect(q.start).toBe(at);
            q.jumps.forEach((j) => dirs.add(Math.sign(j)));
            at = q.end;
        }
        expect(dirs).toEqual(new Set([1, -1]));
    });
});
describe('number line rules', () => {
    it('starts easy and grows', () => {
        expect(specFor(1)).toMatchObject({ max: 10, steps: 1, back: false, labels: 'all' });
        expect(specFor(10).steps).toBe(2);
        expect(specFor(10).labels).toBe('start');
    });
    it('hides labels at higher levels, but never the start', () => {
        const q = { start: 23, jumps: [4], end: 27, lo: 20 };
        expect(showsLabel(27, q, 'all')).toBe(true);
        expect(showsLabel(25, q, 'fives')).toBe(true);
        expect(showsLabel(27, q, 'fives')).toBe(false);
        expect(showsLabel(23, q, 'start')).toBe(true);
        expect(showsLabel(30, q, 'start')).toBe(false);
    });
    it('writes jumps with a real minus sign', () => {
        expect(jumpText(3)).toBe('+3');
        expect(jumpText(-2)).toBe('−2');
    });
    it('rewards streaks, speed and accuracy', () => {
        expect(pointsFor(5, 4)).toBeGreaterThan(pointsFor(1, 4));
        expect(pointsFor(1, 1)).toBeGreaterThan(pointsFor(1, 6));
        expect(accuracyFor(12, 0)).toBe(1);
        expect(accuracyFor(12, 4)).toBeLessThan(1);
        expect(accuracyFor(3, 0)).toBeLessThan(1);
    });
});
