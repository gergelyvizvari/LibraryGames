import { clamp } from '../../kit/random';
export const ROUNDS = 5;
export function pointsFor(ms) {
    return Math.max(0, Math.round(1000 - ms));
}
// Thresholds are set for children: a 6-year-old tapping a phone is usually around half a second.
export function animalKey(ms) {
    if (ms < 300)
        return 'cheetah';
    if (ms < 420)
        return 'rabbit';
    if (ms < 580)
        return 'cat';
    return 'turtle';
}
/** The average that counts as a perfect round: forgiving at level 1, sharper as the level rises. */
export const perfectMs = (level) => clamp(540 - level * 28, 260, 540);
/** Perfect average or faster is full accuracy; 450 ms slower than that counts as weak. */
export function accuracyFor(times, level = 1) {
    if (times.length === 0)
        return 0;
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    return clamp(1 - (avg - perfectMs(level)) / 450, 0, 1);
}
/** Higher levels make the wait less predictable. */
export function holdRange(level) {
    return [400, 1400 + level * 200];
}
