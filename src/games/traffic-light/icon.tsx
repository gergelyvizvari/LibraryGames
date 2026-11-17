import type { GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
// A zebra crossing with a green "go" lamp beside it (Lights Out already has a whole traffic light).
export const icon: GameIcon = [
  ['base', '#7d7a8c', <rect x="4" y="12" width="40" height="30" rx="7" />],
  ['detail', '#fbf7ec', <path d="M12 17 h16 v4 h-16Z M12 25 h16 v4 h-16Z M12 33 h16 v4 h-16Z" />],
  ['accent', '#3b3550', <circle cx="37" cy="12" r="9" />],
  ['detail', '#4fd26b', <circle cx="37" cy="12" r="5.5" />],
  ['shine', '#fff', <circle cx="35.4" cy="10.4" r="1.6" />],
]
