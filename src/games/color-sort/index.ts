import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import { icon } from './icon'
import thumb from './art/thumb.webp'
import albumScene from './art/workshop.webp'
import stampOwl from './art/owl-happy.webp'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'color-sort', skill: 'logic', icon, color: '#00b894', added: '2026-10-28', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.owl', art: stampOwl },
    { name: 'sticker.palette', art: paintedSticker('🎨') },
    { name: 'sticker.brush', art: paintedSticker('🖌') },
    { name: 'sticker.crayon', art: paintedSticker('🖍') },
    { name: 'sticker.rainbow', art: paintedSticker('🌈') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
