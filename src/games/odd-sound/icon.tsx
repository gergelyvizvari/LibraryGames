import type { GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.

/** A blue bird singing a note. */
export const icon: GameIcon = [
  ['base', '#5fa8e8', <ellipse cx="22" cy="28" rx="13" ry="12" />],
  ['detail', '#d9ecfb', <ellipse cx="25" cy="32" rx="7" ry="6" />],
  ['detail', '#f2c14e', <path d="M34 25 L42 27 L34 30 Z" />],
  ['detail', '#2d2440', <circle cx="28" cy="23" r="2" />],
  ['accent', '#6b5aa6', <path d="M36 6 h6 v4 h-3 v8 a3.5 3 0 1 1 -3 -3 Z" />],
]
