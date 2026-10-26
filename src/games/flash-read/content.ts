import type { Locale } from '../../i18n'

export interface Story {
  text: string
  question: string
  /** The first option is the right answer; the game shuffles them. */
  options: [string, string, string]
}

export const stories: { en: Story[] } & Partial<Record<Locale, Story[]>> = {
  en: [
    { text: 'Tom has a red ball. He kicks it over the fence. A big dog brings it back.', question: 'Who brings the ball back?', options: ['A big dog', 'Tom', 'A cat'] },
    { text: 'Mia likes rainy days. She puts on her yellow boots and jumps in every puddle.', question: 'What colour are her boots?', options: ['Yellow', 'Red', 'Blue'] },
    { text: 'The little bird was hungry. It found three worms under a green leaf.', question: 'How many worms did the bird find?', options: ['Three', 'One', 'Five'] },
    { text: 'Grandma baked a cake for Leo. It was chocolate with strawberries on top.', question: 'What was on top of the cake?', options: ['Strawberries', 'Bananas', 'Candles'] },
    { text: 'At night the owl wakes up. It flies over the dark forest looking for food.', question: 'When does the owl wake up?', options: ['At night', 'In the morning', 'At lunch'] },
    { text: 'Sam lost his blue hat at the park. His sister found it under a bench.', question: 'Where was the hat?', options: ['Under a bench', 'In a tree', 'At school'] },
    { text: 'The rocket shot into the sky. It flew past the moon and landed on a pink planet.', question: 'What colour was the planet?', options: ['Pink', 'Green', 'Orange'] },
    { text: 'Ana has two cats and one rabbit. The rabbit is the fastest of them all.', question: 'Which pet is the fastest?', options: ['The rabbit', 'The cats', 'The dog'] },
    { text: 'The frog sat on a lily pad. When a fly came near, it caught it with its long tongue.', question: 'What did the frog catch?', options: ['A fly', 'A fish', 'A leaf'] },
    { text: 'On Monday the class went to the zoo. Everyone loved the funny monkeys the most.', question: 'What did the class love most?', options: ['The monkeys', 'The lions', 'The bus'] },
    { text: 'Ben built a tall tower with ten blocks. His baby brother knocked it down and laughed.', question: 'Who knocked the tower down?', options: ['His baby brother', 'Ben', 'The dog'] },
    { text: 'The snowman had a carrot nose and a red scarf. In spring, he melted away.', question: 'What was his nose made of?', options: ['A carrot', 'A stone', 'A button'] },
    { text: 'Lily planted a tiny seed. She watered it every day, and it grew into a big sunflower.', question: 'What did the seed grow into?', options: ['A sunflower', 'A tree', 'A rose'] },
    { text: 'The pirate ship sailed to a small island. Under the sand, the crew found a box of gold.', question: 'Where was the gold?', options: ['Under the sand', 'In a cave', 'On the ship'] },
    { text: 'Max wanted a pet. His mum said yes, and they brought home a small brown puppy.', question: 'What pet did Max get?', options: ['A puppy', 'A kitten', 'A fish'] },
    { text: 'The train was very long. It had eight carriages and a loud whistle.', question: 'How many carriages did the train have?', options: ['Eight', 'Three', 'Ten'] },
  ],
}
