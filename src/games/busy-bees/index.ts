import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/meadow.webp'
import stampBee from './art/bee-happy.webp'
import stampBear from './art/bear-happy.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'busy-bees', skill: 'focus', icon, color: '#6ab04c', added: '2026-11-02', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.bee', art: stampBee },
    { name: 'sticker.bear', art: stampBear },
    { name: 'sticker.sunflower', art: paintedSticker('🌻') },
    { name: 'sticker.flower', art: paintedSticker('🌼') },
    { name: 'sticker.honey', art: paintedSticker('🍯') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
