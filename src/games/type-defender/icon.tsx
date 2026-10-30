import { ink, type GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
export const icon: GameIcon = [
  ['accent', ink, <rect x="23" y="3" width="2" height="14" />],
  ['accent', '#ff6b6b', <path d="M25 3.5 L34 7 L25 10.5 Z" />],
  ['base', '#a4b0be', <path d="M5 44 V17 H12 V22 H18 V17 H30 V22 H36 V17 H43 V44 Z" />],
  ['detail', '#8d6e63', <path d="M18.5 44 V35 A5.5 5.5 0 0 1 29.5 35 V44 Z" />],
  ['detail', ink, <path d="M10 28 h4 v6 h-4 Z M34 28 h4 v6 h-4 Z" />],
]
