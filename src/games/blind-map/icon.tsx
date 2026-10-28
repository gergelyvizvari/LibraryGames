import { type GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
export const icon: GameIcon = [
  ['base', '#c7ecee', <path d="M4 10 L17 6 L31 10 L44 6 V38 L31 42 L17 38 L4 42 Z" />],
  ['accent', '#9ad8e0', <path d="M17 6 L31 10 V42 L17 38 Z" />],
  ['detail', '#1dd1a1', <path d="M8 17 C12 13 20 15 21 20 C22 26 15 28 11 26 C7 24 6 20 8 17 Z" />],
  ['detail', '#ff6b6b', <path d="M34 13 C30 13 28 16 28 19 C28 24 34 30 34 30 C34 30 40 24 40 19 C40 16 38 13 34 13 Z" />],
  ['detail', '#fff', <circle cx="34" cy="19" r="2.2" />],
]
