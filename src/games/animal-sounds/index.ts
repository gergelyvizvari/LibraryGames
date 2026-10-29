import type { GameDef } from '../../kit/types'
import Game from './Game'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'animal-sounds', skill: 'memory', icon, color: '#20bf6b', added: '2026-10-29' },
  strings,
  Component: Game,
}

export default game
