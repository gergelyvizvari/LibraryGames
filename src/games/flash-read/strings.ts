import type { GameStrings } from '../../i18n'

const strings: GameStrings = {
  en: {
    title: 'Flash Read',
    ask: 'What did you read?',
    read: 'Read carefully!',
    howTo: 'A little story flashes one word at a time. Read it, then answer the question. Get it right and the words go faster!',
    story: 'Story',
    speed: 'Words/min',
    score: 'Score',
    wpm: '{wpm}',
    correct: 'Correct!',
    notQuite: 'Not quite! It was: {answer}',
    next: 'Next story',
  },
  hu: {
    title: 'Villámolvasó',
    ask: 'Mit olvastál?',
    read: 'Olvasd figyelmesen!',
    howTo: 'Egy rövid történet villan fel, szóról szóra. Olvasd el, aztán válaszolj a kérdésre! Ha jól válaszolsz, gyorsulnak a szavak.',
    story: 'Történet',
    speed: 'Szó/perc',
    score: 'Pont',
    wpm: '{wpm}',
    correct: 'Helyes!',
    notQuite: 'Nem egészen! A jó válasz: {answer}',
    next: 'Következő történet',
  },
}

export default strings
