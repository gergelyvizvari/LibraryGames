import { useId, type ReactNode } from 'react'

/**
 * Little storybook ponies for scene games: a unicorn (horn), a pegasus (wings) and an alicorn (both). Lineless
 * shapes with soft shading: a small head on an arched neck, slim legs, a glossy eye and a flowing mane, seen from the
 * side and looking right. Drawn around the middle of the body at (0, 0): about 100 wide and 100 tall, with the
 * hooves on y = 44. The parts move by themselves
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

/** One leg: a thigh that swings from the hip and a slim shin that bends at the knee, with the hoof on y = 44. */
function Leg({ x, y, fill, hoof, step, hind = false, mark }: { x: number; y: number; fill: string; hoof: string; step: 'a' | 'b'; hind?: boolean; mark?: string }) {
  const w = hind ? 7.4 : 5.2
  const knee = y + 15
  return (
    <Joint x={x} y={y} className={`pony-leg pony-leg-${step} ${hind ? 'pony-leg-hind' : 'pony-leg-fore'}`}>
      <Joint x={x} y={knee} className="pony-shin">
        <path d={`M${x - 3.1} ${knee - 3} h6.2 L${x + 2.4} 37 Q${x + 4} 39 ${x + 4.2} 44 h-8.4 Q${x - 4} 39 ${x - 2.4} 37Z`} fill={fill} />
        <path d={`M${x - 3.3} 38.6 h6.6 Q${x + 4.6} 40.4 ${x + 4.6} 42.6 a1.4 1.4 0 0 1 -1.4 1.4 h-6.4 a1.4 1.4 0 0 1 -1.4 -1.4 Q${x - 4.6} 40.4 ${x - 3.3} 38.6Z`} fill={hoof} />
      </Joint>
      <path d={`M${x - w} ${y - 4} Q${x - w} ${y - 10} ${x} ${y - 10} Q${x + w} ${y - 10} ${x + w} ${y - 4} Q${x + w - 1.5} ${y + 6} ${x + 3.2} ${knee} Q${x + 3.2} ${knee + 3.2} ${x} ${knee + 3.2} Q${x - 3.2} ${knee + 3.2} ${x - 3.2} ${knee} Q${x - w + 1.5} ${y + 6} ${x - w} ${y - 4}Z`} fill={fill} />
      {/* A little star on its thigh. */}
      {mark && <path transform={`translate(${x + 0.5} ${y - 7})`} d="M0 0 l1.5 3 3.3 .5 -2.4 2.3 .6 3.3 -3 -1.6 -3 1.6 .6 -3.3 -2.4 -2.3 3.3 -.5Z" fill={mark} opacity="0.9" />}
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
      <Joint x={2} y={-7} className="pony-wing pony-wing-folded">
        <g transform="translate(2 -7) scale(0.8)">
        <path d="M4 0 C0 -8 -14 -10 -27 3 C-22 3 -19 5 -18 8 C-13 7 -10 10 -9 13 C-4 12 -1 14 0 16 C7 12 8 5 4 0Z" fill={top} />
        <path d="M2 3 C-2 -2 -11 -3 -19 4 C-15 4 -13 6 -12 9 C-8 8 -5 10 -4 12 C1 11 4 7 2 3Z" fill={mid} />
        <path d="M0 5 C-3 2 -8 2 -12 5 C-9 6 -7 7 -6 9 C-3 9 0 8 0 5Z" fill={low} />
        </g>
      </Joint>
    )
  return (
    <Joint x={0} y={-8} className={`pony-wing pony-wing-open${far ? ' pony-wing-far' : ''}`}>
      <g transform="translate(0 -9)">
      <path d="M4 2 C-8 0 -30 -12 -38 -38 C-32 -33 -27 -31 -24 -31 C-26 -39 -24 -46 -21 -51 C-17 -43 -13 -38 -10 -36 C-10 -43 -7 -49 -2 -53 C4 -40 12 -18 10 0Z" fill={top} />
      <path d="M4 2 C-6 0 -22 -10 -28 -26 C-23 -23 -19 -22 -17 -22 C-18 -28 -16 -33 -14 -36 C-10 -30 -7 -27 -5 -26 C-4 -31 -2 -35 1 -37 C6 -26 11 -12 10 0Z" fill={mid} />
      <path d="M4 2 C-3 0 -12 -6 -16 -15 C-12 -14 -10 -14 -8 -15 C-8 -19 -6 -22 -4 -24 C0 -18 8 -10 10 0Z" fill={low} />
          </g>
    </Joint>
  )
}

