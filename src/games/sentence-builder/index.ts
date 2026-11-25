import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/bg.webp'
import stampCrab from './art/char-happy.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'sentence-builder', skill: 'reading', icon, color: '#1e90ff', added: '2026-10-27', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.crab', art: stampCrab },
    { name: 'sticker.shell', art: paintedSticker('🐚') },
    { name: 'sticker.boat', art: paintedSticker('⛵') },
    { name: 'sticker.dolphin', art: paintedSticker('🐬') },
    { name: 'sticker.beach', art: paintedSticker('🏖') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
