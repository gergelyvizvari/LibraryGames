import { ink, type GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
// An alarm clock.
export const icon: GameIcon = [
  ['accent', '#feca57', <path d="M5 15 A8 8 0 0 1 16 5 Z M43 15 A8 8 0 0 0 32 5 Z" />],
  ['accent', '#ff6b6b', <path d="M12 40 L9 45 H14 L16 41 Z M36 40 L39 45 H34 L32 41 Z" />],
  ['base', '#54a0ff', <circle cx="24" cy="26" r="18" />],
  ['detail', '#fff', <circle cx="24" cy="26" r="13.5" />],
  ['detail', ink, <path d="M22.5 26 V16 A1.5 1.5 0 0 1 25.5 16 V24.5 H31 A1.5 1.5 0 0 1 31 27.5 H24 A1.5 1.5 0 0 1 22.5 26 Z" />],
]
