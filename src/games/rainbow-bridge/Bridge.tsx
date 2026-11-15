import { Pony, type PonyMood } from '../../kit/ponies'
import type { StoneColour } from './logic'

// The sky between two cloud banks: a meadow cloud on the left, the cloud castle on the right, the garland with
// the rainbow's order on top and the stepping stones in between.

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
  if (at >= len) return { x: W - 52, y: 152 }
  const s = stoneAt(at, len)
  return { x: s.x, y: s.y - 30 }
}

/** A stepping stone, drawn around its middle: a lit top on a darker side, with a glint. */
export function Stone({ colour, r = 17 }: { colour: StoneColour; r?: number }) {
  const p = paint[colour]
  return (
    <>
      <ellipse cy={r * 0.34} rx={r} ry={r * 0.72} fill={p.side} />
      <ellipse rx={r} ry={r * 0.72} fill={p.top} />
      <path d={`M${-r * 0.78} ${r * 0.12} A${r} ${r * 0.72} 0 0 0 ${r * 0.78} ${r * 0.12}`} fill="none" stroke={p.side} strokeWidth={r * 0.1} opacity="0.35" />
      <ellipse cx={-r * 0.3} cy={-r * 0.3} rx={r * 0.38} ry={r * 0.16} fill="#fff" opacity="0.55" />
      <circle cx={r * 0.42} cy={-r * 0.2} r={r * 0.08} fill="#fff" opacity="0.7" />
    </>
  )
}

const Cloud = ({ x, y, s = 1, fill = '#fff', shade }: { x: number; y: number; s?: number; fill?: string; shade?: string }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {shade && (
      <g fill={shade}>
        <ellipse cx="0" cy="4" rx="45" ry="16" />
        <circle cx="-22" cy="-5" r="15" />
        <circle cx="26" cy="-3" r="13" />
      </g>
    )}
    <g fill={fill}>
      <ellipse cx="0" cy="0" rx="44" ry="16" />
      <circle cx="-20" cy="-9" r="15" />
      <circle cx="2" cy="-16" r="19" />
      <circle cx="24" cy="-7" r="13" />
    </g>
  </g>
)

/** The cloud castle the unicorn is going home to. */
function Castle() {
  return (
    <g transform="translate(326 150)">
      <rect x="-22" y="-22" width="40" height="46" fill="#fff3dc" />
      <rect x="8" y="-22" width="10" height="46" fill="#ecd9b4" />
      <path d="M-22 -22 v-7 h7 v4 h6 v-4 h7 v4 h6 v-4 h7 v4 h7 v3Z" fill="#fff3dc" />
      <rect x="-30" y="-44" width="16" height="68" fill="#fffaf0" />
      <rect x="-19" y="-44" width="5" height="68" fill="#ecd9b4" />
      <path d="M-34 -42 L-22 -70 L-10 -42Z" fill="#d9506a" />
      <path d="M-22 -70 L-10 -42 H-17Z" fill="#b63c5c" />
      <rect x="10" y="-36" width="15" height="60" fill="#fffaf0" />
      <rect x="20" y="-36" width="5" height="60" fill="#ecd9b4" />
      <path d="M6 -34 L17.5 -58 L29 -34Z" fill="#7d4a6e" />
      <path d="M17.5 -58 L29 -34 H23Z" fill="#5f3554" />
      <path d="M-22 -70 v-10" stroke="#8a5c3c" strokeWidth="1.6" />
      <path className="rb-flag" d="M-22 -80 l10 3.5 l-10 3.5Z" fill="#f7cf45" />
      <path d="M-9 24 v-18 a8 8 0 0 1 16 0 v18Z" fill="#8a3e55" />
      <path d="M-1 -2 V24" stroke="#6d2f42" strokeWidth="1.2" />
      <rect x="-25" y="-30" width="6" height="9" rx="3" fill="#ffd24a" />
      <rect x="14.5" y="-24" width="6" height="9" rx="3" fill="#ffd24a" />
      <path d="M-4 -14 c-3 -3 -6.5 .8 0 5.4 c6.5 -4.6 3 -8.4 0 -5.4Z" fill="#f08aa6" />
    </g>
  )
}

