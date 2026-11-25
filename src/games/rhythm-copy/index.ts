import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/stage.webp'
import stampBear from './art/bear-happy.webp'
import stampDrum from './art/drum.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'rhythm-copy', skill: 'memory', icon, color: '#e67e22', added: '2026-10-27', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.bear', art: stampBear },
    { name: 'sticker.drum', art: stampDrum },
    { name: 'sticker.trumpet', art: paintedSticker('🎺') },
    { name: 'sticker.violin', art: paintedSticker('🎻') },
    { name: 'sticker.piano', art: paintedSticker('🎹') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
