import { ink, type GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
// A domino: two dots paired up on one half, the odd one out on the other.
export const icon: GameIcon = [
  ['base', '#fff', <rect x="6" y="9" width="36" height="30" rx="7" />],
  ['detail', ink, <rect x="23" y="12" width="2.5" height="24" rx="1.25" />],
  ['detail', '#54a0ff', <circle cx="14" cy="18" r="4" />],
  ['detail', '#54a0ff', <circle cx="14" cy="30" r="4" />],
  ['detail', '#ff6b6b', <circle cx="34" cy="24" r="4.5" />],
]
