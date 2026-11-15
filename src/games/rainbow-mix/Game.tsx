import { useRef, useState } from 'react'
import { useTimeouts } from '../../kit/hooks'
import { PonyGuide, type PonyKind, type PonyMood } from '../../kit/ponies'
import { makeRng } from '../../kit/random'
import { SceneTool } from '../../kit/scene'
import { SceneShell, useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { capFor, makeWishes, mixColour, namedAt, PAINTS, sameColour, tint, tip, type Paint } from './logic'
import { BARE, Pot, StudioArt } from './Studio'

// One pony after the other comes for a new mane.
const guests: PonyKind[] = ['alicorn', 'unicorn', 'pegasus']
const drip = { red: 392, yellow: 440, blue: 330, white: 523 }

export default function RainbowMix({ level, seed, t, onFinish }: GameProps) {
  const wishes = useRef(makeWishes(makeRng(seed), level)).current
  const cap = capFor(level)
  const stage = useStage(wishes.length, onFinish)
  const wish = wishes[Math.min(stage.done, wishes.length - 1)]
  const ask = (w = wish) => (namedAt(level) ? t('ask', { colour: t(w.id) }) : t('askShow'))
  const [drops, setDrops] = useState<Paint[]>([])
  const [stirring, setStirring] = useState(false)
  /** The mix that has been stirred and still lies in the bowl. */
  const [mixed, setMixed] = useState<Paint[] | null>(null)
  const [painted, setPainted] = useState(false)
  const [mood, setMood] = useState<PonyMood>('idle')
  const [tries, setTries] = useState(0)
  const [say, setSay] = useState(() => ask())
  const later = useTimeouts()
  const locked = stirring || painted || stage.over
  // While the finished mane is admired, the pony and its wish on show are still the ones just served.
  const turn = Math.min(painted ? stage.done - 1 : stage.done, wishes.length - 1)
  const kind = guests[turn % guests.length]
  const shown = wishes[turn]

  const add = (p: Paint) => {
    if (locked) return
    // A new drop after a wrong mix starts a fresh bowl.
    const now = mixed ? [] : drops
    if (now.length >= cap) {
      sound.tone(200, 0.06, 'square', 0.05)
      setSay(t('full'))
      return
    }
    sound.tone(drip[p], 0.07, 'sine', 0.14)
    setMixed(null)
    setDrops([...now, p])
    setMood('idle')
    if (mixed) setSay(ask())
  }

  const takeOut = () => {
    if (locked || !drops.length) return
    sound.tap()
    // After a wrong mix the bowl is emptied; before it, the last drop comes out.
    setDrops(mixed ? [] : drops.slice(0, -1))
    if (mixed) setSay(ask())
    setMixed(null)
    setMood('idle')
  }

  const stir = () => {
    if (locked || mixed) return
    if (drops.length < 2) {
      sound.tap()
      setSay(t('more'))
      return
    }
    setStirring(true)
    setSay(t('stirring'))
    ;[0, 180, 360].forEach((ms, i) => later(() => sound.tone(300 + i * 60, 0.08, 'triangle', 0.08), ms))
    later(() => {
      setStirring(false)
      setMixed(drops)
      if (sameColour(drops, wish.recipe)) {
        setPainted(true)
        setMood('happy')
        setSay(t('done'))
        if (stage.good()) return
        later(() => {
          setPainted(false)
          setMixed(null)
          setDrops([])
          setTries(0)
          setMood('idle')
          setSay(ask(wishes[Math.min(stage.done + 1, wishes.length - 1)]))
        }, 2400)
        return
      }
      stage.slip()
      setMood('sad')
      // The first wrong mix only asks to compare; from the second on the pony gives a tip.
      const hint = tip(wish.recipe, drops)
      setSay(tries < 1 ? t('wrong') : hint.kind === 'amounts' ? t('tipAmounts') : t(hint.kind === 'add' ? 'tipAdd' : 'tipDrop', { paint: t(hint.paint) }))
      setTries(tries + 1)
    }, 800)
  }

  const colour = mixed ? mixColour(mixed) : null
  const wishColour = mixColour(shown.recipe)
  const mane = painted ? [wishColour, tint(wishColour, 0.28), tint(wishColour, -0.14)] : BARE
  return (
    <SceneShell
      place="woods"
      say={say}
      stage={stage}
      bare
      className="rainbow-mix"
      guide={<PonyGuide kind={kind} mood={stage.mood === 'happy' ? 'happy' : stage.mood === 'oops' ? 'sad' : 'idle'} mane={mane} />}
      tray={
        <div className="rm-tray">
          <div className="rm-pots" role="group" aria-label={t('paints')}>
            {PAINTS.map((p) => (
              <button key={p} className="rm-pot" onPointerDown={() => add(p)} disabled={locked} aria-label={t(p)}>
                <Pot paint={p} />
              </button>
            ))}
          </div>
          <div className="rm-actions">
            <SceneTool kind="undo" label={t('undo')} hideLabel onPress={takeOut} disabled={locked || !drops.length} />
            <button className="rm-go" onPointerDown={stir} disabled={locked || !!mixed || !drops.length}>
              {t('mix')}
            </button>
          </div>
        </div>
      }
    >
      <div className="rm-board">
        <StudioArt kind={kind} mood={mood} mane={painted ? wishColour : null} wish={wishColour} drops={drops} cap={cap} mixed={colour} stirring={stirring} />
      </div>
    </SceneShell>
  )
}
