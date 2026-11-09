import { clamp, type Rng } from '../../kit/random'

/**
 * Crown Garden: an n × n garden split into n coloured flower beds.
 * Place one crown in every row, every column and every bed; no two crowns may touch, not even at a corner.
 */

/** regions[r][c] is the bed (0..n-1) that cell belongs to. */
export type Regions = number[][]
/** solution[r] is the column of the crown in row r. */
export type Solution = number[]
export interface Puzzle {
  n: number
  regions: Regions
  solution: Solution
}

/** Bed colours available; the CSS defines .cg-r0 to .cg-r7. */
export const MAX_SIZE = 8

/** Grid size: 4 × 4 for the youngest players, up to 8 × 8 at the top level. */
export function sizeFor(level: number) {
  return clamp(4 + Math.floor((clamp(level, 1, 10) - 1) / 2), 4, MAX_SIZE)
}

/** Small gardens come three to a round, big ones two. */
export const puzzlesFor = (level: number) => (sizeFor(level) <= 5 ? 3 : 2)

/** Low levels shade the cells a crown already blocks, so a young player sees the rules at work. */
export const showsBlocked = (level: number) => level <= 4

export const touches = (r1: number, c1: number, r2: number, c2: number) => Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1

/** A random placement of n crowns that follows the row, column and no-touching rules. */
export function randomPlacement(rng: Rng, n: number): Solution {
  const cols: number[] = []
  const used = new Array<boolean>(n).fill(false)
  const place = (r: number): boolean => {
    if (r === n) return true
    for (const c of rng.shuffle([...Array(n).keys()])) {
      if (used[c] || (r > 0 && Math.abs(cols[r - 1] - c) <= 1)) continue
      used[c] = true
      cols[r] = c
      if (place(r + 1)) return true
      used[c] = false
    }
    return false
  }
  place(0)
  return cols
}

/** Grows one bed around each crown, a random cell at a time, until the whole garden is covered. */
export function growRegions(rng: Rng, n: number, crowns: Solution): Regions {
  const regions = Array.from({ length: n }, () => new Array<number>(n).fill(-1))
  crowns.forEach((c, r) => (regions[r][c] = r))
  let left = n * n - n
  while (left > 0) {
    const frontier: [number, number, number][] = []
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++) {
        if (regions[r][c] !== -1) continue
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const id = regions[r + dr]?.[c + dc]
          if (id !== undefined && id !== -1) frontier.push([r, c, id])
        }
      }
    const [r, c, id] = rng.pick(frontier)
    regions[r][c] = id
    left--
  }
  return regions
}

/** Every solution of a garden, up to `limit` of them. */
export function solve(regions: Regions, limit = 2): Solution[] {
  const n = regions.length
  const found: Solution[] = []
  const cols: number[] = []
  const usedCol = new Array<boolean>(n).fill(false)
  const usedBed = new Array<boolean>(n).fill(false)
  const place = (r: number) => {
    if (found.length >= limit) return
    if (r === n) {
      found.push([...cols])
      return
    }
    for (let c = 0; c < n; c++) {
      const bed = regions[r][c]
      if (usedCol[c] || usedBed[bed] || (r > 0 && Math.abs(cols[r - 1] - c) <= 1)) continue
      usedCol[c] = usedBed[bed] = true
      cols[r] = c
      place(r + 1)
      usedCol[c] = usedBed[bed] = false
    }
  }
  place(0)
  return found
}

const STEPS: Cell[] = [[1, 0], [-1, 0], [0, 1], [0, -1]]

/** Is the bed still in one piece if the cell (r, c) leaves it? */
function staysConnected(regions: Regions, r: number, c: number) {
  const bed = regions[r][c]
  const cells: Cell[] = []
  regions.forEach((row, rr) => row.forEach((b, cc) => b === bed && (rr !== r || cc !== c) && cells.push([rr, cc])))
  if (cells.length === 0) return false
  const seen = new Set([cells[0].join()])
  const stack = [cells[0]]
  while (stack.length) {
    const [cr, cc] = stack.pop()!
    for (const [dr, dc] of STEPS) {
      const nr = cr + dr
      const nc = cc + dc
      if ((nr !== r || nc !== c) && regions[nr]?.[nc] === bed && !seen.has(`${nr},${nc}`)) {
        seen.add(`${nr},${nc}`)
        stack.push([nr, nc])
      }
    }
  }
  return seen.size === cells.length
}

/**
 * Random beds usually allow more than one answer. While another answer exists, hand one of its crown cells
 * to a neighbouring bed: that answer now has two crowns in one bed, and ours is untouched.
 */
function makeUnique(rng: Rng, regions: Regions, solution: Solution) {
  const n = regions.length
  for (let step = 0; step < n * n * 2; step++) {
    const other = solve(regions, 2).find((s) => s.some((c, r) => c !== solution[r]))
    if (!other) return true
    const moves: [number, number, number][] = []
    other.forEach((c, r) => {
      if (c === solution[r] || !staysConnected(regions, r, c)) return
      for (const [dr, dc] of STEPS) {
        const bed = regions[r + dr]?.[c + dc]
        if (bed !== undefined && bed !== regions[r][c]) moves.push([r, c, bed])
      }
    })
    if (moves.length === 0) return false
    const [r, c, bed] = rng.pick(moves)
    regions[r][c] = bed
  }
  return false
}

/** Number the beds in reading order, so the colours do not give away the rows of the answer. */
function renumber(regions: Regions): Regions {
  const order = new Map<number, number>()
  for (const row of regions) for (const id of row) if (!order.has(id)) order.set(id, order.size)
  return regions.map((row) => row.map((id) => order.get(id)!))
}

