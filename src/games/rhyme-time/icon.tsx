import { ink, type GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
// Two speech bubbles that answer each other.
export const icon: GameIcon = [
  ['accent', '#feca57', <path d="M22 20 H42 A3 3 0 0 1 45 23 V35 A3 3 0 0 1 42 38 H38 L40 44 L32 38 H25 A3 3 0 0 1 22 35 Z" />],
  ['base', '#fff', <path d="M3 8 A3 3 0 0 1 6 5 H28 A3 3 0 0 1 31 8 V22 A3 3 0 0 1 28 25 H15 L7 31 L9 25 H6 A3 3 0 0 1 3 22 Z" />],
  ['detail', ink, <rect x="9" y="11" width="16" height="3.5" rx="1.75" />],
  ['detail', ink, <rect x="9" y="17" width="10" height="3.5" rx="1.75" />],
  ['detail', ink, <rect x="28" y="26" width="11" height="3.5" rx="1.75" />],
]
