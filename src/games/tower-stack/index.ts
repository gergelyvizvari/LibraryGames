import type { GameDef } from '../../kit/types'
import Game from './Game'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'tower-stack', skill: 'reflexes', icon, color: '#ee5253', added: '2026-10-27' },
  strings,
  Component: Game,
}

export default game
