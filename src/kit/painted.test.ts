import { describe, expect, it } from 'vitest'
import { fitPainting, pbBoxStyle, pickView, uncovered } from './painted'

const world = { w: 1280, h: 800 }
const focus = { x: 330, y: 180, w: 620, h: 540 }

describe('fitPainting', () => {
  it('covers a wide screen and keeps the focus on it', () => {
    const f = fitPainting(1280, 800, world, focus, 80)
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
    const f = fitPainting(1280, 900, world, focus, 80)
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

describe('fitPainting keeps the play clear of the task line and in the middle', () => {
  // An iPad held sideways in Safari, with a tall focus: the painting cannot cover the screen.
  const tall = { x: 250, y: 90, w: 860, h: 650 }
  it('never puts the focus under the task line', () => {
    const f = fitPainting(1194, 703, world, tall, 130, 110)
    expect(f.y + tall.y * f.s).toBeGreaterThanOrEqual(110 - 0.01)
    expect(f.y + (tall.y + tall.h) * f.s).toBeLessThanOrEqual(703 - 130 + 0.01)
  })

  it("puts the play's middle in the middle of the screen", () => {
    const f = fitPainting(1194, 703, world, tall, 130, 110, { x: 320, y: 140, w: 520, h: 520 })
    expect(f.x + 580 * f.s).toBeCloseTo(597)
    const g = fitPainting(1280, 800, world, focus, 120, 0, { x: 500, y: 200, w: 200, h: 300 })
    expect(g.x + 600 * g.s).toBeCloseTo(640)
  })

  it('keeps the whole focus on screen even when its middle is far off centre', () => {
    const f = fitPainting(390, 800, world, focus, 120, 0, { x: focus.x, y: 300, w: 20, h: 100 })
    expect(f.x + focus.x * f.s).toBeGreaterThanOrEqual(-0.01)
    expect(f.x + (focus.x + focus.w) * f.s).toBeLessThanOrEqual(390.01)
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


describe('uncovered', () => {
  it('finds no bare edge when the painting covers the screen', () => {
    expect(uncovered(fitPainting(1280, 800, world, focus, 80), world, 1280, 800)).toEqual([])
  })

  it('names the sides and corners a shrunken painting leaves bare', () => {
    const sides = uncovered({ s: 0.5, x: 100, y: 0 }, world, 1280, 800)
    expect(sides).toContainEqual([-1, 0])
    expect(sides).toContainEqual([1, 0])
    expect(sides).toContainEqual([1, 1])
    expect(sides).toContainEqual([0, 1])
    expect(sides).not.toContainEqual([0, -1])
  })
})

describe('pbBoxStyle', () => {
  it('scales the box with a transform so it still fills its world box', () => {
    const st = pbBoxStyle({ x: 270, y: 250, w: 880, h: 540 }, 1.25)
    expect(st).toMatchObject({ left: 270, top: 250, width: 704, height: 432, transform: 'scale(1.25)' })
    expect(st.zoom).toBeUndefined()
  })
})
