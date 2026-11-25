import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import { icon } from './icon'
import thumb from './art/thumb.webp'
import albumScene from './art/cottage.webp'
import stampHedgehog from './art/hedgehog-happy.webp'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'uk-map', skill: 'geography', icon, color: '#3c6382', added: '2026-11-01', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.hedgehog', art: stampHedgehog },
    { name: 'sticker.tea', art: paintedSticker('☕') },
    { name: 'sticker.umbrella', art: paintedSticker('☂') },
    { name: 'sticker.map', art: paintedSticker('🗺') },
    { name: 'sticker.castle', art: paintedSticker('🏰') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
