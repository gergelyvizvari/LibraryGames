import type { GameDef } from '../../kit/types'
import { icon } from './icon'
import thumb from './art/thumb.webp'
import albumScene from './art/room.webp'
import stampFox from './art/fox-happy.webp'
import stampCup from './art/cup.webp'
import stampBunny from './art/bunny-happy.webp'
import stampOwl from './art/owl-happy.webp'
import stampCake from './art/cake.webp'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'forest-feast', skill: 'logic', icon, color: '#e2607e', added: '2026-11-11', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.fox', art: stampFox },
    { name: 'sticker.cup', art: stampCup },
    { name: 'sticker.bunny', art: stampBunny },
    { name: 'sticker.owl', art: stampOwl },
    { name: 'sticker.cake', art: stampCake },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
