import { useRef, useState } from 'react'
import { useShake } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import type { GameProps } from '../../kit/types'
import { answerFor, colourCount, colours, makeCard } from './logic'

/** Cards to get right in one stage. */
const STAGE = 8

export default function StroopClash({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const [card, setCard] = useState(() => makeCard(rng, level))
  const [n, setN] = useState(0)
  const stage = useStage(STAGE, onFinish)
  const [ref, shake] = useShake<HTMLDivElement>()

  const choose = (i: number) => {
    if (stage.over) return
    if (i !== answerFor(card)) {
      stage.slip()
      shake()
    } else if (stage.good()) return
    setCard(makeCard(rng, level))
    setN((k) => k + 1)
  }

  return (
    <SceneShell place="lake" say={card.rule === 'ink' ? t('tapInk') : t('tapWord')} stage={stage} className="stroop">
      <div className={`sc-word${card.rule === 'word' ? ' sc-flip' : ''}`} ref={ref} key={n} style={{ color: colours[card.ink].css }}>
        {t(colours[card.word].key)}
      </div>
      <div className="sc-buttons">
        {colours.slice(0, colourCount(level)).map((c, i) => (
          <button key={c.key} className="sc-btn" style={{ background: c.css }} aria-label={t(c.key)} onPointerDown={() => choose(i)} />
        ))}
      </div>
    </SceneShell>
  )
}
