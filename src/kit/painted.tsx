import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useT } from '../i18n'
import { useSize } from './hooks'
import { StagePips } from './scene'
import type { Stage } from './SceneShell'

/**
 * A painted scene: one picture-book painting as the whole background, with the game's characters and things
 * placed on it in the painting's own units (its "world", 1280 × 800 by default). The painting is scaled so the
 * `focus` box (where the play happens) always fits between the task line and the tray, and covers the screen where
 * it can. Where it cannot (the screen's shape is far from the painting's, or the play needs the painting smaller),
 * the painting goes on past its edges as its own mirror image, fading into its ground colour further out, so the
 * screen is never framed by a flat border.
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

/** Room at the top for the back button, the progress pips and the task line under them, until the task line has been
 * measured; a phone held sideways has the pips beside the back button and the task line level with them (see
 * `.ps-task` in styles.css). */
const taskRoom = (h: number) => (h < 500 ? 60 : 116)

/** Space kept between the task line (or the tray) and the play. */
const GAP = 8

/** The tallest a measured strip has been on this screen size: the scene must not jump when a hint takes two lines. */
function useTallest<T extends HTMLElement>(key: string, measure: (el: T) => number) {
  const ref = useRef<T>(null)
  const [tallest, setTallest] = useState<{ key: string; v: number }>({ key, v: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const v = Math.ceil(measure(el))
      setTallest((t) => (t.key !== key ? { key, v } : v > t.v ? { key, v } : t))
    }
    update()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  })
  return [ref, tallest.key === key ? tallest.v : 0] as const
}

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
  const key = `${size.w}x${size.h}`
  // The task line sits under the back button and the progress pips; the play is kept below it, and above the tray.
  const [taskRef, taskBottom] = useTallest<HTMLParagraphElement>(key, (el) => el.offsetTop + el.offsetHeight)
  const [trayRef, trayTall] = useTallest<HTMLDivElement>(key, (el) => el.offsetHeight)
  const top = taskBottom ? taskBottom + GAP : taskRoom(size.h)
  const bottom = tray ? Math.max(trayHeight, trayTall ? trayTall + GAP : 0) : 0
  const fit = fitPainting(size.w, size.h, world, focus, bottom, top)
  return (
    <div ref={ref} className={`scene ps ps-${id} ${className}`} style={{ background: ground }}>
      <Backdrop painting={painting} world={world} focus={focus} fit={fit} w={size.w} h={size.h} />
      <div
        className="ps-world"
        style={{ width: world.w, height: world.h, transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.s})` }}
      >
        <Mirrors painting={painting} world={world} fit={fit} w={size.w} h={size.h} />
        <img className="ps-painting" src={painting} alt="" draggable={false} />
        {children(id)}
      </div>
      <StagePips done={stage.done} total={stage.total} label={t('scene.progress', { n: stage.done, total: stage.total })} />
      <p ref={taskRef} className="ps-task" role="status" aria-live="polite">
        {say}
      </p>
      {tray && (
        <div ref={trayRef} className={`ps-tray${stage.over ? ' scene-tray-off' : ''}`} style={{ minHeight: trayHeight }}>
          {tray}
        </div>
      )}
    </div>
  )
}

/** The edges of the screen the painting does not reach, as -1 (before it), 0 or 1 (after it) on each axis. */
export function uncovered(fit: Fit, world: { w: number; h: number }, w: number, h: number) {
  const sides = (at: number, size: number, screen: number) => [...(at > 0.5 ? [-1] : []), 0, ...(at + size < screen - 0.5 ? [1] : [])]
  const xs = sides(fit.x, world.w * fit.s, w)
  const ys = sides(fit.y, world.h * fit.s, h)
  return xs.flatMap((dx) => ys.map((dy) => [dx, dy] as const)).filter(([dx, dy]) => dx || dy)
}

/** Where the painting leaves part of the screen bare, the same painting softly blurred and big enough to cover it,
 * lined up with the painting around the play, so the room's colours and light go on to the screen's edges. */
function Backdrop({ painting, world, focus, fit, w, h }: { painting: string; world: { w: number; h: number }; focus: Box; fit: Fit; w: number; h: number }) {
  if (!uncovered(fit, world, w, h).length) return null
  const s = Math.max(w / world.w, h / world.h) * 1.06
  const place = (screen: number, size: number, centre: number, at: number, fs: number) =>
    Math.min(0, Math.max(screen - size * s, at + centre * fs - centre * s))
  const cx = focus.x + focus.w / 2
  const cy = focus.y + focus.h / 2
  return (
    <img
      className="ps-backdrop"
      src={painting}
      alt=""
      draggable={false}
      style={{ width: world.w * s, height: world.h * s, left: place(w, world.w, cx, fit.x, fit.s), top: place(h, world.h, cy, fit.y, fit.s) }}
    />
  )
}

/** The painting mirrored a little way past each edge the screen can see, so it has no hard border: each mirror fades
 * out away from the painting into the blurred backdrop. */
function Mirrors({ painting, world, fit, w, h }: { painting: string; world: { w: number; h: number }; fit: Fit; w: number; h: number }) {
  return (
    <>
      {uncovered(fit, world, w, h).map(([dx, dy]) => {
        // The mirror is flipped, so its seam with the painting is its own far edge: it fades from there outwards.
        const fade = (dir: string) => `linear-gradient(${dir}, #000 4%, transparent 28%)`
        const mask = [dx ? fade(dx > 0 ? 'to left' : 'to right') : '', dy ? fade(dy > 0 ? 'to top' : 'to bottom') : ''].filter(Boolean).join(', ')
        return (
          <img
            key={`${dx}${dy}`}
            className="ps-mirror"
            src={painting}
            alt=""
            draggable={false}
            style={{
              // Tucked a hair under the painting so no hairline shows at the seam.
              left: dx * (world.w - 2),
              top: dy * (world.h - 2),
              width: world.w,
              height: world.h,
              transform: `scale(${dx ? -1 : 1}, ${dy ? -1 : 1})`,
              maskImage: mask,
              WebkitMaskImage: mask,
              maskComposite: 'intersect',
              WebkitMaskComposite: 'source-in',
            }}
          />
        )
      })}
    </>
  )
}

/** Places a game's play box (`.pb-box`) at `box` in world units, its content drawn `zoom` times bigger. A transform,
 * not CSS `zoom`, so container-query units inside (a map's `.map-stage`) measure the same in every browser. */
export function pbBoxStyle(box: Box, zoom: number): CSSProperties {
  return { left: box.x, top: box.y, width: box.w / zoom, height: box.h / zoom, transform: `scale(${zoom})`, transformOrigin: '0 0' }
}
