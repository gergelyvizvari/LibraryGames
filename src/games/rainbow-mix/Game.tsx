import { useRef, useState } from 'react'
import { useTimeouts } from '../../kit/hooks'
import { PaintedScene, worldStyle, type PaintedView } from '../../kit/painted'
import { makeRng } from '../../kit/random'
import { SceneTool } from '../../kit/scene'
import { useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import bowl from './art/bowl.webp'
import meadowTall from './art/meadow-tall.webp'
import meadow from './art/meadow.webp'
import { capFor, makeWishes, mixColour, namedAt, nameOf, PAINTS, sameColour, tip, type Paint } from './logic'
import { BowlPaint, PaintedPony, Pot, Sum, Wish, type Mood, type PonyKind } from './Studio'

type ViewId = 'wide' | 'tall'

/** The painting corner on the meadow; the focus holds the pony, the bowl and the wish above them. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: meadow, world: { w: 1280, h: 800 }, focus: { x: 150, y: 90, w: 900, h: 690 }, play: { x: 190, y: 110, w: 650, h: 590 }, ground: '#a9ae2e', sayAt: { x: 200, y: 260 } },
  { id: 'tall', painting: meadowTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 300, w: 720, h: 760 }, ground: '#9cb035', sayAt: { x: 40, y: 250 } },
]

/** Where everything stands in each painting: the pony and the bowl by their feet, the wish cloud and the sum by their top left / centre. */
const SPOTS: Record<ViewId, { pony: { x: number; bottom: number; h: number }; bowl: { x: number; bottom: number; h: number }; wish: { x: number; y: number; w: number }; sum: { x: number; y: number } }> = {
  wide: { pony: { x: 380, bottom: 700, h: 380 }, bowl: { x: 740, bottom: 690, h: 120 }, wish: { x: 520, y: 120, w: 320 }, sum: { x: 600, y: 752 } },
  tall: { pony: { x: 230, bottom: 930, h: 340 }, bowl: { x: 530, bottom: 930, h: 110 }, wish: { x: 330, y: 290, w: 300 }, sum: { x: 360, y: 1010 } },
}

// One pony after the other comes for a new mane.
const guests: PonyKind[] = ['alicorn', 'unicorn', 'pegasus']
const drip = { red: 392, yellow: 440, blue: 330, white: 523 }

export default function RainbowMix({ level, seed, t, onFinish }: GameProps) {
  const wishes = useRef(makeWishes(makeRng(seed), level)).current
  const cap = capFor(level)
  const stage = useStage(wishes.length, onFinish)
  const wish = wishes[Math.min(stage.done, wishes.length - 1)]
  const ask = (w = wish) => (namedAt(level) ? t('ask', { colour: t(w.id) }) : t('askShow'))
  const [drops, setDrops] = useState<Paint[]>([])
  const [stirring, setStirring] = useState(false)
  /** The mix that has been stirred and still lies in the bowl. */
  const [mixed, setMixed] = useState<Paint[] | null>(null)
  const [painted, setPainted] = useState(false)
  const [mood, setMood] = useState<Mood>('idle')
  const [tries, setTries] = useState(0)
  const [say, setSay] = useState(() => ask())
  const later = useTimeouts()
  const locked = stirring || painted || stage.over
  // While the finished mane is admired, the pony and its wish on show are still the ones just served.
  const turn = Math.min(painted ? stage.done - 1 : stage.done, wishes.length - 1)
  const kind = guests[turn % guests.length]
  const shown = wishes[turn]

  const add = (p: Paint) => {
    if (locked) return
    // A new drop after a wrong mix starts a fresh bowl.
    const now = mixed ? [] : drops
    if (now.length >= cap) {
      sound.tone(200, 0.06, 'square', 0.05)
      setSay(t('full'))
      return
    }
    sound.tone(drip[p], 0.07, 'sine', 0.14)
    setMixed(null)
    setDrops([...now, p])
    setMood('idle')
    if (mixed) setSay(ask())
  }

  const takeOut = () => {
    if (locked || !drops.length) return
    sound.tap()
    // After a wrong mix the bowl is emptied; before it, the last drop comes out.
    setDrops(mixed ? [] : drops.slice(0, -1))
    if (mixed) setSay(ask())
    setMixed(null)
    setMood('idle')
  }

  const stir = () => {
    if (locked || mixed) return
    if (drops.length < 2) {
      sound.tap()
      setSay(t('more'))
      return
    }
    setStirring(true)
    setSay(t('stirring'))
    ;[0, 180, 360].forEach((ms, i) => later(() => sound.tone(300 + i * 60, 0.08, 'triangle', 0.08), ms))
    later(() => {
      setStirring(false)
      setMixed(drops)
      if (sameColour(drops, wish.recipe)) {
        setPainted(true)
        setMood('happy')
        setSay(t('done'))
        if (stage.good()) return
        later(() => {
          setPainted(false)
          setMixed(null)
          setDrops([])
          setTries(0)
          setMood('idle')
          setSay(ask(wishes[Math.min(stage.done + 1, wishes.length - 1)]))
        }, 2400)
        return
      }
      stage.slip()
      setMood('sad')
      // The first wrong mix says what came out and shows the sum; from the second on the pony also gives a tip.
      const hint = tip(wish.recipe, drops)
      const made = nameOf(drops)
      const first = !made ? t('wrong') : namedAt(level) ? t('wrongMade', { made: t(made), colour: t(wish.id) }) : t('wrongShow', { made: t(made) })
      setSay(tries < 1 ? first : hint.kind === 'amounts' ? t('tipAmounts') : t(hint.kind === 'add' ? 'tipAdd' : 'tipDrop', { paint: t(hint.paint) }))
      setTries(tries + 1)
    }, 800)
  }

  const colour = mixed ? mixColour(mixed) : null
  const wishColour = mixColour(shown.recipe)
  return (
    <PaintedScene
      views={VIEWS}
      say={say}
      stage={stage}
      className="rainbow-mix"
      trayHeight={130}
      tray={
        <div className="rm-tray">
          <div className="rm-pots" role="group" aria-label={t('paints')}>
            {PAINTS.map((p) => (
              <button key={p} className="rm-pot" onPointerDown={() => add(p)} disabled={locked} aria-label={t(p)}>
                <Pot paint={p} />
              </button>
            ))}
          </div>
          <div className="rm-actions">
            <SceneTool kind="undo" label={t('undo')} hideLabel onPress={takeOut} disabled={locked || !drops.length} />
            <button className="rm-go" onPointerDown={stir} disabled={locked || !!mixed || !drops.length}>
              {t('mix')}
            </button>
          </div>
        </div>
      }
    >
      {(view) => {
        const at = SPOTS[view]
        return (
          <div className="rm-board" role="img" aria-label={mixed ? `${t('recipe')}: ${mixed.map((p) => t(p)).join(' + ')}` : undefined}>
            <div className="rm-cloud" style={{ left: at.wish.x, top: at.wish.y, width: at.wish.w }}>
              <Wish colour={wishColour} />
            </div>
            {/* Every guest trots in from the edge of the meadow. */}
            <div key={turn} className="rm-arrive">
              <PaintedPony kind={kind} mood={mood} mane={painted ? wishColour : null} stirring={stirring} style={worldStyle(at.pony.x, at.pony.bottom, at.pony.h)} />
            </div>
            {/* The bowl and its paint share one box, so the paint lies exactly inside the painted rim. */}
            <div className="rm-bowl" style={{ ...worldStyle(at.bowl.x, at.bowl.bottom, at.bowl.h), aspectRatio: 350 / 192 }}>
              <img src={bowl} alt="" draggable={false} />
              <BowlPaint drops={drops} cap={cap} mixed={colour} stirring={stirring} />
            </div>
            {mixed && colour && (
              <div key={mixed.join('-')} className="rm-sum-at" style={{ left: at.sum.x, top: at.sum.y }}>
                <Sum recipe={mixed} made={colour} wish={wishColour} right={painted} />
              </div>
            )}
          </div>
        )
      }}
    </PaintedScene>
  )
}
