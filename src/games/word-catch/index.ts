import type { GameDef } from '../../kit/types'
import Game from './Game'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'word-catch', skill: 'language', icon, color: '#1dd1a1', added: '2026-10-26' },
  strings,
  Component: Game,
}

export default game
