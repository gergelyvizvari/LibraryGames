import { describe, expect, it } from 'vitest'
import { stickerKey, stickerUrl } from './stickers'

const SOURCES = import.meta.glob<string>(['../games/*/*.{ts,tsx}', '!**/*.test.ts', '!**/index.ts', '!**/icon.tsx'], { query: '?raw', import: 'default', eager: true })
/** Games that draw their emoji as painted stickers (they use kit/stickers): every emoji in their code needs one. */
const PAINTED = [...new Set(Object.entries(SOURCES).filter(([, src]) => src.includes("from '../../kit/stickers'")).map(([path]) => path.split('/')[2]))]
const EMOJI = /\p{Extended_Pictographic}️?(?:‍\p{Extended_Pictographic}️?)*/gu

describe('stickers', () => {
  it('names a sticker by its code points, without the variation selector', () => {
    expect(stickerKey('🦁')).toBe('1f981')
    expect(stickerKey('🌧️')).toBe('1f327')
    expect(stickerKey('🧑‍🚀')).toBe('1f9d1-200d-1f680')
  })

  it('finds the games that use stickers', () => {
    expect(PAINTED).toContain('pair-rush')
  })

  it.each(PAINTED)('has a painted sticker for every emoji of %s', (game) => {
    const code = Object.entries(SOURCES).filter(([path]) => path.startsWith(`../games/${game}/`))
    expect(code.length).toBeGreaterThan(0)
    const missing = code.flatMap(([, src]) => src.match(EMOJI) ?? []).filter((e) => !stickerUrl(e))
    expect(missing).toEqual([])
  })
})
