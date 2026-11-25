import type { GameDef } from '../../kit/types'
import { icon } from './icon'
import thumb from './art/thumb.webp'
import albumScene from './art/shop.webp'
import stampSquirrel from './art/squirrel-happy.webp'
import stampAcorn from './art/acorn.webp'
import stampHoney from './art/honey.webp'
import stampHedgehog from './art/hedgehog.webp'
import stampJam from './art/jam.webp'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'acorn-shop', skill: 'maths', icon, color: '#f2c14e', added: '2026-11-16', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.squirrel', art: stampSquirrel },
    { name: 'sticker.acorn', art: stampAcorn },
    { name: 'sticker.honey', art: stampHoney },
    { name: 'sticker.hedgehog', art: stampHedgehog },
    { name: 'sticker.jam', art: stampJam },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
