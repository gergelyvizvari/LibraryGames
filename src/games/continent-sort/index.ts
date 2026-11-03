import type { GameDef } from '../../kit/types'
import Game from './Game'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'continent-sort', skill: 'geography', icon, color: '#8e44ad', added: '2026-11-03' },
  strings,
  Component: Game,
}

export default game
