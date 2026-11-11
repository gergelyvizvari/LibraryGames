import { medals } from '../../kit/SceneShell'
import type { GameDef } from '../../kit/types'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'copy-cat', skill: 'typing', icon, color: '#4a69bd', added: '2026-11-11', scene: true, keyboard: true },
  strings,
  stickers: medals(icon),
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
