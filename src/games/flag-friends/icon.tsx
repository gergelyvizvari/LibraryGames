import { ink, type GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
// Two little flags on poles, side by side like a matched pair.
export const icon: GameIcon = [
  ['accent', '#8d6e63', <rect x="6" y="6" width="4" height="38" rx="2" />],
  ['accent', '#8d6e63', <rect x="26" y="10" width="4" height="34" rx="2" />],
  ['base', '#ff6b6b', <path d="M10 8 H24 Q22 14 24 20 H10 Z" />],
  ['base', '#1dd1a1', <path d="M30 12 H44 Q42 18 44 24 H30 Z" />],
  ['detail', '#fff', <rect x="10" y="12" width="14" height="4" />],
  ['detail', ink, <circle cx="37" cy="18" r="2.5" />],
]
