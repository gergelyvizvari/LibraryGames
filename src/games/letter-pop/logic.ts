import { clamp } from '../../kit/random'

// Home row first, then the rows above and below, like a typing course.
const rows = ['asdfjkl', 'ghqweruio', 'tyzxcvbnmp']

export function lettersForLevel(level: number) {
  if (level <= 2) return rows[0]
  if (level <= 4) return rows[0] + rows[1]
  return rows.join('')
}

/** Rising speed in % of the height per second. */
export const riseSpeed = (level: number, elapsed: number) => clamp(9 + level * 1.5 + elapsed * 0.12, 9, 30)

export const spawnGap = (level: number, elapsed: number) => clamp(1.5 - level * 0.08 - elapsed * 0.01, 0.5, 1.5)
