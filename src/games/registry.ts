import type { GameDef } from '../kit/types'
import flashRead from './flash-read'
import lightsOut from './lights-out'
import numberNinja from './number-ninja'
import pairRush from './pair-rush'
import sequenceEcho from './sequence-echo'
import stroopClash from './stroop-clash'
import typeDefender from './type-defender'
import wordCatch from './word-catch'
import shapeSpin from './shape-spin'
import whatNext from './what-next'
import oddOne from './odd-one'
import blindMap from './blind-map'
import towerStack from './tower-stack'

// One line per game. New games go at the end.
export const games: GameDef[] = [sequenceEcho, lightsOut, wordCatch, stroopClash, numberNinja, flashRead, pairRush, typeDefender,
  shapeSpin, whatNext, oddOne, blindMap, towerStack]

export const gameById = (id: string) => games.find((g) => g.meta.id === id)
