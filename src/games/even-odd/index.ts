import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/orchard.webp'
import stampHedgehog from './art/hedgehog-happy.webp'
import stampBasket from './art/basket.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'even-odd', skill: 'maths', icon, color: '#0fb9b1', added: '2026-11-07', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.hedgehog', art: stampHedgehog },
    { name: 'sticker.basket', art: stampBasket },
    { name: 'sticker.apple', art: paintedSticker('🍎') },
    { name: 'sticker.pear', art: paintedSticker('🍐') },
    { name: 'sticker.cherries', art: paintedSticker('🍒') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
