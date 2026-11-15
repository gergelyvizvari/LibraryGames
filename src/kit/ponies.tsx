import { useId, type ReactNode } from 'react'

/**
 * Little storybook ponies for scene games: a unicorn (horn), a pegasus (wings) and an alicorn (both). Lineless
 * shapes with soft shading, a big glossy eye and a flowing mane, seen from the side and looking right. Drawn around the middle
 * of the body at (0, 0): about 100 wide and 100 tall, with the hooves on y = 44. The parts move by themselves
 * (CSS under "Ponies" in styles.css): the tail swings, the eye blinks, the ear flicks, the legs trot with bending
 * knees and the wings beat. A happy pony prances and a sad one hangs its head.
 */

export const ponyKinds = ['unicorn', 'pegasus', 'alicorn'] as const
export type PonyKind = (typeof ponyKinds)[number]
/** happy: a closed, smiling eye. sad: a little frown. */
export type PonyMood = 'idle' | 'happy' | 'sad'
/** How it moves: standing (the tail swings, it blinks), trotting on the spot, or flying with beating wings and tucked legs. */
export type PonyMotion = 'stand' | 'walk' | 'fly'

const INK = '#33284a'

/** The seven colours of the rainbow, from the outside of the bow to the inside. */
export const RAINBOW = ['#e8505b', '#f58a3c', '#f7cf45', '#58b368', '#3f97e0', '#4347a8', '#9a5ac8'] as const

const coats: Record<PonyKind, { coat: string; shade: string; hoof: string }> = {
  unicorn: { coat: '#fffaf0', shade: '#eadfd0', hoof: '#e9b8cf' },
  pegasus: { coat: '#ffe6ee', shade: '#f5c3d4', hoof: '#e58aa9' },
  alicorn: { coat: '#eadcf8', shade: '#cdb8ea', hoof: '#a987d6' },
}
const manes: Record<PonyKind, string[]> = {
  unicorn: ['#f08aa6', '#f7cf45', '#7fd0e8'],
  pegasus: ['#58b8e0', '#9a8ae0', '#f7cf45'],
  alicorn: ['#9a5ac8', '#f08aa6'],
}

const eyes: Record<PonyKind, string> = { unicorn: '#c86aa8', pegasus: '#2f8fb8', alicorn: '#7a4fc0' }

/**
 * A part that turns around a joint: the children are drawn in the pony's own units, and the CSS animation on
 * `className` turns them around (x, y). (A CSS transform on an SVG group replaces its `transform` attribute, hence
 * the three groups.)
 */
function Joint({ x, y, className, children }: { x: number; y: number; className: string; children: ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={className}>
        <g transform={`translate(${-x} ${-y})`}>{children}</g>
      </g>
    </g>
  )
}

/** One leg: a thigh that swings from the hip and a shin that bends at the knee, with the hoof on y = 44. */
function Leg({ x, y, fill, hoof, step, hind = false, mark }: { x: number; y: number; fill: string; hoof: string; step: 'a' | 'b'; hind?: boolean; mark?: string }) {
  const w = hind ? 7.4 : 6.2
  const knee = y + 13
  return (
    <Joint x={x} y={y} className={`pony-leg pony-leg-${step} ${hind ? 'pony-leg-hind' : 'pony-leg-fore'}`}>
      <Joint x={x} y={knee} className="pony-shin">
        <path d={`M${x - 4.6} ${knee - 3} h9.2 L${x + 4.3} ${knee + 8} Q${x + 5.4} ${knee + 10} ${x + 5.4} 44 h-10.8 Q${x - 5.4} ${knee + 10} ${x - 4.3} ${knee + 8}Z`} fill={fill} />
        <path d={`M${x - 4.6} 38 h9.2 Q${x + 5.6} 40 ${x + 5.6} 42 a2 2 0 0 1 -2 2 h-7.2 a2 2 0 0 1 -2 -2 Q${x - 5.6} 40 ${x - 4.6} 38Z`} fill={hoof} />
        <path d={`M${x - 3} 40.4 q3 -1.2 6 0`} fill="none" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      </Joint>
      <path d={`M${x - w} ${y - 4} Q${x - w} ${y - 9} ${x} ${y - 9} Q${x + w} ${y - 9} ${x + w} ${y - 4} L${x + 4.8} ${knee} Q${x + 4.8} ${knee + 4.6} ${x} ${knee + 4.6} Q${x - 4.8} ${knee + 4.6} ${x - 4.8} ${knee}Z`} fill={fill} />
      {/* A little star on its thigh. */}
      {mark && <path transform={`translate(${x} ${y - 5})`} d="M0 0 l1.6 3.2 3.5 .5 -2.6 2.5 .6 3.5 -3.1 -1.7 -3.1 1.7 .6 -3.5 -2.6 -2.5 3.5 -.5Z" fill={mark} opacity="0.9" />}
    </Joint>
  )
}

