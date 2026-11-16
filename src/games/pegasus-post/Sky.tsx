import { Pony, RAINBOW, type PonyMood } from '../../kit/ponies'
import type { Cell, Sky } from './logic'

// A calm sky laid out as a grid: every stop is one square cloud with a letter waiting on it, empty places are
// faint hollows, and the pegasus leaves one rainbow ribbon behind.

export const CS = 68
export const PAD = 8
/** Extra sky above the top row, so the pegasus standing or flying there keeps its head in the picture. */
export const TOP = 26
export const boardW = (sky: Sky) => sky.cols * CS + PAD * 2
export const boardH = (sky: Sky) => sky.rows * CS + PAD * 2 + TOP

const cx = (sky: Sky, c: Cell) => PAD + (c % sky.cols) * CS + CS / 2
const cy = (sky: Sky, c: Cell) => PAD + TOP + Math.floor(c / sky.cols) * CS + CS / 2

/** One square cloud of the grid. A cloud the pegasus has left turns pale gold. */
function Tile({ glow, done }: { glow: boolean; done: boolean }) {
  return (
    <>
      {glow && <rect x="-33" y="-33" width="66" height="68" rx="20" className="pp-glow" />}
      <rect x="-29" y="-25" width="58" height="58" rx="17" fill={done ? '#ecd9a0' : '#cfe0f1'} className="pp-tile" />
      <rect x="-29" y="-29" width="58" height="58" rx="17" fill={done ? '#fff3c9' : '#fff'} className="pp-tile" />
    </>
  )
}

function Gate({ open }: { open: boolean }) {
  return (
    <g transform="translate(0 14)" className={open ? 'pp-gate-open' : undefined}>
      <g fill="none" strokeWidth="4.4">
        {[0, 2, 3, 4, 6].map((n, i) => (
          <path key={n} d={`M${-20 + i * 4.2} 0 A${20 - i * 4.2} ${24 - i * 4.2} 0 0 1 ${20 - i * 4.2} 0`} stroke={RAINBOW[n]} />
        ))}
      </g>
    </g>
  )
}

export function Letter({ scale = 1 }: { scale?: number }) {
  return (
    <g transform={`scale(${scale})`}>
      <rect x="-9" y="-6.5" width="18" height="13" rx="2.5" fill="#ffe08a" />
      <path d="M-9 -5.5 L0 1.5 L9 -5.5" fill="none" stroke="#e58a2e" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
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
  const trail = flying ? route.slice(0, -1) : route
  const points = trail.map((c) => `${cx(sky, c)},${cy(sky, c)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="pp-art" aria-hidden focusable="false">
      <rect width={W} height={H} rx="26" fill="#8ccbee" />
      <path d={`M0 ${H * 0.55} Q${W * 0.35} ${H * 0.45} ${W * 0.6} ${H * 0.58} T${W} ${H * 0.5} V${H} H0Z`} fill="#9dd4f2" />
      {sky.clouds.map((on, c) => (
        <g key={c} transform={`translate(${cx(sky, c)} ${cy(sky, c)})`}>
          {on ? (
            <g className={hint === c ? 'pp-hint' : undefined}>
              <Tile glow={open.includes(c) || hint === c} done={route.includes(c) && c !== here} />
            </g>
          ) : (
            <rect x="-27" y="-27" width="54" height="54" rx="16" fill="#7fc0e6" opacity="0.55" />
          )}
        </g>
      ))}
      {/* The way flown: one soft rainbow ribbon that bends round the corners. It grows when the pegasus lands. */}
      {trail.length > 1 && (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <polyline points={points} stroke="#f08aa6" strokeWidth="11" />
          <polyline points={points} stroke="#f9d65c" strokeWidth="6.6" />
          <polyline points={points} stroke="#7fd0e8" strokeWidth="2.4" />
        </g>
      )}
      <circle cx={cx(sky, route[0])} cy={cy(sky, route[0])} r="7.5" fill="#f08aa6" />
      <circle cx={cx(sky, route[0])} cy={cy(sky, route[0])} r="3.4" fill="#fff" />
      {sky.clouds.map((on, c) => {
        if (!on || c === here) return null
        return (
          <g key={c} transform={`translate(${cx(sky, c)} ${cy(sky, c)})`}>
            {c === sky.home ? <Gate open={allDone} /> : !route.includes(c) && <Letter scale={1.5} />}
          </g>
        )
      })}
      <g className="pp-flyer" style={{ transform: `translate(${cx(sky, here)}px, ${cy(sky, here) - 6}px)` }}>
        <g key={route.length} className={route.length > 1 && flying ? 'pp-arc' : undefined}>
          <g className={mood === 'sad' ? 'pp-no' : undefined}>
            <g transform={`scale(${left ? -0.7 : 0.7} 0.7)`}>
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
