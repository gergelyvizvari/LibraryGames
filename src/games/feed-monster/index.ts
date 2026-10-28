import type { GameDef } from '../../kit/types'
import Game from './Game'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'feed-monster', skill: 'maths', icon: '👾', color: '#6c5ce7', added: '2026-10-28' },
  strings,
  Component: Game,
}

export default game
