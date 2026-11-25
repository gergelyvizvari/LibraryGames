import type { GameDef } from '../../kit/types'
import { icon } from './icon'
import thumb from './art/thumb.webp'
import albumScene from './art/den.webp'
import stampMama from './art/mama-happy.webp'
import stampChoc from './art/pup-choc-happy.webp'
import stampCream from './art/pup-cream-happy.webp'
import stampGrey from './art/pup-grey-happy.webp'
import stampTan from './art/pup-tan-happy.webp'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'puppy-spots', skill: 'logic', icon, color: '#9b59b6', added: '2026-11-09', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.mama', art: stampMama },
    { name: 'sticker.choc', art: stampChoc },
    { name: 'sticker.cream', art: stampCream },
    { name: 'sticker.grey', art: stampGrey },
    { name: 'sticker.tan', art: stampTan },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
