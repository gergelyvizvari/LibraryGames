import { Critter } from '../../kit/critters'
import type { Light } from './logic'

/** The road from above: grass on both sides, a grey road across the middle and a zebra crossing. */
export function RoadArt() {
  return (
    <svg className="tl-road" viewBox="0 0 400 400" preserveAspectRatio="none" aria-hidden focusable="false">
      <rect width="400" height="400" fill="#9fd47a" />
      <ellipse cx="70" cy="40" rx="50" ry="18" fill="#8cc767" />
      <ellipse cx="330" cy="370" rx="60" ry="20" fill="#8cc767" />
      <rect y="122" width="400" height="156" fill="#7d7a8c" />
      <rect y="118" width="400" height="8" fill="#e8e2d0" />
      <rect y="274" width="400" height="8" fill="#e8e2d0" />
      <path d="M0 200 h40 M70 200 h40 M290 200 h40 M360 200 h40" stroke="#f2d76a" strokeWidth="5" />
      {[136, 164, 192, 220, 248].map((y) => (
        <rect key={y} x="150" y={y} width="100" height="16" rx="3" fill="#fbf7ec" />
      ))}
    </svg>
  )
}

const lamps: { light: Light; on: string; off: string; y: number }[] = [
  { light: 'red', on: '#ff5a5f', off: '#5b4a52', y: 22 },
  { light: 'yellow', on: '#ffd24a', off: '#5d5642', y: 52 },
  { light: 'green', on: '#4fd26b', off: '#3f5546', y: 82 },
]

/** A traffic light on its pole; the lamp that is on glows. */
export function LightArt({ light }: { light: Light }) {
  return (
    <svg viewBox="0 0 60 170" aria-hidden focusable="false">
      <rect x="26" y="100" width="8" height="70" rx="3" fill="#5a5470" />
      <rect x="6" y="4" width="48" height="98" rx="14" fill="#3b3550" />
      {lamps.map((l) => (
        <g key={l.light}>
          {l.light === light && <circle cx="30" cy={l.y} r="16" fill={l.on} opacity="0.35" />}
          <circle cx="30" cy={l.y} r="11" fill={l.light === light ? l.on : l.off} />
          {l.light === light && <circle cx="26" cy={l.y - 4} r="3" fill="#fff" opacity="0.7" />}
        </g>
      ))}
    </svg>
  )
}

export function Hedgehog({ happy }: { happy: boolean }) {
  return (
    <svg viewBox="-34 -36 68 84" aria-hidden focusable="false">
      <ellipse cx="0" cy="43" rx="22" ry="4" fill="#2d2440" opacity="0.2" />
      <Critter kind="hedgehog" mood={happy ? 'happy' : 'idle'} body />
    </svg>
  )
}
