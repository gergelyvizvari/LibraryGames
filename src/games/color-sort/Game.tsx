import { useRef, useState } from 'react'
import { usePops, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hud, Pops } from '../../kit/ui'
import { PUZZLES, accuracyFor, canPour, isDone, isSolved, makePuzzle, pointsFor, pour, sizeFor, type Tube } from './logic'

/** Shapes shown on the liquid in the high contrast theme, so colours never have to be told apart by hue alone. */
const SYMBOLS = ['●', '▲', '■', '★', '♥', '◆', '✚']

export default function ColorSort({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const newPuzzle = (n: number) => {
    const { colors, cap, empty } = sizeFor(level, n)
    return { ...makePuzzle(rng, colors, cap, empty), colors }
  }
  const [puzzle, setPuzzle] = useState(() => newPuzzle(0))
  const [tubes, setTubes] = useState<Tube[]>(puzzle.tubes)
  const [history, setHistory] = useState<Tube[][]>([])
  const [picked, setPicked] = useState<number | null>(null)
  const [moves, setMoves] = useState(0)
  const [solved, setSolved] = useState<{ moves: number; par: number }[]>([])
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [message, setMessage] = useState(t('pickTube'))
  const [wobble, setWobble] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [over, setOver] = useState(false)
  const [pops, addPop] = usePops()
  const later = useTimeouts()
  const { cap } = puzzle

  const popAt = (i: number) => ((i % perRow(tubes.length)) + 0.5) * (100 / perRow(tubes.length))

  const miss = (i: number, key: string) => {
    sound.bad()
    vibrate(40)
    setCombo(0)
    setWobble(i)
    later(() => setWobble(null), 400)
    setMessage(t(key))
  }

  const tap = (i: number) => {
    if (over || busy) return
    if (picked === null) {
      if (tubes[i].length === 0 || isDone(tubes[i], cap)) {
        sound.tap()
        return
      }
      sound.pop()
      setPicked(i)
      setMessage(t('pourIt'))
      return
    }
    if (picked === i) {
      sound.tap()
      setPicked(null)
      setMessage(t('pickTube'))
      return
    }
    if (!canPour(tubes, picked, i, cap)) {
      setPicked(null)
      miss(i, tubes[i].length >= cap ? 'full' : 'noFit')
      return
    }
    const next = pour(tubes, picked, i, cap).tubes
    const pours = moves + 1
    setHistory((h) => [...h, tubes])
    setTubes(next)
    setMoves(pours)
    setPicked(null)
    let gained = 0
    let streak = combo
    if (isDone(next[i], cap)) {
      streak = combo + 1
      gained = 10 * Math.min(streak, 5)
      sound.good(streak)
      addPop(`${t('tubeDone')} +${gained}`, popAt(i), 30)
    } else {
      sound.tone(520 + next[i].length * 80, 0.08, 'triangle', 0.12)
    }
    setCombo(streak)

    if (isSolved(next, cap)) {
      const done = [...solved, { moves: pours, par: puzzle.par }]
      gained += pointsFor(puzzle.colors, pours, puzzle.par)
      const total = score + gained
      setScore(total)
      setSolved(done)
      setMessage(t('solved'))
      sound.win()
      addPop(`+${gained}`, 50, 50)
      setBusy(true)
      if (done.length >= PUZZLES) {
        setOver(true)
        onFinish({ score: total, accuracy: accuracyFor(done) })
        return
      }
      later(() => {
        const p = newPuzzle(done.length)
        setPuzzle(p)
        setTubes(p.tubes)
        setHistory([])
        setMoves(0)
        setBusy(false)
        setMessage(t('pickTube'))
      }, 1200)
      return
    }
    setScore((s) => s + gained)
    const anyPour = next.some((_, a) => next.some((_, b) => canPour(next, a, b, cap) && !isDone(next[a], cap)))
    setMessage(anyPour ? t('pickTube') : t('stuck'))
  }

  const undo = () => {
    if (over || busy || history.length === 0) return
    sound.tap()
    setTubes(history[history.length - 1])
    setHistory((h) => h.slice(0, -1))
    setPicked(null)
    setCombo(0)
    setMessage(t('pickTube'))
  }

  const restart = () => {
    if (over || busy || history.length === 0) return
    sound.tap()
    setTubes(puzzle.tubes)
    setHistory([])
    setPicked(null)
    setCombo(0)
    setMessage(t('pickTube'))
  }

  const columns = perRow(tubes.length)
  return (
    <div className="game color-sort">
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('puzzle'), value: `${Math.min(solved.length + (over ? 0 : 1), PUZZLES)} / ${PUZZLES}` },
          { label: t('moves'), value: moves },
        ]}
      />
      <p className="cs-message">{message}</p>
      <div className="cs-rack" key={solved.length} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 70px))` }}>
        {tubes.map((tube, i) => (
          <button
            key={i}
            className={`cs-tube${picked === i ? ' cs-picked' : ''}${wobble === i ? ' cs-wobble' : ''}${isDone(tube, cap) ? ' cs-done' : ''}`}
            style={{ height: `${cap * 46 + 18}px` }}
            onPointerDown={() => tap(i)}
            aria-label={t('tube', { n: i + 1 })}
          >
            {tube.map((c, k) => (
              <span key={k} className={`cs-layer cs-c${c}`} data-sym={SYMBOLS[c]} />
            ))}
          </button>
        ))}
        <Pops pops={pops} />
      </div>
      <div className="cs-tools">
        <button className="cs-tool" onPointerDown={undo} disabled={history.length === 0}>
          ↩️ {t('undo')}
        </button>
        <button className="cs-tool" onPointerDown={restart} disabled={history.length === 0}>
          🔄 {t('restart')}
        </button>
      </div>
    </div>
  )
}

/** Up to five tubes fit side by side on a phone; more go on two rows. */
function perRow(n: number) {
  return n <= 5 ? n : Math.ceil(n / 2)
}
