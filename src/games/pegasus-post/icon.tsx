import type { GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md: a letter with two wings.
export const icon: GameIcon = [
  ['accent', '#c7ecee', <path d="M14 18 Q2 16 3 6 Q8 10 12 9 Q12 5 16 4 Q18 12 20 18Z" />],
  ['accent', '#c7ecee', <path d="M34 18 Q46 16 45 6 Q40 10 36 9 Q36 5 32 4 Q30 12 28 18Z" />],
  ['base', '#fff', <rect x="8" y="17" width="32" height="24" rx="4" />],
  ['detail', '#feca57', <path d="M8 19 L24 31 L40 19 V21.5 L24 33.5 L8 21.5Z" />],
  ['detail', '#ff6b6b', <path d="M24 39 C17 34 20 29 24 32.5 C28 29 31 34 24 39Z" />],
]
