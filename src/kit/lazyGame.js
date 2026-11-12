import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { lazy } from 'react';
import { useT } from '../i18n';
// One lazy component per game, kept for the whole visit, so "play again" never shows the loading state twice.
const lazyGames = new WeakMap();
export function gameComponent(game) {
    let c = lazyGames.get(game);
    if (!c) {
        // A failed download (offline) is forgotten, so "try again" downloads again.
        const load = () => game.load().catch((e) => (lazyGames.delete(game), Promise.reject(e)));
        lazyGames.set(game, (c = lazy(load)));
    }
    return c;
}
/** The friendly card shown instead of a blank screen when a game crashes or cannot be downloaded. */
export function OopsCard({ onAgain, onHome }) {
    const t = useT();
    return (_jsxs("div", { className: "card oops", role: "alert", children: [_jsx("div", { className: "oops-face", "aria-hidden": true, children: "\uD83D\uDE48" }), _jsx("h1", { children: t('oops') }), _jsx("p", { className: "muted", children: t('oopsHint') }), _jsxs("div", { className: "row", children: [_jsx("button", { className: "big-btn", onClick: onAgain, children: t('playAgain') }), _jsx("button", { className: "ghost-btn", onClick: onHome, children: t('home') })] })] }));
}
