import { medals } from '../../kit/SceneShell';
import { icon } from './icon';
import strings from './strings';
const game = {
    meta: { id: 'pair-rush', skill: 'memory', icon, color: '#ff9ff3', added: '2026-10-26', scene: true },
    strings,
    stickers: medals(icon),
    // The game's code is only downloaded when someone opens it.
    load: () => import('./Game'),
};
export default game;
