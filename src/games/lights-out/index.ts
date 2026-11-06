import type { GameDef } from '../../kit/types'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'lights-out', skill: 'reflexes', icon, color: '#e84393', added: '2026-10-26' },
  strings,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
