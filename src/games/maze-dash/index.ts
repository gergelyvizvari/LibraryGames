import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/garden.webp'
import stampMouse from './art/mouse.webp'
import stampCheese from './art/cheese.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'maze-dash', skill: 'logic', icon, color: '#b8860b', added: '2026-10-27', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.mouse', art: stampMouse },
    { name: 'sticker.cheese', art: stampCheese },
    { name: 'sticker.snail', art: paintedSticker('🐌') },
    { name: 'sticker.strawberry', art: paintedSticker('🍓') },
    { name: 'sticker.sunflower', art: paintedSticker('🌻') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
