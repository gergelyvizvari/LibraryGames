import { useEffect, useRef, useState } from 'react'
import { worldStyle } from './painted'

/**
 * A painted character of a painted scene: four faces of one cut-out (idle, a calm closed-eye blink, happy, sad),
 * standing by its feet in the painting's units. It breathes gently, blinks now and then while idle, and hops when
 * it cheers. Styles: `.cast` in styles.css.
 */
export type Face = 'idle' | 'blink' | 'happy' | 'sad'
export type Faces = Record<Face, string>
export type Mood = 'happy' | 'sad' | null

/** Blinks now and then: true for a short moment every few seconds, while `on`. */
export function useBlink(on = true) {
  const [shut, setShut] = useState(false)
  useEffect(() => {
    if (!on) return
    let timer = 0
    const next = (open: boolean) => {
      timer = window.setTimeout(
        () => {
          setShut(open)
          next(!open)
        },
        open ? 2600 + Math.random() * 2600 : 150,
      )
    }
    next(true)
    return () => {
      clearTimeout(timer)
      setShut(false)
    }
  }, [on])
  return shut
}

/** A happy or sad face for a moment: `feel('happy')` shows it for `ms`, then the character goes back to idle. */
export function useMood(ms = 750): [Mood, (m: Exclude<Mood, null>) => void] {
  const [mood, setMood] = useState<Mood>(null)
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])
  const feel = (m: Exclude<Mood, null>) => {
    setMood(m)
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMood(null), ms)
  }
  return [mood, feel]
}

export function Cast({ faces, mood, at, aspect }: { faces: Faces; mood: Mood; at: { x: number; bottom: number; h: number }; aspect: number }) {
  const blink = useBlink(!mood)
  const face: Face = mood ?? (blink ? 'blink' : 'idle')
  return (
    <div className={`cast${mood === 'happy' ? ' cast-cheer' : mood === 'sad' ? ' cast-oops' : ''}`} style={{ ...worldStyle(at.x, at.bottom, at.h), aspectRatio: aspect }}>
      {(Object.keys(faces) as Face[]).map((f) => (
        <img key={f} src={faces[f]} alt="" draggable={false} className={f === face ? '' : 'cast-off'} />
      ))}
    </div>
  )
}
