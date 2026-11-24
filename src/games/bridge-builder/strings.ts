import type { GameStrings } from '../../i18n'

const strings: GameStrings = {
  en: {
    title: 'Bridge Builder',
    howTo: 'A plank is missing from the forest bridge. Look at the gap and tap the plank that is exactly long enough to close it.',
    aliases: 'measuring, length, size, estimate',
    say: 'Which plank fits the gap in the bridge?',
    short: 'Too short! There would still be a hole.',
    long: 'Too long! It doesn’t fit in the gap.',
    yes: 'It fits! Off we go across the bridge.',
    plank: 'Plank {n}',
  },
  hu: {
    title: 'Hídépítő',
    howTo: 'Hiányzik egy deszka az erdei hídból. Nézd meg a lyukat, és koppints arra a deszkára, amelyik pont belefér!',
    aliases: 'mérés, hosszúság, méret, becslés',
    say: 'Melyik deszka illik pont a lyukba?',
    short: 'Ez túl rövid, maradna egy lyuk!',
    long: 'Ez túl hosszú, nem fér bele a lyukba!',
    yes: 'Pont illik! Mehetünk át a hídon.',
    plank: '{n}. deszka',
  },
}

export default strings
