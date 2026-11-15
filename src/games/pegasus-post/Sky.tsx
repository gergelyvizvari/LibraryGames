import { Pony, RAINBOW, type PonyMood } from '../../kit/ponies'
import type { Cell, Sky } from './logic'

// The sky of a picture book: a puffy cloud for every stop with a little house and its letter box, the post
// office the pegasus starts from, the rainbow gate, and the rainbow ribbon the pegasus leaves behind.

export const CS = 68
export const PAD = 8
/** Extra sky above the top row, so the pegasus standing or flying there keeps its head in the picture. */
export const TOP = 26
export const boardW = (sky: Sky) => sky.cols * CS + PAD * 2
export const boardH = (sky: Sky) => sky.rows * CS + PAD * 2 + TOP
const roofs = [
  { main: '#d9506a', dark: '#b63c5c', light: '#ec7f93' },
  { main: '#7d4a6e', dark: '#5f3554', light: '#a06a90' },
  { main: '#e98a3c', dark: '#c96c22', light: '#f6ad6c' },
  { main: '#3a6db5', dark: '#2c5590', light: '#6a97d6' },
  { main: '#3d8e6e', dark: '#2c6e54', light: '#63b494' },
]
const WALL = '#fff3dc'
const WALL_SHADE = '#ecd9b4'
const DOOR = '#8a3e55'

const cx = (sky: Sky, c: Cell) => PAD + (c % sky.cols) * CS + CS / 2
const cy = (sky: Sky, c: Cell) => PAD + TOP + Math.floor(c / sky.cols) * CS + CS / 2

function Cloud({ glow }: { glow: boolean }) {
  return (
    <>
      {glow && <ellipse cy="14" rx="34" ry="16" className="pp-glow" />}
      <ellipse cy="23" rx="25" ry="5" fill="#5fa4d2" opacity="0.4" />
      <g fill="#dbe9f7">
        <ellipse cy="15" rx="30" ry="10" />
        <circle cx="-20" cy="10" r="10" />
        <circle cx="21" cy="11" r="9" />
      </g>
      <g fill="#fff">
        <ellipse cy="11" rx="29" ry="9.5" />
        <circle cx="-19" cy="6" r="10" />
        <circle cx="19" cy="7" r="9" />
        <circle cx="-4" cy="3" r="12" />
        <circle cx="9" cy="4" r="10" />
      </g>
      <path d="M-24 3 q4 -6 10 -5 M4 -4 q5 -3 10 0" fill="none" stroke="#f3f9ff" strokeWidth="2" strokeLinecap="round" />
    </>
  )
}

type Roof = (typeof roofs)[number]
const windowFill = (lit: boolean) => (lit ? '#ffd24a' : '#a9d8ee')

/** A round window with its cross; it glows once the letter has come. */
function Pane({ x, y, r = 3.6, lit }: { x: number; y: number; r?: number; lit: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r + 1.1} fill="#fffaf0" />
      <circle r={r} fill={windowFill(lit)} className="pp-pane" />
      <path d={`M${-r} 0 H${r} M0 ${-r} V${r}`} stroke="#fffaf0" strokeWidth="1.1" />
    </g>
  )
}

const Smoke = () => (
  <g className="pp-smoke" fill="#fff" opacity="0.85">
    <circle cx="0" cy="0" r="2.6" />
    <circle cx="2.4" cy="-4.6" r="2" />
    <circle cx="0.6" cy="-8.6" r="1.5" />
  </g>
)

