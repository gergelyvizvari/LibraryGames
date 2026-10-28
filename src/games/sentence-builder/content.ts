import type { Locale } from '../../i18n'

export interface Sentence {
  picture: string
  text: string
}

// Short sentences that match a picture. Grouped by length: 3-4 words, 5-6 words, 7-9 words.
export const sentences: { en: Sentence[] } & Partial<Record<Locale, Sentence[]>> = {
  en: [
    // Short
    { picture: '🐶🦴', text: 'Dogs love bones' },
    { picture: '🐱🥛', text: 'The cat drinks milk' },
    { picture: '🐟🌊', text: 'A fish can swim' },
    { picture: '☀️😎', text: 'The sun is hot' },
    { picture: '🍎🧒', text: 'I like red apples' },
    { picture: '🐦🎶', text: 'Birds sing songs' },
    { picture: '🐸⬆️', text: 'Frogs can jump' },
    { picture: '🌙⭐', text: 'Stars shine at night' },
    { picture: '🐮🥛', text: 'Cows give milk' },
    { picture: '🐝🌸', text: 'Bees love flowers' },
    { picture: '❄️⛄', text: 'Snow is cold' },
    { picture: '🐰🥕', text: 'Rabbits eat carrots' },
    { picture: '🚗💨', text: 'The car is fast' },
    { picture: '🐌🐢', text: 'Snails are slow' },
    { picture: '🍕😋', text: 'Pizza is yummy' },
    { picture: '🌧️💧', text: 'It is raining' },
    { picture: '🐘👂', text: 'Elephants have big ears' },
    { picture: '🦁📣', text: 'The lion roars' },
    { picture: '🎂🎉', text: 'Happy birthday to you' },
    { picture: '🐻🍯', text: 'Bears like honey' },
    { picture: '🌳🍃', text: 'Trees have leaves' },
    { picture: '🐔🥚', text: 'Hens lay eggs' },
    { picture: '🚀⬆️', text: 'Rockets fly high' },
    { picture: '👶😴', text: 'The baby sleeps' },
    { picture: '🦆💦', text: 'Ducks swim in ponds' },
    { picture: '🐒🍌', text: 'Monkeys eat bananas' },
    { picture: '🎈🔴', text: 'My balloon is red' },
    { picture: '🏠❤️', text: 'I love my home' },
    { picture: '🦒📏', text: 'Giraffes are very tall' },
    { picture: '⚽🥅', text: 'We play football' },
    { picture: '🐝🍯', text: 'Bees make sweet honey' },
    { picture: '🍎🌳', text: 'Apples grow on trees' },
    // Medium
    { picture: '🐱🛏️', text: 'The cat is on the bed' },
    { picture: '🐶⚽', text: 'The dog has a ball' },
    { picture: '🐦🌳', text: 'The bird is in the tree' },
    { picture: '🐸💦', text: 'The frog jumps in the pond' },
    { picture: '🚌🏫', text: 'We go to school by bus' },
    { picture: '🌙🌃', text: 'The moon is up at night' },
    { picture: '🐘💧', text: 'The big elephant drinks water' },
    { picture: '🍰👩', text: 'Mum made a cake for me' },
    { picture: '🐙8️⃣', text: 'An octopus has eight arms' },
    { picture: '🦉🌙', text: 'Owls are awake at night' },
    { picture: '🍦☀️', text: 'Ice cream melts in the sun' },
    { picture: '🚒🔥', text: 'The fire truck is red' },
    { picture: '🌻🌞', text: 'Sunflowers turn to face the sun' },
    { picture: '🐌🍃', text: 'The snail eats a green leaf' },
    { picture: '🧦👟', text: 'Put on your socks and shoes' },
    { picture: '📚🏫', text: 'We read books at school' },
    { picture: '🐬🌊', text: 'Dolphins jump out of the water' },
    { picture: '🍓🥣', text: 'I eat strawberries for breakfast' },
    { picture: '🦋🌸', text: 'A butterfly sits on a flower' },
    { picture: '🧼👐', text: 'I wash my hands with soap' },
    { picture: '🐕🌳', text: 'My dog runs in the park' },
    { picture: '🐄🌾', text: 'The cow eats green grass' },
    { picture: '🎁😃', text: 'I got a gift today' },
    { picture: '🌈🌦️', text: 'A rainbow comes after rain' },
    { picture: '🧸🛏️', text: 'My teddy sleeps with me' },
    { picture: '🐿️🌰', text: 'The squirrel hides a nut' },
    { picture: '🎨🖌️', text: 'I paint a big picture' },
    { picture: '🦷✨', text: 'Brush your teeth every day' },
    { picture: '🚂🌉', text: 'The train goes over the bridge' },
    { picture: '🧊🥤', text: 'Ice keeps my drink cold' },
    { picture: '🌧️☂️', text: 'Take your umbrella when it rains' },
    { picture: '🚀🌍', text: 'The rocket flies around the world' },
    { picture: '🚀🌕', text: 'An astronaut walked on the moon' },
    { picture: '🦁👪', text: 'Lions live in big family groups' },
    // Long
    { picture: '🐢🐇', text: 'The slow turtle beat the fast rabbit' },
    { picture: '🐧❄️', text: 'Penguins live where it is very cold' },
    { picture: '🐻🌲', text: 'The brown bear lives in the forest' },
    { picture: '🦊☀️', text: 'The little fox sleeps in the day' },
    { picture: '🐳🌊', text: 'The blue whale is the biggest animal' },
    { picture: '🦕🦴', text: 'Dinosaurs lived a very long time ago' },
    { picture: '🍂🍁', text: 'Leaves fall from the trees in autumn' },
    { picture: '🏖️☀️', text: 'We build sandcastles at the beach in summer' },
    { picture: '🐜🍞', text: 'The tiny ants carry crumbs to their nest' },
    { picture: '🌱💧', text: 'Plants need water and sun to grow' },
    { picture: '🚲⛑️', text: 'Always wear a helmet on your bike' },
    { picture: '🐣🥚', text: 'A baby chick comes out of an egg' },
    { picture: '🎹🎶', text: 'My sister plays the piano every evening' },
    { picture: '🐕🎾', text: 'The happy dog catches the ball in the air' },
    { picture: '🐸🦟', text: 'The green frog catches flies with its tongue' },
    { picture: '🕷️🕸️', text: 'A spider spins a web to catch food' },
    { picture: '🍪🥛', text: 'Grandma gives us cookies and warm milk' },
    { picture: '🌋🔥', text: 'Hot lava comes out of the volcano' },
    { picture: '🦉📖', text: 'The wise old owl reads a book' },
    { picture: '⛵🌊', text: 'The little boat sails across the blue sea' },
    { picture: '🚑🏥', text: 'The ambulance takes sick people to hospital' },
    { picture: '🐪🏜️', text: 'Camels can walk for days without water' },
    { picture: '🐑🧶', text: 'Wool from sheep keeps us warm in winter' },
    { picture: '🎃👻', text: 'We carve pumpkins and dress up as ghosts' },
    { picture: '🦒🍃', text: 'Giraffes use their long necks to reach leaves' },
    { picture: '🐟🎣', text: 'Grandpa caught a big fish at the lake' },
  ],
}

const words = (s: Sentence) => s.text.split(' ').length

/** Few words at low levels, longer sentences later, and the shortest ones drop out at the top. */
export function sentencesForLevel(list: Sentence[], level: number) {
  const [min, max] = level <= 2 ? [3, 4] : level <= 4 ? [3, 6] : level <= 6 ? [5, 7] : [6, 99]
  const pool = list.filter((s) => words(s) >= min && words(s) <= max)
  return pool.length >= 15 ? pool : list
}
