import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/nook.webp'
import stampOwl from './art/owl-happy.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'story-order', skill: 'reading', icon, color: '#fa8231', added: '2026-11-10', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.owl', art: stampOwl },
    { name: 'sticker.book', art: paintedSticker('📖') },
    { name: 'sticker.candle', art: paintedSticker('🕯') },
    { name: 'sticker.fairy', art: paintedSticker('🧚') },
    { name: 'sticker.dragon', art: paintedSticker('🐉') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
