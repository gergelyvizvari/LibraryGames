import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/garden.webp'
import stampMole from './art/mole.webp'
import stampBunny from './art/bunny.webp'
import stampGold from './art/gold.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'mole-pop', skill: 'reflexes', icon, color: '#8395a7', added: '2026-10-27', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.mole', art: stampMole },
    { name: 'sticker.bunny', art: stampBunny },
    { name: 'sticker.carrot', art: paintedSticker('🥕') },
    { name: 'sticker.tulip', art: paintedSticker('🌷') },
    { name: 'sticker.gold', art: stampGold },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
