import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { shownGames } from '../games/registry';
import { makeGameT, useLocale, useT } from '../i18n';
import { Icon } from '../kit/icon';
import { Guide } from '../kit/places';
import { currentStreak, dailyDoneToday, gameProgress, isFavourite, isIosBrowser, loadProgress, stickerCount, toggleFavourite } from '../kit/progress';
import { daySeed, makeRng } from '../kit/random';
import { gameColorVars } from '../kit/theme';
import { FavButton, Heart } from '../kit/FavButton';
import { AUTHOR, facebookUrl, portfolioUrl, SUPPORT_URL } from './contact';
import { logoIcon } from './logo';
import { regions } from './map/regions';
import { TeaCup } from './TeaCup';
import { Tools } from './Tools';
const NEW_DAYS = 7;
/** A NEW label on every card means nothing, so only the few most recently added games get one. */
const MAX_NEW = 3;
export function dailyGame(date = new Date()) {
    return makeRng(daySeed(date)).pick(shownGames());
}
/** Ids of the games that get a NEW label: added in the last week, newest first (later in the registry wins ties). */
export function newGameIds(list = shownGames(), today = new Date()) {
    return new Set(list
        .map((g, i) => ({ g, i }))
        .filter(({ g }) => (today.getTime() - new Date(g.meta.added).getTime()) / 86_400_000 < NEW_DAYS)
        .sort((a, b) => b.g.meta.added.localeCompare(a.g.meta.added) || b.i - a.i)
        .slice(0, MAX_NEW)
        .map(({ g }) => g.meta.id));
}
/**
 * Every game on one page, as the index of the storybook: one panel for each region of the map, with its character,
 * and the games as paper cards. The stars on a card are the game's stickers, gold once they are won.
 */
