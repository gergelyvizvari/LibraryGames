import { clamp } from '../../kit/random';
import { countries, GROUPS } from './content';
/** One round lasts this long; boards keep coming until time is up. */
export const DURATION = 80;
const lv = (level) => clamp(Math.round(level), 1, 10);
/** Flag + name pairs on a board: 3 at level 1, 6 at level 8 and up. */
export const pairCount = (level) => [3, 3, 4, 4, 4, 5, 5, 6, 6, 6][lv(level) - 1];
/** How long every card shows face up when a board starts, in ms. Gone from level 7. */
export const peekMs = (level) => (lv(level) <= 3 ? 2600 : lv(level) <= 6 ? 1400 : 0);
export const poolFor = (level, group) => countries.filter((c) => c.group === group && c.minLevel <= lv(level));
/** Continents that have enough countries for a full board at this level. */
export const groupsFor = (level) => GROUPS.filter((g) => poolFor(level, g).length >= pairCount(level));
/** A board for one continent: newer (harder) countries a bit more likely, so each level feels fresh. */
export function dealBoard(rng, level, group) {
    const picked = rng
        .shuffle(poolFor(level, group))
        .sort((a, b) => b.minLevel - a.minLevel + (rng.next() - 0.5) * 6)
        .slice(0, pairCount(level));
    const cards = picked.flatMap((c) => [
        { iso: c.iso, kind: 'flag' },
        { iso: c.iso, kind: 'name' },
    ]);
    return rng.shuffle(cards).map((c, id) => ({ ...c, id, matched: false }));
}
/** The next continent: never the one just played, and every continent comes round before any repeats. */
export function nextGroup(rng, level, played) {
    const all = groupsFor(level);
    const fresh = all.filter((g) => !played.includes(g));
    const options = (fresh.length ? fresh : all).filter((g) => g !== played.at(-1));
    return rng.pick(options.length ? options : all);
}
export const isPair = (a, b) => a.iso === b.iso && a.kind !== b.kind;
/** Points for a pair: more with a streak of pairs found without a miss. */
export const pairPoints = (combo) => 10 + Math.min(Math.max(combo - 1, 0), 5) * 3;
export const boardBonus = (pairs) => pairs * 4;
/**
 * Accuracy for levelling up. A memory game always has some misses, so a good player finds a pair about
 * every second try; that counts as 1. A round with very few pairs counts less.
 */
export const accuracyFor = (pairs, tries) => clamp((pairs * 2) / Math.max(1, tries), 0, 1) * clamp(pairs / 8, 0, 1);
