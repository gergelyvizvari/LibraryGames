import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/bg.webp'
import stampGiraffe from './art/char-happy.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'capital-match', skill: 'geography', icon, color: '#3c6382', added: '2026-10-27', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.giraffe', art: stampGiraffe },
    { name: 'sticker.train', art: paintedSticker('🚂') },
    { name: 'sticker.ticket', art: paintedSticker('🎫') },
    { name: 'sticker.suitcase', art: paintedSticker('🧳') },
    { name: 'sticker.castle', art: paintedSticker('🏰') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
