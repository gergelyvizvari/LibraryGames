import { useEffect, useState } from 'react'
import { Pony, type PonyKind, type PonyMood } from '../../kit/ponies'
import { mixColour, tint, type Paint } from './logic'

// The painting corner on the meadow: the pony who wishes for a colour, its wish in a thought cloud, and the
// mixing bowl on a tree stump.

export const W = 360
export const H = 306

/** The pure colour of a paint, as it looks in its pot and as a drop. */
export const paintColour = (p: Paint) => mixColour([p])
/** A mane that still waits for its paint. */
export const BARE = ['#f3eef7', '#e3dcec', '#ece6f2']

/** A splash of paint, drawn around its middle. */
export function Splash({ colour, r = 24 }: { colour: string; r?: number }) {
  const k = r / 24
  return (
    <g transform={`scale(${k})`}>
      <path d="M-22 -4 Q-25 -19 -10 -20 Q-3 -29 9 -22 Q24 -22 23 -7 Q30 5 19 13 Q16 25 2 21 Q-10 28 -17 17 Q-29 10 -22 -4Z" fill={colour} />
      <path d="M-13 -9 Q-9 -16 0 -15" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" opacity="0.5" />
    </g>
  )
}

/** A pot of paint for the tray. */
export function Pot({ paint }: { paint: Paint }) {
  const c = paintColour(paint)
  return (
    <svg viewBox="-24 -24 48 48" aria-hidden focusable="false">
      <path d="M-16 -8 H16 L13 18 Q0 23 -13 18Z" fill="#d9b488" />
      <path d="M-15.2 -2 H15.2 L14 10 Q0 14 -14 10Z" fill={c} />
      <ellipse cy="-8" rx="17" ry="6.5" fill="#b98a5c" />
      <ellipse cy="-8" rx="13.5" ry="4.6" fill={c} />
      <path d="M-9 -9 q4 -2.4 9 -2" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M8 -6 q3 6 1 11 a3.4 3.4 0 0 1 -5 -1 q-1 -4 0 -9Z" fill={c} />
    </svg>
  )
}

const Plus = ({ x }: { x: number }) => <path d={`M${x - 4} 0 h8 M${x} -4 v8`} stroke="#33284a" strokeWidth="2.6" strokeLinecap="round" />

