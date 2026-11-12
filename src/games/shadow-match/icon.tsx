import { ink, type GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
// A yellow star and its dark shadow behind it.
const star = 'M0 -15 L4.3 -5 L15 -4.3 L6.8 2.9 L9.3 13.6 L0 7.9 L-9.3 13.6 L-6.8 2.9 L-15 -4.3 L-4.3 -5Z'
export const icon: GameIcon = [
  ['accent', ink, <path d={star} transform="translate(30 30)" />],
  ['base', '#feca57', <path d={star} transform="translate(19 20)" />],
  ['shine', '#fff', <ellipse cx="15" cy="15" rx="3" ry="1.8" transform="rotate(-30 15 15)" />],
]
