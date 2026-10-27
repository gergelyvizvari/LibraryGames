import type { GameDef } from '../../kit/types'
import Game from './Game'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'lights-out', skill: 'reflexes', icon: '🚦', color: '#e84393', added: '2026-10-26' },
  strings,
  Component: Game,
}

export default game
