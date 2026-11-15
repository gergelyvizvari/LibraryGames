import { ink, type GameIcon } from '../../kit/icon'
import type { Sticker } from '../../kit/types'
import { icon } from './icon'

const house: GameIcon = [
  ['accent', '#fff', <path d="M4 36 a6 6 0 0 1 8 -6 a8 8 0 0 1 13 -1 a7 7 0 0 1 12 2 a6 6 0 0 1 6 9 a5 5 0 0 1 -4 5 H9 a6 6 0 0 1 -5 -9Z" />],
  ['base', '#feca57', <path d="M14 20 H34 V36 H14Z" />],
  ['base', '#ff6b6b', <path d="M10 22 L24 6 L38 22Z" />],
  ['detail', ink, <path d="M21 36 v-7 a3 3 0 0 1 6 0 v7Z" />],
]

const pegasus: GameIcon = [
  ['accent', '#c7ecee', <path d="M20 24 Q4 22 5 8 Q10 13 14 12 Q14 7 19 5 Q22 14 26 22Z" />],
  ['accent', '#feca57', <path d="M22 10 Q10 12 10 26 Q10 34 14 40 Q15 30 20 25Z" />],
  ['base', '#54a0ff', <path d="M16 20 a11 11 0 0 1 21 -3 l6 8 a5 5 0 0 1 -5 8 h-7 v10 h-15Z" />],
  ['detail', ink, <circle cx="30" cy="21" r="2.6" />],
  ['shine', '#fff', <circle cx="27" cy="29" r="2.2" />],
]

// Won one at a time by finishing stages.
export const stickers: Sticker[] = [
  { name: 'sticker.letter', icon },
  { name: 'sticker.house', icon: house },
  { name: 'sticker.pegasus', icon: pegasus },
]
