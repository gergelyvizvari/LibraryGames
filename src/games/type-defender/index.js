import { medals } from '../../kit/SceneShell';
import { icon } from './icon';
import strings from './strings';
const game = {
    meta: { id: 'type-defender', skill: 'typing', icon, color: '#54a0ff', added: '2026-10-26', scene: true, keyboard: true },
    strings,
    stickers: medals(icon),
    // The game's code is only downloaded when someone opens it.
    load: () => import('./Game'),
};
export default game;
