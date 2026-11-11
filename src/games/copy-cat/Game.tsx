import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useLatest, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Cat, type CatMood } from './Cat'
import { lines } from './content'
import { ACCENT_FREE_UP_TO, isTypingKey, keyMatches, makeDealer, STAGE, wordsOf } from './logic'

interface Note {
  id: number
  text: string
  /** Letters (and spaces) typed so far. */
  pos: number
  /** A wrong key in this note already counted against the stage: later ones only make a sound. */
  slipped: boolean
}

export default function CopyCat({ level, seed, t, onFinish }: GameProps) {
  const locale = useLocale()
  const rng = useRef(makeRng(seed)).current
  const deal = useRef(makeDealer(rng, lines[locale] ?? lines.en, level)).current
  const nextId = useRef(0)
  const newNote = (): Note => ({ id: nextId.current++, text: deal().text, pos: 0, slipped: false })
  const [note, setNote] = useState<Note>(newNote)
  const [mood, setMood] = useState<CatMood>('sleep')
  const [wrong, setWrong] = useState(0)
  const stage = useStage(STAGE, onFinish)
  const later = useTimeouts()
  // The youngest never get stuck on the space bar: typing the next word's first letter skips it.
  const easySpace = level <= ACCENT_FREE_UP_TO
  const done = note.pos === note.text.length

  const press = (key: string) => {
    if (stage.over || done) return
    let pos = note.pos
    if (easySpace && note.text[pos] === ' ' && key !== ' ') pos++
    if (!keyMatches(note.text[pos], key, level)) {
      setWrong((n) => n + 1)
      setMood('peek')
      later(() => setMood((m) => (m === 'peek' ? 'sleep' : m)), 900)
      if (note.slipped) sound.bad()
      else stage.slip()
      setNote({ ...note, slipped: true })
      return
    }
    pos++
    setNote({ ...note, pos })
    if (pos < note.text.length) {
      // A soft tap that climbs a little through the note.
      sound.tone(520 + (pos % 8) * 30, 0.05, 'triangle', 0.1)
      return
    }
    setMood('purr')
    if (stage.good(note.text.length)) return
    later(() => {
      setMood('sleep')
      setNote(newNote())
    }, 1400)
  }

  // Keys arrive through a hidden text box, so accented letters typed with dead keys or an input method count too.
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    input.current?.focus()
    // Whatever was clicked, the next key still goes to the note.
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return
      if (document.activeElement !== input.current) input.current?.focus()
      if (e.key === ' ') e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  const pressRef = useLatest(press)
  const typed = (text: string) => {
    for (const ch of text.normalize('NFC')) if (isTypingKey(ch)) pressRef.current(ch)
  }

  const next = note.text[note.pos]
  const say = done ? t('purr') : mood === 'peek' ? t('peek') : next === ' ' && !easySpace ? t('space') : t('say')
  return (
    <SceneShell place="sea" say={say} stage={stage} bare fill className="copy-cat">
      <div className="cc-room">
        <div className={`cc-note${done ? ' cc-done' : ''}`} key={note.id}>
          {wordsOf(note.text).map(({ word, start }, w) => (
            <span className="cc-word" key={start}>
              {w > 0 && <Cell ch=" " i={start - 1} pos={note.pos} wrong={wrong} />}
              {[...word].map((ch, k) => (
                <Cell key={k} ch={ch} i={start + k} pos={note.pos} wrong={wrong} />
              ))}
            </span>
          ))}
        </div>
        <Cat mood={mood} />
      </div>
      <input
        ref={input}
        className="cc-input"
        value=""
        onChange={(e) => typed(e.target.value)}
        onKeyDown={(e) => e.key === ' ' && (e.preventDefault(), typed(' '))}
        aria-label={t('say')}
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
      />
    </SceneShell>
  )
}

/** One letter of the note: typed, the one to type now (it shakes on a wrong key), or still to come. */
function Cell({ ch, i, pos, wrong }: { ch: string; i: number; pos: number; wrong: number }) {
  const state = i < pos ? 'cc-typed' : i === pos ? 'cc-next' : 'cc-todo'
  return (
    <span className={`cc-ch ${state}${ch === ' ' ? ' cc-space' : ''}`} key={i === pos ? `n${wrong}` : 'c'}>
      {ch === ' ' ? (i === pos ? '␣' : '') : ch}
    </span>
  )
}
