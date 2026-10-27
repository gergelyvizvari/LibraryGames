import type { GameDef } from '../../kit/types'
import Game from './Game'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'rhythm-copy', skill: 'memory', icon: '🥁', color: '#e67e22', added: '2026-10-27' },
  strings,
  Component: Game,
}

export default game
