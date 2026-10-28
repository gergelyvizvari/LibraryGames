import type { GameDef } from '../../kit/types'
import Game from './Game'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'how-many', skill: 'maths', icon, color: '#ffa502', added: '2026-10-27' },
  strings,
  Component: Game,
}

export default game
