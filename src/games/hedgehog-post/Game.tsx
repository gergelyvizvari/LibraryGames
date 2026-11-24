import { useEffect, useRef, useState } from 'react'
import { useTimeouts } from '../../kit/hooks'
import { PaintedScene, type PaintedView } from '../../kit/painted'
import { makeRng } from '../../kit/random'
import { SceneTool } from '../../kit/scene'
import { useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import officeTall from './art/office-tall.webp'
import office from './art/office.webp'
import { DELIVERIES, makeVillage, run, slotsFor, type Cell, type Dir, type Village } from './logic'
import { VillageMap, type Face } from './Village'

/** Time for one step of the hedgehog, in ms. */
const STEP = 430
const turn = { up: 0, right: 90, down: 180, left: 270 } as const

type ViewId = 'wide' | 'tall'

/** The post office; the village map hangs on its back wall and is the focus. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: office, world: { w: 1280, h: 800 }, focus: { x: 290, y: 60, w: 600, h: 640 }, play: { x: 340, y: 120, w: 510, h: 510 }, ground: '#c67231', sayAt: { x: 880, y: 250 } },
  { id: 'tall', painting: officeTall, world: { w: 720, h: 1152 }, focus: { x: 20, y: 200, w: 680, h: 700 }, ground: '#b76b2d', sayAt: { x: 330, y: 250 } },
]

/** Where the map hangs in each painting (a square). */
const MAP: Record<ViewId, { x: number; y: number; size: number }> = {
  wide: { x: 340, y: 120, size: 510 },
  tall: { x: 50, y: 270, size: 620 },
}

function Arrow({ dir }: { dir: Dir }) {
  return (
    <svg viewBox="-16 -16 32 32" aria-hidden focusable="false">
      <path transform={`rotate(${turn[dir]})`} d="M0 -11 L12 4 H5 V12 H-5 V4 H-12Z" fill="currentColor" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  )
}

/** The hedgehog blinks now and then while it waits. */
function useBlink(on: boolean) {
  const [shut, setShut] = useState(false)
  useEffect(() => {
    if (!on) return
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
    return () => {
      clearTimeout(timer)
      setShut(false)
    }
  }, [on])
  return shut
}

export default function HedgehogPost({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const [village, setVillage] = useState<Village>(() => makeVillage(rng, level))
  const [cards, setCards] = useState<Dir[]>([])
  const [at, setAt] = useState<Cell>(village.start)
  const [trail, setTrail] = useState<Cell[]>([])
  const [active, setActive] = useState<number | null>(null)
  const [wrong, setWrong] = useState<number | null>(null)
  const [walking, setWalking] = useState(false)
  const [delivered, setDelivered] = useState(false)
  const [oops, setOops] = useState(false)
  const [say, setSay] = useState(t('say'))
  const stage = useStage(DELIVERIES, onFinish)
  const later = useTimeouts()
  const slots = slotsFor(village)
  const locked = walking || delivered || stage.over
  const blink = useBlink(!walking && !delivered && !oops)
  const face: Face = delivered ? 'happy' : oops ? 'sad' : blink ? 'blink' : 'idle'

  const add = (d: Dir) => {
    if (locked) return
    if (cards.length >= slots) {
      sound.tone(200, 0.06, 'square', 0.05)
      setSay(t('full'))
      return
    }
    sound.tone(520 + cards.length * 30, 0.05, 'triangle', 0.1)
    // Quick taps can come before the next render, so build on the newest list.
    setCards((now) => (now.length >= slots ? now : [...now, d]))
    setWrong(null)
    setSay(t('ready'))
  }

  const remove = (i: number) => {
    if (locked) return
    sound.tap()
    setCards((now) => now.filter((_, j) => j !== i))
    setWrong(null)
  }

  const back = () => {
    if (locked || !cards.length) return
    remove(cards.length - 1)
  }

  const go = () => {
    if (locked) return
    if (!cards.length) {
      sound.tap()
      setSay(t('say'))
      return
    }
    const { cells, outcome } = run(village, cards)
    setWalking(true)
    setWrong(null)
    setTrail([])
    setSay(t('walking'))
    cells.forEach((c, i) =>
      later(() => {
        setAt(c)
        setActive(i)
        setTrail(cells.slice(0, i))
        sound.tone(480 + (i % 4) * 60, 0.06, 'triangle', 0.08)
      }, STEP * (i + 1)),
    )
    const end = STEP * (cells.length + 1)
    if (outcome.kind === 'home') {
      later(() => {
        setDelivered(true)
        setActive(null)
        setSay(t('done'))
        if (stage.good()) return
        later(() => {
          const fresh = makeVillage(rng, level)
          setVillage(fresh)
          setAt(fresh.start)
          setCards([])
          setTrail([])
          setDelivered(false)
          setWalking(false)
          setSay(t('say'))
        }, 1900)
      }, end - STEP / 2)
      return
    }
    // Blocked or out of cards: the hedgehog shakes its head, then walks back to the post box; the cards stay to fix.
    later(() => {
      stage.slip()
      setOops(true)
      setActive(null)
      if (outcome.kind === 'blocked') setWrong(outcome.at)
      setSay(t(outcome.kind === 'blocked' ? 'blocked' : 'short'))
    }, end)
    later(() => {
      setOops(false)
      setAt(village.start)
      setTrail([])
      setWalking(false)
    }, end + 1100)
  }

  // A phone held sideways has little height: one row of buttons beside the cards.
  const short = window.innerHeight < 500
  return (
    <PaintedScene
      views={VIEWS}
      say={say}
      stage={stage}
      className="hedgehog-post"
      trayHeight={short ? 118 : 178}
      tray={
        <div className="hp-tray">
          <ol className="hp-cards" aria-label={t('cards')} style={{ ['--hp-slots' as string]: slots }}>
            {Array.from({ length: slots }, (_, i) => {
              const d = cards[i]
              if (!d) return <li key={i} className="hp-slot" />
              const state = wrong === i ? ' hp-wrong' : active === i ? ' hp-now' : active !== null && i < active ? ' hp-past' : ''
              return (
                <li key={i}>
                  <button className={`hp-card${state}`} onPointerDown={() => remove(i)} aria-label={t(d)} disabled={locked}>
                    <Arrow dir={d} />
                  </button>
                </li>
              )
            })}
          </ol>
          <div className="hp-buttons">
            <div className="hp-arrows">
              {(['up', 'down', 'left', 'right'] as const).map((d) => (
                <SceneTool key={d} kind={d} label={t(d)} hideLabel onPress={() => add(d)} disabled={locked} />
              ))}
            </div>
            <div className="hp-actions">
              <SceneTool kind="undo" label={t('undo')} hideLabel onPress={back} disabled={locked || !cards.length} />
              <button className="hp-go" onPointerDown={go} disabled={locked || !cards.length}>
                <svg viewBox="-10 -10 20 20" aria-hidden focusable="false">
                  <path d="M-6 -8 L8 0 L-6 8Z" fill="currentColor" />
                </svg>
                {t('go')}
              </button>
            </div>
          </div>
        </div>
      }
    >
      {(view) => {
        const m = MAP[view]
        return (
          <div key={stage.done} className="hp-board" style={{ left: m.x, top: m.y, width: m.size, height: m.size }}>
            <VillageMap village={village} at={at} trail={trail} delivered={delivered} face={face} oops={oops} />
          </div>
        )
      }}
    </PaintedScene>
  )
}
