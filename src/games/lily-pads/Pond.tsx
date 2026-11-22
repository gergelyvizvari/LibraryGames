import { Critter } from '../../kit/critters'
import { Thing } from '../../kit/things'
import pad from './art/pad.webp'
import type { Pic } from './logic'

// The frog's pond: two big painted lily pads floating on the painted water, the pictures lying on them.

/** One picture drawn to fill its box: a thing or a sitting forest animal. */
export function PicArt({ pic }: { pic: Pic }) {
  if (pic.kind === 'thing') return <Thing id={pic.id} className="lp-art" />
  return (
    <svg className="lp-art" viewBox="-46 -52 92 92" aria-hidden focusable="false">
      <Critter kind={pic.kind === 'critter' ? pic.id : 'owl'} body />
    </svg>
  )
}

/** A painted lily pad, its notch turned towards `notch` degrees; the second pad is a little lighter. */
export function PadArt({ notch, light }: { notch: number; light: boolean }) {
  return <img className="lp-pad-art" src={pad} alt="" draggable={false} style={{ rotate: `${notch}deg`, filter: `${light ? 'brightness(1.08) saturate(0.92) hue-rotate(-8deg) ' : ''}drop-shadow(4px 8px 4px rgba(10, 80, 90, 0.35))` }} />
}
