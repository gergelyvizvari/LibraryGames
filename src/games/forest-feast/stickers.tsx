import { ink, type GameIcon } from '../../kit/icon'
import type { Sticker } from '../../kit/types'
import { icon } from './icon'

const fox: GameIcon = [
  ['accent', '#ff9f43', <path d="M8 22 L6 4 L20 14Z M40 22 L42 4 L28 14Z" />],
  ['base', '#ff9f43', <ellipse cx="24" cy="24" rx="17" ry="15" />],
  ['detail', '#fff', <path d="M7 27 Q15 41 24 39 Q33 41 41 27 Q33 32 24 32 Q15 32 7 27Z" />],
  ['base', ink, <path d="M17 18.8a3.4 3.4 0 1 0 .1 0Z M31 18.8a3.4 3.4 0 1 0 .1 0Z M21 28 h6 q0 3.6 -3 3.6 q-3 0 -3 -3.6Z" />],
  ['shine', '#fff', <path d="M16 19.6a1.1 1.1 0 1 0 .1 0Z M30 19.6a1.1 1.1 0 1 0 .1 0Z" />],
]

const tea: GameIcon = [
  ['accent', '#fff', <ellipse cx="22" cy="38" rx="18" ry="5" />],
  ['accent', '#1dd1a1', <path d="M33 18 h4 a8 8 0 0 1 0 16 h-6 v-5 h6 a3 3 0 0 0 0 -6 h-4Z" />],
  ['base', '#1dd1a1', <path d="M8 16 h28 v8 a14 14 0 0 1 -28 0Z" />],
  ['detail', '#c7ecee', <ellipse cx="22" cy="16" rx="14" ry="3.5" />],
  ['shine', '#fff', <path d="M12 21 h4 v5 a3 3 0 0 1 -4 -2Z" />],
]

// Won one at a time by finishing stages.
export const stickers: Sticker[] = [
  { name: 'sticker.cake', icon },
  { name: 'sticker.fox', icon: fox },
  { name: 'sticker.tea', icon: tea },
]