/** Three kinds of houses, drawn with their floor on y = 9: a cottage, a tower and a wide barn. */
function House({ kind, roof, lit }: { kind: number; roof: Roof; lit: boolean }) {
  if (kind === 1)
    return (
      <g>
        <path d="M-9 -12 H9 V9 H-9Z" fill={WALL} />
        <path d="M4 -12 H9 V9 H4Z" fill={WALL_SHADE} />
        <path d="M-13 -11 Q-7 -28 0 -33 Q7 -28 13 -11 Q0 -15 -13 -11Z" fill={roof.main} />
        <path d="M0 -33 Q7 -28 13 -11 Q8 -13 4 -13.4 Q4 -24 0 -33Z" fill={roof.dark} />
        <path d="M-8 -17 q3 -8 6 -11" fill="none" stroke={roof.light} strokeWidth="2" strokeLinecap="round" />
        <path d="M0 -33 V-40" stroke="#8a5c3c" strokeWidth="1.4" />
        <path d="M0 -40 l7 2.5 l-7 2.5Z" fill="#f2c14e" className="pp-flag" />
        <Pane x={0} y={-5} r={3.2} lit={lit} />
        <path d="M-3.4 9 v-6 a3.4 3.4 0 0 1 6.8 0 v6Z" fill={DOOR} />
        <circle cx="1.8" cy="5" r="0.8" fill="#f2c14e" />
      </g>
    )
  if (kind === 2)
    return (
      <g>
        <path d="M-15 -4 H15 V9 H-15Z" fill={WALL} />
        <path d="M9 -4 H15 V9 H9Z" fill={WALL_SHADE} />
        <path d="M-18 -3 L-12 -15 L-5 -21 H5 L12 -15 L18 -3 Q0 -7 -18 -3Z" fill={roof.main} />
        <path d="M5 -21 L12 -15 L18 -3 Q13 -4.6 9 -5.2 L7 -14Z" fill={roof.dark} />
        <path d="M-11 -13 L-5 -18 H1" fill="none" stroke={roof.light} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M0 -8.2 c-2.6 -2.6 -5.6 0.6 0 4.6 c5.6 -4 2.6 -7.2 0 -4.6Z" fill={windowFill(lit)} className="pp-pane" />
        <path d="M-5 9 v-7 h10 v7Z" fill={DOOR} />
        <path d="M0 2 V9" stroke="#6d2f42" strokeWidth="1" />
        <rect x="-13" y="1" width="5" height="5" rx="1" fill={windowFill(lit)} className="pp-pane" />
      </g>
    )
  return (
    <g>
      <rect x="6" y="-22" width="5" height="10" rx="1" fill="#b98a5c" />
      <g transform="translate(8.5 -25)">
        <Smoke />
      </g>
      <path d="M-13 -5 Q-14 9 -12 9 H12 Q14 9 13 -5Z" fill={WALL} />
      <path d="M7 -5 H13 Q14 9 12 9 H7Z" fill={WALL_SHADE} />
      <path d="M-18 -3 Q-10 -21 0 -23 Q10 -21 18 -3 Q0 -8 -18 -3Z" fill={roof.main} />
      <path d="M0 -23 Q10 -21 18 -3 Q12 -5 7 -5.6 Q6 -16 0 -23Z" fill={roof.dark} />
      <path d="M-12 -8 q4 -8 9 -11" fill="none" stroke={roof.light} strokeWidth="2.2" strokeLinecap="round" />
      <Pane x={-6} y={1} lit={lit} />
      <path d="M1 9 v-7 a3.6 3.6 0 0 1 7.2 0 v7Z" fill={DOOR} />
      <circle cx="6.4" cy="4.6" r="0.8" fill="#f2c14e" />
      <path d="M-11 6.2 h10" stroke="#8a5c3c" strokeWidth="2" strokeLinecap="round" />
      <circle cx="-9" cy="4.6" r="1.5" fill="#f08aa6" />
      <circle cx="-5.6" cy="4.4" r="1.5" fill="#fff" />
      <circle cx="-2.6" cy="4.7" r="1.4" fill="#f08aa6" />
    </g>
  )
}

/** The letter box beside every house: the flag goes up and a letter peeks out when the post has come. */
function LetterBox({ full }: { full: boolean }) {
  return (
    <g transform="translate(21 0)">
      <rect x="-1" y="0" width="2.4" height="10" fill="#8a5c3c" />
      <path d="M-5.5 -7 a5.5 5.5 0 0 1 11 0 V1 H-5.5Z" fill={full ? '#e2607e' : '#9aa7c4'} />
      <path d="M2 -7 a3.4 3.4 0 0 1 3.5 0 V1 H2Z" fill="#33284a" opacity="0.18" />
      {full && (
        <g className="pp-letter">
          <rect x="-6.5" y="-13.5" width="10" height="7.5" rx="1.4" fill="#fffaf0" transform="rotate(-12 -1.5 -10)" />
          <path d="M-6 -12.6 l4.8 3.4 l4.6 -4.6" fill="none" stroke="#e2607e" strokeWidth="1.2" strokeLinejoin="round" />
        </g>
      )}
    </g>
  )
}

