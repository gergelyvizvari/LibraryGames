import { describe, expect, it } from 'vitest'
import { makeRng } from '../../kit/random'
import strings from './strings'
import { capFor, makeWishes, mixColour, mixRgb, PAINTS, ratio, sameColour, SHADES, tip, wishesFor, type Paint } from './logic'

/** How far apart two colours look, roughly: the distance of their red, green and blue. */
const apart = (a: readonly Paint[], b: readonly Paint[]) => Math.hypot(...mixRgb(a).map((v, k) => v - mixRgb(b)[k]))

describe('rainbow mix', () => {
  it('judges a mix by its proportions, not by its size or order', () => {
    expect(sameColour(['red', 'yellow'], ['yellow', 'red'])).toBe(true)
    expect(sameColour(['red', 'yellow'], ['red', 'red', 'yellow', 'yellow'])).toBe(true)
    expect(sameColour(['red', 'yellow'], ['red', 'red', 'yellow'])).toBe(false)
    expect(sameColour(['red', 'white'], ['red', 'white', 'white'])).toBe(false)
    expect(ratio(['yellow', 'blue', 'yellow'])).toBe('0:2:1:0')
  })

  it('mixes paint the way a paint box does', () => {
    const [r, g, b] = mixRgb(['yellow', 'blue'])
    expect(g).toBeGreaterThan(r)
    expect(g).toBeGreaterThan(b)
    const orange = mixRgb(['red', 'yellow'])
    expect(orange[0]).toBeGreaterThan(orange[1])
    expect(orange[1]).toBeGreaterThan(orange[2])
    const purple = mixRgb(['red', 'blue'])
    expect(purple[1]).toBeLessThan(purple[0])
    expect(purple[1]).toBeLessThan(purple[2])
    // White makes a colour paler, and more white makes it paler still.
    const sum = (m: Paint[]) => mixRgb(m).reduce((a, v) => a + v, 0)
    expect(sum(['red', 'white'])).toBeGreaterThan(sum(['red', 'red', 'white']))
    expect(sum(['red', 'white', 'white'])).toBeGreaterThan(sum(['red', 'white']))
    // More yellow makes a yellower green: more red light in it.
    expect(mixRgb(['yellow', 'yellow', 'blue'])[0]).toBeGreaterThan(mixRgb(['yellow', 'blue'])[0])
    expect(mixColour(['red'])).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('has a recipe, a name and a look of its own for every colour', () => {
    expect(new Set(SHADES.map((s) => s.id)).size).toBe(SHADES.length)
    expect(new Set(SHADES.map((s) => ratio(s.recipe))).size).toBe(SHADES.length)
    for (const s of SHADES) {
      expect(new Set(s.recipe).size).toBeGreaterThan(1)
      expect(s.recipe.length).toBeLessThanOrEqual(capFor(s.from))
      for (const lang of Object.values(strings)) expect(lang[s.id]).toBeTruthy()
      // No two wishes look alike.
      for (const o of SHADES) if (o !== s) expect(apart(s.recipe, o.recipe)).toBeGreaterThan(30)
    }
  })

  it('tells every mix that fits in the bowl apart from the wish unless it is the same colour', () => {
    const mixes: Paint[][] = [[]]
    for (let n = 0; n < 3; n++) for (const m of [...mixes]) if (m.length === n) for (const p of PAINTS) mixes.push([...m, p])
    for (const s of SHADES) for (const m of mixes) if (m.length >= 2 && !sameColour(m, s.recipe)) expect(apart(m, s.recipe), `${s.id} vs ${m.join('+')}`).toBeGreaterThan(30)
  })

  it('asks for different colours in a stage, and new ones as the levels go up', () => {
    const seen = new Set<string>()
    for (let level = 1; level <= 10; level++) {
      const here = new Set<string>()
      for (let seed = 1; seed <= 30; seed++) {
        const wishes = makeWishes(makeRng(seed * 17 + level), level)
        expect(wishes.length).toBe(wishesFor(level))
        expect(new Set(wishes).size).toBe(wishes.length)
        wishes.forEach((w) => {
          expect(w.from).toBeLessThanOrEqual(level)
          expect(w.recipe.length).toBeLessThanOrEqual(capFor(level))
          here.add(w.id)
          seen.add(w.id)
        })
      }
      expect(here.size).toBeGreaterThanOrEqual(level === 1 ? 5 : 8)
    }
    expect(seen.size).toBe(SHADES.length)
  })

  it('gives a tip that leads towards the wish', () => {
    expect(tip(['yellow', 'blue'], ['red', 'yellow'])).toEqual({ kind: 'add', paint: 'blue' })
    expect(tip(['yellow', 'blue'], ['yellow', 'blue', 'white'])).toEqual({ kind: 'drop', paint: 'white' })
    expect(tip(['yellow', 'yellow', 'blue'], ['yellow', 'blue'])).toEqual({ kind: 'amounts' })
  })
})
