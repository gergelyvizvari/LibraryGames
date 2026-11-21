/**
 * Finding a game by typing: kids type without accents ("szorny" finds "Etesd a szörnyet!"), in either language,
 * and a few letters of any word are enough.
 */

/** Lower case without accents: "Szörny" and "szorny" both become "szorny". */
export function fold(text: string) {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

export interface Searchable<T> {
  item: T
  /** The game's name in every language: a hit here ranks first. */
  titles: string[]
  /** Everything else a kid might type: what the game is about, its skill and its place on the map. */
  more: string[]
}

const words = (text: string) => fold(text).split(/[^\p{L}\p{N}]+/u).filter(Boolean)

/**
 * Hungarian glues words together ("vaktérkép", "Makkbolt"), so a typed word of three or more letters may sit
 * anywhere inside a word; a shorter one must start it, or almost everything would match.
 */
const inWord = (h: string, w: string) => (w.length >= 3 ? h.includes(w) : h.startsWith(w))

/**
 * The items every typed word is found in, the best first: a title that starts with the query, then one
 * where every word is found in the title, then the rest. An empty query returns nothing.
 */
export function search<T>(list: Searchable<T>[], query: string): T[] {
  const typed = words(query)
  if (!typed.length) return []
  const has = (hay: string[], w: string) => hay.some((h) => inWord(h, w))
  const start = fold(query).trim()
  return list
    .map((e, i) => {
      const title = e.titles.flatMap(words)
      const all = [...title, ...e.more.flatMap(words)]
      if (!typed.every((w) => has(all, w))) return null
      const rank = e.titles.some((t) => fold(t).startsWith(start)) ? 0 : typed.every((w) => has(title, w)) ? 1 : 2
      return { item: e.item, rank, i }
    })
    .filter((x) => x !== null)
    .sort((a, b) => a.rank - b.rank || a.i - b.i)
    .map((x) => x.item)
}
