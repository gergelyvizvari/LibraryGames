import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/bg.webp'
import stampWoodpecker from './art/char-happy.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'shape-spin', skill: 'spatial', icon, color: '#ff9f43', added: '2026-10-27', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.woodpecker', art: stampWoodpecker },
    { name: 'sticker.hammer', art: paintedSticker('🔨') },
    { name: 'sticker.ruler', art: paintedSticker('📏') },
    { name: 'sticker.triangle', art: paintedSticker('🔺') },
    { name: 'sticker.chair', art: paintedSticker('🪑') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
