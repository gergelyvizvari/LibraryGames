import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import albumScene from './art/farm.webp'
import stampCow from './art/cow.webp'
import stampSheep from './art/sheep.webp'
import stampPig from './art/pig.webp'
import stampDuck from './art/duck.webp'
import stampRooster from './art/rooster.webp'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'animal-sounds', skill: 'memory', icon, color: '#20bf6b', added: '2026-10-29', scene: true, thumb },
  strings,
  // Five painted stamps for the album, stuck on the game's own place.
  stickers: [
    { name: 'sticker.cow', art: stampCow },
    { name: 'sticker.sheep', art: stampSheep },
    { name: 'sticker.pig', art: stampPig },
    { name: 'sticker.duck', art: stampDuck },
    { name: 'sticker.rooster', art: stampRooster },
  ],
  album: albumScene,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
