import type { GameStrings } from '../../i18n'

const strings: GameStrings = {
  en: {
    title: 'Even or Odd?',
    howTo: 'Numbers are falling! Swipe even numbers left and odd numbers right, or tap the basket.',
    score: 'Score',
    combo: 'Combo',
    time: 'Time',
    even: 'Even',
    odd: 'Odd',
    hint: 'Swipe or tap a basket',
    whyEven: '{n} is even: {half} + {half}',
    whyOdd: '{n} is odd: {half} + {half} + 1',
    whyOne: '1 is odd: it has no partner.',
    digitEven: 'The last digit is {d}, so {n} is even.',
    digitOdd: 'The last digit is {d}, so {n} is odd.',
  },
  hu: {
    title: 'Páros-páratlan',
    howTo: 'Hullanak a számok! A párosakat söpörd balra, a páratlanokat jobbra, vagy koppints a kosárra.',
    score: 'Pont',
    combo: 'Kombó',
    time: 'Idő',
    even: 'Páros',
    odd: 'Páratlan',
    hint: 'Söpörd el, vagy koppints egy kosárra!',
    whyEven: '{n} páros: {half} + {half}',
    whyOdd: '{n} páratlan: {half} + {half} + 1',
    whyOne: 'Az 1 páratlan: nincs párja.',
    digitEven: 'Az utolsó számjegy {d}, ezért {n} páros.',
    digitOdd: 'Az utolsó számjegy {d}, ezért {n} páratlan.',
  },
}

export default strings
