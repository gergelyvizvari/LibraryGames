import type { GameDef } from '../../kit/types'
import { icon } from './icon'
import thumb from './art/thumb.webp'
import albumScene from './art/kitchen.webp'
import stampPurple from './art/monster-happy.webp'
import stampCookie from './art/cookie.webp'
import stampGreen from './art/monster-leaf-happy.webp'
import stampBlue from './art/monster-sky-happy.webp'
import stampTeal from './art/monster-teal-happy.webp'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'feed-monster', skill: 'maths', icon, color: '#6c5ce7', added: '2026-10-28', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.purple', art: stampPurple },
    { name: 'sticker.cookie', art: stampCookie },
    { name: 'sticker.green', art: stampGreen },
    { name: 'sticker.blue', art: stampBlue },
    { name: 'sticker.teal', art: stampTeal },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
