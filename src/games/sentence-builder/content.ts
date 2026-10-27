import type { Locale } from '../../i18n'

export interface Sentence {
  picture: string
  text: string
}

// Short sentences that match a picture. Longer ones unlock at higher levels.
export const sentences: { en: Sentence[] } & Partial<Record<Locale, Sentence[]>> = {
  en: [
    { picture: '🐱🛏️', text: 'The cat is on the bed' },
    { picture: '🐶⚽', text: 'The dog has a ball' },
    { picture: '☀️😎', text: 'The sun is hot' },
    { picture: '🐟🌊', text: 'A fish can swim' },
    { picture: '🐦🌳', text: 'The bird is in the tree' },
    { picture: '🍎🧒', text: 'I like red apples' },
    { picture: '🐸💦', text: 'The frog jumps in the pond' },
    { picture: '🚌🏫', text: 'We go to school by bus' },
    { picture: '🌙⭐', text: 'The moon is up at night' },
    { picture: '🐘💧', text: 'The big elephant drinks water' },
    { picture: '🍰🎂', text: 'Mum made a cake for me' },
    { picture: '🐻🍯', text: 'The bear loves sweet honey' },
    { picture: '🚀🌍', text: 'The rocket flies around the world' },
    { picture: '🐢🐇', text: 'The slow turtle beat the fast rabbit' },
    { picture: '🌧️☂️', text: 'Take your umbrella when it rains' },
    { picture: '🐧❄️', text: 'Penguins live where it is very cold' },
  ],
}

export function sentencesForLevel(list: Sentence[], level: number) {
  const max = level <= 2 ? 5 : level <= 4 ? 6 : 99
  const pool = list.filter((s) => s.text.split(' ').length <= max)
  return pool.length >= 6 ? pool : list
}
