import type { GameDef } from '../../kit/types'
import { icon } from './icon'
import { stickers } from './stickers'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'puppy-spots', skill: 'logic', icon, color: '#9b59b6', added: '2026-11-09', scene: true },
  strings,
  stickers,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
