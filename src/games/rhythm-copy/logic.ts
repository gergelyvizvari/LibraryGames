import { clamp, type Rng } from '../../kit/random'

export const ROUNDS = 8
/** Beats in a bar (4/4) and in the count-in before each pass. */
export const BAR = 4

/**
 * One beat-sized building block, named after the rhythm syllables kids learn in music class:
 * ta = one quarter note, ti-ti = two eighths, ta-a = a half note (two beats), rest = a silent beat.
 */
export type Cell = 'ta' | 'titi' | 'taa' | 'rest'

export const cellBeats: Record<Cell, number> = { ta: 1, titi: 1, taa: 2, rest: 1 }

export interface Pattern {
  cells: Cell[]
  /** Length in beats: always whole bars, so the pulse never breaks. */
  beats: number
  /** When each drum hit falls, in beats from the start of the pattern. */
  hits: number[]
}

/** Milliseconds per beat: 100 bpm at level 1, about 130 bpm at level 10. */
export function beatMs(level: number) {
  return clamp(620 - level * 17, 450, 600)
}

export function barsFor(level: number, round: number) {
  return level >= 5 || (level >= 3 && round >= ROUNDS / 2) ? 2 : 1
}

export function hitTimes(cells: Cell[]) {
  const hits: number[] = []
  let at = 0
  for (const c of cells) {
    if (c === 'titi') hits.push(at, at + 0.5)
    else if (c !== 'rest') hits.push(at)
    at += cellBeats[c]
  }
  return hits
}

function makeBar(rng: Rng, level: number, first: boolean): Cell[] {
  // Rests come in from level 3; ti-ti gets more common as the level rises.
  const pool: Cell[] = level < 3 ? ['ta', 'ta', 'titi', 'taa'] : level < 6 ? ['ta', 'titi', 'taa', 'rest'] : ['ta', 'titi', 'titi', 'taa', 'rest']
  for (;;) {
    const cells: Cell[] = []
    let beat = 0
    while (beat < BAR) {
      const c = rng.pick(pool)
      // A half note sits on beat 1 or 3, never across the middle of the bar.
      if (c === 'taa' && beat % 2 !== 0) continue
      // The pattern starts on beat 1 and two rests in a row lose the thread.
      if (c === 'rest' && ((first && beat === 0) || cells[cells.length - 1] === 'rest')) continue
      cells.push(c)
      beat += cellBeats[c]
    }
    // Four plain ta beats is just the pulse itself; ask for a real rhythm.
    if (cells.some((c) => c !== 'ta')) return cells
  }
}

export function makePattern(rng: Rng, level: number, round: number): Pattern {
  const bars = barsFor(level, round)
  const cells: Cell[] = []
  for (let b = 0; b < bars; b++) cells.push(...makeBar(rng, level, b === 0))
  return { cells, beats: bars * BAR, hits: hitTimes(cells) }
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2
}

/**
 * How well the taps land on the pattern's beats, 0..1, plus a credit per hit.
 * `hits` and `taps` are in ms on the same clock. A steady lag (slow screens, Bluetooth speakers)
 * is forgiven, so what counts is keeping the pulse, not reaction time.
 */
export function judge(hits: number[], taps: number[], beat: number) {
  if (taps.length === 0) return { score: 0, credits: hits.map(() => 0) }
  const nearest = (t: number) => hits.reduce((best, h) => (Math.abs(t - h) < Math.abs(t - best) ? h : best))
  const lag = clamp(median(taps.map((t) => t - nearest(t))), -beat / 4, beat / 4)
  const used = new Set<number>()
  const credits = hits.map((h) => {
    let pick = -1
    taps.forEach((t, i) => {
      if (!used.has(i) && (pick < 0 || Math.abs(t - lag - h) < Math.abs(taps[pick] - lag - h))) pick = i
    })
    if (pick < 0) return 0
    const off = Math.abs(taps[pick] - lag - h) / beat
    // Within 15% of a beat is spot on; 35% off or worse is a miss (and leaves the tap free for another hit).
    const credit = clamp(1 - (off - 0.15) / 0.2, 0, 1)
    if (credit > 0) used.add(pick)
    return credit
  })
  // Banging away at every beat must not beat listening, so taps beyond the pattern cost points.
  const extra = Math.max(0, taps.length - hits.length)
  return { score: credits.reduce((a, b) => a + b, 0) / (hits.length + extra), credits }
}

export function grade(score: number): 'perfect' | 'great' | 'good' | 'oops' {
  return score >= 0.9 ? 'perfect' : score >= 0.7 ? 'great' : score >= 0.45 ? 'good' : 'oops'
}
