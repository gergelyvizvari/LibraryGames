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
import gridGlow from './grid-glow'
import molePop from './mole-pop'
import anagramRace from './anagram-race'
import simonSays from './simon-says'
import howMany from './how-many'
import sentenceBuilder from './sentence-builder'
import letterPop from './letter-pop'
import mazeDash from './maze-dash'
import mirrorMatch from './mirror-match'
import capitalMatch from './capital-match'
import rhythmCopy from './rhythm-copy'
import feedMonster from './feed-monster'
import animalSounds from './animal-sounds'
import colorSort from './color-sort'
import rhymeTime from './rhyme-time'

// One line per game. New games go at the end.
export const games: GameDef[] = [sequenceEcho, lightsOut, wordCatch, stroopClash, numberNinja, flashRead, pairRush, typeDefender,
  shapeSpin, whatNext, oddOne, blindMap, towerStack,
  gridGlow, molePop, anagramRace, simonSays, howMany, sentenceBuilder, letterPop, mazeDash, mirrorMatch, capitalMatch,
  rhythmCopy, feedMonster, colorSort, animalSounds, rhymeTime]

export const gameById = (id: string) => games.find((g) => g.meta.id === id)
