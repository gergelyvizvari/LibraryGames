import { type GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
export const icon: GameIcon = [
  ['accent', '#8d6e63', <rect x="29" y="26" width="7" height="19" rx="3.5" transform="rotate(-45 32.5 35.5)" />],
  ['base', '#feca57', <circle cx="20" cy="20" r="15" />],
  ['detail', '#c7ecee', <circle cx="20" cy="20" r="10" />],
  ['shine', '#fff', <path d="M13 19 A7 7 0 0 1 19 13 L19 16 A4 4 0 0 0 16 19 Z" />],
]
