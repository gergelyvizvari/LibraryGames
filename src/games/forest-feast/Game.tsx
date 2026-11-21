import { useMemo, useRef, useState } from 'react'
import type { CritterKind } from '../../kit/critters'
import { useTimeouts } from '../../kit/hooks'
import { PaintedScene, worldStyle, type PaintedView } from '../../kit/painted'
import { makeRng } from '../../kit/random'
import { useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import bearHappy from './art/bear-happy.webp'
import bearSad from './art/bear-sad.webp'
import bear from './art/bear.webp'
import bunnyHappy from './art/bunny-happy.webp'
import bunnySad from './art/bunny-sad.webp'
import bunny from './art/bunny.webp'
import cake from './art/cake.webp'
import chair from './art/chair.webp'
import cup from './art/cup.webp'
import foxHappy from './art/fox-happy.webp'
import fox from './art/fox.webp'
import hedgehogHappy from './art/hedgehog-happy.webp'
import hedgehogSad from './art/hedgehog-sad.webp'
import hedgehog from './art/hedgehog.webp'
import mouseHappy from './art/mouse-happy.webp'
import mouseSad from './art/mouse-sad.webp'
import mouse from './art/mouse.webp'
import owlHappy from './art/owl-happy.webp'
import owlSad from './art/owl-sad.webp'
import owl from './art/owl.webp'
import roomTall from './art/room-tall.webp'
import room from './art/room.webp'
import squirrelHappy from './art/squirrel-happy.webp'
import squirrelSad from './art/squirrel-sad.webp'
import squirrel from './art/squirrel.webp'
import windowArt from './art/window.webp'
import { isSet, makeTable, TABLES, wishState, type Seating, type Table, type Wish, type WishState } from './logic'

type Mood = 'idle' | 'happy' | 'sad'
const MOODS: Mood[] = ['idle', 'happy', 'sad']

/** Each guest's painted faces. The fox is the host and never a guest. */
const FACES: Record<Exclude<CritterKind, 'fox'>, Record<Mood, string>> = {
  owl: { idle: owl, happy: owlHappy, sad: owlSad },
  bunny: { idle: bunny, happy: bunnyHappy, sad: bunnySad },
  bear: { idle: bear, happy: bearHappy, sad: bearSad },
  hedgehog: { idle: hedgehog, happy: hedgehogHappy, sad: hedgehogSad },
  squirrel: { idle: squirrel, happy: squirrelHappy, sad: squirrelSad },
  mouse: { idle: mouse, happy: mouseHappy, sad: mouseSad },
}
const faces = (kind: CritterKind) => FACES[kind as Exclude<CritterKind, 'fox'>]

type ViewId = 'wide' | 'tall'

/** The dining room; the focus is the table with the guests' wishes above it (and the fox on the rug when upright). */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: room, world: { w: 1280, h: 800 }, focus: { x: 20, y: 150, w: 1240, h: 500 }, ground: '#bd662f', sayAt: { x: 640, y: 196 } },
  { id: 'tall', painting: roomTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 290, w: 720, h: 770 }, ground: '#b75f29', sayAt: { x: 380, y: 290 } },
]

/** Where the table is in each painting, how big the guests may be and where the fox stands. */
const TABLE_AT: Record<ViewId, {
  /** The back edge of the table top (guests are cut off there), its front edge, and the seats' span. */
  top: number
  front: number
  left: number
  right: number
  /** Tallest guest, and the size of a wish bubble. */
  maxH: number
  bubble: number
  host: { x: number; bottom: number; h: number }
}> = {
  wide: { top: 452, front: 478, left: 200, right: 1060, maxH: 290, bubble: 64, host: { x: 1178, bottom: 730, h: 340 } },
  tall: { top: 518, front: 545, left: 40, right: 680, maxH: 300, bubble: 84, host: { x: 360, bottom: 1040, h: 360 } },
}

/** How much of a seated guest shows above the table. */
const SHOWN = 0.64

/** Each cup gets its own colour. */
const CUP_HUE = [0, 150, 250, 300, 40, 200]

const WISH_KEY = { window: 'wish.window', cake: 'wish.cake', next: 'wish.next', apart: 'wish.apart' } as const

const moodFor = (state: WishState, done: boolean): Mood => (done || state === 'ok' ? 'happy' : state === 'broken' ? 'sad' : 'idle')