/** A wing, spread for flying or folded along the side. `far` is the one behind the body. */
function Wing({ open, far = false }: { open: boolean; far?: boolean }) {
  const top = far ? '#dfe9f7' : '#ffffff'
  const mid = far ? '#cfdcf0' : '#eef3fb'
  const low = far ? '#bccce6' : '#dbe5f5'
  if (!open)
    return (
      <Joint x={-1} y={5} className="pony-wing pony-wing-folded">
        <path d="M4 1 C0 -7 -14 -9 -27 4 C-22 4 -19 6 -18 9 C-13 8 -10 11 -9 14 C-4 13 -1 15 0 17 C7 13 8 6 4 1Z" fill={top} />
        <path d="M2 4 C-2 -1 -11 -2 -19 5 C-15 5 -13 7 -12 10 C-8 9 -5 11 -4 13 C1 12 4 8 2 4Z" fill={mid} />
        <path d="M0 6 C-3 3 -8 3 -12 6 C-9 7 -7 8 -6 10 C-3 10 0 9 0 6Z" fill={low} />
        <path d="M-20 3.4 q3 .4 4.6 2.6 M-12 7.6 q2.6 .4 4 2.4" fill="none" stroke="#c9d6ea" strokeWidth="1.1" strokeLinecap="round" />
      </Joint>
    )
  return (
    <Joint x={-2} y={3} className={`pony-wing pony-wing-open${far ? ' pony-wing-far' : ''}`}>
      <path d="M2 4 C-10 2 -32 -10 -40 -36 C-34 -31 -29 -29 -26 -29 C-28 -37 -26 -44 -23 -49 C-19 -41 -15 -36 -12 -34 C-12 -41 -9 -47 -4 -51 C2 -38 10 -16 8 2Z" fill={top} />
      <path d="M2 4 C-8 2 -24 -8 -30 -24 C-25 -21 -21 -20 -19 -20 C-20 -26 -18 -31 -16 -34 C-12 -28 -9 -25 -7 -24 C-6 -29 -4 -33 -1 -35 C4 -24 9 -10 8 2Z" fill={mid} />
      <path d="M2 4 C-5 2 -14 -4 -18 -13 C-14 -12 -12 -12 -10 -13 C-10 -17 -8 -20 -6 -22 C-2 -16 6 -8 8 2Z" fill={low} />
    </Joint>
  )
}

// The mane falls down the neck in three wavy locks, and the tail swings out behind and curls at its tip; a mane
// with fewer colours repeats them.
const locks = [
  'M15 -41 C-3 -48 -16 -35 -13 -17 C-12 -8 -17 -2 -22 5 C-11 6 -3 0 -2 -11 C-1 -21 3 -31 13 -33Z',
  'M15 -38 C2 -42 -8 -31 -6 -17 C-5 -9 -8 -4 -12 1 C-4 1 1 -5 2 -14 C3 -23 6 -30 14 -32Z',
  'M15 -35 C7 -36 1 -29 1 -19 C1 -13 0 -9 -3 -5 C3 -7 6 -12 7 -18 C8 -24 10 -29 15 -31Z',
]
const tails = [
  'M-28 6 C-44 -8 -58 6 -54 22 C-51 34 -40 40 -32 37 C-28 35 -28 30 -31 28 C-37 31 -43 26 -43 19 C-43 12 -37 9 -26 13Z',
  'M-28 8 C-40 -1 -51 8 -49 20 C-47 29 -40 34 -34 33 C-39 30 -41 25 -40 19 C-39 13 -34 11 -26 13Z',
  'M-28 10 C-36 4 -44 10 -43 19 C-42 24 -39 27 -36 28 C-37 23 -36 18 -33 15 C-31 13 -29 13 -26 13Z',
]

