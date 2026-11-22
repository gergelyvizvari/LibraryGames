import cheese from './art/cheese.webp'
import mouse from './art/mouse.webp'
import { E, S, type Maze } from './logic'

// The maze is a hedge garden seen from above, laid on the painted lawn: grass paths between clipped hedges, a painted mouse and its cheese.

const U = 100

/** The painted mouse (from above) and its cheese, drawn around (0, 0). */
function Mouse() {
  return (
    <>
      <ellipse cx="2" cy="30" rx="22" ry="6" fill="#241a3c" opacity="0.25" />
      <image href={mouse} x="-32" y="-40" width="64" height="80" preserveAspectRatio="xMidYMid meet" />
    </>
  )
}

function Cheese() {
  return (
    <>
      <ellipse cx="0" cy="24" rx="28" ry="6" fill="#241a3c" opacity="0.22" />
      <image href={cheese} x="-34" y="-30" width="68" height="62" preserveAspectRatio="xMidYMax meet" />
    </>
  )
}

export function Garden({ maze, pos, trail, won }: { maze: Maze; pos: number; trail: number[]; won: boolean }) {
  const { w, h, open } = maze
  const W = w * U
  const H = h * U
  const xy = (i: number) => [(i % w) * U + U / 2, Math.floor(i / w) * U + U / 2]
  // Every hedge once: the right and bottom side of each square that is closed. The garden's own edge is drawn as a frame.
  let hedge = ''
  open.forEach((o, i) => {
    const x = (i % w) * U
    const y = Math.floor(i / w) * U
    if (!(o & E) && i % w < w - 1) hedge += `M${x + U} ${y} v${U} `
    if (!(o & S) && i < w * (h - 1)) hedge += `M${x} ${y + U} h${U} `
  })
  const [mx, my] = xy(pos)
  const [gx, gy] = xy(w * h - 1)
  const k = Math.min(1.15, 0.72 + 6 / (w + h))
  return (
    <svg className="md-art" viewBox={`0 0 ${W} ${H}`} aria-hidden focusable="false">
      <rect x="-30" y="-18" width={W + 60} height={H + 60} rx="40" fill="#241a3c" opacity="0.28" />
      <rect x="-30" y="-30" width={W + 60} height={H + 60} rx="40" fill="#1f6a5c" />
      <rect x="-22" y="-30" width={W + 44} height={H + 44} rx="34" fill="#2c8474" />
      <rect width={W} height={H} rx="14" fill="#c5d86b" />
      {open.map((_, i) => {
        const [x, y] = xy(i)
        return (i + Math.floor(i / w)) % 2 ? <rect key={i} x={x - 50} y={y - 50} width={U} height={U} rx="14" fill="#d2e27c" opacity="0.6" /> : null
      })}
      {trail.map((i) => {
        const [x, y] = xy(i)
        return i === pos ? null : <circle key={i} className="md-crumb" cx={x} cy={y} r="9" fill="#fff6dc" />
      })}
      <path d={hedge} fill="none" stroke="#1f6a5c" strokeWidth="26" strokeLinecap="round" />
      <path d={hedge} fill="none" stroke="#2c8474" strokeWidth="14" strokeLinecap="round" transform="translate(0 -5)" />
      <g transform={`translate(${gx} ${gy}) scale(${k})`}>
        <g className={won ? 'md-gone' : 'md-cheese'}>
          <Cheese />
        </g>
      </g>
      <g className="md-mouse" style={{ transform: `translate(${mx}px, ${my}px)` }}>
        <g transform={`scale(${k})`}>
          <g className={won ? 'md-cheer' : undefined}>
            <Mouse />
          </g>
        </g>
      </g>
    </svg>
  )
}
