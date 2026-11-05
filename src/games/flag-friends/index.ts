import type { GameDef } from '../../kit/types'
import Game from './Game'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'flag-friends', skill: 'memory', icon, color: '#e67e22', added: '2026-11-04' },
  strings,
  Component: Game,
}

export default game
