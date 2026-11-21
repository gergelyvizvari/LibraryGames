import boardArt from './art/board.webp'
import bunny from './art/bunny.webp'
import cottageBlue from './art/cottage-blue.webp'
import cottagePlum from './art/cottage-plum.webp'
import cottageRed from './art/cottage-red.webp'
import cottageRose from './art/cottage-rose.webp'
import letterArt from './art/letter.webp'
import pine from './art/pine.webp'
import pond from './art/pond.webp'
import postbox from './art/postbox.webp'
import postmanBlink from './art/postman-blink.webp'
import postmanHappy from './art/postman-happy.webp'
import postmanSad from './art/postman-sad.webp'
import postman from './art/postman.webp'
import { colOf, rowOf, SIZE, type Cell, type Village } from './logic'

// The village map on the post office wall, seen from above: a painted meadow in a wooden frame, a sandy path,
// painted pines, ponds and cottages, and the hedgehog postman walking it.

export const CS = 64
const PAD = 14
export const BOARD = SIZE * CS + PAD * 2
const cottages = [cottageRose, cottagePlum, cottageRed, cottageBlue]
const SAND = '#e6c678'
const SAND_EDGE = '#c9a35a'

export type Face = 'idle' | 'blink' | 'happy' | 'sad'
const FACES: [Face, string][] = [
  ['idle', postman],
  ['blink', postmanBlink],
  ['happy', postmanHappy],
  ['sad', postmanSad],
]

const cx = (c: Cell) => PAD + colOf(c) * CS + CS / 2
const cy = (c: Cell) => PAD + rowOf(c) * CS + CS / 2

/** A painted picture standing on the map, by its bottom centre. */
function Sprite({ href, x, y, w, h }: { href: string; x: number; y: number; w: number; h: number }) {
  return <image href={href} x={x - w / 2} y={y - h} width={w} height={h} preserveAspectRatio="xMidYMax meet" />
}

export function VillageMap({
  village,
  at,
  trail,
  delivered,
  face,
  oops,
}: {
  village: Village
  /** The square the hedgehog stands on. */
  at: Cell
  trail: Cell[]
  delivered: boolean
  face: Face
  oops: boolean
}) {
  const { ground, houses, start } = village
  const path = (c: number) => c >= 0 && ground[c] === 'path'
  const target = houses[0]
  return (
    <svg viewBox={`0 0 ${BOARD} ${BOARD}`} className="hp-art" aria-hidden focusable="false">
      <image href={boardArt} width={BOARD} height={BOARD} preserveAspectRatio="none" />
      {/* The path: a soft sandy patch on every path square, joined to its neighbours. */}
      {/* Drawn twice: a darker edge, then the sand on top. */}
      {[SAND_EDGE, SAND].map((fill, k) => (
        <g key={fill} fill={fill}>
          {ground.map((g, c) => {
            if (g !== 'path') return null
            const x = cx(c)
            const y = cy(c)
            const r = k ? 0 : 2.5
            return (
              <g key={c}>
                <circle cx={x} cy={y} r={21 + r} />
                {colOf(c) < SIZE - 1 && path(c + 1) && <rect x={x} y={y - 16 - r} width={CS} height={32 + 2 * r} rx={15 + r} />}
                {rowOf(c) < SIZE - 1 && path(c + SIZE) && <rect x={x - 16 - r} y={y} width={32 + 2 * r} height={CS} rx={15 + r} />}
              </g>
            )
          })}
        </g>
      ))}
      {ground.map((g, c) => (g === 'path' ? <ellipse key={c} cx={cx(c)} cy={cy(c)} rx="12" ry="8" fill="#f3dfa0" opacity="0.9" /> : null))}
      {trail.map((c, i) => (
        <g key={`${i}-${c}`} fill="#a8854a" opacity="0.5">
          <ellipse cx={cx(c) - 6} cy={cy(c) + 3} rx="3" ry="4" />
          <ellipse cx={cx(c) + 6} cy={cy(c) - 5} rx="3" ry="4" />
        </g>
      ))}
      {/* Things stand back to front, row by row, so a lower one overlaps the one above it. */}
      {ground.map((g, c) => {
        const house = houses.findIndex((h) => h.cell === c)
        if (house >= 0)
          return (
            <g key={c}>
              <Sprite href={cottages[houses[house].roof % cottages.length]} x={cx(c)} y={cy(c) + 26} w={60} h={62} />
              {house === 0 && delivered && (
                <g className="hp-guest">
                  <Sprite href={bunny} x={cx(c) - 22} y={cy(c) + 30} w={34} h={40} />
                </g>
              )}
            </g>
          )
        if (g === 'pine') return <Sprite key={c} href={pine} x={cx(c)} y={cy(c) + 26} w={56} h={64} />
        if (g === 'pond') return <Sprite key={c} href={pond} x={cx(c)} y={cy(c) + 24} w={60} h={46} />
        return null
      })}
      <Sprite href={postbox} x={cx(start) - 22} y={cy(start) + 22} w={24} h={38} />
      {!delivered ? (
        <g className="hp-letter">
          <Sprite href={letterArt} x={cx(target.cell) + 20} y={cy(target.cell) - 14} w={30} h={24} />
        </g>
      ) : (
        <Sprite href={letterArt} x={(cx(target.cell) + cx(target.door)) / 2} y={(cy(target.cell) + cy(target.door)) / 2 + 14} w={20} h={16} />
      )}
      <g className="hp-walker" style={{ transform: `translate(${cx(at)}px, ${cy(at) + 22}px)` }}>
        <g className={oops ? 'hp-oops' : delivered ? 'hp-hop' : undefined}>
          {FACES.map(([f, src]) => (
            <image key={f} href={src} x={-31} y={-74} width={62} height={74} preserveAspectRatio="xMidYMax meet" visibility={f === face ? 'visible' : 'hidden'} />
          ))}
        </g>
      </g>
    </svg>
  )
}
