import { describe, expect, it } from 'vitest';
import { makeRng } from '../../kit/random';
import { makePuzzle, mirrorOf, targets } from './logic';
describe('mirror match', () => {
    it('mirrors across the middle line', () => {
        const p = { rows: 5, half: 3, left: [0, 2, 4] };
        expect(mirrorOf(p, 0)).toBe(2);
        expect(mirrorOf(p, 2)).toBe(0);
        expect(mirrorOf(p, 4)).toBe(4);
    });
    it('targets are distinct cells on the right side', () => {
        const rng = makeRng(10);
        for (let s = 0; s < 10; s++) {
            const p = makePuzzle(rng, 3, s);
            const tg = targets(p);
            expect(new Set(tg).size).toBe(tg.length);
            tg.forEach((c) => expect(c).toBeLessThan(p.rows * p.half));
        }
    });
});
