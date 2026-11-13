import { medals } from '../../kit/SceneShell'
import type { GameDef } from '../../kit/types'
import { icon } from './icon'
import { stickers } from './stickers'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'feed-monster', skill: 'maths', icon, color: '#6c5ce7', added: '2026-10-28', scene: true },
  strings,
  // Its own drawn stickers first, then the medals for the higher levels.
  stickers: [...stickers, ...medals(icon)],
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
