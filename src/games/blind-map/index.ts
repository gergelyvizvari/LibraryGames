import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/bg.webp'
import stampCaptain from './art/char-happy.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'blind-map', skill: 'geography', icon, color: '#0abde3', added: '2026-10-27', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.captain', art: stampCaptain },
    { name: 'sticker.map', art: paintedSticker('🗺') },
    { name: 'sticker.anchor', art: paintedSticker('⚓') },
    { name: 'sticker.telescope', art: paintedSticker('🔭') },
    { name: 'sticker.boat', art: paintedSticker('⛵') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
