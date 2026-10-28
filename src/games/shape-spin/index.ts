import type { GameDef } from '../../kit/types'
import Game from './Game'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'shape-spin', skill: 'spatial', icon, color: '#ff9f43', added: '2026-10-27' },
  strings,
  Component: Game,
}

export default game
