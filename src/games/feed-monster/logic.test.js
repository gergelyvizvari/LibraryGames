import { describe, expect, it } from 'vitest';
import { makeRng } from '../../kit/random';
import { canFinish, fewestBlocks, makeMonster, pointsFor } from './logic';
describe('feed the monster', () => {
    it('finds the fewest blocks', () => {
        expect(fewestBlocks(7, [1, 2, 5])).toBe(2);
        expect(fewestBlocks(6, [1, 3, 4])).toBe(2);
        expect(fewestBlocks(5, [2, 4])).toBe(Infinity);
        expect(canFinish(0, [3])).toBe(true);
    });
    it('always makes a fair monster', () => {
        const rng = makeRng(3);
        for (let level = 1; level <= 10; level++) {
            for (let i = 0; i < 50; i++) {
                const m = makeMonster(rng, level);
                expect(m.blocks.includes(m.target)).toBe(false);
                expect(m.best).toBeGreaterThanOrEqual(2);
                expect(m.best).toBeLessThan(Infinity);
                expect(new Set(m.blocks).size).toBe(m.blocks.length);
            }
        }
    });
    it('starts easy', () => {
        const rng = makeRng(9);
        for (let i = 0; i < 50; i++) {
            const m = makeMonster(rng, 1);
            expect(m.target).toBeLessThanOrEqual(7);
            expect(m.blocks).toContain(1);
            expect(m.blocks).toHaveLength(3);
        }
    });
    it('rewards the smart way', () => {
        const m = { target: 7, blocks: [1, 2, 5], best: 2 };
        expect(pointsFor(m, 2, 0)).toBeGreaterThan(pointsFor(m, 7, 0));
    });
});
