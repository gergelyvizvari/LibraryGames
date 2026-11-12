import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { games, shownGames } from '../../games/registry';
import { makeGameT, useLocale, useT } from '../../i18n';
import { useSize, useTimeouts } from '../../kit/hooks';
import { Icon } from '../../kit/icon';
import { currentStreak, dailyDoneToday, gameProgress, isFavourite, loadProgress, stickerCount, toggleFavourite } from '../../kit/progress';
import { sound } from '../../kit/sound';
import { gameColorVars } from '../../kit/theme';
import { FavButton, Heart } from '../../kit/FavButton';
import { dailyGame } from '../Home';
import { Tools } from '../Tools';
import mapArt from './map.webp';
import { MAP_H, MAP_W, mapScale, placeGames, regions } from './regions';
const SCROLL_KEY = 'lg.map.x';
const STAR = 'M0 -14 L4.1 -5.6 L13.3 -4.3 L6.6 2.1 L8.2 11.3 L0 7 L-8.2 11.3 L-6.6 2.1 L-13.3 -4.3 L-4.1 -5.6 Z';
/** How much the map grows when it closes in on a game, and how long that takes. Keep ZOOM_MS in step with .wm-scroll's transition. */
const ZOOM = 3.4;
const ZOOM_MS = 520;
/** The badge behind a game's picture on the map. Played games get a gold rim and a little star; the next one to try in a region has a ring. */
function StarMark({ state }) {
    const done = state === 'done';
    return (_jsxs("svg", { viewBox: "-30 -30 60 60", "aria-hidden": true, focusable: "false", children: [state === 'next' && _jsx("circle", { className: "wm-ring", r: "28" }), _jsx("ellipse", { className: "wm-shade", cx: "1", cy: "4", rx: "22", ry: "21" }), _jsx("circle", { r: "22", fill: "#fffaf0", stroke: done ? '#ffd24a' : '#fffaf0', strokeWidth: "4" }), done && (_jsxs("g", { transform: "translate(18 -18) scale(0.72)", children: [_jsx("path", { className: "wm-shade", d: STAR, transform: "translate(1 3)", strokeWidth: "5", strokeLinejoin: "round" }), _jsx("path", { d: STAR, fill: "#ffd24a", stroke: "#ffd24a", strokeWidth: "5", strokeLinejoin: "round" }), _jsx("path", { d: "M0 -14 L4.1 -5.6 L13.3 -4.3 L6.6 2.1 L8.2 11.3 L0 7 Z", fill: "#f2a71b", opacity: "0.75" })] }))] }));
}
/**
 * A round smiley sticker with its edge peeling up, so it reads as "stickers" even to a child who cannot read,
 * and does not look like the gold star of played games next to it.
 */
function StickerIcon() {
    return (_jsxs("svg", { viewBox: "0 0 24 24", className: "wm-sticker-icon", "aria-hidden": true, focusable: "false", children: [_jsx("circle", { cx: "12.4", cy: "12.8", r: "10.6", fill: "rgba(60, 40, 90, 0.18)" }), _jsx("path", { d: "M22.1 14.7 A10.4 10.4 0 1 0 14.7 22.1 Z", fill: "#fff" }), _jsx("path", { d: "M20.3 14.3 A8.5 8.5 0 1 0 14.3 20.3 Z", fill: "#ff8fab" }), _jsx("circle", { cx: "8.6", cy: "9.6", r: "1.35", fill: "#5a2340" }), _jsx("circle", { cx: "14.2", cy: "9.6", r: "1.35", fill: "#5a2340" }), _jsx("path", { d: "M7.6 13.2 Q11.4 16.6 15.2 13.2", fill: "none", stroke: "#5a2340", strokeWidth: "1.5", strokeLinecap: "round" }), _jsx("path", { d: "M22.1 14.7 Q15.6 15.4 14.7 22.1 Z", fill: "#efe3c9", stroke: "#d8c8a6", strokeWidth: "0.8", strokeLinejoin: "round" })] }));
}
/**
 * The home screen: a storybook map with a landscape for every group of skills and a star for every game.
 * On a phone it is as tall as the screen and is dragged sideways; a wide window shows all of it.
 */
