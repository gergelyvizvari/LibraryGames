import { medals } from '../../kit/SceneShell'
import type { GameDef } from '../../kit/types'
import { icon } from './icon'
import thumb from './art/thumb.webp'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'country-map', skill: 'geography', icon, color: '#079992', added: '2026-10-31', scene: true, thumb },
  strings,
  stickers: medals(icon),
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
