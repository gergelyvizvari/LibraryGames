import { Pony, RAINBOW, type PonyMood } from '../../kit/ponies'
import type { Cell, Sky } from './logic'

// The sky seen from the side of a picture book: a cloud for every stop, a little house on each, the pegasus
// with its post bag and the rainbow ribbon it leaves behind.

export const CS = 68
const PAD = 8
export const boardW = (sky: Sky) => sky.cols * CS + PAD * 2
export const boardH = (sky: Sky) => sky.rows * CS + PAD * 2
const roofs = ['#d9506a', '#7d4a6e', '#e98a3c', '#3a6db5', '#3d8e6e']

const cx = (sky: Sky, c: Cell) => PAD + (c % sky.cols) * CS + CS / 2
const cy = (sky: Sky, c: Cell) => PAD + Math.floor(c / sky.cols) * CS + CS / 2

function Cloud({ glow }: { glow: boolean }) {
  return (
    <>
      {glow && <ellipse cy="13" rx="33" ry="15" className="pp-glow" />}
      <ellipse cy="19" rx="27" ry="8" fill="#6fb2dc" opacity="0.45" />
      <g fill="#fff">
        <ellipse cy="12" rx="29" ry="11" />
        <circle cx="-17" cy="6" r="10" />
        <circle cx="17" cy="7" r="9" />
        <circle cx="0" cy="3" r="12" />
      </g>
      <path d="M-27 14 Q0 26 27 14 Q24 23 0 23 Q-24 23 -27 14Z" fill="#dcecf8" />
    </>
  )
}

function House({ roof, lit }: { roof: string; lit: boolean }) {
  return (
    <g transform="translate(0 -6)">
      <path d="M-12 -2 Q-13 14 -11 14 H11 Q13 14 12 -2Z" fill="#fff3dc" />
      <path d="M-17 0 Q-9 -17 0 -19 Q9 -17 17 0 Q0 -4 -17 0Z" fill={roof} />
      <path d="M-3.5 14 v-7 a3.5 3.5 0 0 1 7 0 v7Z" fill="#8a3e55" />
      <rect x="-10" y="2" width="5.5" height="5.5" rx="1.5" fill={lit ? '#ffd24a' : '#bfe3ef'} />
      <rect x="4.5" y="2" width="5.5" height="5.5" rx="1.5" fill={lit ? '#ffd24a' : '#bfe3ef'} />
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
    </>
  )
}

export function SkyMap({
  sky,
  route,
  open,
  hint,
  mood,
}: {
  sky: Sky
  /** The clouds the pegasus has landed on, in order; it stands on the last one. */
  route: Cell[]
  /** Clouds to light up as the next possible stops. */
  open: Cell[]
  hint: Cell | null
  mood: PonyMood
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
      <rect width={W} height={H} rx="26" fill="#8fcdee" />
      <path d={`M0 ${H * 0.42} Q${W * 0.3} ${H * 0.3} ${W * 0.55} ${H * 0.44} T${W} ${H * 0.4} V${H - 26} a26 26 0 0 1 -26 26 H26 a26 26 0 0 1 -26 -26Z`} fill="#a4d8f2" />
      {sky.clouds.map((on, c) =>
        on ? (
          <g key={c} transform={`translate(${cx(sky, c)} ${cy(sky, c)})`} className={hint === c ? 'pp-hint' : undefined}>
            <Cloud glow={open.includes(c) || hint === c} />
          </g>
        ) : null,
      )}
      {/* The ribbon: every flight gets the next colour of the rainbow. */}
      {route.slice(1).map((c, i) => (
        <line key={`${i}-${c}`} className="pp-ribbon" x1={cx(sky, route[i])} y1={cy(sky, route[i]) + 10} x2={cx(sky, c)} y2={cy(sky, c) + 10} stroke={RAINBOW[i % RAINBOW.length]} strokeWidth="8" strokeLinecap="round" />
      ))}
      {sky.clouds.map((on, c) => {
        if (!on) return null
        const x = cx(sky, c)
        const y = cy(sky, c)
        const seen = route.includes(c)
        if (c === sky.start)
          return (
            <g key={c} transform={`translate(${x} ${y})`}>
              <rect x="-17" y="-4" width="4" height="16" rx="1.5" fill="#8a5c3c" />
              <rect x="-23" y="-17" width="16" height="15" rx="6.5" fill="#3a6db5" />
              <rect x="-19.5" y="-11" width="9" height="2.4" rx="1" fill="#fffaf0" />
            </g>
          )
        if (c === sky.home)
          return (
            <g key={c} transform={`translate(${x} ${y + 9})`}>
              <g fill="none" strokeWidth="3.4" className={allDone ? 'pp-gate-open' : undefined}>
                {[0, 2, 4, 6].map((k, i) => (
                  <path key={k} d={`M${-19 + i * 3.4} 0 A${19 - i * 3.4} ${24 - i * 3.4} 0 0 1 ${19 - i * 3.4} 0`} stroke={RAINBOW[k]} />
                ))}
              </g>
            </g>
          )
        return (
          <g key={c} transform={`translate(${x} ${y})`}>
            <House roof={roofs[(c * 3 + Math.floor(c / sky.cols)) % roofs.length]} lit={seen} />
            {seen && (
              <g className="pp-letter" transform="translate(13 2) rotate(-10)">
                <Letter scale={0.72} />
              </g>
            )}
          </g>
        )
      })}
      <g className="pp-flyer" style={{ transform: `translate(${cx(sky, here)}px, ${cy(sky, here) - 12}px)` }}>
        <g className={mood === 'happy' ? 'pp-hop' : mood === 'sad' ? 'pp-no' : 'pp-hover'}>
          <g transform={`scale(${left ? -0.5 : 0.5} 0.5)`}>
            <Pony kind="pegasus" mood={mood} />
            <PostBag />
          </g>
        </g>
      </g>
    </svg>
  )
}
