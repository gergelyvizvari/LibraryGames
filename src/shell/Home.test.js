import { describe, expect, it } from 'vitest';
import { newGameIds } from './Home';
const game = (id, added) => ({ meta: { id, added } });
describe('newGameIds', () => {
    const today = new Date('2026-10-28');
    it('labels at most three of the newest games', () => {
        const list = [game('a', '2026-10-26'), game('b', '2026-10-27'), game('c', '2026-10-27'), game('d', '2026-10-25'), game('e', '2026-10-27')];
        expect([...newGameIds(list, today)]).toEqual(['e', 'c', 'b']);
    });
    it('skips games older than a week', () => {
        expect(newGameIds([game('old', '2026-10-01')], today).size).toBe(0);
    });
});
