import type { GameDef } from '../../kit/types'
import Game from './Game'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'busy-bees', skill: 'focus', icon, color: '#6ab04c', added: '2026-11-02' },
  strings,
  Component: Game,
}

export default game
