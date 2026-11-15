import { Pony, type PonyMood } from '../../kit/ponies'
import type { StoneColour } from './logic'

// The sky between two clouds: the garland with the rainbow's order on top, the stepping stones below it.

export const W = 360
export const H = 250

export const paint: Record<StoneColour, { top: string; side: string }> = {
  red: { top: '#e8505b', side: '#bf3847' },
  orange: { top: '#f58a3c', side: '#cf6a24' },
  yellow: { top: '#f7cf45', side: '#d9a928' },
  green: { top: '#58b368', side: '#3d8e4e' },
  blue: { top: '#3f97e0', side: '#2b73b8' },
  indigo: { top: '#4347a8', side: '#2f3282' },
  violet: { top: '#9a5ac8', side: '#7a40a4' },
  pink: { top: '#f6a5c0', side: '#d9809f' },
  brown: { top: '#9a6a48', side: '#774e33' },
  grey: { top: '#a9a9b8', side: '#85859a' },
  white: { top: '#fbf7ef', side: '#d8d0c2' },
  turquoise: { top: '#45c4be', side: '#2b9c97' },
}
const rainbow = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'] as const

/** Where stone `i` of `len` lies: the bridge sags a little towards the middle, like a rope bridge. */
export function stoneAt(i: number, len: number) {
  const gap = Math.min(40, 244 / len)
  const x = W / 2 + (i - (len - 1) / 2) * gap
  const y = 186 + 12 * Math.sin((Math.PI * (i + 0.5)) / len)
  return { x, y, r: Math.min(17, gap / 2 - 1.5) }
}
/** Where the unicorn stands: -1 on the left cloud, `len` on the right one. */
export function ponyAt(at: number, len: number) {
  if (at < 0) return { x: 28, y: 150 }
  if (at >= len) return { x: W - 38, y: 150 }
  const s = stoneAt(at, len)
  return { x: s.x, y: s.y - 30 }
}

/** A stepping stone, drawn around its middle: a lit top on a darker side. */
export function Stone({ colour, r = 17 }: { colour: StoneColour; r?: number }) {
  const p = paint[colour]
  return (
    <>
      <ellipse cy={r * 0.3} rx={r} ry={r * 0.72} fill={p.side} />
      <ellipse rx={r} ry={r * 0.72} fill={p.top} />
      <ellipse cx={-r * 0.3} cy={-r * 0.3} rx={r * 0.38} ry={r * 0.16} fill="#fff" opacity="0.45" />
    </>
  )
}

const Cloud = ({ x, y, s = 1, fill = '#fff' }: { x: number; y: number; s?: number; fill?: string }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
    <ellipse cx="0" cy="0" rx="44" ry="16" />
    <circle cx="-20" cy="-9" r="15" />
    <circle cx="2" cy="-16" r="19" />
    <circle cx="24" cy="-7" r="13" />
  </g>
)

export function BridgeArt({
  len,
  stones,
  selected,
  wrong,
  at,
  mood,
  garland,
  crossed,
  backwards,
}: {
  len: number
  /** The colour on every place, null for a gap. */
  stones: (StoneColour | null)[]
  /** The gap the next stone goes to. */
  selected: number | null
  /** Stones that wobble because they are in the wrong place. */
  wrong: number[]
  at: number
  mood: PonyMood
  /** The garland with the rainbow's order: in sight, behind a cloud, or not there at all. */
  garland: 'shown' | 'hidden' | 'none'
  crossed: boolean
  /** The unicorn walks back: it looks to the left. */
  backwards?: boolean
}) {
  const pony = ponyAt(at, len)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="rb-art" aria-hidden focusable="false">
      <rect width={W} height={H} rx="28" fill="#a9daf0" />
      <path d={`M0 150 Q90 120 180 142 Q270 164 ${W} 136 V${H - 28} a28 28 0 0 1 -28 28 H28 a28 28 0 0 1 -28 -28Z`} fill="#bfe6f5" />
      <Cloud x={84} y={128} s={0.5} fill="#d9f0fa" />
      <Cloud x={262} y={112} s={0.62} fill="#d9f0fa" />
      {/* The rainbow that grows over the finished bridge: red on the outside, violet on the inside. */}
      {crossed && (
        <g className="rb-bow" fill="none" strokeWidth="5">
          {rainbow.map((c, i) => (
            <path key={c} d={`M${40 + i * 5} 196 A${140 - i * 5} ${118 - i * 5} 0 0 1 ${W - 40 - i * 5} 196`} stroke={paint[c].top} />
          ))}
        </g>
      )}
      {/* The garland: seven flags in the rainbow's order. */}
      {garland !== 'none' && (
        <g>
          <rect x="60" y="20" width="5" height="46" rx="2.5" fill="#b98a5c" />
          <rect x={W - 65} y="20" width="5" height="46" rx="2.5" fill="#b98a5c" />
          <path d={`M62 24 Q180 52 ${W - 62} 24`} fill="none" stroke="#8a5c3c" strokeWidth="2" />
          {rainbow.map((c, i) => {
            const u = (i + 0.5) / 7
            const x = 62 + u * (W - 124)
            const y = 24 + 28 * 2 * u * (1 - u)
            return <path key={c} transform={`translate(${x} ${y})`} d="M-12 -1 H12 L0 26Z" fill={paint[c].top} />
          })}
          <g className={`rb-veil${garland === 'hidden' ? ' rb-veil-on' : ''}`}>
            <Cloud x={120} y={58} s={1.5} />
            <Cloud x={236} y={54} s={1.6} />
          </g>
        </g>
      )}
      {/* The clouds at the two ends. */}
      <Cloud x={20} y={206} s={1.35} />
      <Cloud x={W - 20} y={206} s={1.35} />
      <path d={`M0 212 H56 Q40 240 0 238Z M${W} 212 H${W - 56} Q${W - 40} 240 ${W} 238Z`} fill="#fff" />
      {stones.map((c, i) => {
        const s = stoneAt(i, len)
        return (
          <g key={i} transform={`translate(${s.x} ${s.y})`}>
            {c ? (
              <g key={c} className={wrong.includes(i) ? 'rb-wobble' : 'rb-laid'}>
                <Stone colour={c} r={s.r} />
              </g>
            ) : (
              <ellipse className={selected === i ? 'rb-gap rb-gap-on' : 'rb-gap'} cy={s.r * 0.15} rx={s.r - 1} ry={s.r * 0.72} />
            )}
          </g>
        )
      })}
      <g className="rb-pony" style={{ transform: `translate(${pony.x}px, ${pony.y}px)` }}>
        <g className={mood === 'happy' ? 'rb-hop' : mood === 'sad' ? 'rb-no' : undefined}>
          <g transform={`scale(${backwards ? -0.62 : 0.62} 0.62)`}>
            <Pony kind="unicorn" mood={mood} />
          </g>
        </g>
      </g>
    </svg>
  )
}