function Sum({ recipe, made, wish, right }: { recipe: readonly Paint[]; made: string; wish: string; right: boolean }) {
  // Laid out from the left: a drop for every drop, plus signs between them, then what they made.
  const step = 30
  const width = recipe.length * step + 34 + 34 + (right ? 0 : 34)
  const x0 = (W - width) / 2 + 11
  const after = x0 + recipe.length * step
  return (
    <g key={recipe.join('-')} className="rm-sum" transform={`translate(0 ${H - 26})`}>
      <rect x={(W - width) / 2 - 12} y="-19" width={width + 24} height="38" rx="19" fill="#fffaf0" />
      {recipe.map((p, i) => (
        <g key={i}>
          <g transform={`translate(${x0 + i * step} 0)`}>
            <path d="M0 -11 C6 -3 8 1 8 4 a8 8 0 0 1 -16 0 C-8 1 -6 -3 0 -11Z" fill={paintColour(p)} />
            <ellipse cx="-3" cy="3" rx="2" ry="3" fill="#fff" opacity="0.5" />
          </g>
          {i < recipe.length - 1 && <Plus x={x0 + i * step + step / 2} />}
        </g>
      ))}
      <path d={`M${after - 9} -3 h9 M${after - 9} 3 h9`} stroke="#33284a" strokeWidth="2.6" strokeLinecap="round" />
      <g transform={`translate(${after + 19} 0)`}>
        <Splash colour={made} r={13} />
      </g>
      {right ? (
        <g transform={`translate(${after + 46} 0)`}>
          <circle r="10" fill="#58b368" />
          <path d="M-5 0 l3.6 4 l6.4 -7.4" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : (
        <>
          <path d={`M${after + 37} -3 h9 M${after + 37} 3 h9 M${after + 45} -7 l-7 14`} stroke="#e2607e" strokeWidth="2.4" strokeLinecap="round" />
          <g transform={`translate(${after + 66} 0)`}>
            <Splash colour={wish} r={13} />
          </g>
        </>
      )}
    </g>
  )
}

export function StudioArt({
  guest,
  kind,
  mood,
  mane,
  wish,
  drops,
  cap,
  mixed,
  stirring,
  recipe,
  right,
}: {
  /** Which guest this is, counted from 0: a new one walks in. */
  guest: number
  kind: PonyKind
  mood: PonyMood
  /** The colour the mane has been painted, or null while it waits for its paint. */
  mane: string | null
  /** The colour the pony wishes for. */
  wish: string
  /** The drops in the bowl. */
  drops: readonly Paint[]
  /** How many drops fit in the bowl. */
  cap: number
  /** The colour of the bowl once it has been mixed. */
  mixed: string | null
  stirring: boolean
  /** The drops that were mixed last: shown as a sum under the picture, so the result can be read off. */
  recipe: readonly Paint[] | null
  /** Whether that mix was the wished colour. */
  right: boolean
}) {
  const hair = mane ? [mane, tint(mane, 0.28), tint(mane, -0.14)] : BARE
  const [walking, setWalking] = useState(true)
  const [seen, setSeen] = useState(guest)
  if (seen !== guest) {
    setSeen(guest)
    setWalking(true)
  }
  useEffect(() => {
    const id = setTimeout(() => setWalking(false), 900)
    return () => clearTimeout(id)
  }, [guest])
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="rm-art" aria-hidden focusable="false">
      <rect width={W} height={H} fill="#dccdf3" />
      <circle cx="304" cy="40" r="60" fill="#e8dcf8" />
      <path d={`M0 176 Q84 138 190 170 Q280 196 ${W} 160 V${H} H0Z`} fill="#c5d86b" />
      <path d={`M0 214 Q120 190 220 216 Q300 234 ${W} 208 V${H} H0Z`} fill="#b6cc5c" />
      {[[30, 232], [176, 240], [330, 236], [214, 196]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r="4.5" fill={i % 2 ? '#f4b6c8' : '#fff'} />
          <circle r="2" fill="#f2c14e" />
        </g>
      ))}
      {/* The wish: a splash of the colour in a thought cloud. */}
      <g className="rm-wish">
        <circle cx="168" cy="92" r="5" fill="#fffaf0" />
        <circle cx="184" cy="76" r="8" fill="#fffaf0" />
        <g fill="#fffaf0">
          <ellipse cx="252" cy="58" rx="56" ry="38" />
          <circle cx="212" cy="40" r="22" />
          <circle cx="250" cy="28" r="26" />
          <circle cx="292" cy="42" r="22" />
          <circle cx="298" cy="72" r="18" />
          <circle cx="208" cy="72" r="18" />
        </g>
        <g key={wish} className="rm-pop" transform="translate(252 54)">
          <Splash colour={wish} r={27} />
        </g>
      </g>
      <ellipse cx="100" cy="232" rx="62" ry="10" fill="#8fae3e" opacity="0.6" />
      <g transform="translate(96 164)">
        {/* Every guest trots in from the edge of the meadow. */}
        <g key={guest} className="rm-arrive">
          <g className={mood === 'sad' ? 'rm-no' : stirring ? 'rm-watch' : undefined}>
            <g className="rm-pony" transform="scale(1.6)">
              <Pony kind={kind} mood={mood} mane={hair} motion={walking ? 'walk' : 'stand'} />
            </g>
          </g>
        </g>
      </g>
      {/* The tree stump and the bowl on it. */}
      <path d="M222 214 Q220 246 214 252 H318 Q312 246 310 214Z" fill="#a8774f" />
      <ellipse cx="266" cy="214" rx="44" ry="10" fill="#d9b488" />
      <ellipse cx="266" cy="214" rx="30" ry="6" fill="none" stroke="#c49a68" strokeWidth="2" />
      <path d="M218 172 Q220 214 266 214 Q312 214 314 172Z" fill="#fff6dc" />
      <path d="M222 190 Q232 212 266 213 Q300 212 310 190 Q296 206 266 206 Q236 206 222 190Z" fill="#ecdcb4" />
      <ellipse cx="266" cy="172" rx="48" ry="15" fill="#fffaf0" />
      <ellipse cx="266" cy="173" rx="42" ry="11.5" fill={mixed ?? '#d8cbb0'} className="rm-paint" />
      {mixed ? (
        <path className="rm-swirl" d="M246 172 q10 -7 22 -2 q10 4 18 -1" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      ) : (
        <g className={stirring ? 'rm-stir' : undefined}>
          {Array.from({ length: cap }, (_, i) => {
            const x = 266 + (i - (cap - 1) / 2) * 23
            const p = drops[i]
            return p ? (
              <g key={`${i}-${p}`} transform={`translate(${x} 172)`}>
                <g className="rm-drop">
                  <ellipse rx="10.5" ry="7.5" fill={paintColour(p)} />
                  <ellipse cx="-3" cy="-2.5" rx="3.6" ry="1.8" fill="#fff" opacity="0.55" />
                </g>
              </g>
            ) : (
              <ellipse key={i} cx={x} cy="172" rx="9.5" ry="6.5" className="rm-slot" />
            )
          })}
        </g>
      )}
      {stirring && (
        <g transform="translate(266 168)">
          <g className="rm-spoon">
            <rect x="-2.5" y="-46" width="5" height="44" rx="2.5" fill="#b98a5c" />
            <ellipse cy="2" rx="7" ry="9" fill="#a8774f" />
          </g>
        </g>
      )}
      {/* The sum of the last mix: the drops that went in, what they made, and whether that is the wish. */}
      {recipe && mixed && <Sum recipe={recipe} made={mixed} wish={wish} right={right} />}
    </svg>
  )
}
