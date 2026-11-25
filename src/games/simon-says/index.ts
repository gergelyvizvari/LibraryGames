import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/glade.webp'
import stampBear from './art/bear-happy.webp'
import stampMonkey from './art/monkey.webp'
import stampPenguin from './art/penguin.webp'
import stampElephant from './art/elephant.webp'
import stampLion from './art/lion.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'simon-says', skill: 'focus', icon, color: '#2ed573', added: '2026-10-27', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.bear', art: stampBear },
    { name: 'sticker.monkey', art: stampMonkey },
    { name: 'sticker.penguin', art: stampPenguin },
    { name: 'sticker.elephant', art: stampElephant },
    { name: 'sticker.lion', art: stampLion },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
