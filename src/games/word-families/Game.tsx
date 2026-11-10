import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useGameLoop, useLatest, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { words, type Group, type GroupId } from './content'
import { beltSeconds, makeDealer, showPictures, type Item } from './logic'

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
    <SceneShell place="village" say={message.text} stage={stage} bare className="word-families">
      <div className="wf-belt">
        <div key={ride.id} className={`wf-card${doneClass}`} style={{ left: `${88 - ride.t * 76}%` }}>
          {pictures && <span className="wf-emoji">{ride.word.emoji}</span>}
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
              <span className="wf-basket-emoji">{b.emoji}</span>
              <span className="wf-basket-name">{t(`group.${b.id}`)}</span>
            </button>
          )
        })}
      </div>
    </SceneShell>
  )
}
