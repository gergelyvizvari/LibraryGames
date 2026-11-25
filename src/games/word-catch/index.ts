import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/square.webp'
import stampFox from './art/fox-happy.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'word-catch', skill: 'language', icon, color: '#1dd1a1', added: '2026-10-26', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.fox', art: stampFox },
    { name: 'sticker.butterfly', art: paintedSticker('🦋') },
    { name: 'sticker.ladybird', art: paintedSticker('🐞') },
    { name: 'sticker.bee', art: paintedSticker('🐝') },
    { name: 'sticker.flower', art: paintedSticker('🌼') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
