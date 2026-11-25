import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/bg.webp'
import stampSeagull from './art/char-happy.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'type-defender', skill: 'typing', icon, color: '#54a0ff', added: '2026-10-26', scene: true, keyboard: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.seagull', art: stampSeagull },
    { name: 'sticker.shell', art: paintedSticker('🐚') },
    { name: 'sticker.crab', art: paintedSticker('🦀') },
    { name: 'sticker.castle', art: paintedSticker('🏰') },
    { name: 'sticker.crown', art: paintedSticker('👑') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
