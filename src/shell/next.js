import { shownGames } from '../games/registry';
import { gameProgress, loadProgress } from '../kit/progress';
import { makeRng, randomSeed } from '../kit/random';
/**
 * The game offered after a round: another skill, so kids try something different, and games they have not played
 * yet first, so they discover the whole collection.
 */
export function nextGame(currentId, list = shownGames(), progress = loadProgress(), seed = randomSeed()) {
    const current = list.find((g) => g.meta.id === currentId);
    const others = list.filter((g) => g.meta.id !== currentId && g.meta.skill !== current?.meta.skill);
    const pool = others.length > 0 ? others : list.filter((g) => g.meta.id !== currentId);
    const fresh = pool.filter((g) => gameProgress(progress, g.meta.id).plays === 0);
    return makeRng(seed).pick(fresh.length > 0 ? fresh : pool);
}
