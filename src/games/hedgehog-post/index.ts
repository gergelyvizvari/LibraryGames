import type { GameDef } from '../../kit/types'
import { icon } from './icon'
import thumb from './art/thumb.webp'
import albumScene from './art/office.webp'
import stampPostman from './art/postman-happy.webp'
import stampLetter from './art/letter.webp'
import stampBox from './art/postbox.webp'
import stampBunny from './art/bunny.webp'
import stampCottage from './art/cottage-rose.webp'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'hedgehog-post', skill: 'logic', icon, color: '#3a6db5', added: '2026-11-11', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.postman', art: stampPostman },
    { name: 'sticker.letter', art: stampLetter },
    { name: 'sticker.box', art: stampBox },
    { name: 'sticker.bunny', art: stampBunny },
    { name: 'sticker.cottage', art: stampCottage },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
