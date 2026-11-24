import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useGameLoop, useShake } from '../../kit/hooks'
import { clamp, makeRng } from '../../kit/random'
import { Cast, useMood } from '../../kit/cast'
import { PaintedScene, type PaintedView } from '../../kit/painted'
import { useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { typedPrefix, typedWhole, wordLists, wordsForLevel } from './content'
import bgTall from './art/bg-tall.webp'
import bg from './art/bg.webp'
import charBlink from './art/char-blink.webp'
import charHappy from './art/char-happy.webp'
import charSad from './art/char-sad.webp'
import char from './art/char.webp'

const FACES = { idle: char, blink: charBlink, happy: charHappy, sad: charSad }
/** The character's width / height. */
const ASPECT = 0.756

type ViewId = 'wide' | 'tall'

/** The beach: words drift down from the sky towards the sandcastle, guarded by the seagull knight. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: bg, world: { w: 1280, h: 800 }, focus: { x: 100, y: 0, w: 1080, h: 800 }, play: { x: 200, y: 20, w: 880, h: 620 }, ground: '#e4bf63', sayAt: { x: 60, y: 760 } },
  { id: 'tall', painting: bgTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 60, w: 720, h: 1092 }, ground: '#f5bf7c', sayAt: { x: 190, y: 1080 } },
]

/** Where the play sits in each painting (its content zoomed to suit the painting's scale), and the character. */
const SPOTS: Record<ViewId, { box: { x: number; y: number; w: number; h: number }; zoom: number; char: { x: number; bottom: number; h: number } }> = {
  wide: { box: { x: 200, y: 20, w: 880, h: 620 }, zoom: 1.6, char: { x: 1100, bottom: 780, h: 300 } },
  tall: { box: { x: 20, y: 130, w: 680, h: 780 }, zoom: 1.8, char: { x: 100, bottom: 1130, h: 240 } },
}

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
  const [mood, feel] = useMood()
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
      feel('sad')
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
      feel('happy')
    stage.good(target.word.length * 5)
      setTyped('')
      return
    }
    setTyped(v)
  }

  return (
    <PaintedScene views={VIEWS} say={t('say')} stage={stage} className="type-defender" trayHeight={90} tray={
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
      }>
      {(view) => {
        const at = SPOTS[view]
        return (
          <>
            <Cast faces={FACES} mood={mood} at={at.char} aspect={ASPECT} />
            {/* `zoom` scales the box's own position too, so it is given in zoomed units. */}
            <div className="pb-box" style={{ left: at.box.x / at.zoom, top: at.box.y / at.zoom, width: at.box.w / at.zoom, height: at.box.h / at.zoom, zoom: at.zoom }}>
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
      </div>
            </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
