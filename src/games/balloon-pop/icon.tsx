import { type GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
// Two balloons on their strings.
export const icon: GameIcon = [
  ['accent', '#fff', <path d="M17 31 Q14 38 18 45 M31 27 Q34 36 30 45" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />],
  ['base', '#54a0ff', <ellipse cx="31" cy="15" rx="11" ry="12.5" />],
  ['base', '#feca57', <ellipse cx="17" cy="19" rx="11" ry="12.5" />],
  ['shine', '#fff', <ellipse cx="13" cy="13" rx="2.4" ry="4" transform="rotate(25 13 13)" />],
]
