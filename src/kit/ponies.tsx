import type { ReactNode } from 'react'

/**
 * Little storybook ponies for scene games: a unicorn (horn), a pegasus (wings) and an alicorn (both). Lineless
 * flat shapes, a big glossy eye and a flowing mane, seen from the side and looking right. Drawn around the middle
 * of the body at (0, 0): about 100 wide and 100 tall, with the hooves on y = 44.
 */

export const ponyKinds = ['unicorn', 'pegasus', 'alicorn'] as const
export type PonyKind = (typeof ponyKinds)[number]
/** happy: a closed, smiling eye. sad: a little frown. */
export type PonyMood = 'idle' | 'happy' | 'sad'

const INK = '#33284a'

/** The seven colours of the rainbow, from the outside of the bow to the inside. */
export const RAINBOW = ['#e8505b', '#f58a3c', '#f7cf45', '#58b368', '#3f97e0', '#4347a8', '#9a5ac8'] as const

const coats: Record<PonyKind, { coat: string; shade: string; hoof: string }> = {
  unicorn: { coat: '#fffaf0', shade: '#eadfd0', hoof: '#e9b8cf' },
  pegasus: { coat: '#cfe6f7', shade: '#aacde8', hoof: '#7fa6d6' },
  alicorn: { coat: '#eadcf8', shade: '#cdb8ea', hoof: '#a987d6' },
}
const manes: Record<PonyKind, string[]> = {
  unicorn: ['#f08aa6', '#f7cf45', '#7fd0e8'],
  pegasus: ['#f7cf45', '#f9e08a'],
  alicorn: ['#9a5ac8', '#f08aa6'],
}

// The mane falls down the neck in three locks and the tail swings out behind; a mane with fewer colours repeats them.
const locks = [
  'M21 -37 Q2 -47 -7 -31 Q-15 -17 -12 2 Q-3 -3 -1 -14 Q2 -25 12 -29Z',
  'M17 -35 Q5 -41 -1 -29 Q-8 -17 -7 -4 Q0 -8 2 -17 Q5 -26 13 -30Z',
  'M15 -33 Q8 -36 4 -28 Q0 -21 0 -13 Q5 -16 7 -22 Q9 -27 14 -30Z',
]
const tails = [
  'M-25 2 Q-52 -8 -49 18 Q-47 36 -32 38 Q-39 24 -31 15 Q-27 11 -22 12Z',
  'M-25 4 Q-45 -2 -43 18 Q-42 31 -32 36 Q-36 24 -29 16 Q-26 12 -22 12Z',
  'M-25 6 Q-38 4 -37 19 Q-36 27 -32 32 Q-33 23 -28 17 Q-25 13 -22 12Z',
]

function Wing() {
  return (
    <g className="pony-wing" transform="translate(-9 5)">
      <path d="M-6 6 Q-34 -6 -30 -32 Q-22 -24 -16 -24 Q-18 -32 -12 -38 Q-6 -28 0 -24 Q2 -30 8 -32 Q12 -12 4 4Z" fill="#fff" />
      <path d="M-6 6 Q-20 0 -24 -12 Q-14 -8 -10 -10 Q-10 -16 -6 -18 Q-2 -10 4 -8 Q8 -2 4 4Z" fill="#e3ecf8" />
    </g>
  )
}

/**
 * A pony. `mane` gives the colours of its mane and tail (one, two or three, from the outer lock to the inner
 * one); without it the kind's own colours are used.
 */
export function Pony({ kind, mood = 'idle', mane }: { kind: PonyKind; mood?: PonyMood; mane?: readonly string[] }) {
  const c = coats[kind]
  const hair = mane?.length ? mane : manes[kind]
  const lock = (i: number) => hair[Math.min(i, hair.length - 1)]
  const horn = kind !== 'pegasus'
  const wings = kind !== 'unicorn'
  return (
    <>
      {tails.map((d, i) => (
        <path key={i} d={d} fill={lock(i)} />
      ))}
      {/* The far legs, a shade darker. */}
      <rect x="-19" y="18" width="10" height="26" rx="5" fill={c.shade} />
      <rect x="5" y="18" width="10" height="26" rx="5" fill={c.shade} />
      <ellipse cx="-5" cy="12" rx="23" ry="16" fill={c.coat} />
      <path d="M-26 16 Q-12 30 14 22 Q4 32 -10 30 Q-22 28 -26 16Z" fill={c.shade} opacity="0.7" />
      <rect x="-26" y="18" width="10" height="26" rx="5" fill={c.coat} />
      <rect x="-2" y="18" width="10" height="26" rx="5" fill={c.coat} />
      <path d="M-26 39 h10 v0 a5 5 0 0 1 -10 0Z M-2 39 h10 a5 5 0 0 1 -10 0Z" fill={c.hoof} />
      <path d="M-19 39 h10 a5 5 0 0 1 -10 0Z M5 39 h10 a5 5 0 0 1 -10 0Z" fill={c.hoof} opacity="0.75" />
      {/* Neck and head. */}
      <path d="M-2 4 Q0 -16 10 -24 L26 -12 Q20 6 14 14Z" fill={c.coat} />
      {wings && <Wing />}
      <path d="M9 -31 L11 -47 L21 -35Z" fill={c.coat} />
      <path d="M12 -34 L12.5 -42 L18 -35Z" fill="#f4b6c8" />
      {horn && (
        <g>
          <path d="M20 -36 L33 -60 L29 -33Z" fill="#f7cf45" />
          <path d="M22.5 -40 l5 2.6 M25 -45 l4 2.2 M27.6 -50 l3 1.6" stroke="#e0a82e" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      )}
      <circle cx="18" cy="-18" r="18" fill={c.coat} />
      <ellipse cx="31" cy="-9" rx="11" ry="9.5" fill={c.coat} />
      <ellipse cx="33" cy="-7" rx="8" ry="6.5" fill={c.shade} opacity="0.55" />
      <circle cx="37" cy="-10" r="1.3" fill={INK} opacity="0.55" />
      {locks.map((d, i) => (
        <path key={i} d={d} fill={lock(i)} />
      ))}
      {/* The forelock over the forehead. */}
      <path d="M12 -36 Q24 -42 31 -31 Q24 -33 21 -27 Q18 -33 12 -30Z" fill={lock(0)} />
      {mood === 'happy' ? (
        <path d="M17 -17 q5 -6 10 0" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      ) : (
        <>
          <circle cx="22" cy="-18" r="6.2" fill="#fff" />
          <circle cx="22.8" cy="-17.6" r="4.9" fill={INK} />
          <circle cx="20.8" cy="-19.8" r="1.9" fill="#fff" />
          <circle cx="24.6" cy="-15.6" r="0.9" fill="#fff" />
          {mood === 'sad' && <path d="M16 -27 l8 -2.5" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />}
        </>
      )}
      <circle cx="24" cy="-7" r="3.4" fill="#f08aa6" opacity="0.6" />
      {mood === 'sad' ? (
        <path d="M31 -2.5 q3.5 -2.6 6 0" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
      ) : (
        <path d="M30 -4 q3.5 3.4 7 0.4" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
      )}
    </>
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
