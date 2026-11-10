import { useRef, useState } from 'react'
import { useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneTool } from '../../kit/scene'
import { SceneShell, useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { PUZZLES, canPour, isDone, isSolved, makePuzzle, pointsFor, pour, sizeFor, type Tube } from './logic'

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
  const [solved, setSolved] = useState(0)
  const stage = useStage(PUZZLES, onFinish)
  const over = stage.over
  const [message, setMessage] = useState(t('pickTube'))
  const [wobble, setWobble] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const later = useTimeouts()
  const { cap } = puzzle

  const miss = (i: number, key: string) => {
    stage.slip()
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
    sound.tone(520 + next[i].length * 80, 0.08, 'triangle', 0.12)

    if (isSolved(next, cap)) {
      setMessage(t('solved'))
      setBusy(true)
      setSolved(solved + 1)
      if (stage.good(pointsFor(puzzle.colors, pours, puzzle.par))) return
      later(() => {
        const p = newPuzzle(solved + 1)
        setPuzzle(p)
        setTubes(p.tubes)
        setHistory([])
        setMoves(0)
        setBusy(false)
        setMessage(t('pickTube'))
      }, 1200)
      return
    }
    const anyPour = next.some((_, a) => next.some((_, b) => canPour(next, a, b, cap) && !isDone(next[a], cap)))
    setMessage(anyPour ? t('pickTube') : t('stuck'))
  }

  const undo = () => {
    if (over || busy || history.length === 0) return
    sound.tap()
    setTubes(history[history.length - 1])
    setHistory((h) => h.slice(0, -1))
    setPicked(null)
    setMessage(t('pickTube'))
  }

  const restart = () => {
    if (over || busy || history.length === 0) return
    sound.tap()
    setTubes(puzzle.tubes)
    setHistory([])
    setPicked(null)
    setMessage(t('pickTube'))
  }

  const columns = perRow(tubes.length)
  return (
    <SceneShell
      place="woods"
      say={message}
      stage={stage}
      bare
      className="color-sort"
      tray={
        <div className="cs-tools">
          <SceneTool kind="undo" label={t('undo')} onPress={undo} disabled={history.length === 0} />
          <SceneTool kind="restart" label={t('restart')} onPress={restart} disabled={history.length === 0} />
        </div>
      }
    >
      <div className="cs-rack" key={solved} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 70px))` }}>
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
      </div>
    </SceneShell>
  )
}

/** Up to five tubes fit side by side on a phone; more go on two rows. */
function perRow(n: number) {
  return n <= 5 ? n : Math.ceil(n / 2)
}
