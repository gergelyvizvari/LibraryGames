import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/bg.webp'
import stampChameleon from './art/char-happy.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'stroop-clash', skill: 'focus', icon, color: '#a29bfe', added: '2026-10-26', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.chameleon', art: stampChameleon },
    { name: 'sticker.brush', art: paintedSticker('🖌') },
    { name: 'sticker.palette', art: paintedSticker('🎨') },
    { name: 'sticker.crayon', art: paintedSticker('🖍') },
    { name: 'sticker.picture', art: paintedSticker('🖼') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
