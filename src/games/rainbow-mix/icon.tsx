import type { GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md: a painter's palette with three paints and a brush.
export const icon: GameIcon = [
  ['base', '#fff', <path d="M24 6 C11 6 4 15 4 25 C4 36 13 43 23 43 C29 43 28 37 25 35 C22 33 24 29 28 29 H37 C42 29 45 25 44 20 C42 11 34 6 24 6Z" />],
  ['detail', '#ff6b6b', <circle cx="15" cy="19" r="4.5" />],
  ['detail', '#feca57', <circle cx="26" cy="14" r="4.5" />],
  ['detail', '#54a0ff', <circle cx="36" cy="20" r="4.5" />],
  ['detail', '#a29bfe', <circle cx="14" cy="31" r="4.5" />],
]
