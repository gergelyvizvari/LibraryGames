import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/pond.webp'
import stampFrog from './art/frog-happy.webp'
import stampRed from './art/bell-red.webp'
import stampBlue from './art/bell-blue.webp'
import stampGreen from './art/bell-green.webp'
import stampYellow from './art/bell-yellow.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'sequence-echo', skill: 'memory', icon, color: '#ff6b6b', added: '2026-10-26', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.frog', art: stampFrog },
    { name: 'sticker.red', art: stampRed },
    { name: 'sticker.blue', art: stampBlue },
    { name: 'sticker.green', art: stampGreen },
    { name: 'sticker.yellow', art: stampYellow },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
