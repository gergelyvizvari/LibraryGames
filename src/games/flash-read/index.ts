import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/bg.webp'
import stampSeal from './art/char-happy.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'flash-read', skill: 'reading', icon, color: '#48dbfb', added: '2026-10-26', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.seal', art: stampSeal },
    { name: 'sticker.book', art: paintedSticker('📖') },
    { name: 'sticker.shell', art: paintedSticker('🐚') },
    { name: 'sticker.anchor', art: paintedSticker('⚓') },
    { name: 'sticker.whale', art: paintedSticker('🐳') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