// The mane flows down the crest of the neck in three wavy locks, and the long tail sweeps down behind; a mane
// with fewer colours repeats them.
const locks = [
  'M17 -47 C8 -48 0 -40 -2 -28 C-4 -18 -9 -13 -14 -7 C-6 -5 0 -9 2 -17 C4 -25 7 -33 15 -38Z',
  'M17 -45 C10 -45 4 -38 2 -28 C1 -21 -2 -17 -6 -12 C0 -12 4 -16 5 -22 C7 -29 9 -34 15 -38Z',
  'M17 -43 C12 -43 8 -37 6 -29 C5 -25 4 -22 2 -19 C6 -20 8 -23 9 -27 C10 -31 12 -35 16 -38Z',
]
const tails = [
  'M-30 -5 C-44 -10 -52 2 -50 16 C-49 27 -52 35 -58 41 C-46 43 -38 37 -36 27 C-35 18 -37 8 -28 3Z',
  'M-30 -3 C-41 -6 -47 3 -45 15 C-44 24 -46 31 -50 36 C-43 36 -39 31 -38 24 C-37 16 -37 8 -28 3Z',
  'M-30 -1 C-37 -3 -42 4 -41 14 C-40 20 -41 26 -44 30 C-39 29 -37.6 25 -37 20 C-36.6 13 -35 7 -28 3Z',
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
  const body = `url(#${id}b)`
  return (
    <g className={`pony pony-${motion} pony-${mood}`}>
      <defs>
        <linearGradient id={`${id}b`} gradientUnits="userSpaceOnUse" x1="0" y1="-8" x2="0" y2="46">
          <stop offset="0.35" stopColor={c.coat} />
          <stop offset="1" stopColor={c.shade} />
        </linearGradient>
        <linearGradient id={`${id}h`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#f6c24a" />
          <stop offset="0.6" stopColor="#fbe08a" />
          <stop offset="1" stopColor="#fff6cf" />
        </linearGradient>
      </defs>
      <g className="pony-bob">
        <g transform="translate(0 4.4) scale(0.9)">
        {wings && open && <Wing open far />}
        <Joint x={-29} y={-1} className="pony-tail">
          {tails.map((d, i) => (
            <path key={i} d={d} fill={lock(i)} />
          ))}
          <path d="M-46 0 C-49 8 -47 18 -50 28" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
        </Joint>
        {/* The far legs, a shade darker. */}
        <Leg x={-14} y={9} fill={c.shade} hoof={c.hoof} step="b" hind />
        <Leg x={15} y={9} fill={c.shade} hoof={c.hoof} step="a" />
        <g className="pony-trunk">
          <path d="M0 -10 C-12 -13 -29 -10 -32 1 C-34 9 -28 14 -16 14 C-6 15 6 14 13 11 C20 7 20 -3 15 -9 C10 -12 5 -10 0 -10Z" fill={body} />
          <path d="M-24 -7 C-17 -10 -9 -10 -3 -8" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity="0.5" />
        </g>
        <Leg x={-24} y={10} fill={body} hoof={c.hoof} step="a" hind mark={lock(0)} />
        <Leg x={6} y={10} fill={body} hoof={c.hoof} step="b" />
        <Joint x={7} y={-5} className="pony-head">
          {/* The arched neck. */}
          <path d="M14 -42 C9 -36 4 -24 -1 -9 C3 1 12 3 17 -1 C18 -10 19 -19 25 -27Z" fill={c.coat} />
          <path d="M24 -27 C20 -19 19 -10 17 -1 C14 1 11 1 9 0 C13 -5 16 -15 19 -25Z" fill={c.shade} opacity="0.45" />
          <g className="pony-mane">
            {locks.map((d, i) => (
              <path key={i} d={d} fill={lock(i)} />
            ))}
            <path d="M3 -37 C-1 -29 0 -20 -6 -12" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
          </g>
          <g transform="translate(15 -42) scale(0.8) translate(-13 36)">
          <Joint x={16} y={-38} className="pony-ear">
            <path d="M12 -36 C10 -44 12 -51 16 -54 C20 -49 21 -42 20 -36Z" fill={c.coat} />
            <path d="M14.4 -38 C13.6 -43 14.6 -47 16.2 -49.6 C18 -46 18.2 -42 17.8 -38Z" fill="#f4b6c8" />
          </Joint>
          {horn && (
            <g>
              <path d="M25 -40 Q31 -51 35.5 -63 Q34.6 -50 31 -37.6Z" fill={`url(#${id}h)`} />
              <path d="M27.2 -43.4 q2.8 .4 4.4 2.4 M29.6 -48.2 q2.4 .3 3.6 2 M31.8 -53 q1.8 .3 2.6 1.5" fill="none" stroke="#e3a630" strokeWidth="1.1" strokeLinecap="round" />
              <path className="pony-glint" d="M38.4 -65 l1.1 2.8 2.8 1.1 -2.8 1.1 -1.1 2.8 -1.1 -2.8 -2.8 -1.1 2.8 -1.1Z" fill="#fff" />
            </g>
          )}
          {/* The head: a round cheek and a short muzzle. */}
          <path d="M13 -36 C17 -43 28 -43 32 -36 C35 -31 41 -28 43 -23 C45 -18 42 -13 37 -13 C33 -13 31 -15 28 -15.6 C24 -12 16 -13 12 -19 C8 -24 9 -31 13 -36Z" fill={c.coat} />
          <path d="M43 -23 C45 -18 42 -13 37 -13 C34.6 -13 33 -13.8 31.4 -14.6 C35 -15 40 -17 43 -23Z" fill={c.shade} opacity="0.5" />
          <ellipse cx="40.6" cy="-20.4" rx="0.9" ry="1.3" fill={INK} opacity="0.5" />
          {/* The forelock over the forehead. */}
          <path d="M15 -41 C21 -46 30 -44 33 -33 C29 -36 26 -35 24 -31 C22 -36 18 -37 14 -35Z" fill={lock(0)} />
          {mood === 'happy' ? (
            <path d="M22 -25.6 q4.6 -6.4 9.4 0" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
          ) : (
            <g className="pony-eye">
              <ellipse cx="26.6" cy="-27.4" rx="4.8" ry="5.8" fill={INK} />
              <path d="M22.4 -25 a4.8 5.8 0 0 0 8.4 0 q-4.2 2 -8.4 0Z" fill={eyes[kind]} />
              <ellipse cx="24.8" cy="-29.8" rx="1.9" ry="2.3" fill="#fff" />
              <circle cx="28.8" cy="-25" r="1" fill="#fff" opacity="0.9" />
              <path d="M22.4 -29.8 q-1.4 -1.8 -3.4 -2" fill="none" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
              {mood === 'sad' && <path d="M22.6 -35 q4.4 -1.8 8.4 0.4" fill="none" stroke={INK} strokeWidth="1.2" strokeLinecap="round" transform="rotate(-12 26.6 -35)" />}
            </g>
          )}
          <ellipse cx="22.6" cy="-18.6" rx="3.2" ry="2.1" fill="#f08aa6" opacity="0.5" />
          {mood === 'sad' ? (
            <path d="M36.4 -15.4 q2.4 -1.6 4.4 -0.2" fill="none" stroke={INK} strokeWidth="1.3" strokeLinecap="round" />
          ) : mood === 'happy' ? (
            <path d="M35.4 -17.2 q2.6 3.8 6 0.4Z" fill="#c8506e" stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
          ) : (
            <path d="M35.6 -17 q2.6 2.2 5.4 0.2" fill="none" stroke={INK} strokeWidth="1.3" strokeLinecap="round" />
          )}
          </g>
        </Joint>
        {wings && <Wing open={open} />}
        </g>
      </g>
    </g>
  )
}

/** A pony as the character of a scene (for `<SceneShell guide>`), on the guides' 120 × 120 grid. */
export function PonyGuide({ kind, mood = 'idle', mane, children }: { kind: PonyKind; mood?: PonyMood; mane?: readonly string[]; children?: ReactNode }) {
  return (
    <svg viewBox="0 0 120 120" className="sg-guide-art" aria-hidden focusable="false">
      <ellipse cx="60" cy="112" rx="40" ry="7" fill="#241a3c" opacity="0.3" />
      <g transform="translate(60 68) scale(0.95)">
        <Pony kind={kind} mood={mood} mane={mane} />
        {children}
      </g>
    </svg>
  )
}
