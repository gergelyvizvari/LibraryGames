import type { GameDef } from '../../kit/types'
import Game from './Game'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'color-sort', skill: 'logic', icon: '🧪', color: '#00b894', added: '2026-10-28' },
  strings,
  Component: Game,
}

export default game
