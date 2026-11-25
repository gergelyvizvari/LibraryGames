import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/pond.webp'
import stampFrog from './art/frog-happy.webp'
import stampPad from './art/pad.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'lily-pads', skill: 'focus', icon, color: '#54a0ff', added: '2026-11-12', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.frog', art: stampFrog },
    { name: 'sticker.pad', art: stampPad },
    { name: 'sticker.ladybird', art: paintedSticker('🐞') },
    { name: 'sticker.butterfly', art: paintedSticker('🦋') },
    { name: 'sticker.blossom', art: paintedSticker('🌸') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
