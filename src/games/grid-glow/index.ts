import type { GameDef } from '../../kit/types'
import Game from './Game'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'grid-glow', skill: 'memory', icon, color: '#f368e0', added: '2026-10-27' },
  strings,
  Component: Game,
}

export default game
