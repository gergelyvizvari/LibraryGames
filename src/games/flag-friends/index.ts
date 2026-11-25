import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/bg.webp'
import stampPiglet from './art/char-happy.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'flag-friends', skill: 'memory', icon, color: '#e67e22', added: '2026-11-04', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.piglet', art: stampPiglet },
    { name: 'sticker.basket', art: paintedSticker('🧺') },
    { name: 'sticker.strawberry', art: paintedSticker('🍓') },
    { name: 'sticker.kite', art: paintedSticker('🪁') },
    { name: 'sticker.bow', art: paintedSticker('🎀') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
