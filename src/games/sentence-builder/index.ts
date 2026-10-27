import type { GameDef } from '../../kit/types'
import Game from './Game'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'sentence-builder', skill: 'reading', icon: '🧱', color: '#1e90ff', added: '2026-10-27' },
  strings,
  Component: Game,
}

export default game
