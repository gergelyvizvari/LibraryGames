import { ink, type GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
// A sleeping cat's head, with a little "z" floating up.
export const icon: GameIcon = [
  ['accent', '#ff9f43', <path d="M8 22 L10 6 L21 14 Z M40 22 L38 6 L27 14 Z" />],
  ['base', '#ff9f43', <ellipse cx="24" cy="28" rx="17" ry="15" />],
  ['detail', ink, <path d="M13.5 27 q4 3.5 8 0 M26.5 27 q4 3.5 8 0" fill="none" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />],
  ['detail', '#ff6b6b', <path d="M21.5 32 h5 l-2.5 3 Z" />],
  ['accent', '#fff', <path d="M35 3 h9 l-8 8 h9" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />],
  ['shine', '#fff', <ellipse cx="16" cy="19" rx="4" ry="2.4" />],
]
