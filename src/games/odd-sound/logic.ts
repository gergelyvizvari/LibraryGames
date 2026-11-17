import { clamp, type Rng } from '../../kit/random'

/** Songs to tell apart in one stage. */
export const STAGE = 5

/** Notes the birds can sing: a pentatonic scale over two octaves (C5 to A6), so every tune sounds friendly. */
export const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760]
/** Steps of the scale in one octave. */
const OCTAVE = 5

/** How the odd bird's song differs from the others. */
export type Change = 'octave' | 'turn' | 'note'

export interface Spec {
  birds: number
  notes: number
  change: Change
  /** For a changed note: how many scale steps it moves, at least. */
  step: number
}

const SPECS: Spec[] = [
  { birds: 3, notes: 3, change: 'octave', step: 0 },
  { birds: 3, notes: 3, change: 'octave', step: 0 },
  { birds: 3, notes: 3, change: 'turn', step: 0 },
  { birds: 3, notes: 4, change: 'turn', step: 0 },
  { birds: 3, notes: 3, change: 'note', step: 3 },
  { birds: 3, notes: 4, change: 'note', step: 3 },
  { birds: 4, notes: 4, change: 'note', step: 2 },
  { birds: 4, notes: 4, change: 'note', step: 2 },
  { birds: 4, notes: 4, change: 'note', step: 1 },
  { birds: 4, notes: 5, change: 'note', step: 1 },
]

export const specFor = (level: number) => SPECS[clamp(Math.round(level), 1, 10) - 1]

/** A song is a list of steps on SCALE. */
export type Song = number[]

export interface Task {
  songs: Song[]
  odd: number
}

/** A tune that climbs or falls without repeating a note, within `lo`..`hi` steps of the scale. */
function walk(rng: Rng, notes: number, lo: number, hi: number): Song {
  for (;;) {
    const song = [rng.int(lo, hi)]
    while (song.length < notes) {
      const prev = song[song.length - 1]
      const next = prev + rng.pick([-2, -1, 1, 2])
      if (next < lo || next > hi) break
      song.push(next)
    }
    if (song.length === notes) return song
  }
}

/** The same tune turned around, which must sound different from the tune itself. */
const turned = (song: Song) => [...song].reverse()

/** Two songs that differ in the way `spec` asks. */
export function makePair(rng: Rng, spec: Spec): { same: Song; odd: Song } {
  if (spec.change === 'octave') {
    const low = walk(rng, spec.notes, 0, OCTAVE - 1)
    const high = low.map((n) => n + OCTAVE)
    return rng.chance(0.5) ? { same: low, odd: high } : { same: high, odd: low }
  }
  if (spec.change === 'turn') {
    for (;;) {
      const same = walk(rng, spec.notes, 1, SCALE.length - 2)
      const odd = turned(same)
      if (odd.join() !== same.join()) return { same, odd }
    }
  }
  for (;;) {
    const same = walk(rng, spec.notes, 1, SCALE.length - 2)
    // Not the first note: hearing where the tune starts is easy, the change hides inside it.
    const at = rng.int(1, spec.notes - 1)
    const moved = same[at] + rng.pick([-1, 1]) * (spec.step + rng.int(0, 1))
    if (moved < 0 || moved >= SCALE.length) continue
    const odd = [...same]
    odd[at] = moved
    return { same, odd }
  }
}

/** One branch of birds: every bird sings the same song but one. */
export function makeTask(rng: Rng, level: number, lastOdd = -1): Task {
  const spec = specFor(level)
  const { same, odd } = makePair(rng, spec)
  let at = rng.int(0, spec.birds - 1)
  if (at === lastOdd) at = (at + 1 + rng.int(0, spec.birds - 2)) % spec.birds
  return { songs: Array.from({ length: spec.birds }, (_, i) => (i === at ? odd : same)), odd: at }
}

/** Time for one note and for the pause after a bird's song, in ms. */
export const NOTE_MS = 300
export const BIRD_GAP_MS = 500

/** When each bird starts singing, from the start of the round, in ms. */
export function startTimes(task: Task): number[] {
  let t = 0
  return task.songs.map((s) => {
    const at = t
    t += s.length * NOTE_MS + BIRD_GAP_MS
    return at
  })
}
