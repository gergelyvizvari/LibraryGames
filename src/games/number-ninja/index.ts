import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/bg.webp'
import stampPanda from './art/char-happy.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'number-ninja', skill: 'maths', icon, color: '#feca57', added: '2026-10-26', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.panda', art: stampPanda },
    { name: 'sticker.melon', art: paintedSticker('🍉') },
    { name: 'sticker.orange', art: paintedSticker('🍊') },
    { name: 'sticker.suit', art: paintedSticker('🥋') },
    { name: 'sticker.medal', art: paintedSticker('🥇') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
