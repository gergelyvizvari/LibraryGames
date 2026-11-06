import type { Locale } from '../../i18n'

export interface Word {
  word: string
  emoji: string
}

/** Words that rhyme with each other. Groups with the same `sound` almost rhyme, so they never trick each other. */
export interface RhymeGroup {
  sound: string
  words: Word[]
}

const g = (sound: string, ...pairs: [string, string][]): RhymeGroup => ({
  sound,
  words: pairs.map(([word, emoji]) => ({ word, emoji })),
})

export const rhymes: Record<Locale, RhymeGroup[]> = {
  en: [
    g('at', ['cat', '🐱'], ['hat', '🎩'], ['bat', '🦇']),
    g('og', ['dog', '🐶'], ['frog', '🐸'], ['log', '🪵']),
    g('ee', ['bee', '🐝'], ['tree', '🌳'], ['key', '🔑']),
    g('ar', ['star', '⭐'], ['car', '🚗'], ['jar', '🫙']),
    g('oon', ['moon', '🌙'], ['spoon', '🥄'], ['balloon', '🎈']),
    g('ake', ['cake', '🎂'], ['snake', '🐍']),
    g('air', ['bear', '🐻'], ['pear', '🍐'], ['chair', '🪑']),
    g('ish', ['fish', '🐟'], ['dish', '🍽️']),
    g('ouse', ['mouse', '🐭'], ['house', '🏠']),
    g('o', ['boat', '⛵'], ['goat', '🐐'], ['coat', '🧥']),
    g('ock', ['sock', '🧦'], ['clock', '🕐'], ['rock', '🪨']),
    g('ing', ['king', '🤴'], ['ring', '💍']),
    g('ed', ['bed', '🛏️'], ['bread', '🍞']),
    g('ug', ['bug', '🐛'], ['mug', '☕']),
    g('ox', ['fox', '🦊'], ['box', '📦']),
    g('all', ['ball', '⚽'], ['wall', '🧱']),
    g('ail', ['snail', '🐌'], ['whale', '🐋'], ['nail', '💅']),
    g('ell', ['bell', '🔔'], ['shell', '🐚']),
    g('i', ['light', '💡'], ['kite', '🪁']),
    g('ain', ['train', '🚂'], ['rain', '🌧️'], ['plane', '✈️']),
    g('un', ['sun', '☀️'], ['run', '🏃']),
    g('en', ['pen', '🖊️'], ['hen', '🐔']),
    g('o', ['nose', '👃'], ['rose', '🌹']),
    g('i', ['tie', '👔'], ['pie', '🥧'], ['eye', '👁️']),
    g('art', ['heart', '❤️'], ['cart', '🛒']),
    g('orn', ['corn', '🌽'], ['horn', '📯']),
  ],
  hu: [
    g('al', ['hal', '🐟'], ['fal', '🧱'], ['dal', '🎵']),
    g('al', ['sál', '🧣'], ['tál', '🥣']),
    g('ű', ['tű', '🪡'], ['fű', '🌿'], ['betű', '🔤']),
    g('ka', ['macska', '🐱'], ['táska', '👜']),
    g('lma', ['alma', '🍎'], ['pálma', '🌴']),
    g('ó', ['ló', '🐴'], ['hó', '❄️'], ['tó', '🏞️'], ['dió', '🌰'], ['rádió', '📻']),
    g('ó', ['pók', '🕷️'], ['csók', '💋']),
    g('éz', ['kéz', '✋'], ['méz', '🍯']),
    g('ap', ['nap', '☀️'], ['kalap', '🎩'], ['csap', '🚰']),
    g('olt', ['hold', '🌙'], ['bolt', '🏪']),
    g('ör', ['kör', '⭕'], ['vödör', '🪣']),
    g('íz', ['víz', '💧'], ['tíz', '🔟']),
    g('ke', ['lepke', '🦋'], ['kecske', '🐐']),
    g('egy', ['hegy', '⛰️'], ['meggy', '🍒']),
    g('ár', ['vár', '🏰'], ['madár', '🐦'], ['pohár', '🥤']),
    g('er', ['egér', '🐭'], ['kenyér', '🍞']),
    g('er', ['eper', '🍓'], ['tenger', '🌊']),
    g('ág', ['virág', '🌸'], ['világ', '🌍']),
    g('ő', ['eső', '🌧️'], ['ernyő', '☂️'], ['csengő', '🔔']),
    g('ék', ['pék', '🧑‍🍳'], ['szék', '🪑']),
    g('ci', ['foci', '⚽'], ['maci', '🧸']),
    g('ej', ['tej', '🥛'], ['fej', '🗣️']),
    g('út', ['kút', '⛲'], ['út', '🛣️']),
    g('ab', ['bab', '🫘'], ['hab', '🫧']),
  ],
}
