import { clamp, type Rng } from '../../kit/random'
import { items, type Item } from './content'

export const QUESTIONS = 10

const lv = (level: number) => clamp(Math.round(level), 1, 10)

export const poolForLevel = (level: number) => items.filter((i) => i.minLevel <= lv(level))

/** Ten different items, the newest-unlocked ones a bit more likely so each level feels fresh. */
export function pickItems(rng: Rng, level: number): Item[] {
  const weighted = rng.shuffle(poolForLevel(level)).sort((a, b) => b.minLevel - a.minLevel + (rng.next() - 0.5) * 6)
  // Never the same continent three times in a row, so the round keeps moving round the world.
  const out: Item[] = []
  const rest = weighted.slice(0, QUESTIONS + 6)
  while (out.length < QUESTIONS && rest.length) {
    const i = rest.findIndex((it) => !(out.length >= 2 && out.at(-1)!.continent === it.continent && out.at(-2)!.continent === it.continent))
    out.push(rest.splice(Math.max(0, i), 1)[0])
  }
  return out
}

/** Continent names are written on the map at the first levels. */
export const showLabels = (level: number) => lv(level) <= 2
/** Each continent has its own colour until level 6; after that the map is one colour, a real blind map. */
export const coloured = (level: number) => lv(level) <= 6

/** Points: more for the first try, a bonus for being quick and for a streak. */
export function pointsFor(tries: number, seconds: number, combo: number) {
  if (tries > 1) return 0
  const base = tries === 0 ? 15 : 5
  const quick = tries === 0 ? Math.max(0, Math.round((6 - seconds) * 1.5)) : 0
  return base + quick + (tries === 0 ? Math.min(Math.max(combo - 1, 0), 5) * 2 : 0)
}
