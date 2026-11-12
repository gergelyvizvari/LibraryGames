import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useT } from '../i18n';
import { Icon } from './icon';
import { stickerName } from './SceneShell';
/** A game's stickers as an album page: the ones won so far, and an empty place for each one still to find. */
export function StickerGrid({ stickers, have, gt, fresh }) {
    const t = useT();
    return (_jsx("ul", { className: "album-grid", children: stickers.map((s, i) => (_jsxs("li", { className: `${i < have ? 'album-got' : 'album-missing'}${i === fresh ? ' album-fresh' : ''}`, children: [i < have ? _jsx(Icon, { icon: s.icon }) : _jsx("span", { className: "album-hole", "aria-hidden": true, children: "?" }), _jsx("span", { children: i < have ? stickerName(s, gt, t) : t('stickers.locked') })] }, i))) }));
}
