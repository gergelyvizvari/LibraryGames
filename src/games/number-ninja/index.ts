import type { GameDef } from '../../kit/types'
import Game from './Game'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'number-ninja', skill: 'maths', icon, color: '#feca57', added: '2026-10-26' },
  strings,
  Component: Game,
}

export default game
