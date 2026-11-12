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
export function TheatreArt() {
  return (
    <svg className="sm-theatre-art" viewBox="0 0 360 250" aria-hidden>
      <defs>
        <radialGradient id="sm-light" cx="50%" cy="48%" r="58%">
          <stop offset="0" stopColor="#fff4cf" />
          <stop offset="0.7" stopColor="#fbe8b8" />
          <stop offset="1" stopColor="#efd59c" />
        </radialGradient>
      </defs>
      <ellipse cx="180" cy="240" rx="170" ry="9" fill="#241a3c" opacity="0.2" />
      {/* Posts */}
      <rect x="22" y="14" width="16" height="228" rx="7" fill="#8a5a3c" />
      <rect x="30" y="14" width="8" height="228" rx="4" fill="#6d4130" />
      <rect x="322" y="14" width="16" height="228" rx="7" fill="#8a5a3c" />
      <rect x="330" y="14" width="8" height="228" rx="4" fill="#6d4130" />
      {/* The rod with a leafy garland */}
      <rect x="12" y="20" width="336" height="12" rx="6" fill="#a8744e" />
      {/* The sheet, its hem a little wavy */}
      <path d="M40 32 H320 V206 Q306 216 292 208 Q278 200 264 208 Q250 216 236 208 Q222 200 208 208 Q194 216 180 208 Q166 200 152 208 Q138 216 124 208 Q110 200 96 208 Q82 216 68 208 Q54 200 40 208Z" fill="url(#sm-light)" />
      <path d="M300 32 H320 V206 Q310 212 300 210Z" fill="#e6cc92" opacity="0.6" />
      {[30, 66, 102, 138, 174, 210, 246, 282, 318].map((x, i) => (
        <g key={x}>
          <ellipse cx={x} cy={22} rx="12" ry="7" fill={i % 2 ? '#62ab3e' : '#7cc552'} transform={`rotate(${i % 2 ? 18 : -18} ${x} 22)`} />
          <circle cx={x + 10} cy={30} r="3.4" fill="#e2607e" />
        </g>
      ))}
    </svg>
  )
}
