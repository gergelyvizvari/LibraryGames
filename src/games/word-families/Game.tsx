import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useGameLoop, useLatest, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { Cast, useMood } from '../../kit/cast'
import { PaintedScene, type PaintedView } from '../../kit/painted'
import { useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import { Emoji } from '../../kit/stickers'
import type { GameProps } from '../../kit/types'
import { words, type Group, type GroupId } from './content'
import { beltSeconds, makeDealer, showPictures, type Item } from './logic'
import bgTall from './art/bg-tall.webp'
import bg from './art/bg.webp'
import charBlink from './art/char-blink.webp'
import charHappy from './art/char-happy.webp'
import charSad from './art/char-sad.webp'
import char from './art/char.webp'

const FACES = { idle: char, blink: charBlink, happy: charHappy, sad: charSad }
/** The character's width / height. */
const ASPECT = 0.554

type ViewId = 'wide' | 'tall'

/** The market square: the words ride along above the counter and the baskets stand on it, with the pig seller in front. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: bg, world: { w: 1280, h: 800 }, focus: { x: 40, y: 0, w: 1240, h: 800 }, play: { x: 160, y: 150, w: 840, h: 340 }, ground: '#d6b081', sayAt: { x: 300, y: 150 } },
  { id: 'tall', painting: bgTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 100, w: 720, h: 1052 }, ground: '#b0a532', sayAt: { x: 60, y: 180 } },
]

/** Where the play sits in each painting (its content zoomed to suit the painting's scale), and the character. */
const SPOTS: Record<ViewId, { box: { x: number; y: number; w: number; h: number }; zoom: number; char: { x: number; bottom: number; h: number } }> = {
  wide: { box: { x: 160, y: 150, w: 840, h: 340 }, zoom: 1.1, char: { x: 1140, bottom: 790, h: 340 } },
  tall: { box: { x: 30, y: 190, w: 660, h: 430 }, zoom: 1, char: { x: 580, bottom: 1080, h: 300 } },
}

/** Words to sort in one stage. */
const STAGE = 10

interface Ride extends Item {
  id: number
  /** 0 when it appears on the right, 1 when it leaves on the left. */
  t: number
  done?: { picked: GroupId | null; right: boolean }
}

export default function WordFamilies({ level, seed, t, onFinish }: GameProps) {
  const locale = useLocale()
  const rng = useRef(makeRng(seed)).current
  const dealer = useRef(makeDealer(rng, level, words[locale] ?? words.en)).current
  const nextId = useRef(0)
  const newRide = (): Ride => ({ ...dealer.next(), id: nextId.current++, t: 0 })
  // The riding word lives in a ref (the loop and taps both change it) and is copied to state to draw it.
  const cur = useRef<Ride | null>(null)
  if (!cur.current) cur.current = newRide()
  const [ride, setRide] = useState<Ride>(cur.current)
  const [baskets, setBaskets] = useState<Group[]>(() => dealer.baskets())
  const [message, setMessage] = useState<{ text: string; kind: '' | 'yes' | 'no' }>(() => ({ text: t('hint'), kind: '' }))
  const [flash, setFlash] = useState<{ id: GroupId; kind: 'right' | 'wrong' | 'show' }[]>([])
  const stage = useStage(STAGE, onFinish)
  const [mood, feel] = useMood()
  const over = stage.over
  const later = useTimeouts()
  const pictures = showPictures(level)
  const seconds = beltSeconds(level)

  const show = (r: Ride) => {
    cur.current = r
    setRide(r)
  }

  const nextRide = () => {
    later(() => {
      const before = cur.current!.set
      const r = newRide()
      if (r.set !== before) {
        setBaskets(dealer.baskets())
        sound.pop()
        setMessage({ text: t('hint'), kind: '' })
      }
      show(r)
    }, 450)
  }

  const flashFor = (list: { id: GroupId; kind: 'right' | 'wrong' | 'show' }[]) => {
    setFlash(list)
    later(() => setFlash([]), 700)
  }

  const wrong = (r: Ride, picked: GroupId | null) => {
    setMessage({ text: t('belongs', { word: r.word.word, group: t(`group.${r.group}`) }), kind: 'no' })
    flashFor(picked ? [{ id: picked, kind: 'wrong' }, { id: r.group, kind: 'show' }] : [{ id: r.group, kind: 'show' }])
    feel('sad')
      stage.slip()
  }

  useGameLoop((dt) => {
    const r = cur.current!
    if (r.done) return
    const tt = r.t + dt / seconds
    if (tt < 1) return show({ ...r, t: tt })
    // It rode away: show where it belonged.
    show({ ...r, t: 1, done: { picked: null, right: false } })
    wrong(r, null)
    nextRide()
  }, !over)

  const pick = (g: GroupId) => {
    const r = cur.current!
    if (over || r.done) return
    const right = r.group === g
    show({ ...r, done: { picked: g, right } })
    if (!right) {
      nextRide()
      return wrong(r, g)
    }
    feel('happy')
    setMessage({ text: t('yes'), kind: 'yes' })
    flashFor([{ id: g, kind: 'right' }])
    if (!stage.good()) nextRide()
  }

  // Number keys 1 to 4 pick a basket, for anyone on a computer.
  const pickRef = useLatest(pick)
  const basketsRef = useLatest(baskets)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const b = basketsRef.current[Number(e.key) - 1]
      if (b) pickRef.current(b.id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pickRef, basketsRef])

  const doneClass = ride.done ? (ride.done.right ? ' wf-in' : ride.done.picked ? ' wf-miss' : ' wf-away') : ''
  return (
    <PaintedScene views={VIEWS} say={message.text} stage={stage} className="word-families">
      {(view) => {
        const at = SPOTS[view]
        return (
          <>
            <Cast faces={FACES} mood={mood} at={at.char} aspect={ASPECT} />
            {/* `zoom` scales the box's own position too, so it is given in zoomed units. */}
            <div className="pb-box" style={{ left: at.box.x / at.zoom, top: at.box.y / at.zoom, width: at.box.w / at.zoom, height: at.box.h / at.zoom, zoom: at.zoom }}>
      <div className="wf-belt">
        <div key={ride.id} className={`wf-card${doneClass}`} style={{ left: `${88 - ride.t * 76}%` }}>
          {pictures && <span className="wf-emoji"><Emoji e={ride.word.emoji} /></span>}
          <span className="wf-word">{ride.word.word}</span>
        </div>
        <div className="wf-rail" />
      </div>
      <div className={`wf-baskets wf-baskets-${baskets.length}`} key={ride.set}>
        {baskets.map((b, i) => {
          const f = flash.find((x) => x.id === b.id)
          return (
            <button
              key={b.id}
              className={`wf-basket${f ? ` wf-basket-${f.kind}` : ''}`}
              style={{ animationDelay: `${i * 60}ms` }}
              onPointerDown={() => pick(b.id)}
              disabled={over}
            >
              <span className="wf-basket-emoji"><Emoji e={b.emoji} /></span>
              <span className="wf-basket-name">{t(`group.${b.id}`)}</span>
            </button>
          )
        })}
      </div>
            </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
