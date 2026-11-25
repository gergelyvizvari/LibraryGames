import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/desk.webp'
import stampMagpie from './art/magpie-happy.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'odd-one', skill: 'focus', icon, color: '#10ac84', added: '2026-10-27', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.magpie', art: stampMagpie },
    { name: 'sticker.key', art: paintedSticker('🔑') },
    { name: 'sticker.coin', art: paintedSticker('🪙') },
    { name: 'sticker.ring', art: paintedSticker('💍') },
    { name: 'sticker.gem', art: paintedSticker('💎') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
