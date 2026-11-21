import basketArt from './art/basket.webp'
import type { Cell, Regions } from './logic'

// The pieces of the puppies' den: the painted pups, the patchwork rug they sit on (kept crisp, it is the puzzle)
// and their basket.

const CREAM = '#fff6dc'

/** The painted pups, one coat each, with a calm and a happy face: art/pup-<coat>[-happy].webp. */
const ART = import.meta.glob<string>('./art/pup-*.webp', { eager: true, import: 'default' })
const COAT_NAMES = ['tan', 'white', 'grey', 'choc', 'cream'] as const
export const COATS = COAT_NAMES.length
const pupArt = (coat: number, happy: boolean) => ART[`./art/pup-${COAT_NAMES[coat % COATS]}${happy ? '-happy' : ''}.webp`]

/** A sitting pup, drawn around (0, 0): about 50 wide and 60 tall, its paws at y 28. Happy pups smile with closed eyes. */
export function Pup({ coat, happy = false, bow = false }: { coat: number; happy?: boolean; bow?: boolean }) {
  return (
    <>
      <ellipse cx="0" cy="27" rx="19" ry="5" fill="#241a3c" opacity="0.25" />
      <g className="pk-head">
        <image href={pupArt(coat, happy)} x="-27" y="-33" width="54" height="62" preserveAspectRatio="xMidYMax meet" />
      </g>
      {bow && (
        <g transform="translate(0 6)">
          <path d="M0 0 l-9 -5 v10Z M0 0 l9 -5 v10Z" fill="#d9506a" />
          <circle r="2.8" fill="#b63c5c" />
        </g>
      )}
    </>
  )
}

// Patch colours of the rug, a lighter and a deeper shade of each for the chequered weave.
const patches = [
  ['#e2607e', '#c94a6b'],
  ['#f2c14e', '#d9a52e'],
  ['#3fb0a8', '#2c9690'],
  ['#a48cf0', '#8a70dc'],
  ['#7cc552', '#62ab3e'],
  ['#f39a5a', '#dc7f3c'],
  ['#62a6e6', '#4689cc'],
  ['#e39ad8', '#cc7cc0'],
] as const

const U = 100
const key = (r: number, c: number) => `${r},${c}`
const cross = (cx: number, cy: number, s: number) => `M${cx - s} ${cy - s} l${2 * s} ${2 * s} M${cx + s} ${cy - s} l${-2 * s} ${2 * s}`

export interface RugProps {
  regions: Regions
  pups: Cell[]
  /** Pups that were here first: they wear a bow. */
  gifts: Set<string>
  marks: Set<string>
  blocked: Set<string>
  /** Squares that light up to show which rule a pup broke. */
  why?: Set<string>
  /** The pups that shake their heads. */
  bad: Cell[]
  stuck: Set<string>
  /** The square a hint just pointed at. */
  tip: string | null
  happy: boolean
}

