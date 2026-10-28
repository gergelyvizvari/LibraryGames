import { ink, type GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
export const icon: GameIcon = [
  ['accent', '#6d4c41', <ellipse cx="24" cy="40" rx="20" ry="6" />],
  ['base', '#a1887f', <path d="M10 40 V24 C10 15 16 8 24 8 C32 8 38 15 38 24 V40 Z" />],
  ['detail', ink, <circle cx="18.5" cy="21" r="2.3" />],
  ['detail', ink, <circle cx="29.5" cy="21" r="2.3" />],
  ['detail', '#ff9ff3', <ellipse cx="24" cy="27" rx="3.8" ry="2.8" />],
  ['detail', '#fff', <rect x="21.8" y="30.5" width="4.4" height="4.5" rx="1" />],
]
