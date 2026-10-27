import { clamp } from '../../kit/random'

export interface Block {
  x: number
  w: number
}

/** Width counts as a perfect drop when the edges are within this many % of the block below. */
export const PERFECT = 3

export interface DropResult {
  placed: Block | null
  perfect: boolean
  cut: number
}

/** Drop `moving` onto `below`: the overhang falls off. Perfect drops snap and grow a little back. */
export function drop(moving: Block, below: Block): DropResult {
  if (Math.abs(moving.x - below.x) <= PERFECT) {
    return { placed: { x: below.x, w: Math.min(below.w + 2, 60) }, perfect: true, cut: 0 }
  }
  const left = Math.max(moving.x, below.x)
  const right = Math.min(moving.x + moving.w, below.x + below.w)
  if (right <= left) return { placed: null, perfect: false, cut: moving.w }
  return { placed: { x: left, w: right - left }, perfect: false, cut: moving.w - (right - left) }
}

/** Slide speed in % of width per second. Faster as the tower grows. */
export function speedFor(level: number, floors: number) {
  return clamp(28 + level * 4 + floors * 1.5, 28, 110)
}
