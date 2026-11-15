import { ink, type GameIcon } from '../../kit/icon'
import type { Sticker } from '../../kit/types'
import { icon } from './icon'

const unicorn: GameIcon = [
  ['accent', '#feca57', <path d="M27 14 L36 3 L33 17Z" />],
  ['accent', '#a29bfe', <path d="M22 10 Q8 10 7 26 Q6 36 12 43 Q13 32 18 26Z" />],
  ['base', '#fff', <path d="M16 20 a11 11 0 0 1 21 -3 l6 8 a5 5 0 0 1 -5 8 h-7 v10 h-15Z" />],
  ['detail', ink, <circle cx="30" cy="21" r="2.6" />],
  ['detail', '#ff6b6b', <circle cx="27" cy="29" r="2.4" />],
]

const garland: GameIcon = [
  ['accent', '#8d6e63', <path d="M4 10 Q24 24 44 10 v3 Q24 27 4 13Z" />],
  ['base', '#ff6b6b', <path d="M6 14 l9 4 l-7 12Z" />],
  ['base', '#feca57', <path d="M17 19 l9 1 l-5 13Z" />],
  ['base', '#1dd1a1', <path d="M28 20 l8 -2 l-2 14Z" />],
  ['base', '#54a0ff', <path d="M37 17 l6 -3 l1 13Z" />],
]

// Won one at a time by finishing stages.
export const stickers: Sticker[] = [
  { name: 'sticker.rainbow', icon },
  { name: 'sticker.unicorn', icon: unicorn },
  { name: 'sticker.garland', icon: garland },
]
