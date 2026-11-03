// Every board picks one theme, so each new board looks fresh. Each theme has at least 10 faces (the biggest board).
export const themes = [
    ['🐶', '🐱', '🦊', '🐼', '🐸', '🐵', '🦁', '🐯', '🐷', '🐮', '🐰', '🐨'],
    ['🐙', '🐳', '🐬', '🐟', '🐠', '🦀', '🦈', '🐢', '🦞', '🐚', '🦑', '🐡'],
    ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍒', '🍍', '🥝', '🍋', '🍑', '🥥'],
    ['🚗', '🚌', '🚒', '🚓', '🚑', '🚜', '🚲', '🚀', '✈️', '🚁', '⛵', '🚂'],
    ['⚽', '🏀', '🎾', '🏈', '⚾', '🏐', '🎱', '🏓', '🥊', '⛸️', '🛹', '🎳'],
    ['🍕', '🍔', '🌭', '🍟', '🌮', '🍩', '🍪', '🎂', '🍦', '🍿', '🥨', '🧁'],
    ['🦄', '🐉', '🧚', '🧜', '🧞', '👑', '🔮', '🏰', '🧝', '🧙', '🌈', '⭐'],
    ['🐝', '🦋', '🐞', '🐛', '🐌', '🐜', '🕷️', '🦗', '🦂', '🦟', '🐸', '🦎'],
];
/** Number of cards per board, smallest first. Each cleared board moves to the next size. */
export const boardSizes = [4, 6, 8, 12, 16, 20];
export function startBoard(level) {
    return Math.min(boardSizes.length - 1, Math.floor((level - 1) / 2));
}
export function columnsFor(cards) {
    return cards <= 4 ? 2 : cards <= 12 ? (cards === 6 ? 3 : 4) : cards === 16 ? 4 : 5;
}
export function deal(rng, cards) {
    const chosen = rng.shuffle(rng.pick(themes)).slice(0, cards / 2);
    return rng.shuffle([...chosen, ...chosen]).map((face, id) => ({ id, face, matched: false }));
}