const Flower = ({ x, y, c }: { x: number; y: number; c: string }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M0 0 v9" stroke="#58b368" strokeWidth="1.6" strokeLinecap="round" />
    <circle r="3.6" fill={c} />
    <circle r="1.5" fill="#f7cf45" />
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
  walking,
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
  /** The unicorn is on its way: its legs trot. */
  walking: boolean
  /** The unicorn walks back: it looks to the left. */
  backwards?: boolean
}) {
  const pony = ponyAt(at, len)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="rb-art" aria-hidden focusable="false">
      <rect width={W} height={H} fill="#9fd4ef" />
      <path d={`M0 120 Q90 96 180 116 Q270 136 ${W} 108 V${H} H0Z`} fill="#b3def4" />
      <path d={`M0 176 Q110 150 200 172 Q290 192 ${W} 166 V${H} H0Z`} fill="#c8e9f8" />
      <circle cx="22" cy="104" r="24" fill="#fff6c8" opacity="0.5" />
      <circle cx="22" cy="104" r="14" fill="#ffe27a" />
      <Cloud x={112} y={112} s={0.5} fill="#e2f3fb" />
      <Cloud x={236} y={98} s={0.62} fill="#e2f3fb" />
      {[[150, 150], [214, 132], [96, 86], [286, 70]].map(([x, y], i) => (
        <path key={i} className="pp-twinkle" style={{ animationDelay: `${i * 0.6}s` }} transform={`translate(${x} ${y})`} d="M0 -4 l1 3 3 1 -3 1 -1 3 -1 -3 -3 -1 3 -1Z" fill="#fff" />
      ))}
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
          <rect x="60" y="18" width="5" height="48" rx="2.5" fill="#b98a5c" />
          <rect x={W - 65} y="18" width="5" height="48" rx="2.5" fill="#b98a5c" />
          <circle cx="62.5" cy="17" r="4" fill="#f7cf45" />
          <circle cx={W - 62.5} cy="17" r="4" fill="#f7cf45" />
          <path d={`M62 24 Q180 52 ${W - 62} 24`} fill="none" stroke="#8a5c3c" strokeWidth="2" />
          {rainbow.map((c, i) => {
            const u = (i + 0.5) / 7
            const x = 62 + u * (W - 124)
            const y = 24 + 28 * 2 * u * (1 - u)
            return (
              <g key={c} transform={`translate(${x} ${y})`}>
                <g className="rb-pennant" style={{ animationDelay: `${i * 0.12}s` }}>
                  <path d="M-12 -1 H12 L0 26Z" fill={paint[c].top} />
                  <path d="M0 -1 H12 L0 26Z" fill={paint[c].side} opacity="0.55" />
                </g>
              </g>
            )
          })}
          <g className={`rb-veil${garland === 'hidden' ? ' rb-veil-on' : ''}`}>
            <Cloud x={120} y={58} s={1.5} shade="#dbe9f7" />
            <Cloud x={236} y={54} s={1.6} shade="#dbe9f7" />
          </g>
        </g>
      )}
      {/* The cloud banks at the two ends: a little meadow on the left, the castle on the right. */}
      <Castle />
      <Cloud x={20} y={206} s={1.35} shade="#dbe9f7" />
      <Cloud x={W - 20} y={206} s={1.35} shade="#dbe9f7" />
      <path d={`M0 212 H56 Q40 240 0 238Z M${W} 212 H${W - 56} Q${W - 40} 240 ${W} 238Z`} fill="#fff" />
      <Flower x={10} y={196} c="#f08aa6" />
      <Flower x={50} y={204} c="#b79be8" />
      <Flower x={W - 8} y={198} c="#f08aa6" />
      {/* A soft mist under the stones. */}
      <ellipse cx={W / 2} cy="218" rx="120" ry="10" fill="#fff" opacity="0.35" />
      {stones.map((c, i) => {
        const s = stoneAt(i, len)
        return (
          <g key={i} transform={`translate(${s.x} ${s.y})`}>
            <ellipse cy={s.r * 0.95} rx={s.r * 0.9} ry={s.r * 0.22} fill="#5fa4d2" opacity="0.3" />
            {c ? (
              <g key={c} className={wrong.includes(i) ? 'rb-wobble' : at === i ? 'rb-press' : 'rb-laid'}>
                <Stone colour={c} r={s.r} />
              </g>
            ) : (
              <ellipse className={selected === i ? 'rb-gap rb-gap-on' : 'rb-gap'} cy={s.r * 0.15} rx={s.r - 1} ry={s.r * 0.72} />
            )}
          </g>
        )
      })}
      <g className="rb-pony" style={{ transform: `translate(${pony.x}px, ${pony.y}px)` }}>
        <g key={at} className={walking && mood === 'idle' ? 'rb-step' : undefined}>
          <g className={mood === 'happy' ? 'rb-hop' : mood === 'sad' ? 'rb-no' : undefined}>
            <g transform={`scale(${backwards ? -0.62 : 0.62} 0.62)`}>
              <Pony kind="unicorn" mood={mood} motion={walking && mood !== 'happy' ? 'walk' : 'stand'} />
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}
