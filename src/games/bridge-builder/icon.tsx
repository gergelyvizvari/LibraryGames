import type { GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
// A bridge deck with one plank dropping into its gap.
export const icon: GameIcon = [
  ['base', '#8d6e63', <path d="M3 28 h15 v7 h-15Z M30 28 h15 v7 h-15Z" />],
  ['accent', '#8d6e63', <path d="M4 18 h3 v10 h-3Z M41 18 h3 v10 h-3Z M4 18 Q24 24 44 18 v2 Q24 26 4 20Z" />],
  ['base', '#feca57', <rect x="17" y="10" width="14" height="7" rx="2" />],
  ['detail', '#2d3142', <path d="M24 19 v5 M21 22 l3 3 l3 -3" fill="none" stroke="#2d3142" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />],
]
