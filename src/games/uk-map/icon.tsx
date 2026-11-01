import { type GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
// Great Britain and Northern Ireland with a pin on them.
export const icon: GameIcon = [
  ['accent', '#1dd1a1', <path d="M5 24 L10 21 L14 23 L13 29 L7 30 Z" />],
  ['base', '#1dd1a1', <path d="M19 4 L26 4 L24 10 L28 12 L25 17 L29 22 L32 27 L37 30 L41 36 L38 41 L28 42 L18 45 L13 42 L19 38 L15 33 L20 30 L18 24 L15 19 L17 13 L14 8 Z" />],
  ['accent', '#ff6b6b', <path d="M34 4 C29.6 4 27 7.3 27 11 C27 16 34 22 34 22 C34 22 41 16 41 11 C41 7.3 38.4 4 34 4 Z" />],
  ['shine', '#fff', <circle cx="34" cy="11" r="2.8" />],
]
