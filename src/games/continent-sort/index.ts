import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/bg.webp'
import stampKoala from './art/char-happy.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'continent-sort', skill: 'geography', icon, color: '#8e44ad', added: '2026-11-03', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.koala', art: stampKoala },
    { name: 'sticker.globe', art: paintedSticker('🌍') },
    { name: 'sticker.kangaroo', art: paintedSticker('🦘') },
    { name: 'sticker.elephant', art: paintedSticker('🐘') },
    { name: 'sticker.penguin', art: paintedSticker('🐧') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
