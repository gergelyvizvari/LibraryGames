import type { Locale } from '../../i18n'

export interface Story {
  /** 1: one or two short sentences, 2: a bit longer, 3: longer stories with a "why" or "what happened next" question. */
  tier: 1 | 2 | 3
  text: string
  question: string
  /** The first option is the right answer; the game shuffles them. */
  options: [string, string, string]
}

export const stories: { en: Story[] } & Partial<Record<Locale, Story[]>> = {
  en: [
    // Tier 1
    { tier: 1, text: 'Tom has a red ball. He kicks it over the fence. A big dog brings it back.', question: 'Who brings the ball back?', options: ['A big dog', 'Tom', 'A cat'] },
    { tier: 1, text: 'Mia likes rainy days. She puts on her yellow boots and jumps in every puddle.', question: 'What colour are her boots?', options: ['Yellow', 'Red', 'Blue'] },
    { tier: 1, text: 'The little bird was hungry. It found three worms under a green leaf.', question: 'How many worms did the bird find?', options: ['Three', 'One', 'Five'] },
    { tier: 1, text: 'Grandma baked a cake for Leo. It was chocolate with strawberries on top.', question: 'What was on top of the cake?', options: ['Strawberries', 'Bananas', 'Candles'] },
    { tier: 1, text: 'At night the owl wakes up. It flies over the dark forest looking for food.', question: 'When does the owl wake up?', options: ['At night', 'In the morning', 'At lunch'] },
    { tier: 1, text: 'Sam lost his blue hat at the park. His sister found it under a bench.', question: 'Where was the hat?', options: ['Under a bench', 'In a tree', 'At school'] },
    { tier: 1, text: 'The rocket shot into the sky. It flew past the moon and landed on a pink planet.', question: 'What colour was the planet?', options: ['Pink', 'Green', 'Orange'] },
    { tier: 1, text: 'Ana has two cats and one rabbit. The rabbit is the fastest of them all.', question: 'Which pet is the fastest?', options: ['The rabbit', 'The cats', 'The dog'] },
    { tier: 1, text: 'The frog sat on a lily pad. When a fly came near, it caught it with its long tongue.', question: 'What did the frog catch?', options: ['A fly', 'A fish', 'A leaf'] },
    { tier: 1, text: 'On Monday the class went to the zoo. Everyone loved the funny monkeys the most.', question: 'What did the class love most?', options: ['The monkeys', 'The lions', 'The bus'] },
    { tier: 1, text: 'Ben built a tall tower with ten blocks. His baby brother knocked it down and laughed.', question: 'Who knocked the tower down?', options: ['His baby brother', 'Ben', 'The dog'] },
    { tier: 1, text: 'The snowman had a carrot nose and a red scarf. In spring, he melted away.', question: 'What was his nose made of?', options: ['A carrot', 'A stone', 'A button'] },
    { tier: 1, text: 'Lily planted a tiny seed. She watered it every day, and it grew into a big sunflower.', question: 'What did the seed grow into?', options: ['A sunflower', 'A tree', 'A rose'] },
    { tier: 1, text: 'The pirate ship sailed to a small island. Under the sand, the crew found a box of gold.', question: 'Where was the gold?', options: ['Under the sand', 'In a cave', 'On the ship'] },
    { tier: 1, text: 'Max wanted a pet. His mum said yes, and they brought home a small brown puppy.', question: 'What pet did Max get?', options: ['A puppy', 'A kitten', 'A fish'] },
    { tier: 1, text: 'The train was very long. It had eight carriages and a loud whistle.', question: 'How many carriages did the train have?', options: ['Eight', 'Three', 'Ten'] },
    { tier: 1, text: 'Zoe has a green kite. On windy days she flies it on the hill.', question: 'Where does Zoe fly her kite?', options: ['On the hill', 'At the beach', 'In the garden'] },
    { tier: 1, text: 'The cow lives on a farm. Every morning the farmer gets milk from her.', question: 'Where does the cow live?', options: ['On a farm', 'In a zoo', 'In a forest'] },
    { tier: 1, text: 'Dad made soup for dinner. It was hot, so Ella blew on her spoon.', question: 'Why did Ella blow on her spoon?', options: ['The soup was hot', 'It was dirty', 'She was cold'] },
    { tier: 1, text: 'A little duck swam across the pond. Five baby ducks swam behind her.', question: 'How many baby ducks were there?', options: ['Five', 'Two', 'Seven'] },
    { tier: 1, text: 'Noah got new shoes. They were blue with white stars and they lit up.', question: 'What was on the shoes?', options: ['White stars', 'Red dots', 'Green stripes'] },
    { tier: 1, text: 'The bear was sleepy. It went into its cave and slept all winter.', question: 'Where did the bear sleep?', options: ['In its cave', 'In a tree', 'By the river'] },
    // Tier 2
    { tier: 2, text: 'It was Amy’s birthday. Her friends came to the party with presents. Her best gift was a purple bike with a bell. She rode it around the garden all afternoon.', question: 'What colour was the bike?', options: ['Purple', 'Pink', 'Silver'] },
    { tier: 2, text: 'Jack and his dad went fishing at the lake. They sat in a little boat for hours. Jack caught a small fish, but his dad caught only an old boot.', question: 'What did Dad catch?', options: ['An old boot', 'A big fish', 'A frog'] },
    { tier: 2, text: 'The squirrel was busy in autumn. It collected nuts and hid them in a hole in the old oak tree. In winter, it had plenty to eat.', question: 'Where did the squirrel hide its nuts?', options: ['In the oak tree', 'Under a rock', 'In a nest'] },
    { tier: 2, text: 'Emma wanted to bake cookies. She mixed flour, butter, sugar and eggs. Then she added chocolate chips. The kitchen smelled wonderful.', question: 'What did Emma add at the end?', options: ['Chocolate chips', 'Nuts', 'Raisins'] },
    { tier: 2, text: 'A tiny turtle hatched on the beach at night. It crawled across the sand towards the sea. The moon showed it the way.', question: 'What showed the turtle the way?', options: ['The moon', 'A lamp', 'The sun'] },
    { tier: 2, text: 'Oliver forgot his lunch at home. His friend Ravi shared his sandwich and an apple with him. Oliver said thank you and gave Ravi a sticker.', question: 'What did Oliver give Ravi?', options: ['A sticker', 'A cookie', 'A pencil'] },
    { tier: 2, text: 'The fire engine raced down the street with its siren on. A cat was stuck high up in a tree. A firefighter climbed a ladder and carried it down.', question: 'Where was the cat stuck?', options: ['Up a tree', 'On a roof', 'In a box'] },
    { tier: 2, text: 'Grandpa has a garden full of vegetables. He grows carrots, tomatoes and big green cabbages. Sophie helps him pick them every Saturday.', question: 'When does Sophie help Grandpa?', options: ['Every Saturday', 'Every Monday', 'Every evening'] },
    { tier: 2, text: 'The class planted beans in paper cups. They put the cups on the windowsill. After a week, little green shoots came out of the soil.', question: 'Where did they put the cups?', options: ['On the windowsill', 'In a cupboard', 'Outside'] },
    { tier: 2, text: 'A small dragon could not breathe fire. Instead, it blew bubbles. The other dragons laughed, until the bubbles put out a fire in the forest.', question: 'What could the small dragon blow?', options: ['Bubbles', 'Fire', 'Snow'] },
    { tier: 2, text: 'Lucy’s dog Biscuit loves the beach. He chases the waves and digs big holes in the sand. On the way home he always falls asleep in the car.', question: 'What is the dog’s name?', options: ['Biscuit', 'Lucy', 'Buddy'] },
    { tier: 2, text: 'The library had a new book about space. Leo read about the planets. His favourite was Saturn because of its beautiful rings.', question: 'Which planet does Leo like best?', options: ['Saturn', 'Mars', 'Earth'] },
    { tier: 2, text: 'It snowed all night. In the morning, Mia and her brother built a snowman. They gave him a hat, a scarf and two stones for eyes.', question: 'What did they use for eyes?', options: ['Two stones', 'Two buttons', 'Two carrots'] },
    { tier: 2, text: 'A clever crow was thirsty. The water in the jug was too low to reach. The crow dropped pebbles in until the water came up to the top.', question: 'What did the crow drop in the jug?', options: ['Pebbles', 'Leaves', 'Seeds'] },
    { tier: 2, text: 'The circus came to town. There were clowns, jugglers and a man on stilts. Ben laughed the most when a clown slipped on a banana.', question: 'What did the clown slip on?', options: ['A banana', 'Some water', 'A ball'] },
    { tier: 2, text: 'Every night, Nora reads a story to her little sister. Tonight it was about a princess who could talk to animals. Her sister fell asleep before the end.', question: 'Who could talk to animals?', options: ['A princess', 'Nora', 'A wizard'] },
    { tier: 2, text: 'The bus was late, so Tim and his mum walked to school. On the way they saw a hedgehog crossing the path. Tim was not late after all.', question: 'What animal did they see?', options: ['A hedgehog', 'A rabbit', 'A fox'] },
    { tier: 2, text: 'A brown cow, a white sheep and a pink pig lived on Old Farm. One day the gate was open. The pig was the first to run out into the field.', question: 'Who ran out first?', options: ['The pig', 'The cow', 'The sheep'] },
    { tier: 2, text: 'Ella’s tooth was wobbly for days. At lunch she bit an apple and the tooth came out. That night she put it under her pillow.', question: 'What did Ella bite?', options: ['An apple', 'A carrot', 'A sandwich'] },
    { tier: 2, text: 'The band played in the park on Sunday. Sam liked the big drum best because it was so loud. His sister liked the trumpet.', question: 'Which instrument did Sam like best?', options: ['The big drum', 'The trumpet', 'The guitar'] },
    // Tier 3
    { tier: 3, text: 'Mila wanted to win the school race. Every evening for a month she ran around the park with her dad. On the day of the race she was nervous, but she remembered her practice and finished first.', question: 'Why did Mila win?', options: ['She practised a lot', 'She had new shoes', 'The others were sick'] },
    { tier: 3, text: 'The wind blew Leo’s hat into the river. He ran along the bank, but the water was too fast. Then a duck swam over, pushed the hat to the shore, and quacked as if to say: here you are!', question: 'Who helped Leo get his hat back?', options: ['A duck', 'His dad', 'A fisherman'] },
    { tier: 3, text: 'When the lights went out, the whole house was dark. Dad found a torch, and Mum lit some candles. Instead of watching TV, the family played games and told stories. Everyone agreed it was the best evening of the week.', question: 'What did the family do in the dark?', options: ['Played games and told stories', 'Went to bed', 'Watched TV'] },
    { tier: 3, text: 'Sara’s little brother was scared of the dark. Sara gave him her old night light shaped like a moon. The next morning he said he had slept all night without waking up once.', question: 'What did Sara give her brother?', options: ['A night light', 'A teddy bear', 'A blanket'] },
    { tier: 3, text: 'A family of beavers built a dam across the stream. They used sticks, stones and mud. Behind the dam, the water became a quiet pond where fish, frogs and ducks came to live.', question: 'What happened behind the dam?', options: ['A pond formed', 'The stream dried up', 'A forest grew'] },
    { tier: 3, text: 'Ollie found a lost wallet on the pavement. Inside there was money and a card with a name and address. He and his mum took it back. The owner was so happy that she baked them a pie.', question: 'Why did the owner bake a pie?', options: ['To say thank you', 'It was her birthday', 'She was a baker'] },
    { tier: 3, text: 'The class was going on a trip to the mountains. Their teacher told them to bring warm coats. Jake forgot his, but it did not matter, because his friend had packed an extra jumper.', question: 'What did Jake forget?', options: ['His warm coat', 'His lunch', 'His hat'] },
    { tier: 3, text: 'Every spring, swallows fly thousands of kilometres from Africa to Europe. They build nests of mud under roofs and bridges. In autumn, when it gets cold, they fly all the way back again.', question: 'Why do the swallows fly back in autumn?', options: ['It gets cold', 'They are hungry', 'Their nests break'] },
    { tier: 3, text: 'Ava’s plant looked sad and droopy. She checked the soil and it was dry as dust. She gave it a big drink of water and moved it into the sunshine. By the next day it was standing tall again.', question: 'Why was the plant droopy?', options: ['It needed water', 'It was too hot', 'It was too big'] },
    { tier: 3, text: 'Two friends both wanted the last swing. Instead of arguing, they took turns counting to twenty. Soon other children joined in the counting, and the playground was full of laughter.', question: 'How did the friends share the swing?', options: ['They took turns', 'They both sat on it', 'They asked a teacher'] },
    { tier: 3, text: 'The museum had a huge dinosaur skeleton. Its bones were taller than a house. A guide explained that it ate only plants, even though it looked scary. Finn decided he would be a scientist one day.', question: 'What did the dinosaur eat?', options: ['Only plants', 'Fish', 'Other dinosaurs'] },
    { tier: 3, text: 'Grandma’s glasses were missing. Everyone searched the kitchen, the garden and the car. In the end, little Rosie pointed and giggled. The glasses were on top of Grandma’s head all along!', question: 'Where were the glasses?', options: ['On Grandma’s head', 'In the car', 'In the garden'] },
    { tier: 3, text: 'The orchestra was about to start when the violinist broke a string. The audience waited quietly while she fixed it. When she finally played, the music was so beautiful that people stood up and clapped.', question: 'What broke?', options: ['A violin string', 'A drum', 'A chair'] },
    { tier: 3, text: 'Ben’s goldfish, Bubbles, swam round and round in a small bowl. Ben saved his pocket money for three months. Then he bought a big tank with plants and a tiny castle, and Bubbles had a new home.', question: 'How did Ben pay for the tank?', options: ['He saved pocket money', 'Mum bought it', 'He won it'] },
    { tier: 3, text: 'Bees visit flowers to collect a sweet juice called nectar. Back in the hive, they turn it into honey. While they fly from flower to flower, they carry pollen, which helps new fruit to grow.', question: 'What do bees make from nectar?', options: ['Honey', 'Wax', 'Pollen'] },
    { tier: 3, text: 'The sky turned dark grey and the wind grew stronger. Farmer Joe hurried to bring the sheep into the barn. Just as the last sheep went inside, the rain began to pour down.', question: 'Why did Joe hurry?', options: ['A storm was coming', 'It was dinner time', 'The sheep were hungry'] },
    { tier: 3, text: 'Lena was the new girl in class and she felt shy. At break time, Maya asked her to play hopscotch. By the end of the week, they were best friends and sat together every day.', question: 'How did Lena feel at first?', options: ['Shy', 'Angry', 'Sleepy'] },
    { tier: 3, text: 'A big ship needed to find its way in the fog. Up on the cliff, the lighthouse keeper switched on the bright lamp. The sailors saw the light, steered away from the rocks and reached the harbour safely.', question: 'What helped the ship in the fog?', options: ['The lighthouse', 'The moon', 'A map'] },
  ],
}

/** Easy stories at low levels, longer ones mixed in as the level rises. */
export function storiesForLevel(list: Story[], level: number) {
  const tiers = level <= 3 ? [1] : level <= 5 ? [1, 2] : level <= 7 ? [2, 3] : [3]
  const pool = list.filter((s) => tiers.includes(s.tier))
  return pool.length >= 8 ? pool : list
}
