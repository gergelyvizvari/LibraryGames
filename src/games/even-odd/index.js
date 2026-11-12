import { medals } from '../../kit/SceneShell';
import { icon } from './icon';
import strings from './strings';
const game = {
    meta: { id: 'even-odd', skill: 'maths', icon, color: '#0fb9b1', added: '2026-11-07', scene: true },
    strings,
    stickers: medals(icon),
    // The game's code is only downloaded when someone opens it.
    load: () => import('./Game'),
};
export default game;
