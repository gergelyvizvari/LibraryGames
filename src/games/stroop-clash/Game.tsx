import { useRef, useState } from 'react'
import { useCountdown, usePops, useShake } from '../../kit/hooks'
import { clamp, makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hud, Pops, TimerBar } from '../../kit/ui'
import { answerFor, colourCount, colours, makeCard } from './logic'

const DURATION = 45

export default function StroopClash({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const [card, setCard] = useState(() => makeCard(rng, level))
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [right, setRight] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [over, setOver] = useState(false)
  const [pops, addPop] = usePops()
  const [ref, shake] = useShake<HTMLDivElement>()

  const left = useCountdown(
    DURATION,
    () => {
      setOver(true)
      const total = right + wrong
      onFinish({ score, accuracy: total === 0 ? 0 : (right / total) * clamp(right / 25, 0, 1) })
    },
    !over,
  )

  const next = () => {
    const c = makeCard(rng, level)
    setCard(c)
    if (c.rule === 'word') addPop(t('flip'), 50, 15, 'info')
  }

  const choose = (i: number) => {
    if (over) return
    if (i === answerFor(card)) {
      const nc = combo + 1
      const gained = 10 + Math.min(nc, 10)
      setScore((s) => s + gained)
      setCombo(nc)
      setRight((r) => r + 1)
      sound.good(nc)
      addPop(`+${gained}`, 50, 40)
    } else {
      setCombo(0)
      setWrong((w) => w + 1)
      sound.bad()
      vibrate(50)
      shake()
    }
    next()
  }

  return (
    <div className="game stroop">
      <TimerBar left={left} total={DURATION} />
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('combo'), value: `×${combo}`, highlight: combo >= 5 },
          { label: t('time'), value: Math.ceil(left) },
        ]}
      />
      <p className={`prompt${card.rule === 'word' ? ' prompt-flip' : ''}`}>{card.rule === 'ink' ? t('tapInk') : t('tapWord')}</p>
      <div className="sc-word" ref={ref} style={{ color: colours[card.ink].css }}>
        {t(colours[card.word].key)}
      </div>
      <div className="sc-buttons">
        {colours.slice(0, colourCount(level)).map((c, i) => (
          <button key={c.key} className="sc-btn" style={{ background: c.css }} aria-label={t(c.key)} onPointerDown={() => choose(i)} />
        ))}
      </div>
      <Pops pops={pops} />
    </div>
  )
}
