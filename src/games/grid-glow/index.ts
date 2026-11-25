import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/bg.webp'
import stampTurtle from './art/char-happy.webp'
import stampPad from './art/pad.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'grid-glow', skill: 'memory', icon, color: '#f368e0', added: '2026-10-27', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.turtle', art: stampTurtle },
    { name: 'sticker.pad', art: stampPad },
    { name: 'sticker.frog', art: paintedSticker('🐸') },
    { name: 'sticker.moon', art: paintedSticker('🌙') },
    { name: 'sticker.sparkle', art: paintedSticker('✨') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
