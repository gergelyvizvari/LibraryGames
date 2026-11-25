import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/room.webp'
import stampBadger from './art/badger-happy.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'how-many', skill: 'maths', icon, color: '#ffa502', added: '2026-10-27', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.badger', art: stampBadger },
    { name: 'sticker.abacus', art: paintedSticker('🧮') },
    { name: 'sticker.dice', art: paintedSticker('🎲') },
    { name: 'sticker.teddy', art: paintedSticker('🧸') },
    { name: 'sticker.trophy', art: paintedSticker('🏆') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
