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

/** A standing figure (red lamp) and a walking one (green lamp), drawn on a 0..24 box, so the lamps speak without colour too. */
const STAND = 'M12 3.2a2.6 2.6 0 1 1 0 5.2a2.6 2.6 0 1 1 0-5.2Z M9 9.6h6l1 7.2h-2.1v6.6h-1.6v-6.2h-.6v6.2h-1.6v-6.6H8Z'
const WALK = 'M13.4 3a2.5 2.5 0 1 1 0 5a2.5 2.5 0 1 1 0-5Z M11.2 9.2l3.1.3l1.4 4.2l2.6 1.3l-.7 1.4l-3.1-1.5l-.6-1.6l-.8 3.4l2.4 2.6l-.4 4.3h-1.7l.3-3.6l-2.6-2.7l-1.2 3.4l-3.3 3h-2l3.6-4l1.4-6.6l-1.4.8l-.9 2.7l-1.6-.5l1.1-3.6Z'

/** A pedestrian light on its pole: the red standing figure on top, the green walking figure below; the green one blinks before red. */
export function LightArt({ light }: { light: Light }) {
  const red = light === 'red'
  const green = light !== 'red'
  return (
    <svg viewBox="0 0 60 170" aria-hidden focusable="false">
      <rect x="26" y="100" width="8" height="70" rx="3" fill="#5a5470" />
      <rect x="4" y="4" width="52" height="98" rx="12" fill="#3b3550" />
      <rect x="10" y="10" width="40" height="40" rx="8" fill={red ? '#ff5a5f' : '#4a3d48'} />
      <path d={STAND} transform="translate(12 12) scale(1.5)" fill={red ? '#fff3f0' : '#6b5560'} />
      <g className={light === 'blink' ? 'tl-blink' : undefined}>
        <rect x="10" y="56" width="40" height="40" rx="8" fill={green ? '#4fd26b' : '#3a4a42'} />
        <path d={WALK} transform="translate(12 58) scale(1.5)" fill={green ? '#effff2' : '#53685b'} />
      </g>
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
