import cloudGold from './art/cloud-gold.webp'
import cloud from './art/cloud.webp'
import gate from './art/gate.webp'
import letter from './art/letter.webp'
import pegasusBlink from './art/pegasus-blink.webp'
import pegasusHappy from './art/pegasus-happy.webp'
import pegasusSad from './art/pegasus-sad.webp'
import pegasus from './art/pegasus.webp'
import type { Cell, Sky } from './logic'

// A grid of painted clouds in the painted sky: every stop is one cloud with a winged letter waiting on it, empty
// places are faint wisps, and the pegasus leaves one rainbow ribbon behind.

export const CS = 68
export const PAD = 8
/** Extra sky above the top row, so the pegasus standing or flying there keeps its head in the picture. */
export const TOP = 26
export const boardW = (sky: Sky) => sky.cols * CS + PAD * 2
export const boardH = (sky: Sky) => sky.rows * CS + PAD * 2 + TOP

const cx = (sky: Sky, c: Cell) => PAD + (c % sky.cols) * CS + CS / 2
const cy = (sky: Sky, c: Cell) => PAD + TOP + Math.floor(c / sky.cols) * CS + CS / 2

/** One cloud of the grid: a painted puff that turns sunny gold once the pegasus has left it. */
function Tile({ glow, done }: { glow: boolean; done: boolean }) {
  return (
    <>
      {glow && <ellipse cx="0" cy="4" rx="34" ry="26" className="pp-glow" />}
      <image href={done ? cloudGold : cloud} x="-33" y="-18" width="66" height="45" preserveAspectRatio="xMidYMid meet" />
    </>
  )
}

function Gate({ open }: { open: boolean }) {
  return (
    <g className={open ? 'pp-gate-open' : undefined}>
      <image href={gate} x="-30" y="-36" width="60" height="48" preserveAspectRatio="xMidYMax meet" />
    </g>
  )
}

function Letter() {
  return <image href={letter} x="-26" y="-22" width="52" height="22" preserveAspectRatio="xMidYMax meet" className="pp-letter" />
}

export type Face = 'idle' | 'blink' | 'happy' | 'sad'
const FACES: [Face, string][] = [
  ['idle', pegasus],
  ['blink', pegasusBlink],
  ['happy', pegasusHappy],
  ['sad', pegasusSad],
]

export function SkyMap({
  sky,
  route,
  open,
  hint,
  face,
  flying,
}: {
  sky: Sky
  /** The clouds the pegasus has landed on, in order; it stands on the last one. */
  route: Cell[]
  /** Clouds to light up as the next possible stops. */
  open: Cell[]
  hint: Cell | null
  face: Face
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
      {sky.clouds.map((on, c) => (
        <g key={c} transform={`translate(${cx(sky, c)} ${cy(sky, c)})`}>
          {on ? (
            <g className={hint === c ? 'pp-hint' : undefined}>
              <Tile glow={open.includes(c) || hint === c} done={route.includes(c) && c !== here} />
            </g>
          ) : (
            <ellipse cx="0" cy="4" rx="22" ry="9" fill="#fff" opacity="0.35" />
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
            {c === sky.home ? <Gate open={allDone} /> : !route.includes(c) && <Letter />}
          </g>
        )
      })}
      <g className="pp-flyer" style={{ transform: `translate(${cx(sky, here)}px, ${cy(sky, here) - 6}px)` }}>
        <g key={route.length} className={route.length > 1 && flying ? 'pp-arc' : undefined}>
          <g className={face === 'sad' ? 'pp-no' : undefined}>
            <g transform={`scale(${left ? -1 : 1} 1)`}>
              {/* Nose up on the way up, nose down on the way down, and a little squash on landing. */}
              <g className={flying ? 'pp-pitch' : route.length > 1 ? 'pp-land' : undefined}>
                {FACES.map(([f, src]) => (
                  <image key={f} href={src} x="-36" y="-66" width="72" height="77" preserveAspectRatio="xMidYMax meet" visibility={f === face ? 'visible' : 'hidden'} />
                ))}
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}
