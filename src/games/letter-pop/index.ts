import type { GameDef } from '../../kit/types'
import Game from './Game'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'letter-pop', skill: 'typing', icon, color: '#00d2d3', added: '2026-10-27' },
  strings,
  Component: Game,
}

export default game