/** The post office on the first cloud: a blue kiosk with a striped awning and an envelope for a sign. */
function PostOffice() {
  return (
    <g>
      <path d="M-14 -8 H14 V9 H-14Z" fill="#4f86cf" />
      <path d="M8 -8 H14 V9 H8Z" fill="#3a6db5" />
      <path d="M-17 -8 L-13 -19 H13 L17 -8Z" fill="#fffaf0" />
      <path d="M-13 -19 H-7.8 L-10.2 -8 H-17Z M-2.6 -19 H2.6 L3.4 -8 H-3.4Z M7.8 -19 H13 L17 -8 H10.2Z" fill="#e2607e" />
      <path d="M-17 -8 q3.4 4 6.8 0 q3.4 4 6.8 0 q3.4 4 6.8 0 q3.4 4 6.8 0 q3.4 4 6.8 0Z" fill="#fffaf0" />
      <rect x="-10" y="-2" width="11" height="8" rx="1.4" fill="#fffaf0" />
      <path d="M-10 -1.4 l5.5 4 l5.5 -4" fill="none" stroke="#e2607e" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M4 9 v-9 h6 v9Z" fill="#2c5590" />
      <circle cx="-4.5" cy="-24" r="5" fill="#f2c14e" />
      <path d="M-7 -24 h5 M-4.5 -26.5 v5" stroke="#fffaf0" strokeWidth="1.4" strokeLinecap="round" />
    </g>
  )
}

function Gate({ open }: { open: boolean }) {
  return (
    <g transform="translate(0 10)">
      <g fill="none" strokeWidth="3.6" className={open ? 'pp-gate-open' : undefined}>
        {RAINBOW.map((c, i) => (i % 2 === 0 || i === 3 ? <path key={c} d={`M${-21 + i * 2.1} 0 A${21 - i * 2.1} ${30 - i * 2.4} 0 0 1 ${21 - i * 2.1} 0`} stroke={c} strokeWidth="2.3" /> : null))}
      </g>
      <path className="pp-star" d="M0 -40 l2 4.4 4.8 .6 -3.5 3.3 .9 4.7 -4.2 -2.3 -4.2 2.3 .9 -4.7 -3.5 -3.3 4.8 -.6Z" fill="#f7cf45" />
      <g fill="#fff">
        <circle cx="-19" cy="0" r="5.5" />
        <circle cx="-13" cy="1.5" r="4" />
        <circle cx="19" cy="0" r="5.5" />
        <circle cx="13" cy="1.5" r="4" />
      </g>
    </g>
  )
}

export function Letter({ scale = 1 }: { scale?: number }) {
  return (
    <g transform={`scale(${scale})`}>
      <rect x="-9" y="-6.5" width="18" height="13" rx="2.5" fill="#fffaf0" />
      <path d="M-9 -5.5 L0 1.5 L9 -5.5" fill="none" stroke="#e2607e" strokeWidth="2" strokeLinejoin="round" />
    </g>
  )
}

/** The pegasus's post bag, drawn on the pony's own grid. */
export function PostBag() {
  return (
    <>
      <path d="M-14 0 L2 24" stroke="#8a5c3c" strokeWidth="3" />
      <rect x="-12" y="14" width="19" height="15" rx="4" fill="#d07a44" />
      <rect x="-12" y="14" width="19" height="6" rx="3" fill="#b8612f" />
      <circle cx="-2.5" cy="20" r="1.8" fill="#f2c14e" />
    </>
  )
}

