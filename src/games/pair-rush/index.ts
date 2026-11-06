import type { GameDef } from '../../kit/types'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'pair-rush', skill: 'memory', icon, color: '#ff9ff3', added: '2026-10-26' },
  strings,
  // The game's code is only downloaded when someone opens it.
  load: () => import('./Game'),
}

export default game
