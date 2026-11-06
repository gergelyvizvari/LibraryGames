import type { GameDef } from '../../kit/types'
import Game from './Game'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'river-mountain', skill: 'geography', icon, color: '#16a085', added: '2026-11-05' },
  strings,
  Component: Game,
}

export default game
