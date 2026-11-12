/**
 * Hedgehog Post: a little village seen from above, SIZE × SIZE squares. The hedgehog walks only on the path,
 * one square per arrow card. The player lays out all the cards first, then the hedgehog follows them.
 */
export const SIZE = 5;
export const dirs = ['up', 'down', 'left', 'right'];
const delta = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
/** Deliveries in one stage. */
export const DELIVERIES = 3;
export const stepsFor = (level) => Math.min(11, level + 2);
const spursFor = (level) => (level <= 2 ? 0 : level <= 5 ? 1 : 2);
/** How many cards fit in the row: a few more than needed, so a wrong card does not block the rest. */
export const slotsFor = (v) => Math.min(14, v.shortest + 3);
export const rowOf = (c) => Math.floor(c / SIZE);
export const colOf = (c) => c % SIZE;
/** The square one step away, or -1 off the edge of the village. */
export function step(c, d) {
    const r = rowOf(c) + delta[d][0];
    const k = colOf(c) + delta[d][1];
    return r < 0 || r >= SIZE || k < 0 || k >= SIZE ? -1 : r * SIZE + k;
}
export const neighbours = (c) => dirs.map((d) => step(c, d)).filter((n) => n >= 0);
/**
 * A self-avoiding walk of `len` steps from `from` that never runs alongside the squares in `taken` (other than
 * the one it left from), so the path stays a single line without shortcuts.
 */
function walk(rng, from, len, taken) {
    const out = [from];
    const used = new Set(taken);
    used.add(from);
    for (let i = 0; i < len; i++) {
        const here = out[out.length - 1];
        const options = rng.shuffle(neighbours(here)).filter((n) => !used.has(n) && neighbours(n).every((m) => m === here || !used.has(m)));
        if (!options.length)
            return null;
        out.push(options[0]);
        used.add(options[0]);
    }
    return out;
}
export function makeVillage(rng, level) {
    for (let attempt = 0;; attempt++) {
        // A long path almost always fits; if it keeps failing, settle for a slightly shorter one.
        const len = Math.max(2, stepsFor(level) - Math.floor(attempt / 400));
        const start = (SIZE - 1) * SIZE + rng.int(0, SIZE - 1);
        const main = walk(rng, start, len, new Set());
        if (!main)
            continue;
        const goal = main[main.length - 1];
        const path = new Set(main);
        const spurEnds = [];
        for (let s = 0; s < spursFor(level); s++) {
            const from = rng.pick(main.slice(1, -1));
            const spur = walk(rng, from, rng.int(1, 3), new Set([...path].filter((c) => c !== from)));
            if (!spur)
                continue;
            spur.forEach((c) => path.add(c));
            spurEnds.push(spur[spur.length - 1]);
        }
        // The letter's house stands next to the end of the path; other houses wait at the ends of side paths.
        const houses = [];
        const placeHouse = (door) => {
            const spots = neighbours(door).filter((c) => !path.has(c) && !houses.some((h) => h.cell === c));
            if (!spots.length)
                return false;
            houses.push({ cell: rng.pick(spots), door, roof: houses.length });
            return true;
        };
        if (!placeHouse(goal))
            continue;
        spurEnds.forEach(placeHouse);
        if (level >= 2)
            placeHouse(main[rng.int(1, main.length - 2)]);
        const ground = Array.from({ length: SIZE * SIZE }, (_, c) => (path.has(c) ? 'path' : 'grass'));
        for (let c = 0; c < SIZE * SIZE; c++)
            if (ground[c] === 'grass' && !houses.some((h) => h.cell === c) && rng.chance(0.3))
                ground[c] = 'pine';
        const pond = rng.int(0, SIZE * SIZE - 1);
        if (ground[pond] === 'pine' || ground[pond] === 'grass')
            ground[pond] = houses.some((h) => h.cell === pond) ? ground[pond] : 'pond';
        return { ground, start, goal, houses, shortest: len };
    }
}
/** The squares the hedgehog walks through, card by card, and how the walk ends. `at` is the card where it ended. */
export function run(v, cards) {
    const cells = [];
    let here = v.start;
    for (let i = 0; i < cards.length; i++) {
        const next = step(here, cards[i]);
        if (next < 0 || v.ground[next] !== 'path')
            return { cells, outcome: { kind: 'blocked', at: i } };
        here = next;
        cells.push(here);
        if (here === v.goal)
            return { cells, outcome: { kind: 'home', at: i } };
    }
    return { cells, outcome: { kind: 'short' } };
}
/** The shortest list of cards from the start to the goal (a breadth-first search over the path). */
export function solve(v) {
    const prev = new Map();
    const queue = [v.start];
    const seen = new Set(queue);
    while (queue.length) {
        const c = queue.shift();
        if (c === v.goal) {
            const out = [];
            for (let x = c; x !== v.start; x = prev.get(x)[0])
                out.unshift(prev.get(x)[1]);
            return out;
        }
        for (const d of dirs) {
            const n = step(c, d);
            if (n < 0 || seen.has(n) || v.ground[n] !== 'path')
                continue;
            seen.add(n);
            prev.set(n, [c, d]);
            queue.push(n);
        }
    }
    return null;
}
