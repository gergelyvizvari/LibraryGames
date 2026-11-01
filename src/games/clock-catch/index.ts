import type { GameDef } from '../../kit/types'
import Game from './Game'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'clock-catch', skill: 'maths', icon, color: '#ff7675', added: '2026-11-01' },
  strings,
  Component: Game,
}

export default game
