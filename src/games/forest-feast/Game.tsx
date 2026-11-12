import { useMemo, useRef, useState } from 'react'
import { CritterGuide } from '../../kit/critters'
import { useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Feast, SEAT_W, Waiting } from './Feast'
import { isSet, makeTable, TABLES, wishState, type Seating, type Table } from './logic'

const WISH_KEY = { window: 'wish.window', cake: 'wish.cake', next: 'wish.next', apart: 'wish.apart' } as const

export default function ForestFeast({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const [table, setTable] = useState<Table>(() => makeTable(rng, level))
  const [seating, setSeating] = useState<Seating>(() => Array(table.guests.length).fill(null))
  const [picked, setPicked] = useState<number | null>(null)
  const [say, setSay] = useState(t('say'))
  const [busy, setBusy] = useState(false)
  const stage = useStage(TABLES, onFinish)
  const later = useTimeouts()
  const n = table.guests.length

  const states = useMemo(() => table.guests.map((_, g) => wishState(table, seating, g)), [table, seating])
  const waiting = table.guests.map((_, g) => g).filter((g) => !seating.includes(g))

  const explain = (g: number) => {
    const wish = table.wishes[g]
    return t(wish ? WISH_KEY[wish.kind] : 'wish.none')
  }

  const pick = (g: number) => {
    if (busy || stage.over) return
    sound.tap()
    if (picked === g) {
      // A second tap on a seated guest sends it back to the tray.
      setPicked(null)
      if (seating.includes(g)) setSeating(seating.map((x) => (x === g ? null : x)))
      setSay(t('say'))
      return
    }
    setPicked(g)
    setSay(explain(g))
  }

  const sit = (s: number) => {
    if (busy || stage.over) return
    const there = seating[s]
    if (picked === null) {
      if (there !== null) pick(there)
      return
    }
    if (there === picked) {
      pick(picked)
      return
    }
    const next = [...seating]
    const from = next.indexOf(picked)
    // Whoever sat there swaps places with the guest (or goes back to the tray).
    if (from >= 0) next[from] = there
    next[s] = picked
    setSeating(next)
    setPicked(null)
    if (isSet(table, next)) {
      setBusy(true)
      setSay(t('done'))
      if (stage.good()) return
      later(() => {
        const fresh = makeTable(rng, level)
        setTable(fresh)
        setSeating(Array(fresh.guests.length).fill(null))
        setSay(t('say'))
        setBusy(false)
      }, 1800)
      return
    }
    if (next.every((g) => g !== null)) {
      stage.slip()
      setSay(t('fix'))
      return
    }
    sound.tone(440 + next.filter((g) => g !== null).length * 60, 0.1, 'triangle', 0.12)
    setSay(wishState(table, next, picked) === 'broken' ? explain(picked) : t('say'))
  }

  const width = n * SEAT_W + 24
  return (
    <SceneShell
      place="woods"
      say={say}
      stage={stage}
      bare
      className="forest-feast"
      guide={<CritterGuide kind="fox" mood={busy ? 'happy' : 'idle'} />}
      tray={
        <div className="ff-tray">
          {waiting.length === 0 ? (
            <span className="ff-all">{t('allSeated')}</span>
          ) : (
            waiting.map((g) => (
              <button key={g} className={`ff-wait${picked === g ? ' ff-wait-on' : ''}`} onPointerDown={() => pick(g)} aria-pressed={picked === g} aria-label={t('guest', { n: g + 1 })}>
                <Waiting table={table} g={g} />
              </button>
            ))
          )}
        </div>
      }
    >
      <div key={stage.done} className="ff-table" style={{ aspectRatio: `${width} / 300`, ['--ff-ratio' as string]: width / 300 }}>
        <Feast table={table} seating={seating} states={states} picked={picked} done={busy} />
        <div className="ff-seats" style={{ gridTemplateColumns: `repeat(${n}, 1fr)`, paddingInline: `${(12 / width) * 100}%` }}>
          {seating.map((g, s) => (
            <button key={s} className="ff-seat" onPointerDown={() => sit(s)} aria-label={t('seat', { n: s + 1 })} aria-pressed={g !== null} />
          ))}
        </div>
      </div>
    </SceneShell>
  )
}
