import type { GameDef } from '../../kit/types'
import Game from './Game'
import strings from './strings'

const game: GameDef = {
  meta: { id: 'stroop-clash', skill: 'focus', icon: '🎨', color: '#a29bfe', added: '2026-10-26' },
  strings,
  Component: Game,
}

export default game