/**
 * A pony. `mane` gives the colours of its mane and tail (one, two or three, from the outer lock to the inner
 * one); without it the kind's own colours are used.
 */
export function Pony({ kind, mood = 'idle', mane, motion = 'stand' }: { kind: PonyKind; mood?: PonyMood; mane?: readonly string[]; motion?: PonyMotion }) {
  const id = useId()
  const c = coats[kind]
  const hair = mane?.length ? mane : manes[kind]
  const lock = (i: number) => hair[Math.min(i, hair.length - 1)]
  const horn = kind !== 'pegasus'
  const wings = kind !== 'unicorn'
  const open = motion === 'fly'
  const coat = `url(#${id}c)`
  const body = `url(#${id}b)`
  return (
    <g className={`pony pony-${motion} pony-${mood}`}>
      <defs>
        <linearGradient id={`${id}c`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.35" stopColor={c.coat} />
          <stop offset="1" stopColor={c.shade} />
        </linearGradient>
        <linearGradient id={`${id}b`} gradientUnits="userSpaceOnUse" x1="0" y1="2" x2="0" y2="46">
          <stop offset="0.1" stopColor={c.coat} />
          <stop offset="1" stopColor={c.shade} />
        </linearGradient>
        <linearGradient id={`${id}h`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#f6c24a" />
          <stop offset="0.6" stopColor="#fbe08a" />
          <stop offset="1" stopColor="#fff6cf" />
        </linearGradient>
        <linearGradient id={`${id}e`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.3" stopColor={INK} />
          <stop offset="1" stopColor={eyes[kind]} />
        </linearGradient>
      </defs>
      <g className="pony-bob">
        {wings && open && <Wing open far />}
        <Joint x={-27} y={9} className="pony-tail">
          {tails.map((d, i) => (
            <path key={i} d={d} fill={lock(i)} />
          ))}
          <path d="M-48 8 C-52 14 -51 22 -47 28" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.45" />
        </Joint>
        {/* The far legs, a shade darker. */}
        <Leg x={-12} y={17} fill={c.shade} hoof={c.hoof} step="b" hind />
        <Leg x={15} y={17} fill={c.shade} hoof={c.hoof} step="a" />
        <g className="pony-trunk">
          <path d="M11 -1 C1 -7 -20 -7 -29 2 C-37 10 -35 26 -23 29 C-12 32 3 32 11 27 C19 22 19 5 11 -1Z" fill={body} />
                    <path d="M-22 2 C-16 -2 -6 -3 2 -1" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity="0.5" />
        </g>
        <Leg x={-24} y={18} fill={body} hoof={c.hoof} step="a" hind mark={lock(0)} />
        <Leg x={3} y={18} fill={body} hoof={c.hoof} step="b" />
        <Joint x={6} y={6} className="pony-head">
          {/* Neck. */}
          <path d="M-4 8 C-4 -10 3 -20 12 -25 L28 -8 C24 6 19 14 12 19 C4 20 -2 16 -4 8Z" fill={coat} />
          <Joint x={12} y={-36} className="pony-ear">
            <path d="M7 -33 C5 -44 9 -52 15 -55 C20 -48 21 -40 19 -33Z" fill={c.coat} />
            <path d="M10.5 -36 C10 -42 12 -47 14.6 -49.6 C17 -45 17.4 -41 16.6 -36Z" fill="#f4b6c8" />
          </Joint>
          {horn && (
            <g>
              <path d="M20.5 -37 Q30 -52 37 -66 Q35 -50 30.5 -34Z" fill={`url(#${id}h)`} />
              <path d="M23.4 -41.6 q4 .6 6.4 3.4 M26.4 -47 q3.4 .6 5 2.8 M29.4 -52.6 q2.6 .4 3.8 2.2 M32.2 -58 q1.6 .2 2.4 1.4" fill="none" stroke="#e3a630" strokeWidth="1.5" strokeLinecap="round" />
              <path className="pony-glint" d="M40 -68 l1.3 3.3 3.3 1.3 -3.3 1.3 -1.3 3.3 -1.3 -3.3 -3.3 -1.3 3.3 -1.3Z" fill="#fff" />
            </g>
          )}
          {/* The head and the muzzle. */}
          <path d="M19 -40 C31 -40 38 -31 38.5 -21 C44 -20 47 -15 46.4 -9.6 C45.8 -3.6 40 0 33 -0.4 C28 3 12 3 5 -6 C-3 -18 4 -40 19 -40Z" fill={coat} />
          <path d="M30 -8 C34 -3 42 -3 46 -10 C46 -3 40 0 33 -0.4 C28 3 14 2.6 7 -4 C14 0 24 -1 30 -8Z" fill={c.shade} opacity="0.5" />
          <ellipse cx="42" cy="-12.6" rx="1.2" ry="1.6" fill={INK} opacity="0.5" />
          <g className="pony-mane">
            {locks.map((d, i) => (
              <path key={i} d={d} fill={lock(i)} />
            ))}
            <path d="M-7 -30 C-11 -20 -8 -10 -13 -1" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.45" />
          </g>
          {/* The forelock over the forehead. */}
          <path d="M11 -39 C17 -47 31 -45 35 -31 C30 -35 26 -33 24 -28 C22 -35 16 -36 11 -33Z" fill={lock(0)} />
          <path d="M16 -40 C21 -43 27 -41 30 -37" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity="0.45" />
          {mood === 'happy' ? (
            <path d="M20.6 -17.6 q5 -7.4 10.4 0" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
          ) : (
            <g className="pony-eye">
              <ellipse cx="26" cy="-20" rx="6" ry="7.4" fill={`url(#${id}e)`} />
              <ellipse cx="26.6" cy="-18.4" rx="2.6" ry="3.6" fill={INK} />
              <ellipse cx="23.8" cy="-23.4" rx="2.3" ry="2.9" fill="#fff" />
              <circle cx="28.6" cy="-16" r="1.2" fill="#fff" opacity="0.9" />
              <path d="M19.6 -22.6 C21 -28 30 -29.6 32.4 -23.4" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
              <path d="M20 -23.4 l-3.4 -1.2 M21.2 -25.8 l-2.8 -2.6 M23.4 -27.6 l-1.6 -3.2" stroke={INK} strokeWidth="1.3" strokeLinecap="round" />
              {mood === 'sad' && <path d="M19 -30.6 C22 -33 27 -33.4 31 -32" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" transform="rotate(-14 25 -32)" />}
            </g>
          )}
          <ellipse cx="29.4" cy="-8.6" rx="4" ry="2.8" fill="#f08aa6" opacity="0.55" />
          {mood === 'sad' ? (
            <path d="M35 -3.4 q3.4 -2.4 6.4 -0.2" fill="none" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
          ) : mood === 'happy' ? (
            <path d="M34 -6.4 q4 5.6 8.6 0.6Z" fill="#c8506e" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
          ) : (
            <path d="M34.4 -5.6 q4 3.2 8 0.2" fill="none" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
          )}
        </Joint>
        {wings && <Wing open={open} />}
      </g>
    </g>
  )
}

/** A pony as the character of a scene (for `<SceneShell guide>`), on the guides' 120 × 120 grid. */
export function PonyGuide({ kind, mood = 'idle', mane, children }: { kind: PonyKind; mood?: PonyMood; mane?: readonly string[]; children?: ReactNode }) {
  return (
    <svg viewBox="0 0 120 120" className="sg-guide-art" aria-hidden focusable="false">
      <ellipse cx="60" cy="112" rx="40" ry="7" fill="#241a3c" opacity="0.3" />
      <g transform="translate(62 62) scale(1.1)">
        <Pony kind={kind} mood={mood} mane={mane} />
        {children}
      </g>
    </svg>
  )
}
