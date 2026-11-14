import { medals } from '../../kit/SceneShell'
import type { GameDef } from '../../kit/types'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'odd-sound', skill: 'focus', icon, color: '#5fa8e8', added: '2026-11-14', scene: true },
  strings,
  stickers: medals(icon),
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
