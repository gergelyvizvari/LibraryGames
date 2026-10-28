import type { ComponentType } from 'react'
import type { GameStrings, T } from '../i18n'
import type { GameIcon } from './icon'

export const skills = ['memory', 'reflexes', 'language', 'focus', 'maths', 'reading', 'typing', 'logic', 'spatial', 'geography'] as const
export type Skill = (typeof skills)[number]

export interface RoundResult {
  score: number
  /** 0..1, how well the player did. Drives adaptive difficulty: high raises the level, low lowers it. */
  accuracy: number
}

export interface GameProps {
  /** 1..10, adapts after every round. */
  level: number
  /** Random seed for this round. Same seed means the same round (used by the daily challenge). */
  seed: number
  /** Translate a key from the game's own `strings.ts`. */
  t: T
  /** Call exactly once when the round is over. */
  onFinish: (result: RoundResult) => void
}

export interface GameMeta {
  /** Folder name, kebab-case. Also the URL: #/play/<id>. */
  id: string
  skill: Skill
  /** Drawn sticker icon from the game's `icon.tsx`, see "Icons" in ADDING_A_GAME.md. */
  icon: GameIcon
  /** Card colour (CSS colour). */
  color: string
  /** ISO date the game was added. Newest games are marked "New". */
  added: string
}

export interface GameDef {
  meta: GameMeta
  /** Must contain at least `title`, `howTo` (one or two short sentences) for `en`. */
  strings: GameStrings
  Component: ComponentType<GameProps>
}
