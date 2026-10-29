import { sound } from '../../kit/sound'
import type { Animal } from './logic'

const { tone } = sound

/** Each animal's call, built from short synth notes. All calls last under 0.6 s. */
export const voices: Record<Animal, () => void> = {
  cat: () => [620, 760, 820, 700, 560].forEach((f, i) => tone(f, 0.12, 'triangle', 0.18, i * 0.08)),
  dog: () => {
    tone(220, 0.1, 'square', 0.14)
    tone(170, 0.08, 'square', 0.12, 0.06)
    tone(230, 0.1, 'square', 0.14, 0.26)
    tone(175, 0.08, 'square', 0.12, 0.32)
  },
  cow: () => [130, 140, 150, 145, 135].forEach((f, i) => tone(f, 0.16, 'sawtooth', 0.12, i * 0.1)),
  duck: () => {
    tone(480, 0.09, 'sawtooth', 0.1)
    tone(420, 0.09, 'sawtooth', 0.1, 0.05)
    tone(480, 0.09, 'sawtooth', 0.1, 0.24)
    tone(420, 0.09, 'sawtooth', 0.1, 0.29)
  },
  bird: () => [2000, 2600, 2100, 2700, 2200, 2800].forEach((f, i) => tone(f, 0.06, 'sine', 0.14, i * 0.07)),
  frog: () => [260, 300, 260, 300, 240].forEach((f, i) => tone(f, 0.05, 'square', 0.1, i * 0.06 + (i > 2 ? 0.12 : 0))),
}
