import { clamp } from '../../kit/random';
export const DURATION = 60;
/** Minutes between possible times: whole hours first, then halves, quarters, fives and any minute. */
export function stepFor(level) {
    return level <= 2 ? 60 : level <= 4 ? 30 : level <= 6 ? 15 : level <= 8 ? 5 : 1;
}
export const optionCount = (level) => (level <= 2 ? 3 : 4);
/** From level 3 every other question flips: a digital time, pick the right clock. */
export const flipped = (level, index) => level >= 3 && index % 2 === 1;
export const same = (a, b) => a.h === b.h && a.m === b.m;
export const label = (t) => `${t.h}:${String(t.m).padStart(2, '0')}`;
const wrapH = (h) => ((((h - 1) % 12) + 12) % 12) + 1;
export function randomTime(rng, step) {
    return { h: rng.int(1, 12), m: rng.int(0, Math.floor(59 / step)) * (step === 60 ? 0 : step) };
}
/** Hand angles in degrees, clockwise from 12. */
export function angles(t) {
    return { hour: ((t.h % 12) + t.m / 60) * 30, minute: t.m * 6 };
}
/** Wrong answers that look tempting: hands swapped, an hour off, the minutes off by a step. */
export function makeOptions(rng, answer, level) {
    const step = stepFor(level);
    const s = step === 60 ? 30 : step;
    const tempting = [
        { h: wrapH(answer.h + 1), m: answer.m },
        { h: wrapH(answer.h - 1), m: answer.m },
        { h: answer.h, m: (answer.m + s) % 60 },
        { h: answer.h, m: (answer.m + 60 - s) % 60 },
    ];
    // Swapped hands only make sense when the minute hand points at a number.
    if (answer.m % 5 === 0)
        tempting.push({ h: answer.m === 0 ? 12 : answer.m / 5, m: (answer.h % 12) * 5 });
    const options = [answer];
    for (const o of rng.shuffle(tempting)) {
        if (options.length >= optionCount(level))
            break;
        // Keep wrong answers on the same grid as the level (whole hours, halves, quarters…).
        if (o.m % step !== 0)
            continue;
        if (!options.some((x) => same(x, o)))
            options.push(o);
    }
    while (options.length < optionCount(level)) {
        const o = randomTime(rng, step);
        if (!options.some((x) => same(x, o)))
            options.push(o);
    }
    return rng.shuffle(options);
}
export function pointsFor(seconds, combo) {
    return 10 + clamp(Math.round((5 - seconds) * 3), 0, 12) + Math.min(combo, 8) * 2;
}
