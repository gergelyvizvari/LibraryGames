import { useMemo, useRef, useState } from 'react'
import { usePops, useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hud, Pops } from '../../kit/ui'
import {
  accuracyFor,
  clashes,
  conflicts,
  hintFor,
  isSolved,
  makePuzzle,
  pointsFor,
  puzzlesFor,
  showsBlocked,
  sizeFor,
  type Cell,
  type Solved,
} from './logic'

type Tool = 'crown' | 'mark'
const key = (r: number, c: number) => `${r},${c}`

export default function CrownGarden({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const n = sizeFor(level)
  const total = puzzlesFor(level)
  const [puzzle, setPuzzle] = useState(() => makePuzzle(rng, n))
  const [crowns, setCrowns] = useState<Cell[]>([])
  const [marks, setMarks] = useState<Set<string>>(() => new Set())
  const [tool, setTool] = useState<Tool>('crown')
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
  const { regions } = puzzle

  const bad = useMemo(() => conflicts(regions, crowns), [regions, crowns])
  const crownAt = useMemo(() => new Set(crowns.map(([r, c]) => key(r, c))), [crowns])
  const blocked = useMemo(() => {
    const out = new Set<string>()
    if (!showsBlocked(level)) return out
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (!crownAt.has(key(r, c)) && clashes(regions, crowns, r, c)) out.add(key(r, c))
    return out
  }, [level, n, regions, crowns, crownAt])

  const popAt = (r: number, c: number, text: string, kind: 'good' | 'bad' | 'info' = 'good') =>
    addPop(text, ((c + 0.5) / n) * 100, ((r + 0.5) / n) * 100, kind)

  const finishGarden = (next: Cell[], m: number, h: number) => {
    const solved = { n, mistakes: m, hints: h }
    const clean = m === 0 && h === 0
    const run = clean ? streak + 1 : 0
    const gained = pointsFor(solved, run)
    const all = [...done, solved]
    const sum = score + gained
    setCrowns(next)
    setStreak(run)
    setScore(sum)
    setDone(all)
    setMessage(t(clean ? 'perfect' : 'solved'))
    sound.win()
    addPop(`+${gained}`, 50, 45)
    setBusy(true)
    if (all.length >= total) {
      setOver(true)
      onFinish({ score: sum, accuracy: accuracyFor(all) })
      return
    }
    later(() => {
      setPuzzle(makePuzzle(rng, n))
      setCrowns([])
      setMarks(new Set())
      setMistakes(0)
      setHints(0)
      setTool('crown')
      setMessage(t('place'))
      setBusy(false)
    }, 1400)
  }

  const tap = (r: number, c: number) => {
    if (over || busy) return
    const k = key(r, c)
    if (crownAt.has(k)) {
      // Tapping a crown always takes it away, whichever tool is picked.
      sound.tap()
      setCrowns(crowns.filter(([cr, cc]) => cr !== r || cc !== c))
      setMessage(t('place'))
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
    const next: Cell[] = [...crowns, [r, c]]
    if (marks.has(k)) {
      const m = new Set(marks)
      m.delete(k)
      setMarks(m)
    }
    if (clashes(regions, crowns, r, c)) {
      sound.bad()
      vibrate(60)
      shake()
      setMistakes((m) => m + 1)
      setStreak(0)
      setMessage(t('clash'))
      setCrowns(next)
      return
    }
    if (isSolved(regions, next)) {
      finishGarden(next, mistakes, hints)
      return
    }
    sound.tone(440 + next.length * 70, 0.1, 'triangle', 0.12)
    setMessage(t('place'))
    setCrowns(next)
  }

  const hint = () => {
    if (over || busy) return
    const h = hintFor(puzzle, crowns)
    if (!h) return
    setHints(hints + 1)
    setStreak(0)
    if ('remove' in h) {
      const [r, c] = h.remove
      sound.pop()
      popAt(r, c, '💡', 'info')
      setCrowns(crowns.filter(([cr, cc]) => cr !== r || cc !== c))
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

  const clear = () => {
    if (over || busy || (crowns.length === 0 && marks.size === 0)) return
    sound.tap()
    setCrowns([])
    setMarks(new Set())
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

  return (
    <div className="game crown-garden">
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('garden'), value: `${Math.min(done.length + (over ? 0 : 1), total)} / ${total}` },
          { label: t('crowns'), value: `${busy ? n : crowns.length} / ${n}`, highlight: streak > 1 },
        ]}
      />
      <p className="cg-message">{message}</p>
      <div className="cg-wrap">
        <div
          ref={boardRef}
          key={done.length}
          className={`cg-board${busy ? ' cg-solved' : ''}`}
          style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${n}, minmax(0, 1fr))`, ['--cg-n' as string]: n }}
        >
          {regions.map((row, r) =>
            row.map((bed, c) => {
              const k = key(r, c)
              const crown = crownAt.has(k)
              return (
                <button
                  key={k}
                  className={`cg-cell cg-r${bed} ${edges(r, c)}${crown && bad.has(k) ? ' cg-bad' : ''}${blocked.has(k) ? ' cg-blocked' : ''}`}
                  onPointerDown={() => tap(r, c)}
                  aria-label={t('cell', { row: r + 1, col: c + 1 })}
                >
                  {crown ? <span className="cg-crown">👑</span> : marks.has(k) ? <span className="cg-mark">✖</span> : null}
                </button>
              )
            }),
          )}
        </div>
        <Pops pops={pops} />
      </div>
      <div className="cg-tools">
        <button className={`cg-tool${tool === 'crown' ? ' cg-on' : ''}`} onPointerDown={() => pickTool('crown')} aria-pressed={tool === 'crown'}>
          <span>👑</span>{t('toolCrown')}
        </button>
        <button className={`cg-tool${tool === 'mark' ? ' cg-on' : ''}`} onPointerDown={() => pickTool('mark')} aria-pressed={tool === 'mark'}>
          <span>✖</span>{t('toolMark')}
        </button>
        <button className="cg-tool" onPointerDown={hint}>
          <span>💡</span>{t('hint')}
        </button>
        <button className="cg-tool" onPointerDown={clear} disabled={crowns.length === 0 && marks.size === 0}>
          <span>🔄</span>{t('clear')}
        </button>
      </div>
    </div>
  )
}
