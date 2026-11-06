import { playClip, preloadClip, sound } from '../../kit/sound'
import { ANIMALS, type Animal } from './logic'
import bird from './sounds/bird.mp3'
import cat from './sounds/cat.mp3'
import cow from './sounds/cow.mp3'
import dog from './sounds/dog.mp3'
import duck from './sounds/duck.mp3'
import frog from './sounds/frog.mp3'
import horse from './sounds/horse.mp3'
import pig from './sounds/pig.mp3'
import rooster from './sounds/rooster.mp3'
import sheep from './sounds/sheep.mp3'

const { tone } = sound

/** Real recordings of each call (sources and licences in sounds/CREDITS.md). */
const clips: Record<Animal, string> = { cat, dog, cow, duck, bird, frog, sheep, pig, rooster, horse }

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
  sheep: () => tone(380, 0.4, 'sawtooth', 0.08),
  pig: () => [180, 160].forEach((f, i) => tone(f, 0.12, 'square', 0.1, i * 0.2)),
  rooster: () => [500, 700, 700, 560].forEach((f, i) => tone(f, 0.15, 'triangle', 0.15, i * 0.15)),
  horse: () => [900, 1100, 800, 600].forEach((f, i) => tone(f, 0.12, 'triangle', 0.12, i * 0.09)),
}

export const preloadVoices = (animals: readonly Animal[]) => animals.forEach((a) => preloadClip(clips[a]))

/** Each animal's call: about a second (the cow's moo a little longer), so it ends before the next one starts. */
export const voices = Object.fromEntries(
  ANIMALS.map((a) => [a, () => playClip(clips[a], 0.6) || synth[a]()]),
) as Record<Animal, () => void>
