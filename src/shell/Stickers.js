import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { shownGames } from '../games/registry';
import { makeGameT, useLocale, useT } from '../i18n';
import { Icon } from '../kit/icon';
import { loadProgress, stickerCount } from '../kit/progress';
import { StickerGrid } from '../kit/StickerGrid';
/** The sticker album: every sticker of every scene game, the ones not won yet as empty places. Each page opens its game. */
export function Stickers({ onHome, onPlay }) {
    const t = useT();
    const locale = useLocale();
    const progress = useMemo(loadProgress, []);
    const pages = shownGames().filter((g) => g.stickers?.length);
    const total = pages.reduce((n, g) => n + stickerCount(progress, g.meta.id), 0);
    return (_jsx("div", { className: "book", children: _jsxs("div", { className: "book-in album", children: [_jsx("div", { className: "book-top", children: _jsxs("button", { className: "wm-pill", onClick: onHome, children: [_jsxs("svg", { viewBox: "0 0 24 24", className: "wm-pill-icon", "aria-hidden": true, focusable: "false", children: [_jsx("path", { d: "M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" }), _jsx("path", { d: "M9 4v14M15 6v14", fill: "none", stroke: "#fffaf0", strokeWidth: "1.6" })] }), t('map.open')] }) }), _jsx("header", { className: "book-head", children: _jsx("h1", { className: "book-ribbon", children: t('stickers.title') }) }), total === 0 && _jsx("p", { className: "album-empty", children: t('stickers.empty') }), pages.map((g) => {
                    const gt = makeGameT(g.strings, locale);
                    return (_jsxs("section", { className: "album-page", children: [_jsxs("h2", { className: "album-head", children: [_jsx(Icon, { icon: g.meta.icon, className: "frame-icon" }), _jsx("span", { className: "album-title", children: gt('title') }), _jsxs("button", { className: "album-play", onClick: () => onPlay(g.meta.id), "aria-label": t('stickers.play', { title: gt('title') }), children: [t('play'), " ", _jsx("span", { "aria-hidden": true, children: "\u25B6" })] })] }), _jsx(StickerGrid, { stickers: g.stickers, have: stickerCount(progress, g.meta.id), gt: gt })] }, g.meta.id));
                })] }) }));
}
