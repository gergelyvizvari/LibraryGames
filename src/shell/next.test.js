import { describe, expect, it } from 'vitest';
import { nextGame } from './next';
const game = (id, skill) => ({ meta: { id, skill } });
const list = [game('a', 'memory'), game('b', 'memory'), game('c', 'maths'), game('d', 'maths'), game('e', 'logic')];
const played = (...ids) => ({
    games: Object.fromEntries(ids.map((id) => [id, { best: 1, plays: 1, level: 1 }])),
    xp: {},
    streak: { days: 0 },
});
describe('nextGame', () => {
    it('offers another skill, unplayed games first', () => {
        for (let seed = 0; seed < 30; seed++) {
            expect(nextGame('a', list, played('c', 'd'), seed).meta.id).toBe('e');
        }
    });
    it('never offers the same game or skill while others are left', () => {
        for (let seed = 0; seed < 30; seed++) {
            const next = nextGame('c', list, played('a', 'b', 'e'), seed);
            expect(next.meta.skill).not.toBe('maths');
        }
    });
});
