import type { GameDef } from '../kit/types'
import flashRead from './flash-read'
import lightsOut from './lights-out'
import numberNinja from './number-ninja'
import pairRush from './pair-rush'
import sequenceEcho from './sequence-echo'
import stroopClash from './stroop-clash'
import typeDefender from './type-defender'
import wordCatch from './word-catch'

// One line per game. New games go at the end.
export const games: GameDef[] = [sequenceEcho, lightsOut, wordCatch, stroopClash, numberNinja, flashRead, pairRush, typeDefender]

export const gameById = (id: string) => games.find((g) => g.meta.id === id)