/** A garden with exactly one answer, so it can always be solved by thinking, never by guessing. */
export function makePuzzle(rng: Rng, n: number): Puzzle {
  for (;;) {
    const solution = randomPlacement(rng, n)
    const regions = growRegions(rng, n, solution)
    if (makeUnique(rng, regions, solution)) return { n, regions: renumber(regions), solution }
  }
}

export type Cell = [number, number]

/** Crowns that break a rule: two in one row, column or bed, or two touching. */
export function conflicts(regions: Regions, crowns: Cell[]): Set<string> {
  const bad = new Set<string>()
  crowns.forEach(([r1, c1], i) =>
    crowns.forEach(([r2, c2], j) => {
      if (i >= j) return
      if (r1 === r2 || c1 === c2 || regions[r1][c1] === regions[r2][c2] || touches(r1, c1, r2, c2)) {
        bad.add(`${r1},${c1}`)
        bad.add(`${r2},${c2}`)
      }
    }),
  )
  return bad
}

export type Rule = 'row' | 'col' | 'bed' | 'touch'

/** The first rule a new crown at (r, c) would break, and the crown it breaks it with. */
export function ruleBroken(regions: Regions, crowns: Cell[], r: number, c: number): { rule: Rule; other: Cell } | null {
  for (const other of crowns) {
    const [cr, cc] = other
    if (cr === r && cc === c) continue
    if (cr === r) return { rule: 'row', other }
    if (cc === c) return { rule: 'col', other }
    if (regions[cr][cc] === regions[r][c]) return { rule: 'bed', other }
    if (touches(r, c, cr, cc)) return { rule: 'touch', other }
  }
  return null
}

/** Would a crown here break a rule with a crown already in the garden? */
export const clashes = (regions: Regions, crowns: Cell[], r: number, c: number) => ruleBroken(regions, crowns, r, c) !== null

/** The squares that show why a rule broke: the whole row, column or bed, or just the two touching squares. */
export function ruleCells(regions: Regions, rule: Rule, [r, c]: Cell, other: Cell): Cell[] {
  if (rule === 'touch') return [[r, c], other]
  const out: Cell[] = []
  regions.forEach((row, rr) =>
    row.forEach((bed, cc) => {
      if (rule === 'row' ? rr === r : rule === 'col' ? cc === c : bed === regions[r][c]) out.push([rr, cc])
    }),
  )
  return out
}

/**
 * A row, column or bed that still needs its crown but has no free square left: a dead end the player can see.
 * Only looks at what the crowns on the board rule out, so it never gives the answer away.
 */
export function starved(regions: Regions, crowns: Cell[]): { kind: Exclude<Rule, 'touch'>; cells: Cell[] } | null {
  const n = regions.length
  const units: { kind: Exclude<Rule, 'touch'>; cells: Cell[] }[] = []
  for (let i = 0; i < n; i++) {
    units.push({ kind: 'row', cells: regions[i].map((_, c) => [i, c]) })
    units.push({ kind: 'col', cells: regions.map((_, r) => [r, i]) })
    units.push({ kind: 'bed', cells: regions.flatMap((row, r) => row.flatMap((bed, c) => (bed === i ? [[r, c] as Cell] : []))) })
  }
  const has = (r: number, c: number) => crowns.some(([cr, cc]) => cr === r && cc === c)
  return units.find((u) => !u.cells.some(([r, c]) => has(r, c)) && u.cells.every(([r, c]) => clashes(regions, crowns, r, c))) ?? null
}

/** Beginners get one crown planted for them, so the first move shows how the rules work. */
export const giftsFor = (level: number) => (level <= 2 ? 1 : 0)

export const isSolved = (regions: Regions, crowns: Cell[]) => crowns.length === regions.length && conflicts(regions, crowns).size === 0

/**
 * What a hint does: take away a crown that is in the wrong place, or else show where one more crown goes.
 * Returns null when the garden is already solved.
 */
export function hintFor(puzzle: Puzzle, crowns: Cell[]): { remove: Cell } | { add: Cell } | null {
  const wrong = crowns.find(([r, c]) => puzzle.solution[r] !== c)
  if (wrong) return { remove: wrong }
  const row = puzzle.solution.findIndex((c, r) => !crowns.some(([cr, cc]) => cr === r && cc === c))
  return row === -1 ? null : { add: [row, puzzle.solution[row]] }
}

export interface Solved {
  n: number
  mistakes: number
  hints: number
}

/** What each crown is worth when the garden is done: rule breaks and hints shave it down, never below 5. */
export const crownPoints = ({ n, mistakes, hints }: Solved) => Math.max(5, 25 - Math.ceil((mistakes * 10 + hints * 20) / n))

/** A clean garden earns a bonus that grows with every clean garden in a row. */
export const cleanBonus = ({ n, mistakes, hints }: Solved, streak: number) => (mistakes === 0 && hints === 0 ? 20 * n * Math.min(streak, 4) : 0)

export const pointsFor = (solved: Solved, streak: number) => solved.n * crownPoints(solved) + cleanBonus(solved, streak)

/** A clean garden counts fully; each rule broken or hint used takes a slice off. */
export function accuracyFor(done: Solved[]) {
  if (done.length === 0) return 0
  const each = done.map(({ mistakes, hints }) => clamp(1 - mistakes * 0.12 - hints * 0.25, 0, 1))
  return each.reduce((a, b) => a + b, 0) / each.length
}
