import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/bg.webp'
import stampMarmot from './art/char-happy.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'river-mountain', skill: 'geography', icon, color: '#16a085', added: '2026-11-05', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.marmot', art: stampMarmot },
    { name: 'sticker.backpack', art: paintedSticker('🎒') },
    { name: 'sticker.pine', art: paintedSticker('🌲') },
    { name: 'sticker.tent', art: paintedSticker('⛺') },
    { name: 'sticker.peak', art: paintedSticker('🏔') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