export function WorldMap({ onPlay, onAllGames, onStickers, onLocale, from, }) {
    const t = useT();
    const locale = useLocale();
    const [progress, setProgress] = useState(loadProgress);
    // Every game keeps its own spot, also where a game this device cannot play is left out.
    const placed = useMemo(() => {
        const shown = new Set(shownGames());
        return placeGames(games).filter((p) => shown.has(p.game));
    }, []);
    const [wrap, size] = useSize({ w: 390, h: 800 });
    const scale = mapScale(size.w, size.h);
    const scaleNow = useRef(scale);
    scaleNow.current = scale;
    const scroller = useRef(null);
    const [edge, setEdge] = useState({ left: false, right: false });
    const [openId, setOpenId] = useState(null);
    // 'in' while the map closes in on a game that is about to open, 'out' while it pulls back from the one just left.
    const [zoom, setZoom] = useState(from ? 'out' : null);
    const later = useTimeouts();
    const drag = useRef(null);
    const daily = dailyGame();
    const dailyDone = dailyDoneToday(progress);
    const streak = currentStreak(progress);
    const played = (id) => gameProgress(progress, id).plays > 0;
    const starCount = placed.filter(({ game }) => played(game.meta.id)).length;
    const stickers = placed.reduce((n, { game }) => n + stickerCount(progress, game.meta.id), 0);
    // In every region the first game not tried yet is the one to play next.
    const nextIds = new Set(regions.map((r) => placed.find((p) => p.region === r && !played(p.game.meta.id))?.game.meta.id));
    const open = placed.find((p) => p.game.meta.id === openId);
    const syncEdges = () => {
        const el = scroller.current;
        if (!el)
            return;
        setEdge((e) => {
            const left = el.scrollLeft > 4;
            const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
            return e.left === left && e.right === right ? e : { left, right };
        });
    };
    // Come back to the part of the map the player was looking at.
    useLayoutEffect(() => {
        const el = scroller.current;
        if (!el)
            return;
        try {
            el.scrollLeft = Number(sessionStorage.getItem(SCROLL_KEY) ?? 0) * scale;
        }
        catch {
            // storage unavailable
        }
        syncEdges();
    }, [scale, size.w]);
    const onScroll = () => {
        syncEdges();
        try {
            sessionStorage.setItem(SCROLL_KEY, String((scroller.current?.scrollLeft ?? 0) / scale));
        }
        catch {
            // storage unavailable
        }
    };
    // Fingers scroll by themselves; a mouse drags the map.
    useEffect(() => {
        const move = (e) => {
            const d = drag.current;
            const el = scroller.current;
            if (!d || !el)
                return;
            if (Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 6)
                d.moved = true;
            el.scrollLeft = d.left - (e.clientX - d.x);
            el.scrollTop = d.top - (e.clientY - d.y);
        };
        const up = () => {
            const d = drag.current;
            // The click that ends a drag must not open a game: forget the drag only after that click has passed.
            if (d)
                setTimeout(() => drag.current === d && (drag.current = null), 0);
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
        return () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
        };
    }, []);
    /** Moves and enlarges the whole map so that the game's badge fills the middle of the window; null puts it back. */
    const aim = (id) => {
        const el = scroller.current;
        const p = placed.find((q) => q.game.meta.id === id);
        if (!el)
            return;
        if (!p) {
            el.style.transform = '';
            return;
        }
        const box = el.getBoundingClientRect();
        const map = el.firstElementChild.getBoundingClientRect();
        const x = map.left - box.left + p.x * scaleNow.current;
        const y = map.top - box.top + p.y * scaleNow.current;
        el.style.transformOrigin = `${x}px ${y}px`;
        el.style.transform = `translate(${box.width / 2 - x}px, ${box.height / 2 - y}px) scale(${ZOOM})`;
    };
    // Close in on the badge, then open the game, so the map does not just vanish.
    const launch = (id, daily) => {
        if (zoom === 'in')
            return;
        const go = () => (daily ? onPlay(id, true) : onPlay(id));
        if (!window.matchMedia || matchMedia('(prefers-reduced-motion: reduce)').matches)
            return go();
        setZoom('in');
        aim(id);
        later(go, ZOOM_MS);
    };
    // Coming back from a game: start close up on its badge, under the veil, and pull back.
    useEffect(() => {
        const el = scroller.current;
        const p = placed.find((q) => q.game.meta.id === from);
        if (!el || !p)
            return setZoom(null);
        // Two frames: the first one measures the window and puts the map back where the player left it.
        let frame = requestAnimationFrame(() => {
            frame = requestAnimationFrame(() => {
                const x = p.x * scaleNow.current;
                // A game opened from somewhere else (today's adventure) may be out of sight: bring it to the middle.
                if (x < el.scrollLeft + 40 || x > el.scrollLeft + el.clientWidth - 40)
                    el.scrollLeft = x - el.clientWidth / 2;
                el.style.transition = 'none';
                aim(p.game.meta.id);
                void el.offsetWidth;
                el.style.transition = '';
                aim(null);
                setZoom(null);
            });
        });
        return () => cancelAnimationFrame(frame);
        // Only once, when the map appears.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const step = (dir) => scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.7, behavior: 'smooth' });
    const pick = (id) => {
        sound.tap();
        setOpenId(id);
    };
    return (_jsxs("div", { className: `wm${zoom ? ` wm-zoom-${zoom}` : ''}`, ref: wrap, children: [_jsx("div", { className: "wm-scroll", ref: scroller, onScroll: onScroll, onPointerDown: (e) => {
                    const el = scroller.current;
                    if (e.pointerType === 'mouse' && e.button === 0 && el)
                        drag.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop, moved: false };
                }, onClickCapture: (e) => {
                    if (drag.current?.moved) {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                }, onClick: () => openId && setOpenId(null), children: _jsx("div", { className: "wm-map", style: { width: MAP_W * scale, height: MAP_H * scale }, children: _jsxs("div", { className: "wm-inner", style: { width: MAP_W, height: MAP_H, transform: `scale(${scale})`, backgroundImage: `url(${mapArt})` }, children: [_jsx("h1", { className: "wm-ribbon", children: t('map.title') }), regions.map((r) => (_jsxs("div", { className: "wm-label", style: { left: r.label[0], top: r.label[1] }, children: [_jsx("span", { className: "wm-label-name", children: t(r.name) }), _jsx("span", { className: "wm-label-skills", children: r.skills.map((s) => t(`skill.${s}`).toLowerCase()).join(', ') })] }, r.id))), placed.map(({ game, x, y }) => {
                                const id = game.meta.id;
                                const state = played(id) ? 'done' : nextIds.has(id) ? 'next' : 'todo';
                                const title = makeGameT(game.strings, locale)('title');
                                return (_jsxs("button", { className: `wm-star wm-${state}${openId === id ? ' wm-open' : ''}`, style: { left: x, top: y }, "aria-label": title, onClick: (e) => {
                                        e.stopPropagation();
                                        // A second tap on the same badge opens the game, so a double tap goes straight in.
                                        if (openId === id)
                                            launch(id);
                                        else
                                            pick(id);
                                    }, children: [_jsx(StarMark, { state: state }), _jsx(Icon, { icon: game.meta.icon, className: "wm-star-icon" }), isFavourite(progress, id) && (_jsx("span", { className: "wm-fav", children: _jsx(Heart, {}) })), _jsx("span", { className: "wm-tip", "aria-hidden": true, children: title })] }, id));
                            })] }) }) }), _jsxs("div", { className: "wm-top", children: [_jsxs("button", { className: "wm-pill", onClick: onAllGames, "aria-label": t('map.allGames'), title: t('map.allGames'), children: [_jsx("svg", { viewBox: "0 0 24 24", className: "wm-pill-icon", "aria-hidden": true, focusable: "false", children: _jsx("path", { d: "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z" }) }), _jsx("span", { className: "wm-pill-text", children: t('map.allGames') })] }), _jsx("span", { className: "wm-top-gap" }), _jsx(Tools, { onLocale: onLocale }), _jsxs("span", { className: "wm-pill wm-gold", role: "img", "aria-label": t('map.stars', { n: starCount }), title: t('map.starsHint'), children: ["\u2605 ", starCount] }), streak >= 2 && (_jsxs("span", { className: "wm-pill wm-red", role: "img", "aria-label": `${t('streakHint')}: ${streak}`, title: t('streakHint'), children: ["\uD83D\uDD25 ", streak] })), _jsxs("button", { className: "wm-pill wm-stickers", onClick: onStickers, "aria-label": t('stickers.open', { n: stickers }), title: t('stickers.title'), children: [_jsx(StickerIcon, {}), _jsx("span", { className: "wm-pill-text", children: t('stickers.short') }), _jsx("b", { className: "wm-stickers-n", children: stickers })] })] }), edge.left && (_jsx("button", { className: "wm-arrow wm-arrow-left", onClick: () => step(-1), "aria-label": t('map.left'), children: _jsx("svg", { viewBox: "0 0 24 24", "aria-hidden": true, focusable: "false", children: _jsx("path", { d: "M15 5 L8 12 L15 19" }) }) })), edge.right && (_jsx("button", { className: "wm-arrow wm-arrow-right", onClick: () => step(1), "aria-label": t('map.right'), children: _jsx("svg", { viewBox: "0 0 24 24", "aria-hidden": true, focusable: "false", children: _jsx("path", { d: "M9 5 L16 12 L9 19" }) }) })), open ? (_jsxs("div", { className: "wm-card", role: "dialog", "aria-label": makeGameT(open.game.strings, locale)('title'), style: gameColorVars(open.game.meta.color), children: [_jsx("span", { className: "wm-card-icon", children: _jsx(Icon, { icon: open.game.meta.icon }) }), _jsxs("span", { className: "wm-card-text", children: [_jsx("b", { children: makeGameT(open.game.strings, locale)('title') }), _jsxs("small", { children: [t(open.region.name), " \u00B7 ", t(`skill.${open.game.meta.skill}`)] })] }), _jsx(FavButton, { on: isFavourite(progress, open.game.meta.id), onToggle: () => setProgress(toggleFavourite(open.game.meta.id)) }), _jsx("button", { className: "scene-btn", onClick: () => launch(open.game.meta.id), autoFocus: true, children: t('play') }), _jsx("button", { className: "wm-card-close", onClick: () => pick(null), "aria-label": t('map.close'), children: "\u2715" })] })) : (_jsxs("button", { className: "wm-daily", onClick: () => launch(daily.meta.id, true), children: [_jsx("span", { className: "wm-daily-icon", children: _jsx(Icon, { icon: daily.meta.icon }) }), _jsxs("span", { className: "wm-daily-text", children: [_jsx("b", { children: t('map.adventure') }), _jsx("small", { children: makeGameT(daily.strings, locale)('title') })] }), _jsx("span", { className: `wm-daily-go${dailyDone ? ' wm-daily-done' : ''}`, "aria-label": dailyDone ? t('doneToday') : undefined, children: dailyDone ? '✓' : '▶' })] })), _jsx("div", { className: "wm-veil" })] }));
}
