import { describe, expect, it } from 'vitest'
import { MONSTER_W, sceneLayout } from './layout'

describe('feed the monster scene layout', () => {
  // [room width, room height]: phones upright and on their side, a tablet, a laptop, a big screen.
  const rooms = [[320, 430], [390, 680], [430, 780], [844, 270], [768, 880], [1366, 640], [1920, 950]]

  it.each(rooms)('fits the monster and its speech bubble in a %i × %i room', (w, h) => {
    const l = sceneLayout(w, h)
    const half = (MONSTER_W * l.monster.scale) / 2
    expect(l.monster.x - half).toBeGreaterThanOrEqual(0)
    expect(l.monster.x + half).toBeLessThanOrEqual(w)
    expect(l.monster.feet).toBeLessThan(h)
    // The bubble starts above the head (beside it in a wide room) and stays inside the room.
    expect(h - l.bubble.bottom).toBeLessThanOrEqual(l.monster.top + (l.wide ? 50 * l.monster.scale : 1))
    expect(l.bubble.left).toBeGreaterThanOrEqual(12)
    expect(l.bubble.left + l.bubble.maxWidth).toBeLessThanOrEqual(w)
  })

  it('leaves room for the top bar and the bubble above the monster on ordinary screens', () => {
    rooms.filter(([, h]) => h >= 430).forEach(([w, h]) => expect(sceneLayout(w, h).monster.top, `${w}×${h}`).toBeGreaterThanOrEqual(140))
  })
})
