import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/library.webp'
import stampMouse from './art/mouse-happy.webp'
import stampCard from './art/cardback.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'pair-rush', skill: 'memory', icon, color: '#ff9ff3', added: '2026-10-26', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.mouse', art: stampMouse },
    { name: 'sticker.card', art: stampCard },
    { name: 'sticker.books', art: paintedSticker('📚') },
    { name: 'sticker.candle', art: paintedSticker('🕯') },
    { name: 'sticker.owl', art: paintedSticker('🦉') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
