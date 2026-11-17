import { useRef, useState } from 'react'
import { CritterGuide } from '../../kit/critters'
import { useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import { Thing } from '../../kit/things'
import type { GameProps } from '../../kit/types'
import { AcornCoin, Awning, PriceTag } from './Art'
import { makeTask, pay, specFor, STAGE, type Coin, type Task } from './logic'

/** A coin on the counter, and where in the purse it came from (when the purse can run out). */
interface Paid {
  coin: Coin
  from: number | null
  key: number
}

export default function AcornShop({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const spec = specFor(level)
  const nextId = useRef(0)
  const lastTask = useRef<Task | undefined>(undefined)
  const newRound = () => {
    const task = makeTask(rng, level, lastTask.current)
    lastTask.current = task
    return { id: nextId.current++, task }
  }
  const [round, setRound] = useState(newRound)
  const [paid, setPaid] = useState<Paid[]>([])
  const [over, setOver] = useState(false)
  const [solved, setSolved] = useState(false)
  const stage = useStage(STAGE, onFinish)
  const later = useTimeouts()
  const coinKey = useRef(0)
  const { task } = round

  const add = (coin: Coin, from: number | null) => {
    if (solved || stage.over) return
    const result = pay(
      paid.map((p) => p.coin),
      coin,
      task.price,
    )
    if (result === 'over') {
      stage.slip()
      setOver(true)
      return
    }
    setOver(false)
    setPaid([...paid, { coin, from, key: coinKey.current++ }])
    if (result === 'short') {
      sound.tone(520 + paid.length * 60, 0.08, 'triangle', 0.15)
      return
    }
    setSolved(true)
    if (stage.good()) return
    later(() => {
      setSolved(false)
      setPaid([])
      setRound(newRound())
    }, 1600)
  }

  const takeBack = (key: number) => {
    if (solved || stage.over) return
    sound.tap()
    setOver(false)
    setPaid(paid.filter((p) => p.key !== key))
  }

  const used = new Set(paid.map((p) => p.from))
  const purse = task.purse
    ? task.purse.map((coin, i) => ({ coin, i, gone: used.has(i) }))
    : spec.coins.map((coin) => ({ coin, i: null as number | null, gone: false }))

  const say = solved ? t('yes') : over ? t('over', { n: task.price }) : t('say', { n: task.price })

  return (
    <SceneShell
      place="peaks"
      say={say}
      stage={stage}
      bare
      fill
      className="acorn-shop"
      guide={<CritterGuide kind="squirrel" mood={stage.mood === 'happy' ? 'happy' : stage.mood === 'oops' ? 'sad' : 'idle'} />}
      tray={
        <div className="as-purse">
          {purse.map(({ coin, i, gone }, n) => (
            <button
              key={`${round.id}-${n}`}
              className={`as-coin as-c${coin}${gone ? ' as-gone' : ''}`}
              onPointerDown={() => add(coin, i)}
              disabled={gone || solved || stage.over}
              aria-label={t('coin', { n: coin })}
            >
              <AcornCoin value={coin} />
            </button>
          ))}
        </div>
      }
    >
      <div className="as-shop">
        <Awning />
        <div className="as-counter">
          <div className="as-goods" key={round.id}>
            <span className={`as-snack${solved ? ' as-bought' : ''}`}>
              <Thing id={task.snack} />
            </span>
            <span className="as-tag">
              <PriceTag price={task.price} />
            </span>
          </div>
          <div className={`as-paid${over ? ' as-no' : ''}`} onAnimationEnd={() => setOver(false)}>
            {paid.map((p) => (
              <button key={p.key} className={`as-coin as-c${p.coin} as-on`} onPointerDown={() => takeBack(p.key)} disabled={solved} aria-label={t('back', { n: p.coin })}>
                <AcornCoin value={p.coin} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </SceneShell>
  )
}
