import { describe, expect, it } from 'vitest'
import { fitPainting, pickView, placeBubble } from './painted'

const world = { w: 1280, h: 800 }
const focus = { x: 330, y: 180, w: 620, h: 540 }

describe('fitPainting', () => {
  it('covers a wide screen and keeps the focus on it', () => {
    const f = fitPainting(1280, 800, world, focus, 120)
    expect(f.s).toBeCloseTo(1)
    expect(f.x).toBe(0)
    expect(f.y).toBe(0)
  })

  it('shrinks to fit the focus on an upright phone and keeps it in view above the tray', () => {
    const f = fitPainting(390, 800, world, focus, 120)
    expect(f.s).toBeCloseTo(390 / 620)
    const left = f.x + focus.x * f.s
    const right = f.x + (focus.x + focus.w) * f.s
    const bottom = f.y + (focus.y + focus.h) * f.s
    expect(left).toBeGreaterThanOrEqual(-0.01)
    expect(right).toBeLessThanOrEqual(390.01)
    expect(bottom).toBeLessThanOrEqual(800 - 120 + 0.01)
  })

  it('never leaves a gap at the edge of a screen the painting covers', () => {
    const f = fitPainting(1280, 900, world, focus, 120)
    expect(f.x).toBeLessThanOrEqual(0)
    expect(f.x + world.w * f.s).toBeGreaterThanOrEqual(1280 - 0.01)
    expect(f.y).toBeLessThanOrEqual(0)
    expect(f.y + world.h * f.s).toBeGreaterThanOrEqual(900 - 0.01)
  })
})

describe('fitPainting on a tall screen', () => {
  it('hangs the painting from the top', () => {
    const f = fitPainting(390, 844, world, focus, 120)
    expect(f.y).toBe(0)
  })
})

describe('pickView', () => {
  const v = (id: string, w: number, h: number) => ({ id, painting: '', world: { w, h }, focus, ground: '', sayAt: { x: 0, y: 0 } })
  const views = [v('wide', 1280, 800), v('tall', 720, 1280)]
  it('takes the painting shaped most like the screen', () => {
    expect(pickView(views, 1280, 800).id).toBe('wide')
    expect(pickView(views, 390, 844).id).toBe('tall')
    expect(pickView(views, 820, 1180).id).toBe('tall')
    expect(pickView([views[0]], 390, 844).id).toBe('wide')
  })
})

describe('placeBubble', () => {
  const speaker = { x: 300, y: 500, w: 60, h: 120 }
  it('puts the bubble above the head, its tail on the head', () => {
    const p = placeBubble(speaker, 200, 60, 390, 800)
    expect(p.tail).toBe('down')
    expect(p.top + 60 + p.reach).toBeCloseTo(500 + 4.8)
    expect(p.left + p.along).toBeCloseTo(330)
  })
  it('goes beside the head when there is no room above', () => {
    const p = placeBubble({ ...speaker, y: 70 }, 200, 60, 390, 800)
    expect(p.tail).toBe('right')
    expect(p.left + 200).toBeLessThanOrEqual(300 + 60 * 0.12 - 20 + 0.01)
  })
  it('keeps off the things to play with when it can', () => {
    const buttons = [{ x: 0, y: 400, w: 390, h: 90 }]
    const p = placeBubble(speaker, 200, 60, 390, 800, buttons)
    expect(p.top >= 490 || p.top + 60 <= 400).toBe(true)
  })
})
