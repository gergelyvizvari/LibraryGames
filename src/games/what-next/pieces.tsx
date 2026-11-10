import type { ReactElement } from 'react'
import { symbolSets } from './logic'

// Drawn pieces for the rows: every set of five symbols is shown as one family of five things from the woods.

const hues = ['#e2607e', '#f2c14e', '#3fb0a8', '#a48cf0', '#7cc552']
const deep = ['#c94a6b', '#d9a52e', '#2c9690', '#8a70dc', '#62ab3e']
const shine = <path d="M-11 -9 A15 15 0 0 1 -2 -16 A18 18 0 0 0 -11 -9Z" fill="#fff" opacity="0.7" />

const finds: ReactElement[] = [
  // acorn
  <>
    <path d="M-13 -4 Q-14 18 0 22 Q14 18 13 -4Z" fill="#c98a4b" />
    <path d="M4 -4 H13 Q14 18 0 22 Q10 12 4 -4Z" fill="#a8683c" opacity="0.7" />
    <path d="M-16 -4 Q-16 -16 0 -16 Q16 -16 16 -4Z" fill="#8a5a3c" />
    <rect x="-2" y="-22" width="4" height="8" rx="2" fill="#6d4130" />
  </>,
  // mushroom
  <>
    <path d="M-7 0 H7 L9 20 Q0 24 -9 20Z" fill="#fff3dc" />
    <path d="M-20 2 Q-20 -20 0 -20 Q20 -20 20 2Z" fill="#e2607e" />
    <circle cx="-9" cy="-8" r="3.6" fill="#fff6dc" />
    <circle cx="5" cy="-12" r="3" fill="#fff6dc" />
    <circle cx="11" cy="-3" r="2.6" fill="#fff6dc" />
  </>,
  // leaf
  <>
    <path d="M0 -22 Q20 -8 12 12 Q6 22 0 22 Q-6 22 -12 12 Q-20 -8 0 -22Z" fill="#7cc552" />
    <path d="M0 -22 Q20 -8 12 12 Q6 22 0 22Z" fill="#62ab3e" />
    <path d="M0 -14 V22 M0 0 l8 -7 M0 8 l-8 -7" fill="none" stroke="#fff6dc" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
  </>,
  // berries
  <>
    <path d="M0 -20 Q-2 -8 -8 -2 M0 -20 Q4 -8 9 0" fill="none" stroke="#62ab3e" strokeWidth="3" strokeLinecap="round" />
    <circle cx="-9" cy="8" r="11" fill="#7d76d8" />
    <circle cx="10" cy="10" r="11" fill="#6a62c4" />
    <circle cx="-12" cy="4" r="3" fill="#fff" opacity="0.6" />
    <circle cx="7" cy="6" r="3" fill="#fff" opacity="0.6" />
  </>,
  // pine tree
  <>
    <rect x="-3" y="12" width="6" height="10" fill="#5d4038" />
    <path d="M-16 14 L0 -6 L16 14Z M-13 2 L0 -15 L13 2Z M-9 -9 L0 -23 L9 -9Z" fill="#1f6a5c" />
  </>,
]

const star = 'M0 -21 L6 -7 L21 -6 L9.5 4 L13 19 L0 11 L-13 19 L-9.5 4 L-21 -6 L-6 -7Z'
const shapes = [
  (i: number) => <path d={star} fill={hues[i]} stroke={hues[i]} strokeWidth="5" strokeLinejoin="round" />,
  (i: number) => <path d="M0 20 C-30 0 -16 -24 0 -9 C16 -24 30 0 0 20Z" fill={hues[i]} />,
  (i: number) => <path d="M6 -21 A21 21 0 1 0 20 12 A17 17 0 1 1 6 -21Z" fill={hues[i]} />,
  (i: number) => <path d="M0 -22 C12 -6 18 2 18 8 A18 14 0 0 1 -18 8 C-18 2 -12 -6 0 -22Z" fill={hues[i]} />,
  (i: number) => (
    <>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-12" rx="8" ry="10" fill={hues[i]} transform={`rotate(${a})`} />
      ))}
      <circle r="6.5" fill="#fff6dc" />
    </>
  ),
]

/** A symbol of a puzzle as a drawn piece around (0, 0), about 48 wide. */
export function Piece({ symbol }: { symbol: string }) {
  const set = symbolSets.findIndex((s) => s.includes(symbol))
  const i = Math.max(0, symbolSets[Math.max(0, set)].indexOf(symbol))
  const family = Math.max(0, set) % 3
  return (
    <svg className="wn-piece" viewBox="-26 -26 52 52" aria-hidden focusable="false">
      {family === 0 ? (
        <>
          <circle r="19" fill={hues[i]} />
          <path d="M6 -18 A19 19 0 0 1 6 18 A24 24 0 0 0 6 -18Z" fill={deep[i]} />
          {shine}
        </>
      ) : family === 1 ? (
        finds[i]
      ) : (
        shapes[i]((i + set) % 5)
      )}
    </svg>
  )
}
