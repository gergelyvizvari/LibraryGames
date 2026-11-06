import type { GameDef } from '../../kit/types'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'how-many', skill: 'maths', icon, color: '#ffa502', added: '2026-10-27' },
  strings,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
