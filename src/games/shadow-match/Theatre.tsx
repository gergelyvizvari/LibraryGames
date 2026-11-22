import { Critter } from '../../kit/critters'
import { Thing } from '../../kit/things'
import type { Shape } from './logic'

// The shadow theatre in the woods: a sheet hung between two posts, lit warm from the front.

/** One shape drawn to fill its box, a thing or a sitting forest animal. */
export function ShapeArt({ shape }: { shape: Shape }) {
  if (shape.kind === 'thing') return <Thing id={shape.id} className="sm-art" />
  return (
    <svg className="sm-art" viewBox="-46 -52 92 92" aria-hidden focusable="false">
      <Critter kind={shape.id} body />
    </svg>
  )
}

/** viewBox 0 0 360 250: the sheet spans about x 40 to 320 and y 34 to 214. */