/** The board: a patchwork rug. Each colour is one patch, sewn to its neighbours along a stitched seam. */
export function Rug({ regions, pups, gifts, marks, blocked, why, bad, stuck, tip, happy }: RugProps) {
  const n = regions.length
  const w = n * U
  const cells = regions.flatMap((row, r) => row.map((rug, c) => ({ r, c, rug, k: key(r, c) })))
  const seams: string[] = []
  for (const { r, c, rug } of cells) {
    if (c < n - 1 && regions[r][c + 1] !== rug) seams.push(`M${(c + 1) * U} ${r * U} v${U}`)
    if (r < n - 1 && regions[r + 1][c] !== rug) seams.push(`M${c * U} ${(r + 1) * U} h${U}`)
  }
  const seam = seams.join(' ')
  const fringe = Array.from({ length: n * 5 + 1 }, (_, i) => {
    const y = 8 + (i * (w - 16)) / (n * 5)
    return `M-38 ${y + (i % 3) - 1} H-14 M${w + 14} ${y - (i % 2)} H${w + 38}`
  }).join(' ')
  const pupKeys = new Set(pups.map(([r, c]) => key(r, c)))
  const all = [...pups, ...bad.filter(([r, c]) => !pupKeys.has(key(r, c)))]
  return (
    <svg className="pk-rug-art" viewBox={`0 0 ${w} ${w}`} aria-hidden focusable="false">
      <rect x="-22" y="-8" width={w + 44} height={w + 36} rx="22" fill="#241a3c" opacity="0.3" />
      <path d={fringe} fill="none" stroke={CREAM} strokeWidth="5" strokeLinecap="round" />
      <rect x="-16" y="-16" width={w + 32} height={w + 32} rx="20" fill={CREAM} />
      {cells.map(({ r, c, rug, k }) => (
        <g key={k}>
          <rect x={c * U} y={r * U} width={U} height={U} fill={patches[rug % patches.length][(r + c) % 2]} />
          <rect x={c * U + 10} y={r * U + 10} width={U - 20} height={U - 20} rx="13" fill="#fff" opacity="0.1" />
        </g>
      ))}
      <path d={seam} fill="none" stroke={CREAM} strokeWidth="10" strokeLinecap="round" />
      <path d={seam} fill="none" stroke="#b5825a" strokeWidth="2.6" strokeDasharray="8 8" opacity="0.8" />
      {cells.map(({ r, c, k }) => {
        const cx = c * U + U / 2
        const cy = r * U + U / 2
        return (
          <g key={k}>
            {why?.has(k) && <rect className="pk-why" x={c * U} y={r * U} width={U} height={U} fill="#fff6dc" />}
            {!why && stuck.has(k) && <rect className="pk-stuck" x={c * U} y={r * U} width={U} height={U} fill="#241a3c" />}
            {pupKeys.has(k) ? null : marks.has(k) ? (
              <path className="pk-mark" d={cross(cx, cy, 15)} fill="none" stroke={CREAM} strokeWidth="9" strokeLinecap="round" />
            ) : blocked.has(k) ? (
              <path className="pk-blocked" d={cross(cx, cy, 10)} fill="none" stroke={CREAM} strokeWidth="5.5" strokeLinecap="round" />
            ) : null}
            {tip === k && <circle className="pk-tip" cx={cx} cy={cy} r="40" fill="none" stroke="#ffd24a" strokeWidth="8" />}
          </g>
        )
      })}
      {all.map(([r, c]) => {
        const k = key(r, c)
        const shaking = bad.some(([br, bc]) => br === r && bc === c)
        return (
          <g key={k} transform={`translate(${c * U + U / 2} ${r * U + U / 2 - 5}) scale(1.62)`}>
            <g className={`pk-pup${shaking ? ' pk-no' : ''}${happy ? ' pk-hop' : ''}`} style={{ animationDelay: happy ? `${c * 60}ms` : undefined }}>
              <Pup coat={regions[r][c]} bow={gifts.has(k)} happy={happy} />
            </g>
          </g>
        )
      })}
    </svg>
  )
}

/** The basket where the pups wait for their spot: one head peeks out for each (three at most fit). */
export function Basket({ waiting, coats: list }: { waiting: number; coats: number[] }) {
  const seats = [
    [-34, -14],
    [34, -12],
    [0, -24],
  ]
  return (
    <svg className="pk-basket-art" viewBox="-96 -62 192 114" aria-hidden focusable="false">
      {seats.slice(0, Math.min(waiting, seats.length)).map(([x, y], i) => (
        <g key={`${i}-${list[i]}`} className="pk-wait" transform={`translate(${x} ${y}) scale(1.25)`}>
          <Pup coat={list[i] ?? i} />
        </g>
      ))}
      <image href={basketArt} x="-90" y="-8" width="180" height="58" preserveAspectRatio="xMidYMax meet" />
    </svg>
  )
}
