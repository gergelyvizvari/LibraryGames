import { ink, type GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
export const icon: GameIcon = [
  ['accent', '#feca57', <path d="M8 22 L8 5 L21 13 Z M40 22 L40 5 L27 13 Z" />],
  ['base', '#feca57', <ellipse cx="24" cy="27" rx="18" ry="16" />],
  ['detail', ink, <circle cx="17" cy="24" r="3" />],
  ['detail', ink, <circle cx="31" cy="24" r="3" />],
  ['detail', '#ff6b6b', <path d="M21 30 H27 L24 34 Z" />],
  ['shine', '#fff', <ellipse cx="14" cy="17" rx="3" ry="2" transform="rotate(-30 14 17)" />],
]
