import type { GameDef } from '../../kit/types'
import Game from './Game'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'opposites', skill: 'language', icon, color: '#e15f41', added: '2026-11-06' },
  strings,
  Component: Game,
}

export default game
