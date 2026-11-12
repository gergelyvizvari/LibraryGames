import { icon } from './icon';
import { stickers } from './stickers';
import strings from './strings';
const game = {
    meta: { id: 'forest-feast', skill: 'logic', icon, color: '#e2607e', added: '2026-11-11', scene: true },
    strings,
    stickers,
    // The game's code is only downloaded when someone opens it.
    load: () => import('./Game'),
};
export default game;
