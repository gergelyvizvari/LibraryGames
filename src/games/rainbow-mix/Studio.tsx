import { useEffect, useState, type CSSProperties } from 'react'
import { mixColour, type Paint } from './logic'

// The painting corner on the meadow: the painted pony who wishes for a colour, its wish in a thought cloud, and the
// painted mixing bowl in the grass. The paint itself (the drops, the mix, the new mane) is laid over the
// paintings, since its colour changes.

/** The painted ponies, each with four faces and a mask of the mane and tail for each: art/<kind>[-<face>][-mask].webp. */
const ART = import.meta.glob<string>('./art/*.webp', { eager: true, import: 'default' })
const art = (name: string) => ART[`./art/${name}.webp`]

export type PonyKind = 'alicorn' | 'unicorn' | 'pegasus'
export type Mood = 'idle' | 'happy' | 'sad'
type Face = Mood | 'blink'
const FACES: Face[] = ['idle', 'blink', 'happy', 'sad']
/** Width / height of each painted pony. */
const ASPECT: Record<PonyKind, number> = { unicorn: 427 / 412, alicorn: 400 / 412, pegasus: 472 / 412 }

/** The pure colour of a paint, as it looks in its pot and as a drop. */
export const paintColour = (p: Paint) => mixColour([p])

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

/** A painted pot of paint for the tray. */
export function Pot({ paint }: { paint: Paint }) {
  return <img src={art(`pot-${paint}`)} alt="" draggable={false} />
}

const Plus = ({ x }: { x: number }) => <path d={`M${x - 4} 0 h8 M${x} -4 v8`} stroke="#33284a" strokeWidth="2.6" strokeLinecap="round" />

