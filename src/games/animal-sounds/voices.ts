import { playClip, preloadClip, sound } from '../../kit/sound'
import { ANIMALS, type Animal } from './logic'
import bird from './sounds/bird.mp3'
import cat from './sounds/cat.mp3'
import cow from './sounds/cow.mp3'
import dog from './sounds/dog.mp3'
import duck from './sounds/duck.mp3'
import frog from './sounds/frog.mp3'

const { tone } = sound

/** Real recordings of each call (sources and licences in sounds/CREDITS.md). */
const clips: Record<Animal, string> = { cat, dog, cow, duck, bird, frog }

/** Synth stand-ins, only heard if a recording hasn't loaded yet. */
const synth: Record<Animal, () => void> = {
  cat: () => [620, 760, 820, 700, 560].forEach((f, i) => tone(f, 0.12, 'triangle', 0.18, i * 0.08)),
  dog: () => {
    tone(220, 0.1, 'square', 0.14)
    tone(230, 0.1, 'square', 0.14, 0.26)
  },
  cow: () => [130, 140, 150, 145, 135].forEach((f, i) => tone(f, 0.16, 'sawtooth', 0.12, i * 0.1)),
  duck: () => {
    tone(480, 0.09, 'sawtooth', 0.1)
    tone(480, 0.09, 'sawtooth', 0.1, 0.24)
  },
  bird: () => [2000, 2600, 2100, 2700].forEach((f, i) => tone(f, 0.06, 'sine', 0.14, i * 0.07)),
  frog: () => [260, 300, 260].forEach((f, i) => tone(f, 0.05, 'square', 0.1, i * 0.06)),
}

export const preloadVoices = (animals: readonly Animal[]) => animals.forEach((a) => preloadClip(clips[a]))

/** Each animal's call: about a second; the next call cuts it off, so fast levels stay clear. */
export const voices = Object.fromEntries(
  ANIMALS.map((a) => [a, () => playClip(clips[a]) || synth[a]()]),
) as Record<Animal, () => void>
