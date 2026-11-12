import { clamp } from '../../kit/random';
export const ROUNDS = 8;
/** Beats in a bar (4/4). */
export const BAR = 4;
export const cellBeats = { ta: 1, titi: 1, taa: 2, rest: 1 };
/** Milliseconds per beat: 90 bpm at level 1, about 130 bpm at level 10. */
export function beatMs(level) {
    return clamp(690 - level * 23, 460, 667);
}
/**
 * How far off the beat a tap may land, as a share of a beat: full credit within `spot`,
 * nothing from `spot + 0.25`. Roomy for beginners, tighter as the level rises.
 */
export function tolerance(level) {
    return clamp(0.26 - level * 0.014, 0.12, 0.25);
}
/** On the easiest levels the rhythm stays on screen (faded) while the player copies it. */
export const showWhilePlaying = (level) => level <= 3;
export function barsFor(level, round) {
    return level >= 5 || (level >= 3 && round >= ROUNDS / 2) ? 2 : 1;
}
export function hitTimes(cells) {
    const hits = [];
    let at = 0;
    for (const c of cells) {
        if (c === 'titi')
            hits.push(at, at + 0.5);
        else if (c !== 'rest')
            hits.push(at);
        at += cellBeats[c];
    }
    return hits;
}
/**
 * Which cells a level may use. Little ones only get ta and ti-ti; rests (szün) come in from level 3.
 * Music teachers find ta-a hard even for 8-year-olds, so it waits for the top levels.
 */
export function cellsFor(level) {
    return level < 3 ? ['ta', 'ta', 'titi'] : level < 8 ? ['ta', 'titi', 'titi', 'rest'] : ['ta', 'titi', 'titi', 'taa', 'rest'];
}
function makeBar(rng, level, first, last) {
    const pool = cellsFor(level);
    for (;;) {
        const cells = [];
        let beat = 0;
        while (beat < BAR) {
            const c = rng.pick(pool);
            // A half note sits on beat 1 or 3, never across the middle of the bar.
            if (c === 'taa' && beat % 2 !== 0)
                continue;
            // Start on beat 1, never two rests in a row, and no rest at the very end: with no click, nobody can hear it.
            if (c === 'rest' && ((first && beat === 0) || (last && beat === BAR - 1) || cells[cells.length - 1] === 'rest'))
                continue;
            cells.push(c);
            beat += cellBeats[c];
        }
        // Four plain ta beats is just the pulse itself; ask for a real rhythm.
        if (cells.some((c) => c !== 'ta'))
            return cells;
    }
}
export function makePattern(rng, level, round) {
    const bars = barsFor(level, round);
    const cells = [];
    for (let b = 0; b < bars; b++)
        cells.push(...makeBar(rng, level, b === 0, b === bars - 1));
    return { cells, beats: bars * BAR, hits: hitTimes(cells) };
}
/**
 * How well the taps copy the rhythm, 0..1, plus a credit per hit.
 * `hits` are in beats (the first is always 0), `taps` in ms. There is no click to play along to,
 * so the first tap sets where the rhythm starts, and a steady tempo a little slower or faster
 * than the drum's is fine: what counts is that the taps keep one even pulse.
 * (The first hit is always on beat 1, so the first tap is the anchor.)
 */
export function judge(hits, taps, beat, level = 5) {
    if (taps.length === 0)
        return { score: 0, credits: hits.map(() => 0) };
    // Try every tempo from 20% slower to 25% faster than the drum and keep the kindest reading.
    let best = { score: -1, credits: [] };
    for (let f = 0.8; f <= 1.25; f += 0.01) {
        const r = judgeAt(hits, taps, beat * f, tolerance(level));
        if (r.score > best.score)
            best = r;
    }
    return best;
}
function judgeAt(hits, taps, own, spot) {
    const used = new Set();
    const credits = hits.map((h) => {
        const want = taps[0] + h * own;
        let pick = -1;
        taps.forEach((t, i) => {
            if (!used.has(i) && (pick < 0 || Math.abs(t - want) < Math.abs(taps[pick] - want)))
                pick = i;
        });
        if (pick < 0)
            return 0;
        const off = Math.abs(taps[pick] - want) / own;
        // A miss leaves the tap free for another hit.
        const credit = clamp(1 - (off - spot) / 0.25, 0, 1);
        if (credit > 0)
            used.add(pick);
        return credit;
    });
    // Banging away must not beat listening, so taps beyond the pattern cost points.
    const extra = Math.max(0, taps.length - hits.length);
    return { score: credits.reduce((a, b) => a + b, 0) / (hits.length + extra), credits };
}
export function grade(score) {
    return score >= 0.9 ? 'perfect' : score >= 0.7 ? 'great' : score >= 0.45 ? 'good' : 'oops';
}
