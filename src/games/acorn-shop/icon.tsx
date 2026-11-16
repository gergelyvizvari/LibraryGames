import type { GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
// A golden acorn coin with a 5 on it.
export const icon: GameIcon = [
  ['base', '#feca57', <ellipse cx="24" cy="28" rx="15" ry="16" />],
  ['accent', '#8d6e63', <path d="M7 19 Q7 6 24 6 Q41 6 41 19 Q24 23 7 19Z M22 1 h4 v7 h-4Z" />],
  ['detail', '#fff', <circle cx="24" cy="30" r="8" />],
  ['detail', '#2d3142', <path d="M27 24.5 h-6 l-1 5 q4 -1.6 6 0.6 q1.8 2.4 -0.6 4.4 q-2.6 1.6 -5.4 -0.4" fill="none" stroke="#2d3142" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />],
]
