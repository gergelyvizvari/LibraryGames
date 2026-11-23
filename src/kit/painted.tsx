import type { CSSProperties, ReactNode } from 'react'
import { useT } from '../i18n'
import { useSize } from './hooks'
import { StagePips } from './scene'
import type { Stage } from './SceneShell'

/**
 * A painted scene: one picture-book painting as the whole background, with the game's characters and things
 * placed on it in the painting's own units (its "world", 1280 × 800 by default). The painting is scaled so the
 * `focus` box (where the play happens) always fits above the tray, and covers the screen where it can; what the
 * painting cannot cover (an upright phone) is the painting's ground colour: the painting sits at the top and its
 * ground fades into that colour, with the tray lying on it.
 */

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

export interface Fit {
  /** Screen pixels per world unit. */
  s: number
  /** Where the world's top left corner is on screen. */
  x: number
  y: number
}

/** How to lay a `world`-sized painting over a `w` × `h` screen, keeping `focus` between `top` and `bottom` pixels
 * from the edges. */
export function fitPainting(w: number, h: number, world: { w: number; h: number }, focus: Box, bottom = 0, top = 0): Fit {
  const room = Math.max(1, h - bottom - top)
  const s = Math.min(Math.max(w / world.w, h / world.h), w / focus.w, room / focus.h)
  // Centre the focus in the room it has; a painting bigger than the screen never shows its edge, a smaller one
  // never leaves the screen.
  const place = (screen: number, size: number, centre: number, keep: number) => {
    const at = keep / 2 - centre * s
    const [lo, hi] = size >= screen ? [screen - size, 0] : [0, screen - size]
    return Math.min(hi, Math.max(lo, at))
  }
  const tall = world.h * s
  return {
    s,
    x: place(w, world.w * s, focus.x + focus.w / 2, w),
    // Shorter than the screen: hang it from the top (the ground goes on below it), but keep the focus above the tray.
    y: tall >= h
      ? Math.min(0, Math.max(h - tall, top + room / 2 - (focus.y + focus.h / 2) * s))
      : Math.max(Math.min(0, top + room - (focus.y + focus.h) * s), Math.min(top - focus.y * s, h - bottom - tall)),
  }
}

/** Places a picture in world units by its bottom centre, `h` units tall. */
export function worldStyle(x: number, bottom: number, h?: number): CSSProperties {
  return { left: x, top: bottom, height: h, translate: '-50% -100%' }
}

/** One painting of the scene and where things are on it. A scene can have a wide and an upright painting. */
export interface PaintedView<Id extends string = string> {
  id: Id
  painting: string
  world: { w: number; h: number }
  /** Where the play happens; it always fits above the tray. */
  focus: Box
  /** The colour of the painting's bottom edge, which goes on below it on screens taller than the painting. */
  ground: string
  /** Where the character speaks from (kept for the scene's layout notes; the task line sits at the top). */
  sayAt: { x: number; y: number }
}

/** Room at the top for the back button, the progress pips and the task line under them; a phone held sideways has
 * the pips beside the back button and the task line level with them (see `.ps-task` in styles.css). */
const taskRoom = (h: number) => (h < 500 ? 60 : 116)

/** The view whose painting's shape is closest to the screen's. */
export function pickView<V extends PaintedView>(views: V[], w: number, h: number): V {
  const ratio = Math.log(w / Math.max(1, h))
  return views.reduce((best, v) =>
    Math.abs(Math.log(v.world.w / v.world.h) - ratio) < Math.abs(Math.log(best.world.w / best.world.h) - ratio) ? v : best,
  )
}

export function PaintedScene<Id extends string>({
  views,
  say,
  stage,
  tray,
  trayHeight = 120,
  className = '',
  children,
}: {
  views: PaintedView<Id>[]
  /** The task, in one short sentence, shown on the paper strip at the top (and read out by screen readers). */
  say: ReactNode
  stage: Pick<Stage, 'done' | 'total' | 'over'>
  /** Things to tap, laid on the ground at the bottom edge (not scaled with the painting). */
  tray?: ReactNode
  trayHeight?: number
  className?: string
  /** Absolutely placed things in the chosen view's world units (see `worldStyle`). */
  children: (view: Id) => ReactNode
}) {
  const t = useT()
  const [ref, size] = useSize<HTMLDivElement>({ w: 390, h: 700 })
  const { id, painting, world, focus, ground } = pickView(views, size.w, size.h)
  // The task line sits under the back button and the progress pips; the play is kept below it.
  const fit = fitPainting(size.w, size.h, world, focus, tray ? trayHeight : 0, taskRoom(size.h))
  return (
    <div ref={ref} className={`scene ps ps-${id} ${className}`} style={{ background: ground }}>
      <div
        className="ps-world"
        style={{ width: world.w, height: world.h, transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.s})` }}
      >
        <img className="ps-painting" src={painting} alt="" draggable={false} />
        {children(id)}
      </div>
      <StagePips done={stage.done} total={stage.total} label={t('scene.progress', { n: stage.done, total: stage.total })} />
      <p className="ps-task" role="status" aria-live="polite">
        {say}
      </p>
      {tray && (
        <div className={`ps-tray${stage.over ? ' scene-tray-off' : ''}`} style={{ minHeight: trayHeight }}>
          {tray}
        </div>
      )}
    </div>
  )
}