export function Home({ onPlay, onLocale, onMap, }) {
    const t = useT();
    const locale = useLocale();
    const [progress, setProgress] = useState(loadProgress);
    const daily = dailyGame();
    const dailyDone = dailyDoneToday(progress);
    const streak = currentStreak(progress);
    const iosTip = useMemo(() => isIosBrowser(), []);
    const fresh = useMemo(() => newGameIds(), []);
    // New games come first in their region, newest first, so kids spot them straight away.
    const rank = (g) => {
        const i = [...fresh].indexOf(g.meta.id);
        return i < 0 ? fresh.size : i;
    };
    // The author's name is a link, so split the sentence around it (word order differs between languages).
    const madeBy = t('madeBy', { name: '\u0000' }).split('\u0000');
    const shown = useMemo(() => shownGames(), []);
    const favourites = (progress.favourites ?? []).flatMap((f) => shown.find((g) => g.meta.id === f.id) ?? []);
    // A card is a box with two buttons side by side in the markup: the game itself and its heart.
    const card = (g) => {
        const gt = makeGameT(g.strings, locale);
        const total = g.stickers?.length ?? 0;
        const have = stickerCount(progress, g.meta.id);
        const played = gameProgress(progress, g.meta.id).plays > 0;
        return (_jsxs("div", { className: `book-card${played ? ' book-played' : ''}`, style: gameColorVars(g.meta.color), children: [_jsxs("button", { className: "book-card-play", onClick: () => onPlay(g.meta.id), children: [_jsx("span", { className: "book-card-icon", children: _jsx(Icon, { icon: g.meta.icon }) }), _jsx("span", { className: "book-card-title", children: gt('title') }), total > 0 && (_jsx("span", { className: "book-card-stars", role: "img", "aria-label": t('stickers.count', { n: have, total }), children: Array.from({ length: total }, (_, i) => (_jsx("i", { className: i < have ? 'book-star-on' : undefined, children: "\u2605" }, i))) }))] }), _jsx(FavButton, { on: isFavourite(progress, g.meta.id), onToggle: () => setProgress(toggleFavourite(g.meta.id)) }), fresh.has(g.meta.id) && _jsx("span", { className: "book-new", children: t('new') })] }, g.meta.id));
    };
    return (_jsx("div", { className: "book", children: _jsxs("div", { className: "book-in", children: [_jsxs("div", { className: "book-top", children: [_jsxs("button", { className: "wm-pill", onClick: onMap, children: [_jsxs("svg", { viewBox: "0 0 24 24", className: "wm-pill-icon", "aria-hidden": true, focusable: "false", children: [_jsx("path", { d: "M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" }), _jsx("path", { d: "M9 4v14M15 6v14", fill: "none", stroke: "#fffaf0", strokeWidth: "1.6" })] }), t('map.open')] }), _jsx("span", { className: "wm-top-gap" }), _jsx(Tools, { onLocale: onLocale })] }), _jsxs("header", { className: "book-head", children: [_jsxs("p", { className: "book-brand", children: [_jsx(Icon, { icon: logoIcon, className: "book-logo" }), t('appName')] }), _jsx("h1", { className: "book-ribbon", children: t('map.allGames') })] }), _jsxs("button", { className: "book-daily", onClick: () => onPlay(daily.meta.id, true), children: [_jsx("span", { className: "wm-daily-icon", children: _jsx(Icon, { icon: daily.meta.icon }) }), _jsxs("span", { className: "wm-daily-text", children: [_jsx("b", { children: t('map.adventure') }), _jsx("small", { children: makeGameT(daily.strings, locale)('title') })] }), streak >= 2 && (_jsxs("span", { className: "book-streak", title: t('streakHint'), children: ["\uD83D\uDD25 ", t('streakDays', { n: streak })] })), _jsx("span", { className: `wm-daily-go${dailyDone ? ' wm-daily-done' : ''}`, "aria-label": dailyDone ? t('doneToday') : undefined, children: dailyDone ? '✓' : '▶' })] }), favourites.length > 0 && (_jsxs("section", { className: "book-region book-favs", "aria-labelledby": "book-favs", children: [_jsxs("header", { className: "book-band", children: [_jsx("span", { className: "book-guide book-guide-heart", children: _jsx(Heart, {}) }), _jsx("h2", { id: "book-favs", children: t('fav.title') })] }), _jsx("div", { className: "book-grid", children: favourites.map(card) })] })), regions.map((r) => {
                    const list = shown.filter((g) => r.skills.includes(g.meta.skill)).sort((a, b) => rank(a) - rank(b));
                    if (!list.length)
                        return null;
                    return (_jsxs("section", { className: `book-region book-${r.id}`, "aria-labelledby": `book-${r.id}`, children: [_jsxs("header", { className: "book-band", children: [_jsx("span", { className: "book-guide", children: _jsx(Guide, { place: r.id }) }), _jsx("h2", { id: `book-${r.id}`, children: t(r.name) }), _jsx("small", { children: r.skills.map((s) => t(`skill.${s}`).toLowerCase()).join(', ') })] }), _jsx("div", { className: "book-grid", children: list.map(card) })] }, r.id));
                }), _jsxs("footer", { className: "book-foot", children: [_jsx("span", { className: "book-foot-label", children: t('forGrownUps') }), iosTip && _jsx("p", { className: "book-foot-tip", children: t('iosTip') }), _jsxs("a", { className: "book-support", href: SUPPORT_URL, target: "_blank", rel: "noopener noreferrer", title: t('supportHint'), "aria-label": t('supportHint'), children: [_jsx(TeaCup, {}), " ", t('support')] }), _jsxs("span", { className: "book-foot-credit", children: [madeBy[0], _jsx("a", { href: portfolioUrl(locale), target: "_blank", rel: "noopener noreferrer", children: AUTHOR }), madeBy[1], ' · ', _jsx("a", { href: facebookUrl(locale), target: "_blank", rel: "noopener noreferrer", children: "Facebook" }), ' · ', _jsx("a", { href: "#/privacy", children: t('privacyLink') })] })] })] }) }));
}
