import { describe, expect, it } from 'vitest';
import { makeRng } from '../../kit/random';
import { MAX_COLORS, PUZZLES, accuracyFor, canPour, isDone, isSolved, makePuzzle, pointsFor, pour, sizeFor, solve } from './logic';
const puzzleAt = (level, n, seed) => {
    const { colors, cap, empty } = sizeFor(level, n);
    return { ...makePuzzle(makeRng(seed), colors, cap, empty), colors };
};
describe('colour sort pouring', () => {
    it('pours onto the same colour or into an empty tube only', () => {
        const tubes = [[0, 1, 1], [2, 1], [], [0, 2, 0]];
        expect(canPour(tubes, 0, 1, 3)).toBe(true);
        expect(canPour(tubes, 0, 2, 3)).toBe(true);
        expect(canPour(tubes, 0, 3, 3)).toBe(false); // full
        expect(canPour(tubes, 1, 3, 3)).toBe(false); // full
        expect(canPour(tubes, 2, 0, 3)).toBe(false); // nothing to pour
        expect(canPour([[0], [1]], 0, 1, 3)).toBe(false); // colours differ
    });
    it('moves the whole top run, as much as fits', () => {
        expect(pour([[0, 1, 1], []], 0, 1, 3)).toEqual({ tubes: [[0], [1, 1]], moved: 2 });
        expect(pour([[0, 1, 1], [2, 1]], 0, 1, 3)).toEqual({ tubes: [[0, 1], [2, 1, 1]], moved: 1 });
    });
    it('knows when tubes and puzzles are sorted', () => {
        expect(isDone([1, 1, 1], 3)).toBe(true);
        expect(isDone([1, 1], 3)).toBe(false);
        expect(isSolved([[1, 1, 1], [], [0, 0, 0]], 3)).toBe(true);
        expect(isSolved([[1, 1, 0], [0, 0, 1]], 3)).toBe(false);
    });
    it('finds the shortest solution', () => {
        expect(solve([[0, 1], [1, 0], []], 2)).toBe(3);
        expect(solve([[0, 0], [1, 1]], 2)).toBe(0);
        expect(solve([[0, 1], [1, 0]], 2)).toBe(-1);
    });
});
describe('colour sort puzzles', () => {
    it('starts easy and grows with the level', () => {
        expect(sizeFor(1, 0).colors).toBe(2);
        expect(sizeFor(10, PUZZLES - 1).colors).toBe(MAX_COLORS);
        for (let level = 2; level <= 10; level++) {
            expect(sizeFor(level, 0).colors).toBeGreaterThanOrEqual(sizeFor(level - 1, 0).colors);
        }
    });
    it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])('level %i puzzles are fair, solvable and varied', (level) => {
        const seen = new Set();
        for (let seed = 0; seed < 10; seed++) {
            for (let n = 0; n < PUZZLES; n++) {
                const p = puzzleAt(level, n, seed * 7 + n);
                // Every colour fills exactly one tube, nothing starts sorted, and the solver agrees on par.
                const counts = new Array(p.colors).fill(0);
                p.tubes.flat().forEach((c) => counts[c]++);
                expect(counts).toEqual(new Array(p.colors).fill(p.cap));
                p.tubes.forEach((tube) => expect(isDone(tube, p.cap)).toBe(false));
                // par comes from the solver, so a positive par means a solution exists.
                expect(p.par).toBeGreaterThan(0);
                seen.add(JSON.stringify(p.tubes));
            }
        }
        // Two-colour puzzles have fewer possible mixes, so level 1 may repeat now and then.
        expect(seen.size).toBeGreaterThanOrEqual(level === 1 ? 20 : 28);
    }, 20_000);
    it('is the same puzzle for the same seed (daily challenge)', () => {
        expect(puzzleAt(6, 1, 99)).toEqual(puzzleAt(6, 1, 99));
    });
});
describe('colour sort scoring', () => {
    it('rewards more colours and fewer pours', () => {
        expect(pointsFor(5, 12, 12)).toBeGreaterThan(pointsFor(3, 8, 8));
        expect(pointsFor(4, 10, 10)).toBeGreaterThan(pointsFor(4, 20, 10));
    });
    it('counts near-par play as full accuracy and wandering as weak', () => {
        expect(accuracyFor([{ moves: 6, par: 4 }])).toBe(1);
        expect(accuracyFor([{ moves: 30, par: 10 }])).toBeLessThan(0.45);
        expect(accuracyFor([])).toBe(0);
    });
});