/** A wish in a little cream bubble: the window, the cake, or a friend's face with a heart or a "no". Sized in em. */
function WishBubble({ wish, guests, sad = false }: { wish: Wish; guests: CritterKind[]; sad?: boolean }) {
  return (
    <span className={`fe-wish${sad ? ' fe-sad' : ''}`}>
      {wish.kind === 'window' && <img src={windowArt} alt="" draggable={false} />}
      {wish.kind === 'cake' && <img src={cake} alt="" draggable={false} />}
      {(wish.kind === 'next' || wish.kind === 'apart') && (
        <>
          <span className="fe-head">
            <img src={faces(guests[wish.who]).idle} alt="" draggable={false} />
          </span>
          {wish.kind === 'next' ? (
            <svg viewBox="-10 -10 20 20" className="fe-sign" aria-hidden>
              <path d="M0 8 C-12 -1 -7 -10 0 -4 C7 -10 12 -1 0 8Z" fill="#e2607e" />
            </svg>
          ) : (
            <svg viewBox="-10 -10 20 20" className="fe-sign" aria-hidden>
              <circle r="7.5" fill="#fffaf0" stroke="#d9506a" strokeWidth="2.6" />
              <path d="M-5 5 L5 -5" stroke="#d9506a" strokeWidth="2.6" />
            </svg>
          )}
        </>
      )}
    </span>
  )
}

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
  // A phone held sideways has little height: the waiting guests stand smaller.
  const short = window.innerHeight < 500

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

  return (
    <PaintedScene
      views={VIEWS}
      say={say}
      stage={stage}
      className="forest-feast"
      trayHeight={short ? 110 : 170}
      tray={
        <div className="fe-tray">
          {waiting.length === 0 ? (
            <span className="fe-all">{t('allSeated')}</span>
          ) : (
            waiting.map((g) => {
              const wish = table.wishes[g]
              return (
                <button key={`${stage.done}-${g}`} className={`fe-wait${picked === g ? ' fe-wait-on' : ''}`} onPointerDown={() => pick(g)} aria-pressed={picked === g} aria-label={t('guest', { n: g + 1 })}>
                  {wish && <WishBubble wish={wish} guests={table.guests} />}
                  <img src={faces(table.guests[g]).idle} alt="" draggable={false} />
                </button>
              )
            })
          )}
        </div>
      }
    >
      {(view) => {
        const at = TABLE_AT[view]
        const seatW = (at.right - at.left) / n
        const x = (s: number) => at.left + seatW * (s + 0.5)
        const h = Math.min(at.maxH, seatW * 1.7)
        const headTop = at.top - SHOWN * h
        const chairW = Math.min(seatW * 0.8, 150)
        const chairH = chairW / 0.75
        const k = Math.min(1, seatW / 170)
        const bubble = at.bubble * Math.min(1, seatW / 150)
        return (
          <div key={stage.done} className="fe-room">
            {/* Chairs and guests stand behind the table, cut off by its top. */}
            <div className="fe-behind" style={{ height: at.top }}>
              {seating.map((g, s) => (
                <div key={s}>
                  <img className="fe-prop" src={chair} alt="" style={worldStyle(x(s), at.top + 0.48 * chairH, chairH)} />
                  {g === null && picked !== null && <span className="fe-free" style={{ left: x(s), top: at.top - 0.3 * chairH, width: chairW * 0.6, height: chairW * 0.6 }} />}
                </div>
              ))}
              {seating.map((g, s) => {
                if (g === null) return null
                const mood = moodFor(states[g], busy)
                return (
                  <div key={`g${g}`} className={`fe-guest${picked === g ? ' fe-picked' : ''}${busy ? ' fe-hop' : ''}`} style={worldStyle(x(s), at.top + (1 - SHOWN) * h, h)}>
                    {MOODS.map((m) => (
                      <img key={m} src={faces(table.guests[g])[m]} alt="" draggable={false} className={m === mood ? '' : 'fe-off'} />
                    ))}
                  </div>
                )
              })}
            </div>

            {/* The cake in front of its chair and a cup in front of every other one. */}
            {seating.map((_, s) =>
              s === table.cake ? (
                <img key={`c${s}`} className="fe-prop" src={cake} alt="" style={worldStyle(x(s), at.front - 2, 92 * k)} />
              ) : (
                <img key={`c${s}`} className="fe-prop" src={cup} alt="" style={{ ...worldStyle(x(s), at.front - 6, 50 * k), filter: `hue-rotate(${CUP_HUE[s % CUP_HUE.length]}deg)` }} />
              ),
            )}

            {/* The fox hosts the feast. */}
            <div className={`fe-host${busy ? ' fe-happy' : ''}`} style={worldStyle(at.host.x, at.host.bottom, at.host.h)}>
              <img src={fox} alt="" draggable={false} className={busy ? 'fe-off' : ''} />
              <img src={foxHappy} alt="" draggable={false} className={busy ? '' : 'fe-off'} />
            </div>

            {/* A seated guest shows its wish while it is not kept, or while it is picked. */}
            {seating.map((g, s) => {
              const wish = g === null ? null : table.wishes[g]
              if (g === null || !wish || busy || (states[g] === 'ok' && picked !== g)) return null
              return (
                <div key={`w${g}`} className="fe-wish-at" style={{ left: x(s), top: headTop - 4 - (picked === g ? 0.06 * h : 0), fontSize: bubble }}>
                  <WishBubble wish={wish} guests={table.guests} sad={states[g] === 'broken'} />
                </div>
              )
            })}

            {/* The chairs to tap: from above the wishes down to the cloth's hem. */}
            {seating.map((g, s) => (
              <button
                key={`s${s}`}
                className="fe-seat"
                style={{ left: x(s) - seatW / 2, top: headTop - 1.3 * bubble, width: seatW, height: at.front + 110 - (headTop - 1.3 * bubble) }}
                onPointerDown={() => sit(s)}
                aria-label={t('seat', { n: s + 1 })}
                aria-pressed={g !== null}
              />
            ))}
          </div>
        )
      }}
    </PaintedScene>
  )
}
