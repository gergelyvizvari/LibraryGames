import { ink, type GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
export const icon: GameIcon = [
  ['accent', '#feca57', <path d="M13 13 L9 3 L19 9 Z M35 13 L39 3 L29 9 Z" />],
  ['base', '#a29bfe', <path d="M7 41 V22 C7 12 14 6 24 6 C34 6 41 12 41 22 V41 L36 37 L30 41 L24 37 L18 41 L12 37 Z" />],
  ['detail', '#fff', <circle cx="24" cy="18" r="6.5" />],
  ['base', ink, <circle cx="25.5" cy="19" r="3" />],
  ['detail', ink, <path d="M14 27 Q24 39 34 27 Z" />],
  ['base', '#fff', <path d="M18 27.5 L20.5 31.5 L23 27.5 Z M25 27.5 L27.5 31.5 L30 27.5 Z" />],
]
