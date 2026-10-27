import type { Locale } from '../../i18n'

export interface Word {
  emoji: string
  word: string
}

export const words: { en: Word[] } & Partial<Record<Locale, Word[]>> = {
  en: [
    { emoji: '🐱', word: 'cat' }, { emoji: '🐶', word: 'dog' }, { emoji: '☀️', word: 'sun' }, { emoji: '🐷', word: 'pig' },
    { emoji: '🚌', word: 'bus' }, { emoji: '🥚', word: 'egg' }, { emoji: '🦊', word: 'fox' }, { emoji: '🐝', word: 'bee' },
    { emoji: '🐟', word: 'fish' }, { emoji: '🐸', word: 'frog' }, { emoji: '🌙', word: 'moon' }, { emoji: '⭐', word: 'star' },
    { emoji: '🍰', word: 'cake' }, { emoji: '🦆', word: 'duck' }, { emoji: '🐻', word: 'bear' }, { emoji: '🌳', word: 'tree' },
    { emoji: '🍎', word: 'apple' }, { emoji: '🐴', word: 'horse' }, { emoji: '🏠', word: 'house' }, { emoji: '🍕', word: 'pizza' },
    { emoji: '🐍', word: 'snake' }, { emoji: '🐯', word: 'tiger' }, { emoji: '🤖', word: 'robot' }, { emoji: '☁️', word: 'cloud' },
    { emoji: '🚀', word: 'rocket' }, { emoji: '🐒', word: 'monkey' }, { emoji: '🍌', word: 'banana' }, { emoji: '🐉', word: 'dragon' },
    { emoji: '🐧', word: 'penguin' }, { emoji: '🌈', word: 'rainbow' }, { emoji: '🦒', word: 'giraffe' }, { emoji: '🐘', word: 'elephant' },
  ],
}

export function wordsForLevel(list: Word[], level: number) {
  const max = level <= 2 ? 3 : level <= 4 ? 4 : level <= 6 ? 5 : 99
  const pool = list.filter((w) => w.word.length <= max)
  return pool.length >= 6 ? pool : list
}
