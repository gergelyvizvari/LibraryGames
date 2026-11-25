import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/valley.webp'
import stampFox from './art/fox-happy.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'bridge-builder', skill: 'spatial', icon, color: '#8d6e63', added: '2026-11-17', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.fox', art: stampFox },
    { name: 'sticker.log', art: paintedSticker('🪵') },
    { name: 'sticker.hammer', art: paintedSticker('🔨') },
    { name: 'sticker.brick', art: paintedSticker('🧱') },
    { name: 'sticker.bridge', art: paintedSticker('🌉') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
