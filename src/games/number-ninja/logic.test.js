import { describe, expect, it } from 'vitest';
import { makeRng } from '../../kit/random';
import { decoyFor, evaluate, expressionFor } from './logic';
describe('number ninja expressions', () => {
    it('builds expressions that equal the target at every level', () => {
        const rng = makeRng(7);
        for (let level = 1; level <= 10; level++) {
            for (let target = 3; target <= 30; target++) {
                const e = expressionFor(rng, level, target);
                expect(evaluate(e.text)).toBe(target);
            }
        }
    });
    it('decoys are never the target', () => {
        const rng = makeRng(3);
        for (let i = 0; i < 300; i++) {
            const d = decoyFor(rng, 5, 10);
            expect(evaluate(d.text)).not.toBe(10);
            expect(d.value).toBeGreaterThanOrEqual(0);
        }
    });
});
