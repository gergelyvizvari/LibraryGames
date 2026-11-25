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
  /**
   * A scene game fills the whole screen with its own drawn scene and is played in short stages without a clock.
   * The frame shows no intro card, countdown or score: see "Scene games" in ADDING_A_GAME.md.
   */
  scene?: boolean
  /** Played by typing on a keyboard: hidden on phones and tablets, where the on-screen keyboard would cover the scene. */
  keyboard?: boolean
  /** A small painting of the game's scene with its character (art/thumb.webp), shown on the card in the games list. */
  thumb?: string
}

/** A sticker a player collects by finishing a stage of a scene game, shown as a painted stamp in the album. */
export interface Sticker {
  /** Key of the stamp's name in the game's `strings.ts`. */
  name: string
  /** URL of its painting: a cut-out from the game's `art/` folder, or `paintedSticker('🗺')` from kit/stickers. */
  art: string
}

export interface GameDef {
  meta: GameMeta
  /** Must contain at least `title`, `howTo` (one or two short sentences) for `en`. */
  strings: GameStrings
  /** Loads the game's component on demand: `() => import('./Game')`, so the home screen stays small. */
  load: () => Promise<{ default: ComponentType<GameProps> }>
  /** Scene games only: five stamps, handed out one per finished stage, in this order, until all are collected. */
  stickers?: Sticker[]
  /** The game's painted place (its `art/` background): the stamps of its album page are stuck on it. */
  album?: string
}
