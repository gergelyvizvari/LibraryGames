import { useMemo, useRef, useState } from 'react'
import { usePops, useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hud, Pops } from '../../kit/ui'
import {
  accuracyFor,
  clashes,
  cleanBonus,
  crownPoints,
  giftsFor,
  hintFor,
  isSolved,
  makePuzzle,
  puzzlesFor,
  ruleBroken,
  ruleCells,
  showsBlocked,
  sizeFor,
  starved,
  type Cell,
  type Puzzle,
  type Rule,
  type Solved,
} from './logic'

type Tool = 'crown' | 'mark'
const key = (r: number, c: number) => `${r},${c}`
const keys = (cells: Cell[]) => new Set(cells.map(([r, c]) => key(r, c)))
const without = (cells: Cell[], r: number, c: number) => cells.filter(([cr, cc]) => cr !== r || cc !== c)
const CLASH_KEY: Record<Rule, string> = { row: 'clashRow', col: 'clashCol', bed: 'clashBed', touch: 'clashTouch' }
const STUCK_KEY = { row: 'stuckRow', col: 'stuckCol', bed: 'stuckBed' } as const
const FLOWERS = ['🌷', '🌼', '🌸']

/** A crown that broke a rule: it wobbles for a moment, shows why, then hops back off the board. */
interface Clash {
  cell: Cell
  other: Cell
  why: Set<string>
}

