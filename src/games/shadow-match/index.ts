import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/theatre.webp'
import stampRaccoon from './art/raccoon-happy.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'shadow-match', skill: 'spatial', icon, color: '#6c7ae0', added: '2026-11-12', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.raccoon', art: stampRaccoon },
    { name: 'sticker.candle', art: paintedSticker('🕯') },
    { name: 'sticker.ticket', art: paintedSticker('🎟') },
    { name: 'sticker.masks', art: paintedSticker('🎭') },
    { name: 'sticker.star', art: paintedSticker('⭐') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
