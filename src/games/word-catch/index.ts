import { medals } from '../../kit/SceneShell'
import type { GameDef } from '../../kit/types'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'word-catch', skill: 'language', icon, color: '#1dd1a1', added: '2026-10-26', scene: true },
  strings,
  stickers: medals(icon),
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
