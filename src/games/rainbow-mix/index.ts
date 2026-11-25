import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/meadow.webp'
import stampUnicorn from './art/unicorn-happy.webp'
import stampRed from './art/pot-red.webp'
import stampPegasus from './art/pegasus-happy.webp'
import stampBlue from './art/pot-blue.webp'
import stampAlicorn from './art/alicorn-happy.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'rainbow-mix', skill: 'logic', icon, color: '#c9628f', added: '2026-11-15', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.unicorn', art: stampUnicorn },
    { name: 'sticker.red', art: stampRed },
    { name: 'sticker.pegasus', art: stampPegasus },
    { name: 'sticker.blue', art: stampBlue },
    { name: 'sticker.alicorn', art: stampAlicorn },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
