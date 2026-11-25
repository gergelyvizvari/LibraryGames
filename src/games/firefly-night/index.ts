import { paintedSticker } from '../../kit/stickers'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/night.webp'
import stampBunny from './art/bunny-happy.webp'
import stampFirefly from './art/fly-lit.webp'
import stampJar from './art/jar.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'firefly-night', skill: 'reflexes', icon, color: '#2b2f5c', added: '2026-11-18', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.bunny', art: stampBunny },
    { name: 'sticker.firefly', art: stampFirefly },
    { name: 'sticker.jar', art: stampJar },
    { name: 'sticker.moon', art: paintedSticker('🌙') },
    { name: 'sticker.star', art: paintedSticker('⭐') },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
