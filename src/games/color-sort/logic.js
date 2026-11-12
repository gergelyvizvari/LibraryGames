import { clamp } from '../../kit/random';
export const PUZZLES = 3;
/** Liquid colours available; the CSS defines .cs-c0 to .cs-c6. */
export const MAX_COLORS = 7;
/** Level 1 starts with two colours; each later puzzle in the round is a touch harder. */
export function sizeFor(level, puzzle) {
    const colors = clamp(2 + Math.floor((clamp(level, 1, 10) - 1) * 0.55 + Math.min(puzzle, 2) * 0.5), 2, MAX_COLORS);
    return { colors, cap: 4, empty: 2 };
}
const top = (t) => t[t.length - 1];
/** How many layers of the top colour sit together at the top of the tube. */
export function topRun(t) {
    let n = 0;
    while (n < t.length && t[t.length - 1 - n] === top(t))
        n++;
    return n;
}
export function canPour(tubes, from, to, cap) {
    if (from === to)
        return false;
    const a = tubes[from];
    const b = tubes[to];
    if (a.length === 0 || b.length >= cap)
        return false;
    return b.length === 0 || top(b) === top(a);
}
/** Pours as much of the top colour as fits. Returns new tubes and how many layers moved. */
export function pour(tubes, from, to, cap) {
    if (!canPour(tubes, from, to, cap))
        return { tubes, moved: 0 };
    const moved = Math.min(topRun(tubes[from]), cap - tubes[to].length);
    const next = tubes.map((t) => [...t]);
    const color = top(next[from]);
    next[from].length -= moved;
    for (let i = 0; i < moved; i++)
        next[to].push(color);
    return { tubes: next, moved };
}
export const isDone = (t, cap) => t.length === cap && topRun(t) === cap;
export const isSolved = (tubes, cap) => tubes.every((t) => t.length === 0 || isDone(t, cap));
const keyOf = (tubes) => tubes
    .map((t) => t.join(''))
    .sort()
    .join('|');
/** Pours worth trying: skips moving a finished-looking single-colour tube into an empty one. */
function moves(tubes, cap) {
    const out = [];
    tubes.forEach((a, i) => {
        if (a.length === 0 || isDone(a, cap))
            return;
        const whole = topRun(a) === a.length;
        tubes.forEach((b, j) => {
            if (!canPour(tubes, i, j, cap))
                return;
            if (whole && b.length === 0)
                return;
            out.push([i, j]);
        });
    });
    return out;
}
/**
 * Shortest number of pours to solve, by breadth-first search over positions (tube order ignored).
 * Returns -1 when there is no solution or the search grows past `limit` positions.
 */
export function solve(start, cap, limit = 200_000) {
    if (isSolved(start, cap))
        return 0;
    const seen = new Set([keyOf(start)]);
    let frontier = [start];
    for (let depth = 1; frontier.length > 0; depth++) {
        const next = [];
        for (const tubes of frontier) {
            for (const [i, j] of moves(tubes, cap)) {
                const after = pour(tubes, i, j, cap).tubes;
                const k = keyOf(after);
                if (seen.has(k))
                    continue;
                if (isSolved(after, cap))
                    return depth;
                seen.add(k);
                next.push(after);
                if (seen.size > limit)
                    return -1;
            }
        }
        frontier = next;
    }
    return -1;
}
/** A shuffled, solvable puzzle with no tube already finished. Tries again until one passes the solver. */
export function makePuzzle(rng, colors, cap, empty) {
    for (;;) {
        const layers = rng.shuffle(Array.from({ length: colors * cap }, (_, i) => Math.floor(i / cap)));
        const tubes = Array.from({ length: colors }, (_, i) => layers.slice(i * cap, (i + 1) * cap));
        if (tubes.some((t) => topRun(t) === cap))
            continue;
        for (let i = 0; i < empty; i++)
            tubes.push([]);
        const par = solve(tubes, cap);
        if (par > 0)
            return { tubes, cap, par };
    }
}
/** Points for solving one puzzle: more colours are worth more, and staying close to par earns a bonus. */
export function pointsFor(colors, moves, par) {
    return colors * 40 + Math.max(0, 60 - Math.max(0, moves - par) * 6);
}
/** How close to the best possible each puzzle was. Generous: a few extra pours still count as great. */
export function accuracyFor(results) {
    if (results.length === 0)
        return 0;
    const each = results.map(({ moves, par }) => clamp((par + 2) / Math.max(moves, 1), 0, 1));
    return each.reduce((a, b) => a + b, 0) / each.length;
}
