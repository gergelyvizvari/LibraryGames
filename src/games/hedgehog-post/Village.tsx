import { Critter } from '../../kit/critters'
import { colOf, rowOf, SIZE, type Cell, type Village } from './logic'

// The village seen from above: a sandy path on the grass, pines, a pond, houses, and the hedgehog with its bag.

export const CS = 64
const PAD = 12
export const BOARD = SIZE * CS + PAD * 2
const roofs = ['#d9506a', '#7d4a6e', '#a24a4a', '#3a6db5']
const SAND = '#e9d690'

const cx = (c: Cell) => PAD + colOf(c) * CS + CS / 2
const cy = (c: Cell) => PAD + rowOf(c) * CS + CS / 2

function Pine({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y + 2})`}>
      <ellipse cx="0" cy="22" rx="16" ry="5" fill="#5f8f3a" opacity="0.5" />
      <path d="M0 -26 Q9 -10 16 6 Q8 4 0 6 Q-8 4 -16 6 Q-9 -10 0 -26Z" fill="#2f6f6a" />
      <path d="M0 -10 Q11 6 19 20 Q8 17 0 19 Q-8 17 -19 20 Q-11 6 0 -10Z" fill="#245c58" />
    </g>
  )
}

function House({ x, y, roof, guest }: { x: number; y: number; roof: string; guest: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="24" rx="26" ry="6" fill="#5f8f3a" opacity="0.45" />
      <path d="M-20 -2 Q-21 22 -18 22 H18 Q21 22 20 -2Z" fill="#fff3dc" />
      <path d="M-27 2 Q-14 -24 0 -27 Q14 -24 27 2 Q0 -3 -27 2Z" fill={roof} />
      <path d="M-5 22 v-11 a5 5 0 0 1 10 0 v11Z" fill="#8a3e55" />
      <rect x="-16" y="4" width="9" height="9" rx="2" fill="#bfe3ef" />
      <rect x="8" y="4" width="9" height="9" rx="2" fill="#bfe3ef" />
      {guest && (
        <g className="hp-guest" transform="translate(-22 8) scale(0.42)">
          <Critter kind="bunny" mood="happy" />
        </g>
      )}
    </g>
  )
}

export function Letter({ x, y, scale = 1, tilt = 0 }: { x: number; y: number; scale?: number; tilt?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
      <rect x="-13" y="-9" width="26" height="18" rx="3" fill="#fffaf0" />
      <path d="M-13 -8 L0 2 L13 -8" fill="none" stroke="#e2607e" strokeWidth="2.4" strokeLinejoin="round" />
    </g>
  )
}

/** The postman's blue cap, on a hedgehog's head. */
export function PostCap() {
  return (
    <>
      <path d="M-16 -16 Q0 -30 16 -16 Q0 -20 -16 -16Z" fill="#3a6db5" />
      <rect x="-17" y="-18" width="34" height="5" rx="2.5" fill="#2c5590" />
    </>
  )
}

/** The hedgehog postman, drawn around its head like the other critters. */
export function Postman({ mood = 'idle' as 'idle' | 'happy' | 'sad' }) {
  return (
    <>
      <Critter kind="hedgehog" mood={mood} body />
      <PostCap />
      <path d="M-14 12 L12 34" stroke="#8a5c3c" strokeWidth="3.5" />
      <rect x="6" y="24" width="20" height="16" rx="4" fill="#d07a44" />
      <rect x="6" y="24" width="20" height="6" rx="3" fill="#b8612f" />
    </>
  )
}

export function VillageMap({
  village,
  at,
  trail,
  delivered,
  oops,
}: {
  village: Village
  /** The square the hedgehog stands on. */
  at: Cell
  trail: Cell[]
  delivered: boolean
  oops: boolean
}) {
  const { ground, houses, start } = village
  const path = (c: number) => c >= 0 && ground[c] === 'path'
  const target = houses[0]
  return (
    <svg viewBox={`0 0 ${BOARD} ${BOARD}`} className="hp-art" aria-hidden focusable="false">
      <rect width={BOARD} height={BOARD} rx="30" fill="#b6cc5c" />
      {/* The path: a round patch on every path square, joined to its neighbours. */}
      {ground.map((g, c) => {
        if (g !== 'path') return null
        const x = cx(c)
        const y = cy(c)
        const wob = (rowOf(c) + colOf(c)) % 2
        return (
          <g key={c} fill={SAND}>
            <circle cx={x} cy={y} r="21" />
            {colOf(c) < SIZE - 1 && path(c + 1) && <rect x={x} y={y - 16 + wob} width={CS} height={32 - wob * 2} rx="14" />}
            {rowOf(c) < SIZE - 1 && path(c + SIZE) && <rect x={x - 16 + wob} y={y} width={32 - wob * 2} height={CS} rx="14" />}
          </g>
        )
      })}
      {ground.map((g, c) => (g === 'path' ? <ellipse key={c} cx={cx(c)} cy={cy(c)} rx="13" ry="9" fill="#f6e9b8" /> : null))}
      {trail.map((c, i) => (
        <g key={`${i}-${c}`} fill="#a8854a" opacity="0.55">
          <ellipse cx={cx(c) - 6} cy={cy(c) + 3} rx="3" ry="4" />
          <ellipse cx={cx(c) + 6} cy={cy(c) - 5} rx="3" ry="4" />
        </g>
      ))}
      {ground.map((g, c) => {
        if (g === 'pine') return <Pine key={c} x={cx(c)} y={cy(c)} />
        if (g === 'pond')
          return (
            <g key={c}>
              <ellipse cx={cx(c)} cy={cy(c) + 2} rx="27" ry="22" fill="#f0d27a" />
              <ellipse cx={cx(c)} cy={cy(c) + 2} rx="21" ry="16" fill="#3fbfb4" />
              <path d={`M${cx(c) - 8} ${cy(c) + 2} q6 -3 12 0`} stroke="#bff0e8" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            </g>
          )
        if (g === 'grass' && (c * 7) % 5 === 1)
          return (
            <g key={c} transform={`translate(${cx(c)} ${cy(c)})`}>
              <circle r="4" cx="-8" fill="#fff" />
              <circle r="1.8" cx="-8" fill="#f2c14e" />
              <circle r="4" cx="9" cy="8" fill="#f4b6c8" />
              <circle r="1.8" cx="9" cy="8" fill="#f2c14e" />
            </g>
          )
        return null
      })}
      {houses.map((h, i) => (
        <House key={h.cell} x={cx(h.cell)} y={cy(h.cell)} roof={roofs[h.roof % roofs.length]} guest={i === 0 && delivered} />
      ))}
      {/* The post box at the start. */}
      <g transform={`translate(${cx(start) - 24} ${cy(start) - 8})`}>
        <rect x="-2" y="8" width="4" height="18" fill="#8a5c3c" />
        <rect x="-9" y="-6" width="18" height="16" rx="7" fill="#3a6db5" />
        <rect x="-5" y="0" width="10" height="2.5" rx="1" fill="#fffaf0" />
      </g>
      {!delivered ? (
        <g className="hp-letter">
          <Letter x={cx(target.cell) + 20} y={cy(target.cell) - 26} scale={0.85} tilt={-10} />
        </g>
      ) : (
        <Letter x={(cx(target.cell) + cx(target.door)) / 2} y={(cy(target.cell) + cy(target.door)) / 2 + 6} scale={0.6} tilt={-8} />
      )}
      <g className="hp-walker" style={{ transform: `translate(${cx(at)}px, ${cy(at) - 4}px)` }}>
        <g className={oops ? 'hp-oops' : delivered ? 'hp-hop' : undefined}>
          <g transform="scale(0.8)">
            <Postman mood={delivered ? 'happy' : oops ? 'sad' : 'idle'} />
          </g>
        </g>
      </g>
    </svg>
  )
}
