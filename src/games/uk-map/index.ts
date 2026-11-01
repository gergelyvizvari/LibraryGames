import type { GameDef } from '../../kit/types'
import Game from './Game'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'uk-map', skill: 'geography', icon, color: '#3c6382', added: '2026-11-01' },
  strings,
  Component: Game,
}

export default game
