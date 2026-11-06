import { type GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
// A snowy mountain with a river winding past it.
export const icon: GameIcon = [
  ['base', '#8d6e63', <path d="M4 38 L19 12 L27 24 L32 17 L44 38 Z" />],
  ['detail', '#fff', <path d="M14.5 20 L19 12 L23.5 19.5 L21 18 L19 20 L17 18 Z" />],
  ['accent', '#54a0ff', <path d="M2 44 C10 38 16 46 24 41 C30 37 36 44 46 40 L46 46 L2 46 Z" />],
  ['shine', '#fff', <path d="M30 22 L32 19 L34 22 Z" />],
]
