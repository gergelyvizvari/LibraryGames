import type { Locale } from '../../i18n'

// Easy-to-type words for kids, shortest first.
export const wordLists: { en: string[] } & Partial<Record<Locale, string[]>> = {
  en: [
    'cat', 'dog', 'sun', 'run', 'hat', 'big', 'red', 'fun', 'sky', 'cup', 'map', 'pen', 'box', 'zoo', 'jam', 'bug',
    'fish', 'star', 'moon', 'frog', 'cake', 'jump', 'play', 'book', 'rain', 'tree', 'ball', 'bird', 'milk', 'boat',
    'apple', 'happy', 'tiger', 'pizza', 'robot', 'house', 'green', 'smile', 'cloud', 'dance', 'magic', 'water',
    'rocket', 'monkey', 'dragon', 'castle', 'banana', 'jungle', 'planet', 'rabbit', 'pirate', 'school',
  ],
}

export function wordsForLevel(list: string[], level: number) {
  const maxLen = level <= 2 ? 3 : level <= 4 ? 4 : level <= 6 ? 5 : 99
  const pool = list.filter((w) => w.length <= maxLen)
  return pool.length >= 8 ? pool : list
}
