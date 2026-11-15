import { ink, type GameIcon } from '../../kit/icon'
import type { Sticker } from '../../kit/types'

const pot: GameIcon = [
  ['base', '#fff', <path d="M8 16 H40 L36 40 Q24 45 12 40Z" />],
  ['detail', '#a29bfe', <path d="M9.5 24 H38.5 L37 33 Q24 37 11 33Z" />],
  ['accent', '#a29bfe', <ellipse cx="24" cy="16" rx="16" ry="7" />],
  ['shine', '#fff', <path d="M14 15 q5 -3 11 -3 v2.5 q-5 0 -9 2Z" />],
]

const brush: GameIcon = [
  ['accent', '#8d6e63', <rect x="21" y="20" width="7" height="25" rx="3.5" transform="rotate(35 24.5 32.5)" />],
  ['base', '#c7ecee', <rect x="24" y="16" width="11" height="9" rx="2" transform="rotate(35 29.5 20.5)" />],
  ['base', '#ff6b6b', <path d="M30 17 Q28 6 38 4 Q44 8 38 18 Q35 21 30 17Z" />],
  ['detail', '#feca57', <path d="M33 15 Q32 9 38 6.5 Q41 10 37 16Z" />],
]

const alicorn: GameIcon = [
  ['accent', '#feca57', <path d="M27 14 L36 3 L33 17Z" />],
  ['accent', '#c7ecee', <path d="M18 26 Q3 24 4 11 Q9 15 12 14 Q12 9 17 8 Q19 16 23 23Z" />],
  ['base', '#a29bfe', <path d="M16 20 a11 11 0 0 1 21 -3 l6 8 a5 5 0 0 1 -5 8 h-7 v10 h-15Z" />],
  ['detail', ink, <circle cx="30" cy="21" r="2.6" />],
  ['detail', '#ff6b6b', <circle cx="27" cy="29" r="2.4" />],
]

// Won one at a time by finishing stages.
export const stickers: Sticker[] = [
  { name: 'sticker.pot', icon: pot },
  { name: 'sticker.brush', icon: brush },
  { name: 'sticker.alicorn', icon: alicorn },
]
