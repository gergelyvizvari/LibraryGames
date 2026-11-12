import { medals } from '../../kit/SceneShell';
import { icon } from './icon';
import strings from './strings';
const game = {
    meta: { id: 'capital-match', skill: 'geography', icon, color: '#3c6382', added: '2026-10-27', scene: true },
    strings,
    stickers: medals(icon),
    // The game's code is only downloaded when someone opens it.
    load: () => import('./Game'),
};
export default game;
