import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useGameLoop, useShake, useTimeouts } from '../../kit/hooks'
import { PaintedScene, worldStyle, type PaintedView } from '../../kit/painted'
import { clamp, makeRng } from '../../kit/random'
import { useStage } from '../../kit/SceneShell'
import { Emoji } from '../../kit/stickers'
import type { GameProps } from '../../kit/types'
import foxBlink from './art/fox-blink.webp'
import foxHappy from './art/fox-happy.webp'
import foxSad from './art/fox-sad.webp'
import fox from './art/fox.webp'
import squareTall from './art/square-tall.webp'
import square from './art/square.webp'
import { words, wordsForLevel, type Word } from './content'

type Face = 'idle' | 'blink' | 'happy' | 'sad'
const FOX: [Face, string][] = [
  ['idle', fox],
  ['blink', foxBlink],
  ['happy', foxHappy],
  ['sad', foxSad],
]

/** The fox blinks now and then while it waits. */
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

type ViewId = 'wide' | 'tall'

/** The village square; the pictures fall from the sky above it. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: square, world: { w: 1280, h: 800 }, focus: { x: 140, y: 40, w: 1140, h: 760 }, ground: '#c99f98', sayAt: { x: 640, y: 120 } },
  { id: 'tall', painting: squareTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 140, w: 720, h: 1000 }, ground: '#d1aaa3', sayAt: { x: 360, y: 220 } },
]

/** The sky the pictures fall through (x and y are percentages of it), and the fox. */
const SPOTS: Record<ViewId, { sky: { x: number; y: number; w: number; h: number }; fox: { x: number; bottom: number; h: number } }> = {
  wide: { sky: { x: 230, y: 150, w: 820, h: 600 }, fox: { x: 1150, bottom: 790, h: 260 } },
  tall: { sky: { x: 40, y: 280, w: 560, h: 830 }, fox: { x: 610, bottom: 1140, h: 230 } },
}

/** Pictures to name in one stage. */
const STAGE = 8

interface Drop {
  answer: Word
  options: string[]
  x: number
  y: number
}

export default function WordCatch({ level, seed, t, onFinish }: GameProps) {
  const locale = useLocale()
  const rng = useRef(makeRng(seed)).current
  const pool = wordsForLevel(words[locale] ?? words.en, level)
  // Deal words from a shuffled deck so none repeats until the whole pool has been seen.
  const deck = useRef<Word[]>([])
  const makeDrop = (prev?: Word): Drop => {
    if (deck.current.length === 0) deck.current = rng.shuffle(pool.filter((w) => w !== prev))
    const answer = deck.current.pop()!
    const others = rng.shuffle(pool.filter((w) => w !== answer))
    // From level 5, prefer distractors that start with the same letter, so kids must really read.
    const similar = level >= 5 ? others.filter((w) => w.word[0] === answer.word[0]) : []
    const distractors = [...similar, ...others].slice(0, 2).map((w) => w.word)
    return { answer, options: rng.shuffle([answer.word, ...distractors]), x: rng.int(15, 85), y: -10 }
  }

  const [drop, setDropState] = useState<Drop>(() => makeDrop())
  const dropRef = useRef(drop)
  const setDrop = (d: Drop) => {
    dropRef.current = d
    setDropState(d)
  }
  const stage = useStage(STAGE, onFinish)
  const over = stage.over
  const [ref, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()
  const blink = useBlink()
  const [mood, setMood] = useState<'happy' | 'sad' | null>(null)
  const feel = (m: 'happy' | 'sad') => {
    setMood(m)
    later(() => setMood((now) => (now === m ? null : now)), 700)
  }

  const fallSeconds = clamp(7.5 - level * 0.45, 3, 7.5)

  const miss = () => {
    feel('sad')
    stage.slip()
    shake()
  }

  useGameLoop((dt) => {
    const d = dropRef.current
    const y = d.y + (dt / fallSeconds) * 100
    if (y < 92) {
      setDrop({ ...d, y })
      return
    }
    miss()
    setDrop(makeDrop(d.answer))
  }, !over)

  const choose = (option: string) => {
    if (over) return
    if (option !== drop.answer.word) return miss()
    feel('happy')
    if (!stage.good()) setDrop(makeDrop(drop.answer))
  }

  const face: Face = mood ?? (blink ? 'blink' : 'idle')
  return (
    <PaintedScene
      views={VIEWS}
      say={t('say')}
      stage={stage}
      className="word-catch"
      trayHeight={100}
      tray={
        <div className="choices">
          {drop.options.map((o) => (
            <button key={o} className="choice-btn" onPointerDown={() => choose(o)}>
              {o}
            </button>
          ))}
        </div>
      }
    >
      {(view) => {
        const at = SPOTS[view]
        return (
          <>
            <div className={`wc-char${mood === 'happy' ? ' wc-cheer' : ''}`} style={worldStyle(at.fox.x, at.fox.bottom, at.fox.h)}>
              {FOX.map(([f, src]) => (
                <img key={f} src={src} alt="" draggable={false} className={f === face ? '' : 'wc-off'} />
              ))}
            </div>
            <div className="wc-sky" ref={ref} style={{ left: at.sky.x, top: at.sky.y, width: at.sky.w, height: at.sky.h }}>
              <div className="wc-drop" style={{ left: `${drop.x}%`, top: `${drop.y}%` }}>
                <Emoji e={drop.answer.emoji} />
              </div>
            </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
