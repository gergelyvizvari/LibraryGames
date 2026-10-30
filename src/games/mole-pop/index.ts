import type { GameDef } from '../../kit/types'
import Game from './Game'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'mole-pop', skill: 'reflexes', icon, color: '#8395a7', added: '2026-10-27' },
  strings,
  Component: Game,
}

export default game
