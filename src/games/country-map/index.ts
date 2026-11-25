import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import { icon } from './icon'
import thumb from './art/thumb.webp'
import albumScene from './art/study.webp'
import stampStork from './art/stork-happy.webp'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'country-map', skill: 'geography', icon, color: '#079992', added: '2026-10-31', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.stork', art: stampStork },
    { name: 'sticker.map', art: paintedSticker('🗺') },
    { name: 'sticker.backpack', art: paintedSticker('🎒') },
    { name: 'sticker.church', art: paintedSticker('⛪') },
    { name: 'sticker.castle', art: paintedSticker('🏰') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
