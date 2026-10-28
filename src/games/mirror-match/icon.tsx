import { type GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
export const icon: GameIcon = [
  ['base', '#feca57', <rect x="20.5" y="32" width="7" height="13" rx="3.5" />],
  ['base', '#feca57', <ellipse cx="24" cy="19" rx="15" ry="16" />],
  ['detail', '#c7ecee', <ellipse cx="24" cy="19" rx="10.5" ry="11.5" />],
  ['shine', '#fff', <path d="M17 22 L25 12 L28 13 L19 24 Z" />],
]
