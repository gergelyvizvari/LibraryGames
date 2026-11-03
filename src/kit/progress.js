import { clamp } from './random';
const KEY = 'lg.progress.v1';
const empty = () => ({ games: {}, xp: {}, streak: { days: 0 } });
export function loadProgress() {
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
    }
    catch {
        return empty();
    }
}
function save(p) {
    try {
        localStorage.setItem(KEY, JSON.stringify(p));
    }
    catch {
        // storage unavailable; progress lives only for this visit
    }
}
export function gameProgress(p, id) {
    return p.games[id] ?? { best: 0, plays: 0, level: 1 };
}
/** Raise the level after a strong round, lower it after a weak one. */
export function nextLevel(level, accuracy) {
    if (accuracy >= 0.8)
        return clamp(level + 1, 1, 10);
    if (accuracy < 0.45)
        return clamp(level - 1, 1, 10);
    return level;
}
export function isoDay(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function stars(accuracy) {
    return accuracy >= 0.85 ? 3 : accuracy >= 0.6 ? 2 : accuracy > 0.2 ? 1 : 0;
}
export function recordRound(id, skill, result, today = new Date()) {
    const p = loadProgress();
    const g = gameProgress(p, id);
    const day = isoDay(today);
    const newRecord = result.score > g.best && result.score > 0;
    const level = nextLevel(g.level, result.accuracy);
    const xpGained = 10 + stars(result.accuracy) * 5;
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    let streak = p.streak;
    if (streak.lastDay !== day) {
        streak = { days: streak.lastDay === isoDay(yesterday) ? streak.days + 1 : 1, lastDay: day };
    }
    const progress = {
        games: { ...p.games, [id]: { best: Math.max(g.best, result.score), plays: g.plays + 1, level, lastPlayed: day } },
        xp: { ...p.xp, [skill]: (p.xp[skill] ?? 0) + xpGained },
        streak,
    };
    save(progress);
    return { progress, newRecord, previousLevel: g.level, level, xpGained };
}
