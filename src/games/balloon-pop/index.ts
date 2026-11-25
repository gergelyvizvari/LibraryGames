import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/lake.webp'
import stampOtter from './art/otter-happy.webp'
import stampRed from './art/balloon-red.webp'
import stampMint from './art/balloon-mint.webp'
import stampLilac from './art/balloon-lilac.webp'
import stampYellow from './art/balloon-yellow.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'balloon-pop', skill: 'memory', icon, color: '#e8778f', added: '2026-11-13', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.otter', art: stampOtter },
    { name: 'sticker.red', art: stampRed },
    { name: 'sticker.mint', art: stampMint },
    { name: 'sticker.lilac', art: stampLilac },
    { name: 'sticker.yellow', art: stampYellow },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