/** The sum of the last mix: the drops that went in, what they made, and whether that is the wish. */
export function Sum({ recipe, made, wish, right }: { recipe: readonly Paint[]; made: string; wish: string; right: boolean }) {
  const step = 30
  const width = recipe.length * step + 34 + 34 + (right ? 0 : 34)
  const x0 = -width / 2 + 11
  const after = x0 + recipe.length * step
  return (
    <svg className="rm-sum" viewBox={`${-width / 2 - 14} -21 ${width + 28} 42`} style={{ width: (width + 28) * 1.6, height: 42 * 1.6 }} aria-hidden focusable="false">
      <rect x={-width / 2 - 12} y="-19" width={width + 24} height="38" rx="19" fill="#fffaf0" />
      {recipe.map((p, i) => (
        <g key={i}>
          <g transform={`translate(${x0 + i * step} 0)`}>
            {/* White paint would vanish on the pale strip, so it gets an outline and a grey gleam. */}
            <path d="M0 -11 C6 -3 8 1 8 4 a8 8 0 0 1 -16 0 C-8 1 -6 -3 0 -11Z" fill={paintColour(p)} stroke={p === 'white' ? '#b9a98c' : 'none'} strokeWidth="1.6" strokeLinejoin="round" />
            <ellipse cx="-3" cy="3" rx="2" ry="3" fill={p === 'white' ? '#d9cdb8' : '#fff'} opacity={p === 'white' ? 0.8 : 0.5} />
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
    </svg>
  )
}

/** The wish: a splash of the colour in a thought cloud, in a 220 × 150 box with its little bubbles at the bottom left. */
export function Wish({ colour }: { colour: string }) {
  return (
    <svg className="rm-wish" viewBox="0 0 220 150" aria-hidden focusable="false">
      <g fill="#fffaf0">
        <circle cx="16" cy="140" r="6" />
        <circle cx="34" cy="122" r="10" />
        <ellipse cx="124" cy="66" rx="70" ry="46" />
        <circle cx="74" cy="46" r="28" />
        <circle cx="122" cy="30" r="32" />
        <circle cx="172" cy="48" r="28" />
        <circle cx="180" cy="84" r="24" />
        <circle cx="72" cy="86" r="24" />
      </g>
      <g key={colour} className="rm-pop" transform="translate(124 62)">
        <Splash colour={colour} r={34} />
      </g>
    </svg>
  )
}

/** The painted pony: its face for the mood (blinking now and then), and its mane and tail in `mane` once painted. */
export function PaintedPony({ kind, mood, mane, stirring, style }: { kind: PonyKind; mood: Mood; mane: string | null; stirring: boolean; style: CSSProperties }) {
  const [shut, setShut] = useState(false)
  useEffect(() => {
    if (mood !== 'idle') return
    let timer = 0
    const next = (open: boolean) => {
      timer = window.setTimeout(
        () => {
          setShut(open)
          next(!open)
        },
        open ? 2600 + Math.random() * 2600 : 150,
      )
    }
    next(true)
    return () => {
      clearTimeout(timer)
      setShut(false)
    }
  }, [mood])
  const face: Face = mood === 'idle' && shut ? 'blink' : mood
  // Each face has its own mask of the hair, so the paint never touches the face.
  const mask = `url(${art(face === 'idle' ? `${kind}-mask` : `${kind}-${face}-mask`)})`
  return (
    <div data-speaker className="rm-stand" style={{ ...style, aspectRatio: ASPECT[kind] }}>
      <div className={`rm-pony${mood === 'sad' ? ' rm-no' : mood === 'happy' ? ' rm-hop' : stirring ? ' rm-watch' : ''}`}>
        {FACES.map((f) => (
          <img key={f} src={art(f === 'idle' ? kind : `${kind}-${f}`)} alt="" draggable={false} className={f === face ? '' : 'rm-off'} />
        ))}
        {/* The new mane: the colour laid over the white hair, so the painting's shading still shows through. */}
        <span className={`rm-mane${mane ? ' rm-mane-on' : ''}`} style={{ background: mane ?? 'transparent', maskImage: mask, WebkitMaskImage: mask }} />
      </div>
    </div>
  )
}

/** The paint surface inside the painted bowl (art/bowl.webp is 350 × 192): its middle and radii, measured from the picture. */
const SURFACE = { cx: 175, cy: 57, rx: 138, ry: 17 }

/** The bowl's paint, drawn in the bowl picture's own pixels so it lies exactly inside its rim: the drops (or empty places
 * for them) before mixing, the mixed colour after, and the spoon while stirring. */
export function BowlPaint({ drops, cap, mixed, stirring }: { drops: readonly Paint[]; cap: number; mixed: string | null; stirring: boolean }) {
  const { cx, cy, rx, ry } = SURFACE
  return (
    <svg className="rm-bowl-paint" viewBox="0 0 350 192" aria-hidden focusable="false">
      <clipPath id="rm-surface">
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
      </clipPath>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={mixed ?? 'rgba(216, 203, 176, 0.45)'} className="rm-paint" />
      {mixed ? (
        <path className="rm-swirl" d={`M${cx - 40} ${cy} q20 -8 40 -2 q20 6 36 -2`} fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.5" clipPath="url(#rm-surface)" />
      ) : (
        <g className={stirring ? 'rm-stir' : undefined}>
          {Array.from({ length: cap }, (_, i) => {
            const x = cx + (i - (cap - 1) / 2) * 62
            const p = drops[i]
            return p ? (
              <g key={`${i}-${p}`} transform={`translate(${x} ${cy})`}>
                <g className="rm-drop">
                  <ellipse rx="26" ry="11" fill={paintColour(p)} stroke={p === 'white' ? '#d9cdb8' : 'none'} strokeWidth="2" />
                  <ellipse cx="-8" cy="-4" rx="8" ry="2.6" fill="#fff" opacity="0.55" />
                </g>
              </g>
            ) : (
              <ellipse key={i} cx={x} cy={cy} rx="24" ry="10" className="rm-slot" />
            )
          })}
        </g>
      )}
      {stirring && (
        <g transform={`translate(${cx} ${cy - 4})`}>
          <g className="rm-spoon">
            <rect x="-4" y="-70" width="8" height="66" rx="4" fill="#b98a5c" />
            <ellipse cy="2" rx="12" ry="8" fill="#a8774f" />
          </g>
        </g>
      )}
    </svg>
  )
}
