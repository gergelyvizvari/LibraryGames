import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useGameLoop, useShake } from '../../kit/hooks'
import { clamp, makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { typedPrefix, typedWhole, wordLists, wordsForLevel } from './content'

/** Words to type in one stage. */
const STAGE = 8

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
  const stage = useStage(STAGE, onFinish)
  const over = stage.over
  const [ref, shake] = useShake<HTMLDivElement>()
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => input.current?.focus(), [])

  const fallSpeed = clamp(4 + level * 1.1, 4, 16) // % per second

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
      // A word that reaches the castle bounces off its wall: nothing is lost, another one comes.
      stage.slip()
      shake()
      setTyped('')
    }
    setEnemies(s.enemies)
  }, !over)

  const onType = (value: string) => {
    if (over) return
    const v = value.normalize('NFC').toLowerCase().replace(/[^\p{L}]/gu, '')
    const s = state.current
    const target = s.enemies.find((e) => typedPrefix(e.word, v, level))
    if (!target || v === '') {
      if (v !== '') sound.tap()
      setTyped(v === '' ? '' : typed)
      return
    }
    sound.pop()
    if (typedWhole(target.word, v, level)) {
      s.enemies = s.enemies.filter((e) => e.id !== target.id)
      setEnemies(s.enemies)
      stage.good(target.word.length * 5)
      setTyped('')
      return
    }
    setTyped(v)
  }

  return (
    <SceneShell place="sea" say={t('say')} stage={stage} bare fill className="type-defender">
      <div className="td-sky" ref={ref} onPointerDown={() => input.current?.focus()}>
        {enemies.map((e) => {
          const active = typed && typedPrefix(e.word, typed, level)
          return (
            <div key={e.id} className={`td-enemy${active ? ' td-active' : ''}`} style={{ left: `${e.x}%`, top: `${e.y}%` }}>
              {active ? (
                <>
                  <span className="td-done">{e.word.slice(0, typed.length)}</span>
                  {e.word.slice(typed.length)}
                </>
              ) : (
                e.word
              )}
            </div>
          )
        })}
        <div className="td-castle">🏰</div>
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
    </SceneShell>
  )
}
