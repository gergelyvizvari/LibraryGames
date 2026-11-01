import type { GameDef } from '../../kit/types'
import Game from './Game'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'country-map', skill: 'geography', icon, color: '#079992', added: '2026-10-31' },
  strings,
  Component: Game,
}

export default game
