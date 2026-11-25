import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/stream.webp'
import stampFrog from './art/frog-happy.webp'
import stampStone from './art/stone.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'number-line', skill: 'maths', icon, color: '#38ada9', added: '2026-11-09', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.frog', art: stampFrog },
    { name: 'sticker.stone', art: stampStone },
    { name: 'sticker.fish', art: paintedSticker('🐟') },
    { name: 'sticker.ladybird', art: paintedSticker('🐞') },
    { name: 'sticker.duck', art: paintedSticker('🦆') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
