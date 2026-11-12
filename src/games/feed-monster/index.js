import { icon } from './icon';
import { stickers } from './stickers';
import strings from './strings';
const game = {
    meta: { id: 'feed-monster', skill: 'maths', icon, color: '#6c5ce7', added: '2026-10-28', scene: true },
    strings,
    stickers,
    // The game's code is only downloaded when someone opens it.
    load: () => import('./Game'),
};
export default game;
