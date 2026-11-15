import { useRef, useState } from 'react'
import { useTimeouts } from '../../kit/hooks'
import { PonyGuide, type PonyMood } from '../../kit/ponies'
import { makeRng } from '../../kit/random'
import { SceneTool } from '../../kit/scene'
import { SceneShell, useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { BridgeArt, H, Stone, stoneAt, W } from './Bridge'
import { BRIDGES, makeBridge, planFor, RAINBOW, wrongPlaces, type Bridge, type Rainbow } from './logic'

/** Time for one step of the unicorn, in ms. */
const STEP = 380
/** Every colour of the rainbow sings its own note, so a finished bridge is a scale. */
const notes = [262, 294, 330, 349, 392, 440, 494]
const note = (c: Rainbow) => notes[RAINBOW.indexOf(c)]

export default function RainbowBridge({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const plan = planFor(level)
  const [bridge, setBridge] = useState<Bridge>(() => makeBridge(rng, level))
  /** For every place: the tray stone lying on it, or null. */
  const [laid, setLaid] = useState<(number | null)[]>(() => bridge.answer.map(() => null))
  const [picked, setPicked] = useState<number | null>(null)
  const [at, setAt] = useState(-1)
  const [walking, setWalking] = useState(false)
  const [wrong, setWrong] = useState<number[]>([])
  const [mood, setMood] = useState<PonyMood>('idle')
  const [crossed, setCrossed] = useState(false)
  const [peek, setPeek] = useState(false)
  const [returning, setReturning] = useState(false)
  // What the unicorn says first. Where a bridge may run backwards it always asks to look, so the words give nothing away.
  const start = () => t(plan.canReverse ? 'sayTurn' : plan.help === 'shown' ? 'say' : plan.help === 'peek' ? 'sayHidden' : 'sayMemory')
  const [say, setSay] = useState(start)
  const stage = useStage(BRIDGES, onFinish)
  const later = useTimeouts()
  const len = bridge.answer.length
  const locked = walking || crossed || stage.over

  const colours = bridge.answer.map((c, i) => (bridge.fixed[i] ? c : laid[i] === null ? null : bridge.tray[laid[i]!]))
  const gaps = colours.flatMap((c, i) => (c === null ? [i] : []))
  /** The gap the next stone goes to: the one the player picked, or the first one from the left. */
  const target = picked !== null && colours[picked] === null ? picked : (gaps[0] ?? null)

  const walk = (row: (number | null)[]) => {
    const cols = bridge.answer.map((c, i) => (bridge.fixed[i] ? c : row[i] === null ? null : bridge.tray[row[i]!]))
    const bad = wrongPlaces(bridge, cols)
    const reach = bad.length ? bad[0] : len
    setWalking(true)
    setSay(t('walking'))
    for (let i = 0; i < reach; i++)
      later(() => {
        setAt(i)
        sound.tone(note(bridge.answer[i]), 0.16, 'triangle', 0.14)
      }, STEP * (i + 1) + 300)
    const end = STEP * (reach + 1) + 300
    if (!bad.length) {
      later(() => {
        setAt(len)
        setCrossed(true)
        setMood('happy')
        setSay(t('done'))
        if (stage.good()) return
        later(() => {
          const fresh = makeBridge(rng, level)
          setBridge(fresh)
          setLaid(fresh.answer.map(() => null))
          setPicked(null)
          setAt(-1)
          setCrossed(false)
          setWalking(false)
          setMood('idle')
          setSay(start())
        }, 2200)
      }, end)
      return
    }
    // A wrong stone wobbles under the unicorn's hoof; it steps back and the wrong stones go back to the tray.
    later(() => {
      stage.slip()
      setWrong(bad)
      setMood('sad')
      setSay(t('wrong'))
    }, end - STEP / 2)
    later(() => {
      setLaid((now) => now.map((s, i) => (bad.includes(i) ? null : s)))
      setWrong([])
      setPicked(null)
      // It trots back to its cloud, looking the way it goes.
      setAt(-1)
      setMood('idle')
      setReturning(true)
    }, end + 1100)
    later(() => {
      setReturning(false)
      setWalking(false)
    }, end + 1700)
  }

  const lay = (stone: number) => {
    if (locked || target === null || laid.includes(stone)) return
    sound.tone(520, 0.05, 'triangle', 0.1)
    const next = laid.map((s, i) => (i === target ? stone : s))
    setLaid(next)
    setPicked(null)
    // The last gap is closed: the unicorn sets off.
    if (gaps.length === 1) walk(next)
  }

  const tapPlace = (i: number) => {
    if (locked || bridge.fixed[i]) return
    sound.tap()
    if (laid[i] !== null) setLaid(laid.map((s, j) => (j === i ? null : s)))
    setPicked(i)
  }

  const lookUp = () => {
    if (locked || peek) return
    sound.tone(660, 0.08, 'sine', 0.1)
    setPeek(true)
    later(() => setPeek(false), 2600)
  }

  return (
    <SceneShell
      place="woods"
      say={say}
      stage={stage}
      bare
      className="rainbow-bridge"
      guide={<PonyGuide kind="unicorn" mood={stage.mood === 'happy' ? 'happy' : stage.mood === 'oops' ? 'sad' : 'idle'} />}
      tray={
        <div className="rb-tray">
          <div className="rb-stones" role="group" aria-label={t('stones')}>
            {bridge.tray.map((c, i) => (
              <button key={`${stage.done}-${i}`} className="rb-stone" onPointerDown={() => lay(i)} disabled={locked || laid.includes(i)} aria-label={t(c)} style={{ visibility: laid.includes(i) ? 'hidden' : undefined }}>
                <svg viewBox="-20 -16 40 36" aria-hidden focusable="false">
                  <Stone colour={c} r={18} />
                </svg>
              </button>
            ))}
          </div>
          {plan.help === 'peek' && <SceneTool kind="hint" label={t('peek')} onPress={lookUp} disabled={locked || peek} />}
        </div>
      }
    >
      <div key={stage.done} className="rb-board" role="group" aria-label={t('bridge')}>
        <BridgeArt
          len={len}
          stones={colours}
          selected={locked ? null : target}
          wrong={wrong}
          at={at}
          mood={mood}
          garland={plan.help === 'none' ? 'none' : plan.help === 'shown' || peek ? 'shown' : 'hidden'}
          crossed={crossed}
          walking={walking}
          backwards={returning}
        />
        {colours.map((c, i) => {
          const s = stoneAt(i, len)
          const w = Math.min(40, 244 / len)
          return (
            <button
              key={i}
              className="rb-place"
              style={{ left: `${((s.x - w / 2) / W) * 100}%`, top: `${((s.y - 30) / H) * 100}%`, width: `${(w / W) * 100}%`, height: `${(60 / H) * 100}%` }}
              onPointerDown={() => tapPlace(i)}
              disabled={locked || bridge.fixed[i]}
              aria-label={c ? t('place', { n: i + 1, colour: t(c) }) : t('gap', { n: i + 1 })}
            />
          )
        })}
      </div>
    </SceneShell>
  )
}
