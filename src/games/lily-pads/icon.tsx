import type { GameIcon } from '../../kit/icon'

// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
// Two lily pads with the same red heart on each.

/** A round pad with its notch cut out towards `a` degrees. */
const pad = (cx: number, cy: number, r: number, a: number) => {
  const p = (deg: number) => `${(cx + r * Math.cos((deg * Math.PI) / 180)).toFixed(1)} ${(cy + r * Math.sin((deg * Math.PI) / 180)).toFixed(1)}`
  return `M${cx} ${cy} L${p(a + 22)} A${r} ${r} 0 1 1 ${p(a - 22)}Z`
}
const heart = (x: number, y: number) => <path d="M0 20 C-30 0 -16 -24 0 -9 C16 -24 30 0 0 20Z" transform={`translate(${x} ${y}) scale(0.27)`} />

export const icon: GameIcon = [
  ['accent', '#1dd1a1', <path d={pad(16, 17, 13, -60)} />],
  ['base', '#1dd1a1', <path d={pad(31, 31, 14, 120)} />],
  ['detail', '#ff6b6b', heart(16, 18)],
  ['detail', '#ff6b6b', heart(31, 32)],
]