export default function CrownGarden({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const n = sizeFor(level)
  const total = puzzlesFor(level)
  // A garden, with the crowns planted for the player (beginners only) taken from its answer.
  const newGarden = () => {
    const puzzle = makePuzzle(rng, n)
    const rows = rng.shuffle([...Array(n).keys()]).slice(0, giftsFor(level))
    return { puzzle, gifts: rows.map((r): Cell => [r, puzzle.solution[r]]) }
  }
  const [garden, setGarden] = useState<{ puzzle: Puzzle; gifts: Cell[] }>(newGarden)
  const [crowns, setCrowns] = useState<Cell[]>(garden.gifts)
  const [marks, setMarks] = useState<Set<string>>(() => new Set())
  const [tool, setTool] = useState<Tool>('crown')
  const [clash, setClash] = useState<Clash | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [hints, setHints] = useState(0)
  const [done, setDone] = useState<Solved[]>([])
  const [streak, setStreak] = useState(0)
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState(t('place'))
  const [busy, setBusy] = useState(false)
  const [over, setOver] = useState(false)
  const [pops, addPop] = usePops()
  const [boardRef, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()
  const clashRun = useRef(0)
  const { puzzle, gifts } = garden
  const { regions } = puzzle

  const crownAt = useMemo(() => keys(crowns), [crowns])
  const giftAt = useMemo(() => keys(gifts), [gifts])
  const beds = useMemo(() => new Set(crowns.map(([r, c]) => regions[r][c])), [regions, crowns])
  const blocked = useMemo(() => {
    const out = new Set<string>()
    if (busy || !showsBlocked(level)) return out
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (!crownAt.has(key(r, c)) && clashes(regions, crowns, r, c)) out.add(key(r, c))
    return out
  }, [busy, level, n, regions, crowns, crownAt])
  // A row, column or bed with no room left for its crown blinks, so a dead end is never a mystery.
  const stuck = useMemo(() => (busy ? null : starved(regions, crowns)), [busy, regions, crowns])
  const stuckAt = useMemo(() => keys(stuck?.cells ?? []), [stuck])

  const popAt = (r: number, c: number, text: string, kind: 'good' | 'bad' | 'info' = 'good') =>
    addPop(text, ((c + 0.5) / n) * 100, ((r + 0.5) / n) * 100, kind)

  /** After a change that broke no rule: warn about a dead end, or go back to the plain prompt. */
  const settle = (next: Cell[], fallback: string) => {
    const dead = starved(regions, next)
    if (dead) sound.tone(220, 0.18, 'triangle', 0.1)
    setMessage(dead ? t(STUCK_KEY[dead.kind]) : fallback)
  }

  const finishGarden = (next: Cell[], m: number, h: number) => {
    const solved = { n, mistakes: m, hints: h }
    const clean = m === 0 && h === 0
    const run = clean ? streak + 1 : 0
    const each = crownPoints(solved)
    const bonus = cleanBonus(solved, run)
    const all = [...done, solved]
    const before = score
    const sum = before + n * each + bonus
    setCrowns(next)
    setClash(null)
    setStreak(run)
    setDone(all)
    setBusy(true)
    setMessage(t(clean ? 'perfect' : 'solved'))
    // The payoff: every crown is counted in turn, each one a note higher.
    const order = [...next].sort((a, b) => a[0] - b[0])
    order.forEach(([r, c], i) =>
      later(() => {
        sound.good(i + 1)
        popAt(r, c, `+${each}`)
        setScore(before + (i + 1) * each)
      }, 150 + i * 150),
    )
    const counted = 150 + n * 150
    later(() => {
      sound.win()
      setScore(sum)
      if (bonus > 0) addPop(`🌟 +${bonus}`, 50, 45)
    }, counted)
    if (all.length >= total) {
      setOver(true)
      later(() => onFinish({ score: sum, accuracy: accuracyFor(all) }), counted + 1100)
      return
    }
    later(() => {
      const g = newGarden()
      setGarden(g)
      setCrowns(g.gifts)
      setMarks(new Set())
      setMistakes(0)
      setHints(0)
      setTool('crown')
      setMessage(t('place'))
      setBusy(false)
    }, counted + 1300)
  }

  const tap = (r: number, c: number) => {
    if (over || busy) return
    const k = key(r, c)
    if (giftAt.has(k)) {
      sound.tap()
      setMessage(t('gift'))
      return
    }
    if (crownAt.has(k)) {
      // Tapping a crown always takes it away, whichever tool is picked.
      const next = without(crowns, r, c)
      sound.tap()
      setCrowns(next)
      settle(next, t('place'))
      return
    }
    if (tool === 'mark') {
      sound.tap()
      const next = new Set(marks)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      setMarks(next)
      return
    }
    const broken = ruleBroken(regions, crowns, r, c)
    if (broken) {
      // The crown wobbles, the broken row, column, bed or pair lights up, then the crown hops back.
      const run = ++clashRun.current
      sound.bad()
      vibrate(60)
      shake()
      setMistakes((x) => x + 1)
      setStreak(0)
      setMessage(t(CLASH_KEY[broken.rule]))
      setClash({ cell: [r, c], other: broken.other, why: keys(ruleCells(regions, broken.rule, [r, c], broken.other)) })
      later(() => {
        if (clashRun.current === run) setClash(null)
      }, 1100)
      return
    }
    const next: Cell[] = [...crowns, [r, c]]
    setClash(null)
    if (marks.has(k)) {
      const m = new Set(marks)
      m.delete(k)
      setMarks(m)
    }
    if (isSolved(regions, next)) {
      finishGarden(next, mistakes, hints)
      return
    }
    sound.tone(440 + next.length * 70, 0.1, 'triangle', 0.12)
    popAt(r, c, '🌸', 'info')
    setCrowns(next)
    settle(next, t('place'))
  }

  const hint = () => {
    if (over || busy) return
    const h = hintFor(puzzle, crowns)
    if (!h) return
    setHints(hints + 1)
    setStreak(0)
    setClash(null)
    if ('remove' in h) {
      const [r, c] = h.remove
      sound.pop()
      popAt(r, c, '💡', 'info')
      setCrowns(without(crowns, r, c))
      setMessage(t('hintTook'))
      return
    }
    const [r, c] = h.add
    const next: Cell[] = [...crowns, [r, c]]
    const m = new Set(marks)
    m.delete(key(r, c))
    setMarks(m)
    popAt(r, c, '💡', 'info')
    if (isSolved(regions, next)) {
      finishGarden(next, mistakes, hints + 1)
      return
    }
    sound.pop()
    setCrowns(next)
    setMessage(t('hintPut'))
  }

  const canClear = crowns.length > gifts.length || marks.size > 0
  const clear = () => {
    if (over || busy || !canClear) return
    sound.tap()
    setCrowns(gifts)
    setMarks(new Set())
    setClash(null)
    setMessage(t('place'))
  }

  const pickTool = (next: Tool) => {
    if (over || busy) return
    sound.tap()
    setTool(next)
    setMessage(t(next === 'crown' ? 'place' : 'mark'))
  }

  // Thick lines where two beds meet, so the garden reads without telling colours apart.
  const edges = (r: number, c: number) => {
    const bed = regions[r][c]
    const cls = []
    if (r > 0 && regions[r - 1][c] !== bed) cls.push('cg-et')
    if (c > 0 && regions[r][c - 1] !== bed) cls.push('cg-el')
    if (r < n - 1 && regions[r + 1][c] !== bed) cls.push('cg-eb')
    if (c < n - 1 && regions[r][c + 1] !== bed) cls.push('cg-er')
    return cls.join(' ')
  }

  const grid = `repeat(${n}, minmax(0, 1fr))`
  return (
    <div className="game crown-garden">
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('garden'), value: `${Math.min(done.length + (over ? 0 : 1), total)} / ${total}` },
          { label: t('crowns'), value: `${crowns.length} / ${n}`, highlight: streak > 0 },
        ]}
      />
      {/* One pot per bed: it blooms when its bed has a crown. */}
      <div className="cg-pots" aria-hidden>
        {regions.map((_, bed) => (
          <span key={`${done.length}-${bed}-${beds.has(bed)}`} className={`cg-pot cg-r${bed}${beds.has(bed) ? ' cg-bloom' : ''}`}>
            {beds.has(bed) ? '🌸' : '🌱'}
          </span>
        ))}
      </div>
      <p className={`cg-message${clash || stuck ? ' cg-warn' : ''}`}>{message}</p>
      <div className="cg-wrap">
        <div
          ref={boardRef}
          key={done.length}
          className={`cg-board${busy ? ' cg-solved' : ''}`}
          style={{ gridTemplateColumns: grid, gridTemplateRows: grid, ['--cg-n' as string]: n }}
        >
          {regions.map((row, r) =>
            row.map((bed, c) => {
              const k = key(r, c)
              const hopping = clash !== null && clash.cell[0] === r && clash.cell[1] === c
              const cls = [
                `cg-cell cg-r${bed}`,
                edges(r, c),
                clash?.why.has(k) ? 'cg-why' : '',
                hopping || (clash !== null && clash.other[0] === r && clash.other[1] === c) ? 'cg-bad' : '',
                !clash && stuckAt.has(k) ? 'cg-stuck' : '',
                blocked.has(k) ? 'cg-blocked' : '',
                giftAt.has(k) ? 'cg-gift' : '',
              ]
              return (
                <button key={k} className={cls.filter(Boolean).join(' ')} onPointerDown={() => tap(r, c)} aria-label={t('cell', { row: r + 1, col: c + 1 })}>
                  {crownAt.has(k) || hopping ? (
                    <span className="cg-crown">👑</span>
                  ) : busy ? (
                    <span className="cg-flower" style={{ animationDelay: `${(r + c) * 60}ms` }}>
                      {FLOWERS[(r * 2 + c) % 3]}
                    </span>
                  ) : marks.has(k) ? (
                    <span className="cg-mark">✖</span>
                  ) : null}
                </button>
              )
            }),
          )}
        </div>
        <Pops pops={pops} />
      </div>
      <div className="cg-tools">
        <button className={`cg-tool${tool === 'crown' ? ' cg-on' : ''}`} onPointerDown={() => pickTool('crown')} aria-pressed={tool === 'crown'}>
          <span>👑</span>
          {t('toolCrown')}
        </button>
        <button className={`cg-tool${tool === 'mark' ? ' cg-on' : ''}`} onPointerDown={() => pickTool('mark')} aria-pressed={tool === 'mark'}>
          <span>✖</span>
          {t('toolMark')}
        </button>
        <button className="cg-tool" onPointerDown={hint}>
          <span>💡</span>
          {t('hint')}
        </button>
        <button className="cg-tool" onPointerDown={clear} disabled={!canClear}>
          <span>🔄</span>
          {t('clear')}
        </button>
      </div>
    </div>
  )
}
