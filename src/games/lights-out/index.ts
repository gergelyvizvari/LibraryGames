import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/bg.webp'
import stampRabbit from './art/char-happy.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'lights-out', skill: 'reflexes', icon, color: '#e84393', added: '2026-10-26', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.rabbit', art: stampRabbit },
    { name: 'sticker.lights', art: paintedSticker('🚦') },
    { name: 'sticker.flag', art: paintedSticker('🏁') },
    { name: 'sticker.medal', art: paintedSticker('🥇') },
    { name: 'sticker.trophy', art: paintedSticker('🏆') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
