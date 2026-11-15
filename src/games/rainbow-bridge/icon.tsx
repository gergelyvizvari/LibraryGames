import type { GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md: a rainbow standing on two clouds.
export const icon: GameIcon = [
  ['base', '#ff6b6b', <path d="M4 36 A20 20 0 0 1 44 36 H4Z" />],
  ['detail', '#feca57', <path d="M10 36 A14 14 0 0 1 38 36Z" />],
  ['detail', '#54a0ff', <path d="M16 36 A8 8 0 0 1 32 36Z" />],
  ['accent', '#fff', <path d="M3 38 a5 5 0 0 1 7 -5 a6 6 0 0 1 10 3 a4 4 0 0 1 -1 8 H7 a4 4 0 0 1 -4 -6Z" />],
  ['accent', '#fff', <path d="M28 38 a5 5 0 0 1 7 -5 a6 6 0 0 1 10 3 a4 4 0 0 1 -1 8 H32 a4 4 0 0 1 -4 -6Z" />],
]
