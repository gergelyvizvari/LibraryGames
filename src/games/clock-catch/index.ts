import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/shop.webp'
import stampOwl from './art/owl-happy.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'clock-catch', skill: 'maths', icon, color: '#ff7675', added: '2026-11-01', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.owl', art: stampOwl },
    { name: 'sticker.alarm', art: paintedSticker('⏰') },
    { name: 'sticker.key', art: paintedSticker('🔑') },
    { name: 'sticker.bell', art: paintedSticker('🔔') },
    { name: 'sticker.mantel', art: paintedSticker('🕰') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
