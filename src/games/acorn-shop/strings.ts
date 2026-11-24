import type { GameStrings } from '../../i18n'

const strings: GameStrings = {
  en: {
    title: 'Acorn Shop',
    howTo: 'Pay the squirrel exactly the price with acorn coins worth 1, 2 and 5. Tap a coin on the counter to take it back.',
    aliases: 'money, coins, shop, change, counting money, pay',
    say: 'This costs {n} acorns. Pay exactly!',
    over: 'That’s more than {n}! Take a coin back.',
    yes: 'Exactly right! Enjoy!',
    coin: 'Acorn coin worth {n}',
    back: 'Take back the coin worth {n}',
  },
  hu: {
    title: 'Makkbolt',
    howTo: 'Fizesd ki pontosan az árat a mókusnak 1, 2 és 5 értékű makkpénzekkel. Ha vissza akarsz venni egy pénzt, koppints rá a pulton.',
    aliases: 'pénz, pénzérme, érme, bolt, vásárlás, fizetés, pénzszámolás',
    say: 'Ez {n} makkba kerül. Fizess pontosan!',
    over: 'Ez már több, mint {n}! Vegyél vissza egyet.',
    yes: 'Pont annyi! Jó étvágyat!',
    coin: '{n} makkos pénz',
    back: 'Visszaveszem: {n} makkos pénz',
  },
}

export default strings
