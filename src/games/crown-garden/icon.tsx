import { type GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md: a crown on a little patch of garden.
export const icon: GameIcon = [
  ['accent', '#1dd1a1', <rect x="5" y="33" width="38" height="11" rx="5.5" />],
  ['base', '#feca57', <path d="M9 34 L7 13 L17 22 L24 8 L31 22 L41 13 L39 34 Z" />],
  ['detail', '#ff6b6b', <circle cx="24" cy="26" r="3.6" />],
  ['detail', '#54a0ff', <circle cx="15" cy="28" r="2.6" />],
  ['detail', '#54a0ff', <circle cx="33" cy="28" r="2.6" />],
  ['shine', '#fff', <path d="M12 17 L14 19 L13.5 27 L11.5 27 Z" />],
]
