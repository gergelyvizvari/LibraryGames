import type { GameDef } from '../../kit/types'
import Game from './Game'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'sequence-echo', skill: 'memory', icon, color: '#ff6b6b', added: '2026-10-26' },
  strings,
  Component: Game,
}

export default game
