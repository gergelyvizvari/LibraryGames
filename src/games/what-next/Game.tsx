import { useRef, useState } from 'react'
import { useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { Cast, useMood } from '../../kit/cast'
import { PaintedScene, type PaintedView } from '../../kit/painted'
import { useStage } from '../../kit/SceneShell'
import type { GameProps } from '../../kit/types'
import { makePuzzle } from './logic'
import { Piece } from './pieces'
import bgTall from './art/bg-tall.webp'
import bg from './art/bg.webp'
import charBlink from './art/char-blink.webp'
import charHappy from './art/char-happy.webp'
import charSad from './art/char-sad.webp'
import char from './art/char.webp'

const FACES = { idle: char, blink: charBlink, happy: charHappy, sad: charSad }
/** The character's width / height. */
const ASPECT = 0.537

type ViewId = 'wide' | 'tall'

/** The woodland store: the pattern stands on its shelves and the choices lie on the counter, with the mole shopkeeper in front. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: bg, world: { w: 1280, h: 800 }, focus: { x: 80, y: 0, w: 1200, h: 800 }, ground: '#9a8660', sayAt: { x: 990, y: 400 } },
  { id: 'tall', painting: bgTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 120, w: 720, h: 1032 }, ground: '#d37e46', sayAt: { x: 360, y: 400 } },
]

/** Where the play sits in each painting (its content zoomed to suit the painting's scale), and the character. */
const SPOTS: Record<ViewId, { box: { x: number; y: number; w: number; h: number }; zoom: number; char: { x: number; bottom: number; h: number } }> = {
  wide: { box: { x: 200, y: 100, w: 880, h: 380 }, zoom: 1.2, char: { x: 1010, bottom: 770, h: 340 } },
  tall: { box: { x: 30, y: 250, w: 660, h: 562 }, zoom: 1.1, char: { x: 590, bottom: 1130, h: 330 } },
}

/** Rows to finish in one stage. */
const STAGE = 6

export default function WhatNext({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const [puzzle, setPuzzle] = useState(() => makePuzzle(rng, level))
  const [round, setRound] = useState(0)
  const [solved, setSolved] = useState(false)
  const stage = useStage(STAGE, onFinish)
  const [mood, feel] = useMood()
  const [ref, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()

  const choose = (o: string) => {
    if (stage.over || solved) return
    if (o !== puzzle.answer) {
      feel('sad')
      stage.slip()
      shake()
      return
    }
    feel('happy')
    setSolved(true)
    if (stage.good()) return
    later(() => {
      setPuzzle(makePuzzle(rng, level))
      setRound((r) => r + 1)
      setSolved(false)
    }, 700)
  }

  return (
    <PaintedScene views={VIEWS} say={t('say')} stage={stage} className="what-next">
      {(view) => {
        const at = SPOTS[view]
        return (
          <>
            <Cast faces={FACES} mood={mood} at={at.char} aspect={ASPECT} />
            {/* `zoom` scales the box's own position too, so it is given in zoomed units. */}
            <div className="pb-box" style={{ left: at.box.x / at.zoom, top: at.box.y / at.zoom, width: at.box.w / at.zoom, height: at.box.h / at.zoom, zoom: at.zoom }}>
      <div className="wn-shelf" ref={ref} key={round}>
        <div className="wn-row">
          {puzzle.shown.map((s, i) => (
            <span key={i} className="wn-item" style={{ animationDelay: `${i * 0.04}s` }}>
              <Piece symbol={s} />
            </span>
          ))}
          <span className={`wn-item wn-slot${solved ? ' wn-solved' : ''}`}>{solved ? <Piece symbol={puzzle.answer} /> : '?'}</span>
        </div>
      </div>
      <div className="wn-choices">
        {puzzle.options.map((o, i) => (
          <button key={`${round}-${o}`} className="wn-choice" onPointerDown={() => choose(o)} aria-label={t('option', { n: i + 1 })}>
            <Piece symbol={o} />
          </button>
        ))}
      </div>
            </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
