import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/bg.webp'
import stampGoat from './art/char-happy.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'anagram-race', skill: 'language', icon, color: '#ff6348', added: '2026-10-27', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.goat', art: stampGoat },
    { name: 'sticker.letters', art: paintedSticker('🔤') },
    { name: 'sticker.teddy', art: paintedSticker('🧸') },
    { name: 'sticker.kite', art: paintedSticker('🪁') },
    { name: 'sticker.gift', art: paintedSticker('🎁') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
