export const QUESTIONS = 10;
/** Three options for the youngest players, four from level 4. */
export const optionCount = (level) => (level <= 3 ? 3 : 4);
/** Wrong answers from the same continent when possible (Bern vs Vienna, not Bern vs Tokyo). */
export function wrongCapitals(rng, list, country, level, n) {
    const others = list.filter((c) => c !== country && c.capital !== country.capital && c.minLevel <= level + 2);
    const near = rng.shuffle(others.filter((c) => c.continent === country.continent));
    const far = rng.shuffle(others.filter((c) => c.continent !== country.continent));
    // Low levels mix in far-away capitals so the youngest can still guess sensibly.
    const ordered = level <= 2 ? rng.shuffle([...near.slice(0, 2), ...far.slice(0, 2)]) : [...near, ...far];
    return ordered.slice(0, n).map((c) => c.capital);
}
export function makeQuestions(rng, list, level) {
    const pool = list.filter((c) => c.minLevel <= level);
    // Newly unlocked countries are a bit more likely, so each level brings new questions.
    const picked = rng
        .shuffle(pool)
        .sort((a, b) => b.minLevel - a.minLevel + (rng.next() - 0.5) * 8)
        .slice(0, QUESTIONS);
    return rng.shuffle(picked).map((country) => {
        const wrong = wrongCapitals(rng, list, country, level, optionCount(level) - 1);
        return { country, options: rng.shuffle([country.capital, ...wrong]) };
    });
}
