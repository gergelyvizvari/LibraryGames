import type { GameDef } from '../../kit/types'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'uk-map', skill: 'geography', icon, color: '#3c6382', added: '2026-11-01' },
  strings,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
