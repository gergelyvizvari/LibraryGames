import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/bg.webp'
import stampFawn from './art/char-happy.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'mirror-match', skill: 'spatial', icon, color: '#c56cf0', added: '2026-10-27', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.fawn', art: stampFawn },
    { name: 'sticker.butterfly', art: paintedSticker('🦋') },
    { name: 'sticker.tulip', art: paintedSticker('🌷') },
    { name: 'sticker.duck', art: paintedSticker('🦆') },
    { name: 'sticker.rainbow', art: paintedSticker('🌈') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
