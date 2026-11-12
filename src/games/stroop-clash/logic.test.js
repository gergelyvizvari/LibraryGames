import { describe, expect, it } from 'vitest';
import { makeRng } from '../../kit/random';
import { answerFor, flipChance, makeCard } from './logic';
describe('colour clash', () => {
    it('never flips the rule below level 4', () => {
        expect(flipChance(3)).toBe(0);
        const rng = makeRng(1);
        for (let i = 0; i < 200; i++)
            expect(makeCard(rng, 2).rule).toBe('ink');
    });
    it('answers the ink or the word depending on the rule', () => {
        expect(answerFor({ word: 0, ink: 2, rule: 'ink' })).toBe(2);
        expect(answerFor({ word: 0, ink: 2, rule: 'word' })).toBe(0);
    });
});
