import type { GameDef } from '../../kit/types'
import Game from './Game'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'odd-one', skill: 'focus', icon: '🔍', color: '#10ac84', added: '2026-10-27' },
  strings,
  Component: Game,
}

export default game
