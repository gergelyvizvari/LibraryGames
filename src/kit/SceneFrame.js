import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense, useMemo, useState } from 'react';
import { makeGameT, useLocale, useT } from '../i18n';
import { touchOnly } from './device';
import { ErrorBoundary } from './ErrorBoundary';
import { FavButton } from './FavButton';
import { useTimeouts } from './hooks';
import { Icon } from './icon';
import { OopsCard, gameComponent } from './lazyGame';
import { awardSticker, gameProgress, isFavourite, loadProgress, recordRound, stickerCount, toggleFavourite } from './progress';
import { randomSeed } from './random';
import { stickerName } from './SceneShell';
import { StickerGrid } from './StickerGrid';
import { sound } from './sound';
import { gameColorVars } from './theme';
/**
 * The frame of a scene game: only a back button over the game's own full-screen scene, and a quiet ending
 * when a stage is finished (a sticker for the album, then on to the next stage or back to the map).
 */
export function SceneFrame({ game, seed, daily = false, onHome, }) {
    const locale = useLocale();
    const t = useT();
    const gt = useMemo(() => makeGameT(game.strings, locale), [game, locale]);
    const id = game.meta.id;
    const [stage, setStage] = useState(() => {
        const p = gameProgress(loadProgress(), id);
        return { n: p.plays + 1, level: p.level, seed: seed ?? randomSeed() };
    });
    /** Set when the stage is finished: the index of the sticker just won, or null when the album is already full. */
    const [end, setEnd] = useState(null);
    const later = useTimeouts();
    const [fav, setFav] = useState(() => isFavourite(loadProgress(), id));
    /** The popup with all of the game's stickers, opened from the ending card. */
    const [album, setAlbum] = useState(false);
    // A typing game opened on a phone (from a shared link, say) first explains that it needs a keyboard.
    const [noKeys, setNoKeys] = useState(() => !!game.meta.keyboard && touchOnly());
    const finish = (r) => {
        recordRound(id, game.meta.skill, r, new Date(), daily);
        const sticker = game.stickers?.length ? awardSticker(id, game.stickers.length) : null;
        // A moment to look at the finished scene before the card arrives.
        later(() => {
            sound.win();
            setEnd({ sticker });
        }, 900);
    };
    const next = () => {
        sound.tap();
        const p = gameProgress(loadProgress(), id);
        setEnd(null);
        setAlbum(false);
        setStage({ n: p.plays + 1, level: p.level, seed: randomSeed() });
    };
    const Component = gameComponent(game);
    const won = end && end.sticker !== null ? game.stickers?.[end.sticker] : undefined;
    const stickers = game.stickers?.length ? game.stickers : undefined;
    const have = end ? stickerCount(loadProgress(), id) : 0;
    return (_jsxs("div", { className: "scene-frame", style: gameColorVars(game.meta.color), children: [noKeys ? (_jsx(KeyboardCard, { onAnyway: () => setNoKeys(false), onHome: onHome })) : (_jsx(ErrorBoundary, { fallback: _jsx(OopsCard, { onAgain: next, onHome: onHome }), children: _jsx(Suspense, { fallback: _jsx("div", { className: "game-loading", children: t('loading') }), children: _jsx(Component, { level: stage.level, seed: stage.seed, t: gt, onFinish: finish }) }) }, stage.seed)), _jsx("button", { className: "scene-back", onClick: onHome, "aria-label": t('scene.back'), title: t('scene.back'), children: _jsx("svg", { viewBox: "0 0 24 24", "aria-hidden": true, focusable: "false", children: _jsx("path", { d: "M15 5 L8 12 L15 19" }) }) }), _jsx(FavButton, { on: fav, className: "scene-fav", onToggle: () => setFav(isFavourite(toggleFavourite(id), id)) }), end && (_jsxs("div", { className: "scene-end", role: "dialog", "aria-label": t('scene.done'), children: [_jsxs(EndCard, { onOpen: stickers ? () => (sound.tap(), setAlbum(true)) : undefined, children: [_jsx("span", { className: "scene-end-sticker", children: _jsx(Icon, { icon: won?.icon ?? game.meta.icon }) }), _jsxs("span", { className: "scene-end-text", children: [_jsx("span", { className: "scene-end-kicker", children: won ? t('scene.newSticker') : gt('title') }), _jsx("span", { className: "scene-end-name", children: won ? stickerName(won, gt, t) : t('scene.done') }), stickers ? (_jsxs("span", { className: "scene-end-more", children: ["\u2605 ", t('stickers.count', { n: have, total: stickers.length }), " ", _jsx("span", { "aria-hidden": true, children: "\u203A" })] })) : (won && _jsx("span", { className: "scene-end-kicker", children: t('scene.done') }))] })] }), _jsxs("div", { className: "scene-end-actions", children: [_jsx("button", { className: "scene-btn", onClick: next, autoFocus: true, children: t('scene.next', { n: stage.n + 1 }) }), _jsx("button", { className: "scene-link", onClick: onHome, children: t('scene.back') })] })] })), album && stickers && (_jsx("div", { className: "scene-album", role: "dialog", "aria-modal": "true", "aria-label": t('stickers.ofGame', { title: gt('title') }), onClick: () => setAlbum(false), children: _jsxs("div", { className: "scene-album-card album-page", onClick: (e) => e.stopPropagation(), children: [_jsxs("h2", { className: "album-head", children: [_jsx(Icon, { icon: game.meta.icon, className: "frame-icon" }), _jsx("span", { className: "album-title", children: gt('title') }), _jsx("button", { className: "scene-album-close", onClick: () => (sound.tap(), setAlbum(false)), "aria-label": t('map.close'), autoFocus: true, children: "\u2715" })] }), _jsx("p", { className: "scene-album-count", children: t('stickers.count', { n: have, total: stickers.length }) }), _jsx(StickerGrid, { stickers: stickers, have: have, gt: gt, fresh: end?.sticker })] }) }))] }));
}
function EndCard({ onOpen, children }) {
    return onOpen ? (_jsx("button", { className: "scene-end-card scene-end-open", onClick: onOpen, children: children })) : (_jsx("div", { className: "scene-end-card", children: children }));
}
/** Shown instead of a typing game on a phone or tablet: most have no keyboard, but one can be plugged in. */
function KeyboardCard({ onAnyway, onHome }) {
    const t = useT();
    return (_jsxs("div", { className: "card oops scene-keys", role: "alert", children: [_jsx("div", { className: "oops-face", "aria-hidden": true, children: "\u2328\uFE0F" }), _jsx("h1", { children: t('keys.title') }), _jsx("p", { className: "muted", children: t('keys.hint') }), _jsxs("div", { className: "row", children: [_jsx("button", { className: "big-btn", onClick: onHome, autoFocus: true, children: t('scene.back') }), _jsx("button", { className: "ghost-btn", onClick: onAnyway, children: t('keys.anyway') })] })] }));
}
