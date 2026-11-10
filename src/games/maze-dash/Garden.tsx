import { E, S, type Maze } from './logic'

// The maze is a garden seen from above: grass paths between clipped hedges, a little mouse and its cheese.

const INK = '#33284a'
const U = 100

function Mouse() {
  return (
    <>
      <ellipse cx="2" cy="27" rx="24" ry="6" fill="#241a3c" opacity="0.25" />
      <path d="M16 18 q20 4 16 -14" fill="none" stroke="#e79ab0" strokeWidth="4" strokeLinecap="round" />
      <circle cx="-19" cy="-17" r="13" fill="#a9a3c8" />
      <circle cx="19" cy="-17" r="13" fill="#a9a3c8" />
      <circle cx="-19" cy="-16" r="7.5" fill="#f3b2c4" />
      <circle cx="19" cy="-16" r="7.5" fill="#f3b2c4" />
      <ellipse cx="0" cy="6" rx="24" ry="22" fill="#cfcbe2" />
      <ellipse cx="0" cy="15" rx="13" ry="10" fill="#f4f1fb" />
      <circle cx="-9" cy="-1" r="6.4" fill="#fff" />
      <circle cx="9" cy="-1" r="6.4" fill="#fff" />
      <circle cx="-8.4" cy="-0.5" r="5" fill={INK} />
      <circle cx="9.6" cy="-0.5" r="5" fill={INK} />
      <circle cx="-10.2" cy="-2.6" r="1.9" fill="#fff" />
      <circle cx="7.8" cy="-2.6" r="1.9" fill="#fff" />
      <ellipse cx="0" cy="9" rx="4" ry="3" fill="#e2607e" />
      <path d="M-4 14 q4 3.5 8 0" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="-15" cy="9" r="3.4" fill="#f08aa6" opacity="0.6" />
      <circle cx="15" cy="9" r="3.4" fill="#f08aa6" opacity="0.6" />
    </>
  )
}

function Cheese() {
  return (
    <>
      <ellipse cx="0" cy="22" rx="28" ry="6" fill="#241a3c" opacity="0.22" />
      <path d="M-28 6 L20 -22 Q30 -10 28 6 Z" fill="#f7d572" />
      <path d="M-28 6 H28 V22 H-28 Z" fill="#f2c14e" />
      <path d="M8 6 H28 V22 H14 Q18 14 8 6Z" fill="#d9a52e" opacity="0.7" />
      <circle cx="-12" cy="14" r="4.5" fill="#d9a52e" />
      <circle cx="4" cy="16" r="3" fill="#d9a52e" />
      <circle cx="10" cy="-6" r="4" fill="#e6b93f" />
      <circle cx="19" cy="13" r="2.4" fill="#c48f1e" />
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
