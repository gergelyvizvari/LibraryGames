import { Critter } from '../../kit/critters'
import { Thing } from '../../kit/things'
import type { Pic } from './logic'

// The frog's pond: two big lily pads floating on turquoise water, the pictures lying on them.

/** One picture drawn to fill its box: a thing or a sitting forest animal. */
export function PicArt({ pic }: { pic: Pic }) {
  if (pic.kind === 'thing') return <Thing id={pic.id} className="lp-art" />
  return (
    <svg className="lp-art" viewBox="-46 -52 92 92" aria-hidden focusable="false">
      <Critter kind={pic.kind === 'critter' ? pic.id : 'owl'} body />
    </svg>
  )
}

const pt = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180
  return `${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`
}

/** A lily pad on a -100..100 grid, its notch pointing towards `notch` degrees. */
export function PadArt({ notch, light, dark }: { notch: number; light: string; dark: string }) {
  const leaf = (r: number) => `M0 0 L${pt(r, notch + 5)} A${r} ${r} 0 1 1 ${pt(r, notch - 5)}Z`
  return (
    <svg className="lp-pad-art" viewBox="-100 -100 200 200" aria-hidden focusable="false">
      <ellipse cx="4" cy="10" rx="98" ry="94" fill="#2a98ac" opacity="0.55" />
      <path d={leaf(96)} fill={dark} />
      <path d={leaf(91)} fill={light} transform="translate(-3 -4)" />
      {/* Veins from the notch outwards, faint. */}
      {[40, 90, 140, 180, 220, 270, 320].map((a) => (
        <path key={a} d={`M${pt(10, notch + a)} L${pt(78, notch + a)}`} stroke="#fff6dc" strokeWidth="2.4" strokeLinecap="round" opacity="0.22" transform="translate(-3 -4)" />
      ))}
    </svg>
  )
}

/** Water lilies and ripples for the pond's corners. */
export function PondArt() {
  return (
    <svg className="lp-pond-art" viewBox="0 0 200 200" preserveAspectRatio="none" aria-hidden focusable="false">
      <path d="M20 40 h26 M150 30 h22 M30 170 h30 M140 176 h26 M90 12 h18 M84 190 h20" stroke="#b8ecec" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
    </svg>
  )
}

/** A small pink water lily that floats in a corner. */
export function Lily() {
  return (
    <svg className="lp-lily" viewBox="-20 -20 40 40" aria-hidden focusable="false">
      <ellipse cx="0" cy="6" rx="17" ry="8" fill="#6cbf5c" />
      {[-60, -20, 20, 60].map((a) => (
        <ellipse key={a} cx="0" cy="-6" rx="5" ry="11" fill="#f4a6c4" transform={`rotate(${a} 0 4)`} />
      ))}
      <ellipse cx="0" cy="-4" rx="5" ry="11" fill="#fbd0e0" />
      <circle cx="0" cy="3" r="3.5" fill="#f2c14e" />
    </svg>
  )
}
