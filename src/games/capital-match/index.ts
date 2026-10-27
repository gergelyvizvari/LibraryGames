import type { GameDef } from '../../kit/types'
import Game from './Game'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'capital-match', skill: 'geography', icon: '🏛️', color: '#3c6382', added: '2026-10-27' },
  strings,
  Component: Game,
}

export default game
