import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { games } from '../games/registry';
import { makeGameT, nextLocale, useLocale, useT } from '../i18n';
import { Icon } from '../kit/icon';
import { gameProgress, loadProgress } from '../kit/progress';
import { daySeed, makeRng } from '../kit/random';
import { sound } from '../kit/sound';
import { gameColorVars, loadTheme, nextTheme, setTheme, themeIcons } from '../kit/theme';
import { skills } from '../kit/types';
/** Shown in a quiet footer for parents, below the games, never inside a game. */
export const SUPPORT_URL = 'https://buymeacoffee.com/gergelyvizvari';
export const AUTHOR = 'Gergely Vizvári';
const NEW_DAYS = 7;
/** A NEW label on every card means nothing, so only the few most recently added games get one. */
const MAX_NEW = 3;
export function dailyGame(date = new Date()) {
    return makeRng(daySeed(date)).pick(games);
}
/** Ids of the games that get a NEW label: added in the last week, newest first (later in the registry wins ties). */
export function newGameIds(list = games, today = new Date()) {
    return new Set(list
        .map((g, i) => ({ g, i }))
        .filter(({ g }) => (today.getTime() - new Date(g.meta.added).getTime()) / 86_400_000 < NEW_DAYS)
        .sort((a, b) => b.g.meta.added.localeCompare(a.g.meta.added) || b.i - a.i)
        .slice(0, MAX_NEW)
        .map(({ g }) => g.meta.id));
}
export function Home({ onPlay, onLocale }) {
    const t = useT();
    const locale = useLocale();
    const [filter, setFilter] = useState('all');
    const [muted, setMuted] = useState(sound.isMuted());
    const [theme, setThemeState] = useState(loadTheme);
    const progress = useMemo(loadProgress, []);
    const daily = dailyGame();
    const fresh = useMemo(() => newGameIds(), []);
    // New games come first, newest first, so kids spot them straight away.
    const rank = (g) => {
        const i = [...fresh].indexOf(g.meta.id);
        return i < 0 ? fresh.size : i;
    };
    const shown = (filter === 'all' ? games : games.filter((g) => g.meta.skill === filter)).slice().sort((a, b) => rank(a) - rank(b));
    const dailyT = makeGameT(daily.strings, locale);
    const usedSkills = skills.filter((s) => games.some((g) => g.meta.skill === s));
    return (_jsxs("div", { className: "home", children: [_jsxs("header", { className: "home-head", children: [_jsx("h1", { children: t('appName') }), _jsxs("div", { className: "home-tools", children: [_jsx("button", { className: "icon-btn lang-btn", "aria-label": t('language', { name: t(`lang.${locale}`) }), title: t('language', { name: t(`lang.${locale}`) }), onClick: () => onLocale(nextLocale(locale)), children: locale.toUpperCase() }), _jsx("button", { className: "icon-btn", "aria-label": t('theme', { name: t(`theme.${theme}`) }), title: t('theme', { name: t(`theme.${theme}`) }), onClick: () => {
                                    const next = nextTheme(theme);
                                    setTheme(next);
                                    setThemeState(next);
                                }, children: themeIcons[theme] }), _jsx("button", { className: "icon-btn", "aria-label": t('sound'), onClick: () => {
                                    sound.setMuted(!muted);
                                    setMuted(!muted);
                                }, children: muted ? '🔇' : '🔊' })] })] }), _jsxs("button", { className: "daily", style: gameColorVars(daily.meta.color), onClick: () => onPlay(daily.meta.id, true), children: [_jsxs("span", { className: "daily-label", children: ["\u2B50 ", t('todaysGame')] }), _jsxs("span", { className: "daily-icon", "aria-hidden": true, children: [_jsx(Icon, { icon: daily.meta.icon }), _jsx("i", { className: "daily-sparkle", children: "\u2728" })] }), _jsx("span", { className: "daily-title", children: dailyT('title') }), _jsx("span", { className: "daily-play", children: t('play') })] }), _jsx("div", { className: "filters", children: ['all', ...usedSkills].map((s) => (_jsx("button", { className: `chip${filter === s ? ' chip-on' : ''}`, onClick: () => setFilter(s), children: s === 'all' ? t('all') : t(`skill.${s}`) }, s))) }), _jsx("div", { className: "grid", children: shown.map((g) => {
                    const gp = gameProgress(progress, g.meta.id);
                    const gt = makeGameT(g.strings, locale);
                    return (_jsxs("button", { className: "game-card", style: gameColorVars(g.meta.color), onClick: () => onPlay(g.meta.id), children: [fresh.has(g.meta.id) && _jsx("span", { className: "new-tag", children: t('new') }), _jsx("span", { className: "game-card-icon", children: _jsx(Icon, { icon: g.meta.icon }) }), _jsx("span", { className: "game-card-title", children: gt('title') }), _jsxs("span", { className: "game-card-foot", children: [_jsx("span", { className: "game-card-skill", children: t(`skill.${g.meta.skill}`) }), gp.plays > 0 && _jsxs("span", { className: "game-card-best", children: ["\uD83C\uDFC6 ", gp.best] })] })] }, g.meta.id));
                }) }), _jsxs("footer", { className: "home-foot", children: [_jsx("span", { className: "home-foot-label", children: t('forGrownUps') }), _jsxs("a", { className: "support-link", href: SUPPORT_URL, target: "_blank", rel: "noopener noreferrer", title: t('supportHint'), "aria-label": t('supportHint'), children: [_jsx("span", { "aria-hidden": true, children: "\uD83C\uDF75" }), " ", t('support')] }), _jsx("span", { className: "home-foot-credit", children: t('madeBy', { name: AUTHOR }) })] })] }));
}
