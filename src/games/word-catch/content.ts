import type { Locale } from '../../i18n'

export interface Word {
  emoji: string
  word: string
}

// Picture words for young readers. Grouped roughly by length: short words appear at low levels.
// To add a language, add a list with the same emojis in that language.
export const words: { en: Word[] } & Partial<Record<Locale, Word[]>> = {
  en: [
    { emoji: '🐱', word: 'cat' }, { emoji: '🐶', word: 'dog' }, { emoji: '☀️', word: 'sun' }, { emoji: '🐝', word: 'bee' },
    { emoji: '🥚', word: 'egg' }, { emoji: '🐷', word: 'pig' }, { emoji: '🚗', word: 'car' }, { emoji: '🚌', word: 'bus' },
    { emoji: '🧢', word: 'cap' }, { emoji: '🔑', word: 'key' }, { emoji: '🐮', word: 'cow' }, { emoji: '🦊', word: 'fox' },
    { emoji: '🐟', word: 'fish' }, { emoji: '🐸', word: 'frog' }, { emoji: '🌙', word: 'moon' }, { emoji: '⭐', word: 'star' },
    { emoji: '🍰', word: 'cake' }, { emoji: '🐻', word: 'bear' }, { emoji: '🦆', word: 'duck' }, { emoji: '🌳', word: 'tree' },
    { emoji: '🚢', word: 'ship' }, { emoji: '🎈', word: 'balloon' }, { emoji: '🍎', word: 'apple' }, { emoji: '🐴', word: 'horse' },
    { emoji: '🐍', word: 'snake' }, { emoji: '🍌', word: 'banana' }, { emoji: '🏠', word: 'house' }, { emoji: '🦁', word: 'lion' },
    { emoji: '🐘', word: 'elephant' }, { emoji: '🦒', word: 'giraffe' }, { emoji: '🐢', word: 'turtle' }, { emoji: '🚀', word: 'rocket' },
    { emoji: '🌈', word: 'rainbow' }, { emoji: '🍕', word: 'pizza' }, { emoji: '🦋', word: 'butterfly' }, { emoji: '🐧', word: 'penguin' },
    { emoji: '🍓', word: 'strawberry' }, { emoji: '🚲', word: 'bicycle' }, { emoji: '🐙', word: 'octopus' }, { emoji: '🦕', word: 'dinosaur' },
    { emoji: '🍪', word: 'cookie' }, { emoji: '🧸', word: 'teddy' }, { emoji: '🎂', word: 'birthday' }, { emoji: '🌻', word: 'sunflower' },
  ],
}

/** Words available at a level: longer words unlock as the level rises. */
export function wordsForLevel(list: Word[], level: number) {
  const maxLen = level <= 2 ? 4 : level <= 4 ? 6 : 99
  const pool = list.filter((w) => w.word.length <= maxLen)
  return pool.length >= 6 ? pool : list
}
