import { clamp } from '../../kit/random'

/** Room kept free at the top for the back button and the stage stars. */
const TOP = 74
/** The monster's size at scale 1, feet at the bottom middle. */
export const MONSTER_H = 264
export const MONSTER_W = 236

/**
 * Where everything stands in the kitchen for a room of `w` × `h` CSS pixels (the screen without the cookie tray).
 * An upright phone gets a tall room with the monster in the middle; a wide window gets more wall on both sides.
 */
export function sceneLayout(w: number, h: number) {
  const wide = w > h * 1.25
  const k = clamp(Math.min(w / (wide ? 780 : 390), h / (wide ? 400 : 590)), 0.7, 1.6)
  const feet = h - 44 * k
  const floorY = h - (wide ? 96 : 124) * k
  // As big as fits under the top bar and the speech bubble, and never wider than the room allows.
  const scale = Math.max(0.45, Math.min(k * (wide ? 0.9 : 1), (feet - TOP - 76) / MONSTER_H, (w * (wide ? 0.5 : 0.72)) / MONSTER_W))
  const x = wide ? w * 0.38 : w * 0.46
  const top = feet - MONSTER_H * scale
  const wainscot = (wide ? 70 : 104) * k
  const win = { w: (wide ? 124 : 108) * k, h: (wide ? 150 : 146) * k, x: 0, y: 0 }
  win.x = wide ? Math.max(24, x - (MONSTER_W * scale) / 2 - win.w - 70 * k) : 26 * k
  win.y = Math.max(TOP + 14, floorY - wainscot - win.h - (wide ? 30 : 110) * k)
  const shelfW = (wide ? 170 : 118) * k
  const shelf = {
    w: shelfW,
    x: wide ? Math.min(w - shelfW - 30 * k, x + (MONSTER_W * scale) / 2 + 150 * k) : w - shelfW - 22 * k,
    y: wide ? floorY - wainscot - 34 * k : floorY - 150 * k,
  }
  // Upright, the bubble sits above the head; in a wide room it goes beside it, clear of the lamp.
  const bubbleLeft = wide ? x + MONSTER_W * scale * 0.3 : clamp(x - 64, 12, Math.max(12, w - 232))
  return {
    wide,
    k,
    floorY,
    wainscot,
    monster: { x, feet, scale, top },
    lampX: wide ? x : w * 0.78,
    win,
    shelf,
    /** The speech bubble grows upwards from here. */
    bubble: { left: bubbleLeft, bottom: h - top + (wide ? -46 * scale : 6), maxWidth: Math.min(300, w - bubbleLeft - 12) },
  }
}

export type SceneLayout = ReturnType<typeof sceneLayout>
