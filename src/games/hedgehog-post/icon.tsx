import type { GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md: a letter with a heart seal.
export const icon: GameIcon = [
  ['base', '#fff', <rect x="5" y="11" width="38" height="27" rx="4" />],
  ['detail', '#c7ecee', <path d="M5 13 L24 27 L43 13 V15 L24 29 L5 15Z" />],
  ['detail', '#ff6b6b', <path d="M24 34 C14 27 18 20 24 25 C30 20 34 27 24 34Z" />],
]
