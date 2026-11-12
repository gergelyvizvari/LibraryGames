import { clamp } from '../../kit/random';
import { poolFor } from './content';
export const DURATION = 60;
const PAIRS = [4, 4, 4, 5, 5, 5, 5, 6, 6, 6];
export const pairCount = (level) => PAIRS[clamp(Math.round(level), 1, 10) - 1];
/** Pictures help the youngest players read the words; from level 6 the words stand alone. */
export const showPictures = (level) => level < 6;
/**
 * Picks the pairs for each board: pairs the player has not seen yet come first, the last board's pairs
 * never come straight back, and two pairs about the same idea (big/small and tall/short) never meet.
 */
export function makeDealer(rng, list, level) {
    const pool = poolFor(list, level);
    const count = Math.min(pairCount(level), pool.length);
    let seen = new Set();
    let last = [];
    return () => {
        if (seen.size > pool.length - count)
            seen = new Set(last);
        const fresh = rng.shuffle(pool.filter((q) => !seen.has(q)));
        const old = rng.shuffle(pool.filter((q) => seen.has(q) && !last.includes(q)));
        const picked = [];
        for (const q of [...fresh, ...old]) {
            if (picked.length === count)
                break;
            if (!picked.some((o) => o.group === q.group))
                picked.push(q);
        }
        // Only a tiny pool could get here; fill up rather than deal a short board.
        for (const q of [...fresh, ...old, ...last])
            if (picked.length < count && !picked.includes(q))
                picked.push(q);
        picked.forEach((q) => seen.add(q));
        last = picked;
        return picked;
    };
}
/** Each pair puts one word on the left and its opposite on the right, both columns shuffled. */
export function dealBoard(rng, picked) {
    const left = [];
    const right = [];
    picked.forEach((q, pair) => {
        const [l, r] = rng.chance(0.5) ? [q.a, q.b] : [q.b, q.a];
        left.push({ pair, side: 'left', ...l });
        right.push({ pair, side: 'right', ...r });
    });
    return { pairs: picked, left: rng.shuffle(left), right: rng.shuffle(right) };
}
export const isMatch = (x, y) => x.side !== y.side && x.pair === y.pair;
/** A streak of right matches earns more. */
export const pairPoints = (combo) => 10 + Math.min(combo, 8) * 2;
export const boardBonus = (pairs) => pairs * 5;
/** Right first time counts, and a long enough round (12 pairs) is needed for full marks. */
export const accuracyFor = (matched, misses) => clamp(matched / Math.max(1, matched + misses), 0, 1) * clamp(matched / 12, 0, 1);
