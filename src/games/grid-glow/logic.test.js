import { describe, expect, it } from 'vitest';
import { makeRng } from '../../kit/random';
import { gridFor, pattern } from './logic';
describe('grid glow', () => {
    it('lights distinct cells inside the grid', () => {
        const rng = makeRng(4);
        for (let n = 2; n <= 12; n++) {
            const size = gridFor(n);
            const p = pattern(rng, size, n);
            expect(new Set(p).size).toBe(n);
            p.forEach((c) => expect(c).toBeLessThan(size * size));
        }
    });
});
