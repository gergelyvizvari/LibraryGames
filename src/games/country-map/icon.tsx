import { type GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
// A country-shaped map with a pin on it.
export const icon: GameIcon = [
  ['base', '#1dd1a1', <path d="M4 22 L9 15 L17 14 L22 10 L31 11 L37 7 L44 12 L43 20 L39 25 L37 33 L29 36 L20 37 L12 34 L6 29 Z" />],
  ['detail', '#54a0ff', <path d="M22 11 L24 18 L21 25 L23 36 L20 36.5 L18.5 25 L21 18 L19.5 11.5 Z" />],
  ['accent', '#ff6b6b', <path d="M32 4 C27 4 24 7.5 24 11.5 C24 17 32 24 32 24 C32 24 40 17 40 11.5 C40 7.5 37 4 32 4 Z" />],
  ['shine', '#fff', <circle cx="32" cy="11.5" r="3" />],
]
