import type { Locale } from '../../i18n'

export interface Word {
  emoji: string
  word: string
}

// Picture words, roughly shortest first. Every emoji is used once so the picture always means one word.
export const words: { en: Word[] } & Partial<Record<Locale, Word[]>> = {
  en: [
    { emoji: '🐱', word: 'cat' }, { emoji: '🐶', word: 'dog' }, { emoji: '☀️', word: 'sun' }, { emoji: '🐷', word: 'pig' },
    { emoji: '🚌', word: 'bus' }, { emoji: '🥚', word: 'egg' }, { emoji: '🦊', word: 'fox' }, { emoji: '🐝', word: 'bee' },
    { emoji: '🐮', word: 'cow' }, { emoji: '🦉', word: 'owl' }, { emoji: '🐜', word: 'ant' }, { emoji: '🦇', word: 'bat' },
    { emoji: '🐔', word: 'hen' }, { emoji: '🚗', word: 'car' }, { emoji: '☕', word: 'cup' }, { emoji: '🎩', word: 'hat' },
    { emoji: '🔑', word: 'key' }, { emoji: '🗺️', word: 'map' }, { emoji: '🖊️', word: 'pen' }, { emoji: '📦', word: 'box' },
    { emoji: '🛏️', word: 'bed' }, { emoji: '🧊', word: 'ice' }, { emoji: '🥧', word: 'pie' }, { emoji: '👂', word: 'ear' },
    { emoji: '👁️', word: 'eye' }, { emoji: '🦵', word: 'leg' }, { emoji: '🚐', word: 'van' }, { emoji: '👜', word: 'bag' },
    { emoji: '🕸️', word: 'web' }, { emoji: '💎', word: 'gem' }, { emoji: '🥜', word: 'nut' }, { emoji: '🐏', word: 'ram' },
    { emoji: '🐟', word: 'fish' }, { emoji: '🐸', word: 'frog' }, { emoji: '🌙', word: 'moon' }, { emoji: '⭐', word: 'star' },
    { emoji: '🍰', word: 'cake' }, { emoji: '🦆', word: 'duck' }, { emoji: '🐻', word: 'bear' }, { emoji: '🌳', word: 'tree' },
    { emoji: '🦁', word: 'lion' }, { emoji: '🐦', word: 'bird' }, { emoji: '🦀', word: 'crab' }, { emoji: '🦌', word: 'deer' },
    { emoji: '🐐', word: 'goat' }, { emoji: '🚢', word: 'ship' }, { emoji: '⛵', word: 'boat' }, { emoji: '⚽', word: 'ball' },
    { emoji: '🔔', word: 'bell' }, { emoji: '📖', word: 'book' }, { emoji: '🥁', word: 'drum' }, { emoji: '🥛', word: 'milk' },
    { emoji: '🌧️', word: 'rain' }, { emoji: '❄️', word: 'snow' }, { emoji: '🌽', word: 'corn' }, { emoji: '🍐', word: 'pear' },
    { emoji: '🌹', word: 'rose' }, { emoji: '🍃', word: 'leaf' }, { emoji: '👟', word: 'shoe' }, { emoji: '🧦', word: 'sock' },
    { emoji: '🧥', word: 'coat' }, { emoji: '💍', word: 'ring' }, { emoji: '✋', word: 'hand' }, { emoji: '🦶', word: 'foot' },
    { emoji: '👃', word: 'nose' }, { emoji: '🚪', word: 'door' }, { emoji: '⛺', word: 'tent' }, { emoji: '🤴', word: 'king' },
    { emoji: '👶', word: 'baby' }, { emoji: '🦴', word: 'bone' }, { emoji: '🐺', word: 'wolf' }, { emoji: '🦢', word: 'swan' },
    { emoji: '🥝', word: 'kiwi' }, { emoji: '🍚', word: 'rice' }, { emoji: '🍲', word: 'soup' }, { emoji: '🚕', word: 'taxi' },
    { emoji: '🚲', word: 'bike' }, { emoji: '🔥', word: 'fire' }, { emoji: '🎁', word: 'gift' }, { emoji: '🪁', word: 'kite' },
    { emoji: '🍎', word: 'apple' }, { emoji: '🐴', word: 'horse' }, { emoji: '🏠', word: 'house' }, { emoji: '🍕', word: 'pizza' },
    { emoji: '🐍', word: 'snake' }, { emoji: '🐯', word: 'tiger' }, { emoji: '🤖', word: 'robot' }, { emoji: '☁️', word: 'cloud' },
    { emoji: '🐑', word: 'sheep' }, { emoji: '🐭', word: 'mouse' }, { emoji: '🦓', word: 'zebra' }, { emoji: '🐫', word: 'camel' },
    { emoji: '🐨', word: 'koala' }, { emoji: '🐼', word: 'panda' }, { emoji: '🦈', word: 'shark' }, { emoji: '🐳', word: 'whale' },
    { emoji: '🐌', word: 'snail' }, { emoji: '🍞', word: 'bread' }, { emoji: '🍇', word: 'grape' }, { emoji: '🍋', word: 'lemon' },
    { emoji: '🍑', word: 'peach' }, { emoji: '🚆', word: 'train' }, { emoji: '✈️', word: 'plane' }, { emoji: '🚚', word: 'truck' },
    { emoji: '⏰', word: 'clock' }, { emoji: '👑', word: 'crown' }, { emoji: '❤️', word: 'heart' }, { emoji: '👻', word: 'ghost' },
    { emoji: '👸', word: 'queen' }, { emoji: '🦷', word: 'tooth' }, { emoji: '🌍', word: 'earth' }, { emoji: '🍬', word: 'candy' },
    { emoji: '🧹', word: 'broom' }, { emoji: '🍉', word: 'melon' }, { emoji: '🚀', word: 'rocket' }, { emoji: '🐒', word: 'monkey' },
    { emoji: '🍌', word: 'banana' }, { emoji: '🐉', word: 'dragon' }, { emoji: '🐢', word: 'turtle' }, { emoji: '🐰', word: 'rabbit' },
    { emoji: '🦜', word: 'parrot' }, { emoji: '🕷️', word: 'spider' }, { emoji: '🍪', word: 'cookie' }, { emoji: '🥕', word: 'carrot' },
    { emoji: '🍒', word: 'cherry' }, { emoji: '🍊', word: 'orange' }, { emoji: '🍅', word: 'tomato' }, { emoji: '🥔', word: 'potato' },
    { emoji: '🌸', word: 'flower' }, { emoji: '🎸', word: 'guitar' }, { emoji: '✏️', word: 'pencil' }, { emoji: '🏰', word: 'castle' },
    { emoji: '🕯️', word: 'candle' }, { emoji: '⚓', word: 'anchor' }, { emoji: '🦎', word: 'lizard' }, { emoji: '🐧', word: 'penguin' },
    { emoji: '🌈', word: 'rainbow' }, { emoji: '🦒', word: 'giraffe' }, { emoji: '🐙', word: 'octopus' }, { emoji: '🐬', word: 'dolphin' },
    { emoji: '🐓', word: 'rooster' }, { emoji: '🎈', word: 'balloon' }, { emoji: '🎺', word: 'trumpet' }, { emoji: '🦞', word: 'lobster' },
    { emoji: '🦄', word: 'unicorn' }, { emoji: '🐹', word: 'hamster' }, { emoji: '🎃', word: 'pumpkin' }, { emoji: '🍿', word: 'popcorn' },
    { emoji: '🧁', word: 'cupcake' }, { emoji: '🌋', word: 'volcano' }, { emoji: '⛄', word: 'snowman' }, { emoji: '🐘', word: 'elephant' },
    { emoji: '🦕', word: 'dinosaur' }, { emoji: '☂️', word: 'umbrella' }, { emoji: '🥪', word: 'sandwich' }, { emoji: '🦘', word: 'kangaroo' },
    { emoji: '🥦', word: 'broccoli' }, { emoji: '🦔', word: 'hedgehog' }, { emoji: '🍄', word: 'mushroom' }, { emoji: '🦩', word: 'flamingo' },
    { emoji: '🐊', word: 'crocodile' }, { emoji: '🍍', word: 'pineapple' }, { emoji: '🦋', word: 'butterfly' }, { emoji: '🍓', word: 'strawberry' },
  ],
}

/**
 * Words for a level: short ones first, and from level 5 the longer ones replace the shortest,
 * so higher levels really are harder instead of just adding to the easy pile.
 */
export function wordsForLevel(list: Word[], level: number) {
  const [min, max] = level <= 2 ? [3, 3] : level <= 4 ? [3, 4] : level <= 6 ? [4, 5] : level <= 8 ? [5, 7] : [6, 99]
  const pool = list.filter((w) => w.word.length >= min && w.word.length <= max)
  return pool.length >= 20 ? pool : list
}
