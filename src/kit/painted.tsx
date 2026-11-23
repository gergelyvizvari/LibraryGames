import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useT } from '../i18n'
import { useSize } from './hooks'
import { SpeechBubble, StagePips } from './scene'
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

/** How to lay a `world`-sized painting over a `w` × `h` screen, keeping `focus` in the part above `bottom` pixels. */
export function fitPainting(w: number, h: number, world: { w: number; h: number }, focus: Box, bottom = 0): Fit {
  const room = Math.max(1, h - bottom)
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
    y: tall >= h ? place(h, tall, focus.y + focus.h / 2, room) : Math.min(0, room - (focus.y + focus.h) * s),
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
  /** Where the speech bubble points when the scene has no speaker (see `placeBubble`). */
  sayAt: { x: number; y: number }
}

/** A rectangle on screen, in px from the scene's top left. */
export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

/** Where the speech bubble goes and where its tail points from. */
export interface BubblePlace {
  left: number
  top: number
  /** The side the tail comes out of, and how far along that side its tip is, in px. */
  tail: 'down' | 'left' | 'right'
  along: number
  /** How long the tail is, in px. */
  reach: number
}

/** Room kept clear at the top for the back button and the progress pips, and the tail's length. */
const TOP = 64
const TAIL = 20
const EDGE = 10

const overlap = (a: Rect, b: Rect) =>
  Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y))

/**
 * Puts the speech bubble (w × h) by the speaker (its picture's box on screen), in a scene of `width` × `height`,
 * covering as little as possible of the things to play with (`avoid`) and of the speaker: above the speaker's head
 * with the tail pointing down at it if it can, else beside the head with the tail pointing sideways at it.
 */
export function placeBubble(speaker: Rect, w: number, h: number, width: number, height: number, avoid: Rect[] = []): BubblePlace {
  const headX = speaker.x + speaker.w / 2
  const headY = speaker.y + Math.min(speaker.h * 0.04, 8)
  const faceY = speaker.y + Math.min(speaker.h * 0.2, 60)
  const clampX = (x: number) => Math.max(EDGE, Math.min(x, width - EDGE - w))
  const clampY = (y: number) => Math.max(TOP, Math.min(y, height - EDGE - h))
  const candidates: BubblePlace[] = []
  // Above the head: centred on it, or reaching out to either side with the tail near the bubble's end; raised a
  // little on a longer tail when that keeps it off the things to play with.
  for (const lift of [0, 28, 56]) {
    const top = headY - TAIL - lift - h
    if (top < TOP) break
    for (const left of [headX - w / 2, headX - w + 34, headX - 34]) {
      const x = clampX(left)
      candidates.push({ left: x, top, tail: 'down', along: Math.max(22, Math.min(headX - x, w - 22)), reach: TAIL + lift })
    }
  }
  // Beside the head, either side, from level with the face to a little higher or lower.
  for (const dy of [0, -h / 3, h / 3]) {
    const top = clampY(faceY - h / 2 + dy)
    const along = Math.max(18, Math.min(faceY - top, h - 18))
    candidates.push({ left: clampX(speaker.x + speaker.w * 0.12 - TAIL - w), top, tail: 'right', along, reach: TAIL })
    candidates.push({ left: clampX(speaker.x + speaker.w * 0.88 + TAIL), top, tail: 'left', along, reach: TAIL })
  }
  const body: Rect = { x: speaker.x + speaker.w * 0.15, y: speaker.y, w: speaker.w * 0.7, h: speaker.h }
  const cost = (c: BubblePlace, i: number) => {
    const r = { x: c.left, y: c.top, w, h }
    // A tail that cannot reach the speaker (the bubble was pushed off it by the screen's edge) counts against it.
    const reach = c.tail === 'down' ? Math.abs(c.left + c.along - headX) : c.tail === 'right' ? Math.abs(c.left + w + TAIL - (speaker.x + speaker.w * 0.12)) : Math.abs(c.left - TAIL - (speaker.x + speaker.w * 0.88))
    return avoid.reduce((sum, a) => sum + overlap(r, a), 0) + overlap(r, body) * 2 + reach * 40 + (c.reach - TAIL) * 30 + i
  }
  return candidates.reduce((best, c, i) => (cost(c, i) < cost(best.c, best.i) ? { c, i } : best), { c: candidates[0], i: 0 }).c
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
  /** The character's one sentence. */
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
  const { id, painting, world, focus, ground, sayAt } = pickView(views, size.w, size.h)
  const fit = fitPainting(size.w, size.h, world, focus, tray ? trayHeight : 0)
  const bubbleRef = useRef<HTMLParagraphElement>(null)
  const [place, setPlace] = useState<BubblePlace | null>(null)
  // The bubble goes by the speaker: the scene's character (marked `data-speaker`, or a kit Cast), measured on screen.
  useLayoutEffect(() => {
    const root = ref.current
    const bubble = bubbleRef.current?.firstElementChild ?? bubbleRef.current
    if (!root || !(bubble instanceof HTMLElement)) return
    const box = root.getBoundingClientRect()
    const el = root.querySelector('[data-speaker], .cast')
    let speaker: Rect
    if (el) {
      const r = el.getBoundingClientRect()
      speaker = { x: r.left - box.left, y: r.top - box.top, w: r.width, h: r.height }
    } else {
      speaker = { x: fit.x + sayAt.x * fit.s, y: fit.y + sayAt.y * fit.s, w: 0, h: 0 }
    }
    // The things to play with, so the bubble keeps off them (whole backdrops, half the scene or more, do not count).
    const avoid = [...root.querySelectorAll('.ps-world button, .ps-world input, .ps-world svg, .ps-world .map-box, .ps-world [data-play], .ps-tray button, .ps-tray input')]
      .map((e) => e.getBoundingClientRect())
      .filter((r) => r.width * r.height < box.width * box.height * 0.5)
      .map((r) => ({ x: r.left - box.left, y: r.top - box.top, w: r.width, h: r.height }))
    const next = placeBubble(speaker, bubble.offsetWidth, bubble.offsetHeight, box.width, box.height, avoid)
    // `say` may be new JSX on every render: only a real move re-renders.
    setPlace((now) => (now && now.left === next.left && now.top === next.top && now.tail === next.tail && now.along === next.along && now.reach === next.reach ? now : next))
  }, [say, size.w, size.h, id, fit.x, fit.y, fit.s, sayAt.x, sayAt.y, ref])
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
      <div ref={bubbleRef} className={`ps-say ps-tail-${place?.tail ?? 'down'}`} style={{ left: place?.left ?? 0, top: place?.top ?? 0, visibility: place ? undefined : 'hidden', ['--along' as string]: `${place?.along ?? 0}px`, ['--reach' as string]: `${place?.reach ?? 20}px` }}>
        <SpeechBubble>{say}</SpeechBubble>
      </div>
      {tray && (
        <div className={`ps-tray${stage.over ? ' scene-tray-off' : ''}`} style={{ minHeight: trayHeight }}>
          {tray}
        </div>
      )}
    </div>
  )
}
