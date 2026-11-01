import type { GameStrings } from '../../i18n'

const strings: GameStrings = {
  en: {
    title: 'Clock Catch',
    howTo: 'Look at the clock. The short hand shows the hour, the long hand the minutes. Tap the time it shows!',
    score: 'Score',
    caught: 'Caught',
    time: 'Time',
    whatTime: 'What time is it?',
    findClock: 'Which clock shows {time}?',
    yes: 'Yes! It is {time}',
    no: 'Look again: short hand for hours!',
  },
  hu: {
    title: 'Óraleső',
    howTo: 'Nézd meg az órát! A kis mutató az órát mutatja, a nagy a perceket. Koppints a jó időre!',
    score: 'Pont',
    caught: 'Elkapva',
    time: 'Idő',
    whatTime: 'Hány óra van?',
    findClock: 'Melyik óra mutatja ezt: {time}?',
    yes: 'Igen! Most {time} van',
    no: 'Nézd meg újra: a kis mutató az óra!',
  },
}

export default strings
