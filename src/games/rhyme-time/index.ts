import type { GameDef } from '../../kit/types'
import Game from './Game'
import { icon } from './icon'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'rhyme-time', skill: 'language', icon, color: '#fd79a8', added: '2026-10-30' },
  strings,
  Component: Game,
}

export default game
