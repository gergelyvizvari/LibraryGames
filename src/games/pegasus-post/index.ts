import type { GameDef } from '../../kit/types'
import { icon } from './icon'
import thumb from './art/thumb.webp'
import albumScene from './art/sky.webp'
import stampPegasus from './art/pegasus-happy.webp'
import stampLetter from './art/letter.webp'
import stampCloud from './art/cloud.webp'
import stampGate from './art/gate.webp'
import stampGold from './art/cloud-gold.webp'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'pegasus-post', skill: 'spatial', icon, color: '#3f8fd0', added: '2026-11-15', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.pegasus', art: stampPegasus },
    { name: 'sticker.letter', art: stampLetter },
    { name: 'sticker.cloud', art: stampCloud },
    { name: 'sticker.gate', art: stampGate },
    { name: 'sticker.gold', art: stampGold },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
