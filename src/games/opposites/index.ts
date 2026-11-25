import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/bg.webp'
import stampLamb from './art/char-happy.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'opposites', skill: 'language', icon, color: '#e15f41', added: '2026-11-06', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.lamb', art: stampLamb },
    { name: 'sticker.sun', art: paintedSticker('☀') },
    { name: 'sticker.moon', art: paintedSticker('🌙') },
    { name: 'sticker.elephant', art: paintedSticker('🐘') },
    { name: 'sticker.balloon', art: paintedSticker('🎈') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
