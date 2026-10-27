import type { GameDef } from '../../kit/types'
import Game from './Game'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'maze-dash', skill: 'logic', icon: '🧀', color: '#b8860b', added: '2026-10-27' },
  strings,
  Component: Game,
}

export default game
