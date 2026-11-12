import { clamp } from '../../kit/random';
export const DURATION = 60;
const RANGES = [
    [1, 6],
    [1, 10],
    [1, 20],
    [1, 20],
    [10, 50],
    [10, 99],
    [20, 200],
    [100, 999],
    [100, 999],
    [1000, 9999],
];
const lv = (level) => clamp(Math.round(level), 1, 10);
export const numberRange = (level) => RANGES[lv(level) - 1];
/** Small numbers come with dots in pairs, so kids can see the odd one out. */
export const showDots = (level) => lv(level) <= 3;
/** Seconds a number takes to fall to the bottom. */
export const fallSeconds = (level) => 6 - (lv(level) - 1) * 0.38;
export const binFor = (n) => (n % 2 === 0 ? 'even' : 'odd');
/** Deals numbers in the level's range: never the same number twice in a row, never 4 of a kind in a row. */
export function makeDealer(rng, level) {
    const [lo, hi] = numberRange(level);
    const recent = [];
    return () => {
        const streak = recent.length >= 3 && recent.slice(-3).every((n) => binFor(n) === binFor(recent[recent.length - 1]));
        let n = rng.int(lo, hi);
        for (let i = 0; i < 50 && (n === recent[recent.length - 1] || (streak && binFor(n) === binFor(recent[recent.length - 1]))); i++)
            n = rng.int(lo, hi);
        recent.push(n);
        if (recent.length > 3)
            recent.shift();
        return n;
    };
}
/** Reads a horizontal swipe: left is even, right is odd. Short or mostly vertical moves are not swipes. */
export function swipeBin(dx, dy) {
    if (Math.abs(dx) < 30 || Math.abs(dx) < Math.abs(dy))
        return null;
    return dx < 0 ? 'even' : 'odd';
}
/** Why a number is even or odd: pairs for small numbers, the last digit for big ones. */
export function explain(n) {
    const even = n % 2 === 0;
    if (n === 1)
        return { key: 'whyOne', vars: { n } };
    if (n <= 20)
        return { key: even ? 'whyEven' : 'whyOdd', vars: { n, half: Math.floor(n / 2) } };
    return { key: even ? 'digitEven' : 'digitOdd', vars: { n, d: n % 10 } };
}
/** Streaks and quick answers earn more. `early` is how much of the fall was left (0 to 1). */
export const pointsFor = (combo, early) => 10 + Math.min(combo, 10) * 2 + Math.round(clamp(early, 0, 1) * 6);
export const accuracyFor = (right, wrong) => clamp(right / Math.max(1, right + wrong), 0, 1) * clamp(right / 15, 0, 1);
