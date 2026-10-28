import type { Locale } from '../../i18n'

// Easy-to-type words for kids, shortest first. Many different first letters, so several words can be on screen at once.
export const wordLists: { en: string[] } & Partial<Record<Locale, string[]>> = {
  en: [
    // 3 letters
    'cat', 'dog', 'sun', 'run', 'hat', 'big', 'red', 'fun', 'sky', 'cup', 'map', 'pen', 'box', 'zoo', 'jam', 'bug',
    'ant', 'bee', 'cow', 'egg', 'fox', 'gum', 'hen', 'ice', 'jet', 'key', 'leg', 'mud', 'nut', 'owl', 'pig', 'rug',
    'sea', 'toy', 'van', 'web', 'yes', 'zip', 'art', 'bat', 'car', 'den', 'ear', 'fan', 'gem', 'hop', 'ink', 'jog',
    'kid', 'log', 'mix', 'net', 'oak', 'pie', 'rat', 'six', 'top', 'tub', 'vet', 'wig', 'yak', 'ten', 'two', 'hug',
    // 4 letters
    'fish', 'star', 'moon', 'frog', 'cake', 'jump', 'play', 'book', 'rain', 'tree', 'ball', 'bird', 'milk', 'boat',
    'duck', 'echo', 'farm', 'goat', 'hill', 'idea', 'jazz', 'kite', 'lion', 'mask', 'nest', 'open', 'park', 'quiz',
    'rock', 'sand', 'tent', 'pink', 'vase', 'wind', 'yard', 'zero', 'aunt', 'bell', 'corn', 'drum', 'east', 'fire',
    'gold', 'home', 'iron', 'jelly', 'king', 'leaf', 'mint', 'nose', 'oven', 'pond', 'quack', 'road', 'swim', 'tail',
    'snow', 'view', 'wave', 'yell', 'zoom', 'blue', 'coat', 'desk', 'five', 'girl', 'hand', 'joke', 'lamp', 'nine',
    // 5 letters
    'apple', 'happy', 'tiger', 'pizza', 'robot', 'house', 'green', 'smile', 'cloud', 'dance', 'magic', 'water',
    'beach', 'chair', 'dream', 'eagle', 'fairy', 'grape', 'heart', 'igloo', 'juice', 'koala', 'lemon', 'mouse',
    'night', 'ocean', 'panda', 'queen', 'river', 'snake', 'train', 'uncle', 'voice', 'whale', 'young', 'zebra',
    'angel', 'bread', 'candy', 'daisy', 'earth', 'flute', 'ghost', 'honey', 'icing', 'jolly', 'knife', 'laugh',
    'music', 'nurse', 'olive', 'paint', 'quiet', 'radio', 'sheep', 'toast', 'under', 'video', 'witch', 'yummy',
    // 6+ letters
    'rocket', 'monkey', 'dragon', 'castle', 'banana', 'jungle', 'planet', 'rabbit', 'pirate', 'school',
    'animal', 'bubble', 'cookie', 'donkey', 'eleven', 'forest', 'garden', 'hammer', 'island', 'jacket',
    'kitten', 'ladder', 'market', 'number', 'orange', 'parrot', 'quarter', 'rubber', 'spider', 'turtle',
    'unicorn', 'volcano', 'wizard', 'yellow', 'zipper', 'balloon', 'chicken', 'dolphin', 'giraffe', 'penguin',
    'rainbow', 'teacher', 'library', 'octopus', 'blanket', 'sandwich', 'elephant', 'dinosaur', 'treasure', 'umbrella',
  ],
}

/** Short words at low levels; from level 7 the shortest drop out so high levels feel different. */
export function wordsForLevel(list: string[], level: number) {
  const [min, max] = level <= 2 ? [3, 3] : level <= 4 ? [3, 4] : level <= 6 ? [4, 5] : level <= 8 ? [5, 6] : [5, 99]
  const pool = list.filter((w) => w.length >= min && w.length <= max)
  return pool.length >= 20 ? pool : list
}
