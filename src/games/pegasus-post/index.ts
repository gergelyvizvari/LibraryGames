import { medals } from '../../kit/SceneShell'
import type { GameDef } from '../../kit/types'
import thumb from './art/thumb.webp'
import { icon } from './icon'
import { stickers } from './stickers'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'pegasus-post', skill: 'spatial', icon, color: '#3f8fd0', added: '2026-11-15', scene: true, thumb },
  strings,
  // Its own drawn stickers first, then the medals for the higher levels.
  stickers: [...stickers, ...medals(icon)],
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
