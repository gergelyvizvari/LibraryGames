import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useCountdown, useGameLoop, useLatest, usePops, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hud, Pops, TimerBar } from '../../kit/ui'
import { words, type Group, type GroupId } from './content'
import { accuracyFor, beltSeconds, DURATION, makeDealer, pointsFor, showPictures, type Item } from './logic'

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
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [message, setMessage] = useState<{ text: string; kind: '' | 'yes' | 'no' }>(() => ({ text: t('hint'), kind: '' }))
  const [flash, setFlash] = useState<{ id: GroupId; kind: 'right' | 'wrong' | 'show' }[]>([])
  const [over, setOver] = useState(false)
  const stats = useRef({ right: 0, wrong: 0 })
  const scoreRef = useLatest(score)
  const [pops, addPop] = usePops()
  const later = useTimeouts()
  const pictures = showPictures(level)
  const seconds = beltSeconds(level)

  const show = (r: Ride) => {
    cur.current = r
    setRide(r)
  }

  const left = useCountdown(
    DURATION,
    () => {
      setOver(true)
      onFinish({ score: scoreRef.current, accuracy: accuracyFor(stats.current.right, stats.current.wrong) })
    },
    !over,
  )

  const nextRide = () => {
    later(() => {
      const before = cur.current!.set
      const r = newRide()
      if (r.set !== before) {
        setBaskets(dealer.baskets())
        addPop(t('newBaskets'), 50, 30, 'info')
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
    stats.current.wrong++
    setCombo(0)
    setMessage({ text: t('belongs', { word: r.word.word, group: t(`group.${r.group}`) }), kind: 'no' })
    flashFor(picked ? [{ id: picked, kind: 'wrong' }, { id: r.group, kind: 'show' }] : [{ id: r.group, kind: 'show' }])
    sound.bad()
    vibrate(40)
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
    nextRide()
    if (!right) return wrong(r, g)
    const nc = combo + 1
    const gained = pointsFor(nc, 1 - r.t)
    stats.current.right++
    setCombo(nc)
    setScore((s) => s + gained)
    setMessage({ text: t('yes'), kind: 'yes' })
    flashFor([{ id: g, kind: 'right' }])
    sound.good(nc)
    const i = baskets.findIndex((b) => b.id === g)
    addPop(`+${gained}`, baskets.length === 2 ? 25 + i * 50 : 25 + (i % 2) * 50, 62)
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
    <div className="game word-families">
      <TimerBar left={left} total={DURATION} />
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('combo'), value: `×${combo}`, highlight: combo >= 5 },
          { label: t('time'), value: Math.ceil(left) },
        ]}
      />
      <p className={`prompt wf-msg${message.kind ? ` wf-${message.kind}` : ''}`}>{message.text}</p>
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
      <Pops pops={pops} />
    </div>
  )
}
