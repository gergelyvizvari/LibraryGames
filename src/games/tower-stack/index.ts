import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/site.webp'
import stampBeaver from './art/beaver-happy.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'tower-stack', skill: 'reflexes', icon, color: '#ee5253', added: '2026-10-27', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.beaver', art: stampBeaver },
    { name: 'sticker.log', art: paintedSticker('🪵') },
    { name: 'sticker.hammer', art: paintedSticker('🔨') },
    { name: 'sticker.brick', art: paintedSticker('🧱') },
    { name: 'sticker.castle', art: paintedSticker('🏰') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
