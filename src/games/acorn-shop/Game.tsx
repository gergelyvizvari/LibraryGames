import { useEffect, useRef, useState } from 'react'
import { useTimeouts } from '../../kit/hooks'
import { PaintedScene, worldStyle } from '../../kit/painted'
import { makeRng } from '../../kit/random'
import { useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import acorn from './art/acorn.webp'
import apple from './art/apple.webp'
import berries from './art/berries.webp'
import hedgehog from './art/hedgehog.webp'
import honey from './art/honey.webp'
import jam from './art/jam.webp'
import mushroom from './art/mushroom.webp'
import shop from './art/shop.webp'
import squirrelBlink from './art/squirrel-blink.webp'
import squirrelHappy from './art/squirrel-happy.webp'
import squirrel from './art/squirrel.webp'
import { makeTask, pay, specFor, STAGE, type Coin, type Snack, type Task } from './logic'

const snacks: Record<Snack, string> = { apple, berries, mushroom, honey, jam }

/** Where the play happens in the painting (1280 × 800): the stall from its awning to the grass in front. */
const FOCUS = { x: 330, y: 180, w: 620, h: 540 }
/** The counter's top edge: the squirrel stands behind it, the awning hangs above it. */
const COUNTER = 452
const AWNING = 298

/** A coin on the counter, and where in the purse it came from (when the purse can run out). */
interface Paid {
  coin: Coin
  from: number | null
  key: number
}

function CoinArt({ value }: { value: number }) {
  return (
    <span className="as-coin-art" aria-hidden>
      <img src={acorn} alt="" draggable={false} />
      <b>{value}</b>
    </span>
  )
}

/** The squirrel blinks now and then while it waits. */
function useBlink() {
  const [shut, setShut] = useState(false)
  useEffect(() => {
    let timer = 0
    const next = (open: boolean) => {
      timer = window.setTimeout(
        () => {
          setShut(open)
          next(!open)
        },
        open ? 2600 + Math.random() * 2600 : 150,
      )
    }
    next(true)
    return () => clearTimeout(timer)
  }, [])
  return shut
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
  // The "too much" note stays until the next coin; the shake of the counter only lasts its animation.
  const [over, setOver] = useState(false)
  const [shake, setShake] = useState(false)
  const [solved, setSolved] = useState(false)
  const stage = useStage(STAGE, onFinish)
  const later = useTimeouts()
  const coinKey = useRef(0)
  const blink = useBlink()
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
      setShake(true)
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
  const happy = solved || stage.mood === 'happy'
  const face = happy ? 'happy' : blink ? 'blink' : 'idle'

  return (
    <PaintedScene
      painting={shop}
      focus={FOCUS}
      ground="#b9af2e"
      say={say}
      sayAt={{ x: 760, y: 250 }}
      stage={stage}
      className="acorn-shop"
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
              <CoinArt value={coin} />
            </button>
          ))}
        </div>
      }
    >
      {/* Jars and fruit on the shelves, either side of the shopkeeper. */}
      <img className="as-prop" src={jam} alt="" style={worldStyle(440, 346, 44)} />
      <img className="as-prop" src={honey} alt="" style={worldStyle(486, 346, 42)} />
      <img className="as-prop" src={apple} alt="" style={worldStyle(836, 346, 38)} />
      <img className="as-prop" src={mushroom} alt="" style={worldStyle(870, 346, 34)} />
      <img className="as-prop" src={berries} alt="" style={worldStyle(448, 406, 40)} />
      <img className="as-prop" src={mushroom} alt="" style={worldStyle(822, 406, 32)} />
      <img className="as-prop" src={apple} alt="" style={worldStyle(858, 406, 34)} />

      {/* The squirrel stands behind the counter, under the awning. */}
      <div className="as-behind" style={{ top: AWNING, height: COUNTER - AWNING }}>
        <div className={`as-keeper as-${stage.mood}`} style={worldStyle(648, 700 - AWNING, 410)}>
          {[squirrel, squirrelBlink, squirrelHappy].map((src, i) => (
            <img key={src} src={src} alt="" draggable={false} className={['idle', 'blink', 'happy'][i] === face ? '' : 'as-off'} />
          ))}
        </div>
      </div>

      {/* What is for sale, and its price on a tag hanging from the awning. */}
      <img key={round.id} className={`as-prop as-snack${solved ? ' as-bought' : ''}`} src={snacks[task.snack]} alt="" style={worldStyle(500, 474, 84)} />
      <div className="as-string" />
      <div className="as-tag" key={`tag-${round.id}`}>
        <b>{task.price}</b>
        <img src={acorn} alt="" />
      </div>

      {/* The coins paid so far, on the counter in front of the squirrel. */}
      <div className={`as-paid${shake ? ' as-no' : ''}`} onAnimationEnd={(e) => e.target === e.currentTarget && setShake(false)}>
        {paid.map((p) => (
          <button key={p.key} className={`as-coin as-c${p.coin} as-on`} onPointerDown={() => takeBack(p.key)} disabled={solved} aria-label={t('back', { n: p.coin })}>
            <CoinArt value={p.coin} />
          </button>
        ))}
      </div>

      {/* A hedgehog waits its turn with a basket. */}
      <img className="as-prop as-guest" src={hedgehog} alt="" style={worldStyle(250, 712, 210)} />
    </PaintedScene>
  )
}
