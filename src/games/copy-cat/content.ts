import type { Locale } from '../../i18n'

export interface Line {
  text: string
  minLevel: number
  maxLevel: number
}

/** Single words for the youngest, short phrases in the middle, whole sentences at the top. */
const TIERS = { word: [1, 3], phrase: [3, 6], sentence: [6, 10] } as const
const tier = (name: keyof typeof TIERS, ...texts: string[]): Line[] =>
  texts.map((text) => ({ text, minLevel: TIERS[name][0], maxLevel: TIERS[name][1] }))

/** Only letters and single spaces, so every key a child presses is a letter or the space bar. */
export const lines: Record<Locale, Line[]> = {
  en: [
    ...tier('word', 'cat', 'nap', 'milk', 'sun', 'bed', 'toy', 'ball', 'fish', 'mat', 'hat', 'cup', 'dog',
      'box', 'pen', 'egg', 'bee', 'owl', 'fox', 'red', 'map', 'jam', 'bus', 'sock', 'moon'),
    ...tier('phrase', 'a red ball', 'big hat', 'my cat', 'hot milk', 'a soft bed', 'the sun', 'a fat fish', 'blue sky',
      'two cats', 'a tiny mouse', 'warm socks', 'my toy box', 'a pink nose', 'nap time', 'a long tail', 'good night',
      'a green frog', 'ten stars', 'sweet cake', 'a little bird', 'fresh bread', 'a funny hat', 'big paws', 'yellow moon'),
    ...tier('sentence', 'The cat is asleep', 'Do not wake the cat', 'The cat likes warm milk', 'A mouse runs past',
      'The cat dreams of fish', 'Her tail goes swish', 'The sun is on the rug', 'Kittens love to play',
      'The cat has soft paws', 'We read a book in bed', 'The dog barks at the door', 'My cat sleeps all day',
      'The ball rolls under the bed', 'A bird sings in the tree', 'The moon is out tonight', 'I can type quietly',
      'The cat wakes up and yawns', 'Purr says the happy cat', 'Rain taps on the window', 'The kitten chases a string',
      'We have fish for dinner', 'The cat curls up in a ball', 'Tiptoe past the sleeping cat', 'Good cats get a treat'),
  ],
  hu: [
    ...tier('word', 'cica', 'tej', 'nap', 'ágy', 'hal', 'egér', 'labda', 'sapka', 'zokni', 'hold', 'alma', 'kutya',
      'ház', 'méz', 'sál', 'toll', 'dob', 'béka', 'kosár', 'párna', 'tál', 'maci', 'vaj', 'sajt'),
    ...tier('phrase', 'piros labda', 'puha párna', 'meleg tej', 'kis cica', 'nagy kalap', 'kék ég', 'két egér', 'sárga hold',
      'szép álom', 'hosszú farok', 'finom hal', 'zöld béka', 'édes torta', 'jó éjszakát', 'kis madár', 'friss kenyér',
      'vicces sapka', 'puha mancs', 'csíkos zokni', 'tíz csillag', 'rózsaszín orr', 'teli tál', 'kerek gombolyag', 'csendes szoba'),
    ...tier('sentence', 'A cica alszik', 'Ne ébreszd fel a cicát', 'A cica szereti a tejet', 'Egy egér szalad el',
      'A cica halról álmodik', 'Lassan leng a farka', 'Süt a nap a szőnyegre', 'A kiscicák szeretnek játszani',
      'Puha a cica mancsa', 'Az ágyban mesét olvasunk', 'A kutya ugat az ajtónál', 'A cicám egész nap alszik',
      'A labda az ágy alá gurul', 'Egy madár énekel a fán', 'Ma este kint van a hold', 'Csendben gépelek',
      'A cica felébred és ásít', 'Dorombol a boldog cica', 'Kopog az eső az ablakon', 'A kiscica fonalat kerget',
      'Halat eszünk vacsorára', 'A cica gombócba gömbölyödik', 'Lábujjhegyen megyünk el', 'A jó cica jutalmat kap'),
  ],
}

export const linesFor = (list: Line[], level: number) => list.filter((x) => x.minLevel <= level && x.maxLevel >= level)
