import { type GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
// Three story cards in a row: a seed, a sprout and a flower.
export const icon: GameIcon = [
  ['base', '#fff', <rect x="2" y="10" width="13" height="28" rx="3" />],
  ['base', '#fff', <rect x="17.5" y="10" width="13" height="28" rx="3" />],
  ['base', '#fff', <rect x="33" y="10" width="13" height="28" rx="3" />],
  ['accent', '#a0522d', <ellipse cx="8.5" cy="29" rx="3.5" ry="2.6" />],
  ['accent', '#20bf6b', <rect x="23" y="20" width="2" height="12" rx="1" />],
  ['accent', '#20bf6b', <ellipse cx="27" cy="21" rx="3.2" ry="1.8" transform="rotate(-30 27 21)" />],
  ['accent', '#20bf6b', <rect x="38.5" y="22" width="2" height="10" rx="1" />],
  ['accent', '#ff6b6b', <circle cx="39.5" cy="19" r="5" />],
  ['detail', '#feca57', <circle cx="39.5" cy="19" r="2.2" />],
]
