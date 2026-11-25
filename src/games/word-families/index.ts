import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/bg.webp'
import stampPiglet from './art/char-happy.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'word-families', skill: 'language', icon, color: '#4b7bec', added: '2026-11-08', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.piglet', art: stampPiglet },
    { name: 'sticker.carrot', art: paintedSticker('🥕') },
    { name: 'sticker.tomato', art: paintedSticker('🍅') },
    { name: 'sticker.sunflower', art: paintedSticker('🌻') },
    { name: 'sticker.house', art: paintedSticker('🏠') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
