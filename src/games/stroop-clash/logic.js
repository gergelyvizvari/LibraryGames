import { clamp } from '../../kit/random';
export const colours = [
    { key: 'red', css: '#ff4757' },
    { key: 'blue', css: '#3742fa' },
    { key: 'green', css: '#2ed573' },
    { key: 'yellow', css: '#f5c518' },
    { key: 'purple', css: '#9b59b6' },
    { key: 'orange', css: '#ff7f11' },
];
/** Four colours to start with, purple and orange join from level 6. */
export const colourCount = (level) => (level >= 6 ? 6 : 4);
/** Chance that the word and ink disagree. Easy at level 1, nearly always tricky by level 6. */
export const clashChance = (level) => clamp(0.35 + level * 0.1, 0.35, 0.9);
/** From level 4 the rule sometimes flips to "tap the word". */
export const flipChance = (level) => (level < 4 ? 0 : clamp((level - 3) * 0.08, 0, 0.35));
export function makeCard(rng, level) {
    const n = colourCount(level);
    const word = rng.int(0, n - 1);
    let ink = word;
    if (rng.chance(clashChance(level))) {
        while (ink === word)
            ink = rng.int(0, n - 1);
    }
    return { word, ink, rule: rng.chance(flipChance(level)) ? 'word' : 'ink' };
}
export const answerFor = (card) => (card.rule === 'ink' ? card.ink : card.word);
