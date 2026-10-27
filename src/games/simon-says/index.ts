import type { GameDef } from '../../kit/types'
import Game from './Game'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'simon-says', skill: 'focus', icon: '🗣️', color: '#2ed573', added: '2026-10-27' },
  strings,
  Component: Game,
}

export default game