const BackCloud = ({ x, y, s }: { x: number; y: number; s: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="#b9e1f6">
    <ellipse rx="26" ry="8" />
    <circle cx="-9" cy="-6" r="9" />
    <circle cx="7" cy="-8" r="11" />
  </g>
)

export function SkyMap({
  sky,
  route,
  open,
  hint,
  mood,
  flying,
}: {
  sky: Sky
  /** The clouds the pegasus has landed on, in order; it stands on the last one. */
  route: Cell[]
  /** Clouds to light up as the next possible stops. */
  open: Cell[]
  hint: Cell | null
  mood: PonyMood
  /** The pegasus is in the air between two clouds. */
  flying: boolean
}) {
  const W = boardW(sky)
  const H = boardH(sky)
  const here = route[route.length - 1]
  const prev = route.length > 1 ? route[route.length - 2] : here
  // The pegasus looks the way it flies.
  const left = cx(sky, here) < cx(sky, prev)
  const allDone = route.length === sky.clouds.filter(Boolean).length
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="pp-art" aria-hidden focusable="false">
      <rect width={W} height={H} rx="26" fill="#86c8ec" />
      <path d={`M0 ${H * 0.36} Q${W * 0.3} ${H * 0.26} ${W * 0.55} ${H * 0.4} T${W} ${H * 0.34} V${H} H0Z`} fill="#9bd3f1" />
      <path d={`M0 ${H * 0.7} Q${W * 0.35} ${H * 0.6} ${W * 0.6} ${H * 0.72} T${W} ${H * 0.66} V${H} H0Z`} fill="#b0def5" />
      <circle cx={W - 12} cy="12" r="26" fill="#fff6c8" opacity="0.45" />
      <circle cx={W - 12} cy="12" r="15" fill="#ffe27a" />
      <BackCloud x={W * 0.2} y={H * 0.5} s={0.8} />
      <BackCloud x={W * 0.78} y={H * 0.84} s={1} />
      <BackCloud x={W * 0.52} y={H * 0.14} s={0.7} />
      {[[0.1, 0.12], [0.36, 0.3], [0.9, 0.55], [0.14, 0.86], [0.66, 0.62]].map(([x, y], i) => (
        <path key={i} className="pp-twinkle" style={{ animationDelay: `${i * 0.5}s` }} transform={`translate(${W * x} ${H * y})`} d="M0 -4 l1 3 3 1 -3 1 -1 3 -1 -3 -3 -1 3 -1Z" fill="#fff" />
      ))}
      {sky.clouds.map((on, c) =>
        on ? (
          <g key={c} transform={`translate(${cx(sky, c)} ${cy(sky, c)})`}>
            <g className={hint === c ? 'pp-hint' : undefined}>
              <Cloud glow={open.includes(c) || hint === c} />
            </g>
          </g>
        ) : null,
      )}
      {/* The ribbon: every flight gets the next colour of the rainbow. */}
      {route.slice(1).map((c, i) => {
        const at = { x1: cx(sky, route[i]), y1: cy(sky, route[i]) + 13, x2: cx(sky, c), y2: cy(sky, c) + 13 }
        return (
          <g key={`${i}-${c}`} className="pp-ribbon" strokeLinecap="round">
            <line {...at} stroke={RAINBOW[i % RAINBOW.length]} strokeWidth="8" />
            <line {...at} stroke="#fff" strokeWidth="2" opacity="0.45" transform="translate(0 -1.6)" />
          </g>
        )
      })}
      {sky.clouds.map((on, c) => {
        if (!on) return null
        const seen = route.includes(c)
        return (
          <g key={c} transform={`translate(${cx(sky, c)} ${cy(sky, c)})`}>
            {c === sky.start ? (
              <PostOffice />
            ) : c === sky.home ? (
              <Gate open={allDone} />
            ) : (
              <>
                <g transform="translate(-6 0)">
                  <House kind={(c + Math.floor(c / sky.cols) * 2) % 3} roof={roofs[(c * 3 + Math.floor(c / sky.cols)) % roofs.length]} lit={seen} />
                </g>
                <LetterBox full={seen} />
              </>
            )}
          </g>
        )
      })}
      <g className="pp-flyer" style={{ transform: `translate(${cx(sky, here)}px, ${cy(sky, here) - 11}px)` }}>
        <g key={route.length} className={route.length > 1 && flying ? 'pp-arc' : undefined}>
          {/* A puff of cloud where it lands. */}
          {!flying && route.length > 1 && (
            <g className="pp-puff" fill="#fff">
              <circle cx="-15" cy="27" r="4.5" />
              <circle cx="15" cy="27" r="4.5" />
              <circle cx="0" cy="29" r="3.5" />
            </g>
          )}
          <g className={mood === 'sad' ? 'pp-no' : undefined}>
            <g transform={`scale(${left ? -0.62 : 0.62} 0.62)`}>
              {/* Nose up on the way up, nose down on the way down, and a little squash on landing. */}
              <g className={flying ? 'pp-pitch' : route.length > 1 ? 'pp-land' : undefined}>
                <Pony kind="pegasus" mood={mood} motion={flying ? 'fly' : 'stand'} />
                <PostBag />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}
