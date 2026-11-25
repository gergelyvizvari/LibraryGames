import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/bg.webp'
import stampRobin from './art/char-happy.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'rhyme-time', skill: 'language', icon, color: '#fd79a8', added: '2026-10-30', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.robin', art: stampRobin },
    { name: 'sticker.book', art: paintedSticker('📖') },
    { name: 'sticker.note', art: paintedSticker('🎵') },
    { name: 'sticker.bee', art: paintedSticker('🐝') },
    { name: 'sticker.sunflower', art: paintedSticker('🌻') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
