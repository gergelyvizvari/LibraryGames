import { useRef, useState } from 'react'
import { useShake } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { Cast, useMood } from '../../kit/cast'
import { PaintedScene, type PaintedView } from '../../kit/painted'
import { useStage } from '../../kit/SceneShell'
import type { GameProps } from '../../kit/types'
import { answerFor, colourCount, colours, makeCard } from './logic'
import bgTall from './art/bg-tall.webp'
import bg from './art/bg.webp'
import charBlink from './art/char-blink.webp'
import charHappy from './art/char-happy.webp'
import charSad from './art/char-sad.webp'
import char from './art/char.webp'

const FACES = { idle: char, blink: charBlink, happy: charHappy, sad: charSad }
/** The character's width / height. */
const ASPECT = 0.62

type ViewId = 'wide' | 'tall'

/** The painter's studio; the colour word is painted on the big canvas, the paint pots are the buttons. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: bg, world: { w: 1280, h: 800 }, focus: { x: 200, y: 40, w: 1080, h: 760 }, ground: '#e58b39', sayAt: { x: 700, y: 640 } },
  { id: 'tall', painting: bgTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 180, w: 720, h: 960 }, ground: '#de883b', sayAt: { x: 360, y: 300 } },
]

/** Where the play sits in each painting (its content zoomed to suit the painting's scale), and the character. */
const SPOTS: Record<ViewId, { box: { x: number; y: number; w: number; h: number }; zoom: number; char: { x: number; bottom: number; h: number } }> = {
  wide: { box: { x: 380, y: 70, w: 630, h: 460 }, zoom: 1, char: { x: 1170, bottom: 790, h: 300 } },
  tall: { box: { x: 80, y: 270, w: 560, h: 540 }, zoom: 1, char: { x: 620, bottom: 1140, h: 230 } },
}

/** Cards to get right in one stage. */
const STAGE = 8

export default function StroopClash({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const [card, setCard] = useState(() => makeCard(rng, level))
  const [n, setN] = useState(0)
  const stage = useStage(STAGE, onFinish)
  const [mood, feel] = useMood()
  const [ref, shake] = useShake<HTMLDivElement>()

  const choose = (i: number) => {
    if (stage.over) return
    if (i !== answerFor(card)) {
      feel('sad')
      stage.slip()
      shake()
    feel('happy')
    } else if (stage.good()) return
    setCard(makeCard(rng, level))
    setN((k) => k + 1)
  }

  return (
    <PaintedScene views={VIEWS} say={card.rule === 'ink' ? t('tapInk') : t('tapWord')} stage={stage} className="stroop" trayHeight={110} tray={
      <div className="sc-buttons">
        {colours.slice(0, colourCount(level)).map((c, i) => (
          <button key={c.key} className="sc-btn" style={{ background: c.css }} aria-label={t(c.key)} onPointerDown={() => choose(i)} />
        ))}
      </div>
      }>
      {(view) => {
        const at = SPOTS[view]
        return (
          <>
            <Cast faces={FACES} mood={mood} at={at.char} aspect={ASPECT} />
            {/* `zoom` scales the box's own position too, so it is given in zoomed units. */}
            <div className="pb-box" style={{ left: at.box.x / at.zoom, top: at.box.y / at.zoom, width: at.box.w / at.zoom, height: at.box.h / at.zoom, zoom: at.zoom }}>
      <div className={`sc-word${card.rule === 'word' ? ' sc-flip' : ''}`} ref={ref} key={n} style={{ color: colours[card.ink].css }}>
        {t(colours[card.word].key)}
      </div>
            </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
