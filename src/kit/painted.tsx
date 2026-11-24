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

/** How to lay a `world`-sized painting over a `w` × `h` screen. The `play` box (the board, the cards, the baskets:
 * what is tapped and read) goes in the middle of the screen across, and never under the task line (`top` pixels from
 * the top) or the tray (`bottom` pixels from the bottom). The `focus` box (the play and the characters with it) is kept
 * on screen. Where it can, the painting covers the whole screen. */
export function fitPainting(
  w: number,
  h: number,
  world: { w: number; h: number },
  focus: Box,
  bottom = 0,
  top = 0,
  play: Box = focus,
): Fit {
  const room = Math.max(1, h - bottom - top)
  const middle = play.x + play.w / 2
  // Big enough to cover the screen with the play in the middle (but never more than a fifth past plain covering),
  // small enough for the focus to fit on screen and the play between the task line and the tray.
  const cover = Math.max(w / world.w, h / world.h)
  const centred = Math.max(cover, w / 2 / Math.max(1, Math.min(middle, world.w - middle)))
  // The play between the task line and the tray, and the rest of the focus still on screen above and below it.
  const fit = [w / focus.w, h / focus.h, w / play.w, room / play.h]
  const above = play.y - focus.y
  const below = focus.y + focus.h - (play.y + play.h)
  if (above > 0) fit.push((h - bottom) / (above + play.h))
  if (below > 0) fit.push((h - top) / (below + play.h))
  const s = Math.min(centred, cover * 1.2, ...fit)
  const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(lo, hi), Math.max(lo, v))
  const tall = world.h * s
  // Across: the play in the middle of the screen, as long as the whole focus stays on it.
  const x = clamp(w / 2 - middle * s, -focus.x * s, w - (focus.x + focus.w) * s)
  // Down: the play in the middle of its room; a painting taller than the screen keeps covering it, a shorter one hangs
  // from the top. The focus stays on screen, and the play never goes under the task line or the tray.
  const want = tall >= h ? clamp(top + room / 2 - (play.y + play.h / 2) * s, h - tall, 0) : 0
  const onScreen = clamp(want, -focus.y * s, h - (focus.y + focus.h) * s)
  const y = clamp(onScreen, top - play.y * s, h - bottom - (play.y + play.h) * s)
  return { s, x, y }
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
  /** The play and the characters that take part in it: always on screen. */
  focus: Box
  /** What is tapped and read (the board, the cards, the baskets), when it is smaller than the focus: it goes in the
   * middle of the screen, between the task line and the tray (without it, the whole focus does). */
  play?: Box
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
  const { id, painting, world, focus, ground, play } = pickView(views, size.w, size.h)
  const key = `${size.w}x${size.h}`
  // The task line sits under the back button and the progress pips; the play is kept below it, and above the tray.
  const [taskRef, taskBottom] = useTallest<HTMLParagraphElement>(key, (el) => el.offsetTop + el.offsetHeight)
  const [trayRef, trayTall] = useTallest<HTMLDivElement>(key, (el) => el.offsetHeight)
  const top = taskBottom ? taskBottom + GAP : taskRoom(size.h)
  const bottom = tray ? Math.max(trayHeight, trayTall ? trayTall + GAP : 0) : 0
  const fit = fitPainting(size.w, size.h, world, focus, bottom, top, play)
  return (
    <div ref={ref} className={`scene ps ps-${id} ${className}`} style={{ background: ground }}>
      <Backdrop painting={painting} world={world} fit={fit} w={size.w} h={size.h} />
      <div
        className="ps-world"
        style={{ width: world.w, height: world.h, transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.s})` }}
      >
        <img className="ps-painting" src={painting} alt="" draggable={false} style={featherStyle(fit, world, size.w, size.h)} />
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

/** How far (in screen pixels) the painting's own edge fades into the soft backdrop where the screen goes on past it. */
const FEATHER = 36

/** Softens the painting's edges that the screen goes on past, so it melts into the backdrop with no hard border. */
export function featherStyle(fit: Fit, world: { w: number; h: number }, w: number, h: number): CSSProperties | undefined {
  const sides = uncovered(fit, world, w, h).filter(([dx, dy]) => !dx || !dy)
  if (!sides.length) return undefined
  const f = FEATHER / fit.s
  const dir = ([dx, dy]: readonly [number, number]) => (dx < 0 ? 'to right' : dx > 0 ? 'to left' : dy < 0 ? 'to bottom' : 'to top')
  const mask = sides.map((side) => `linear-gradient(${dir(side)}, transparent, #000 ${f}px)`).join(', ')
  return { maskImage: mask, WebkitMaskImage: mask, maskComposite: 'intersect', WebkitMaskComposite: 'source-in' }
}

/** Where the painting leaves part of the screen bare: the painting's own edge drawn out to the screen's edge and
 * softly blurred, so the wall, floor or sky simply goes on (no copies of things in the picture), over a blurred copy of
 * the whole painting for the corners. */
function Backdrop({ painting, world, fit, w, h }: { painting: string; world: { w: number; h: number }; fit: Fit; w: number; h: number }) {
  const sides = uncovered(fit, world, w, h).filter(([dx, dy]) => !dx || !dy)
  if (!sides.length) return null
  const pw = world.w * fit.s
  const ph = world.h * fit.s
  const s = Math.max(w / world.w, h / world.h) * 1.1
  // A thin slice of the painting's edge (this share of it) is drawn out across the bare strip.
  const SLICE = 0.03
  const url = `url("${painting}")`
  return (
    <div className="ps-backdrop" aria-hidden>
      <img
        className="ps-backdrop-all"
        src={painting}
        alt=""
        draggable={false}
        style={{ width: world.w * s, height: world.h * s, left: (w - world.w * s) / 2, top: (h - world.h * s) / 2 }}
      />
      {sides.map(([dx, dy]) => {
        const style: CSSProperties = { backgroundImage: url }
        if (dx) {
          // From the screen's edge to a little inside the painting's (the painting fades over it there).
          const bare = dx < 0 ? fit.x : w - (fit.x + pw)
          const span = bare + FEATHER
          Object.assign(style, {
            left: dx < 0 ? 0 : w - span,
            width: span,
            top: fit.y,
            height: ph,
            backgroundSize: `${span / SLICE}px ${ph}px`,
            backgroundPosition: dx < 0 ? 'left top' : 'right top',
            transform: 'scaleX(-1)',
          })
        } else {
          const bare = dy < 0 ? fit.y : h - (fit.y + ph)
          const span = bare + FEATHER
          Object.assign(style, {
            top: dy < 0 ? 0 : h - span,
            height: span,
            left: fit.x,
            width: pw,
            backgroundSize: `${pw}px ${span / SLICE}px`,
            backgroundPosition: dy < 0 ? 'left top' : 'left bottom',
            transform: 'scaleY(-1)',
          })
        }
        return <div key={`${dx}${dy}`} className="ps-edge" style={style} />
      })}
    </div>
  )
}

/** Places a game's play box (`.pb-box`) at `box` in world units, its content drawn `zoom` times bigger. A transform,
 * not CSS `zoom`, so container-query units inside (a map's `.map-stage`) measure the same in every browser. */
export function pbBoxStyle(box: Box, zoom: number): CSSProperties {
  return { left: box.x, top: box.y, width: box.w / zoom, height: box.h / zoom, transform: `scale(${zoom})`, transformOrigin: '0 0' }
}
