import { describe, expect, it } from 'vitest';
import { makeRng } from '../../kit/random';
import { gridSize, hardPairs, easyPairs, makeBoard } from './logic';
describe('spot the odd one', () => {
    it('keeps the odd one inside the grid', () => {
        const rng = makeRng(9);
        for (let i = 0; i < 200; i++) {
            const b = makeBoard(rng, (i % 10) + 1, i % 20);
            expect(b.oddIndex).toBeLessThan(b.size * b.size);
            expect(b.common).not.toBe(b.odd);
        }
    });
    it('grows the grid as you find more', () => {
        expect(gridSize(1, 0)).toBe(3);
        expect(gridSize(1, 9)).toBeGreaterThan(3);
        expect(gridSize(10, 50)).toBe(7);
    });
    it('pairs are always two different emoji', () => {
        ;
        [...easyPairs, ...hardPairs].forEach(([a, b]) => expect(a).not.toBe(b));
    });
});
