import type { GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
// A glass jar with three glowing fireflies inside.
export const icon: GameIcon = [
  ['accent', '#8d6e63', <rect x="15" y="4" width="18" height="6" rx="2" />],
  ['base', '#c7ecee', <path d="M14 10 h20 q4 0 4 4 v26 q0 5 -5 5 h-18 q-5 0 -5 -5 v-26 q0 -4 4 -4Z" />],
  ['detail', '#feca57', <path d="M19 33 m-3.5 0 a3.5 3.5 0 1 0 7 0 a3.5 3.5 0 1 0 -7 0 M29 27 m-3.5 0 a3.5 3.5 0 1 0 7 0 a3.5 3.5 0 1 0 -7 0 M22 20 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0" />],
  ['shine', '#fff', <rect x="16" y="14" width="3" height="14" rx="1.5" />],
]
