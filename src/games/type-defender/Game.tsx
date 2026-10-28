import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useCountdown, useGameLoop, usePops, useShake } from '../../kit/hooks'
import { clamp, makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hearts, Hud, Pops, TimerBar } from '../../kit/ui'
import { wordLists, wordsForLevel } from './content'

const DURATION = 60
const SHIELDS = 3

interface Enemy {
  id: number
  word: string
  x: number
  y: number
}

export default function TypeDefender({ level, seed, t, onFinish }: GameProps) {
  const locale = useLocale()
  const rng = useRef(makeRng(seed)).current
  const pool = wordsForLevel(wordLists[locale] ?? wordLists.en, level)
  const state = useRef({ enemies: [] as Enemy[], spawnIn: 0.3, nextId: 0 })
  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [typed, setTyped] = useState('')
  const [score, setScore] = useState(0)
  const [zapped, setZapped] = useState(0)
  const [shields, setShields] = useState(SHIELDS)
  const [over, setOver] = useState(false)
  const [pops, addPop] = usePops()
  const [ref, shake] = useShake<HTMLDivElement>()
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => input.current?.focus(), [])

  const finish = (finalShields: number) => {
    if (over) return
    setOver(true)
    onFinish({ score, accuracy: clamp(zapped / 15, 0, 1) * (finalShields > 0 ? 1 : 0.7) })
  }
  const left = useCountdown(DURATION, () => finish(shields), !over)

  const fallSpeed = clamp(5 + level * 1.2, 5, 18) // % per second

  useGameLoop((dt) => {
    const s = state.current
    s.spawnIn -= dt
    if (s.spawnIn <= 0) {
      s.spawnIn = clamp(2.6 - level * 0.15, 1.1, 2.6)
      const used = new Set(s.enemies.map((e) => e.word[0]))
      // Each word on screen starts with a different letter, so typing always targets one word.
      const options = pool.filter((w) => !used.has(w[0]))
      if (options.length) s.enemies.push({ id: s.nextId++, word: rng.pick(options), x: rng.int(8, 72), y: -8 })
    }
    let hit = 0
    s.enemies = s.enemies.flatMap((e) => {
      const y = e.y + fallSpeed * dt
      if (y >= 88) {
        hit++
        return []
      }
      return [{ ...e, y }]
    })
    if (hit) {
      const left = Math.max(0, shields - hit)
      setShields(left)
      sound.bad()
      vibrate(80)
      shake()
      addPop(t('ouch'), 50, 85, 'bad')
      setTyped('')
      if (left === 0) finish(0)
    }
    setEnemies(s.enemies)
  }, !over)

  const onType = (value: string) => {
    if (over) return
    const v = value.normalize('NFC').toLowerCase().replace(/[^\p{L}]/gu, '')
    const s = state.current
    const target = s.enemies.find((e) => e.word.startsWith(v))
    if (!target || v === '') {
      if (v !== '') sound.tap()
      setTyped(v === '' ? '' : typed)
      return
    }
    sound.pop()
    if (v === target.word) {
      s.enemies = s.enemies.filter((e) => e.id !== target.id)
      setEnemies(s.enemies)
      const gained = target.word.length * 5
      setScore((n) => n + gained)
      setZapped((z) => z + 1)
      sound.good(zapped + 1)
      addPop(`${t('zap')} +${gained}`, target.x + 8, target.y)
      setTyped('')
      return
    }
    setTyped(v)
  }

  return (
    <div className="game type-defender" onPointerDown={() => input.current?.focus()}>
      <TimerBar left={left} total={DURATION} />
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('shields'), value: <Hearts left={shields} total={SHIELDS} /> },
          { label: t('time'), value: Math.ceil(left) },
        ]}
      />
      <div className="td-sky" ref={ref}>
        {enemies.map((e) => {
          const active = typed && e.word.startsWith(typed)
          return (
            <div key={e.id} className={`td-enemy${active ? ' td-active' : ''}`} style={{ left: `${e.x}%`, top: `${e.y}%` }}>
              {active ? (
                <>
                  <span className="td-done">{typed}</span>
                  {e.word.slice(typed.length)}
                </>
              ) : (
                e.word
              )}
            </div>
          )
        })}
        <div className="td-castle">🏰</div>
        <Pops pops={pops} />
      </div>
      <input
        ref={input}
        className="td-input"
        value={typed}
        onChange={(e) => onType(e.target.value)}
        placeholder={t('typeHere')}
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="done"
      />
    </div>
  )
}
