import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useLocale } from '../../i18n';
import { usePops, useShake, useTimeouts } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { sound, vibrate } from '../../kit/sound';
import { Hud, Pops } from '../../kit/ui';
import { continentNames, names } from './content';
import { CONTINENTS } from './continents';
import { coloured, pickItems, pointsFor, showLabels } from './logic';
import { WIDTH, loadWorld } from './map';
const COLOURS = {
    northAmerica: '#ff9f43',
    southAmerica: '#1dd1a1',
    europe: '#a29bfe',
    africa: '#feca57',
    asia: '#ff6b6b',
    oceania: '#fd79a8',
    antarctica: '#ffffff',
};
// Stickers on one continent spread out around its anchor, in map units.
const SPOTS = [[0, 0], [-34, -22], [34, -22], [-34, 22], [34, 22], [0, -40], [0, 40], [-60, 0], [60, 0]];
export default function ContinentSort({ level, seed, t, onFinish }) {
    const locale = useLocale();
    const rng = useRef(makeRng(seed)).current;
    const questions = useRef(pickItems(rng, level)).current;
    const itemNames = names[locale] ?? names.en;
    const cNames = continentNames[locale] ?? continentNames.en;
    const [world, setWorld] = useState(null);
    const [index, setIndex] = useState(0);
    const [tries, setTries] = useState(0);
    const [wrong, setWrong] = useState(null);
    const [solved, setSolved] = useState(null);
    const [placed, setPlaced] = useState([]);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [drag, setDrag] = useState(null);
    const stats = useRef({ firstTry: 0 });
    const askedAt = useRef(0);
    const [pops, addPop] = usePops();
    const [shakeRef, shake] = useShake();
    const later = useTimeouts();
    const q = questions[index];
    const done = index >= questions.length;
    useEffect(() => {
        let live = true;
        void loadWorld().then((w) => {
            if (!live)
                return;
            setWorld(w);
            askedAt.current = performance.now();
        });
        return () => {
            live = false;
        };
    }, []);
    const next = (finalScore) => {
        later(() => {
            if (index + 1 >= questions.length) {
                setIndex(index + 1);
                onFinish({ score: finalScore, accuracy: stats.current.firstTry / questions.length });
                return;
            }
            setIndex(index + 1);
            setTries(0);
            setWrong(null);
            setSolved(null);
            askedAt.current = performance.now();
        }, 1100);
    };
    /** Where a screen point falls on the map, in % of the map box, for pops. */
    const percentAt = (clientX, clientY) => {
        const r = shakeRef.current?.getBoundingClientRect();
        if (!r)
            return [50, 50];
        return [((clientX - r.left) / r.width) * 100, ((clientY - r.top) / r.height) * 100];
    };
    const answer = (c, clientX, clientY) => {
        if (!world || done || solved)
            return;
        const [px, py] = percentAt(clientX, clientY);
        if (c === q.continent) {
            const seconds = (performance.now() - askedAt.current) / 1000;
            const nc = tries === 0 ? combo + 1 : 0;
            const gained = pointsFor(tries, seconds, nc);
            if (tries === 0)
                stats.current.firstTry++;
            setCombo(nc);
            setScore(score + gained);
            setSolved('yes');
            setPlaced((p) => [...p, q]);
            sound.good(nc);
            addPop(`+${gained}`, px, py);
            next(score + gained);
            return;
        }
        sound.bad();
        vibrate(40);
        shake();
        setCombo(0);
        setWrong(c);
        const n = tries + 1;
        setTries(n);
        if (n >= 2) {
            // After two misses, show where it lives and move on.
            setSolved('reveal');
            setPlaced((p) => [...p, q]);
            next(score);
        }
    };
    const continentAt = (clientX, clientY) => {
        const el = document.elementFromPoint(clientX, clientY);
        return el?.closest('[data-cont]')?.getAttribute('data-cont') ?? null;
    };
    const onMapTap = (e) => {
        const c = e.target.closest('[data-cont]')?.getAttribute('data-cont');
        if (c)
            answer(c, e.clientX, e.clientY);
    };
    const onCardDown = (e) => {
        if (!world || solved || done)
            return;
        e.target.releasePointerCapture?.(e.pointerId);
        setDrag({ x: e.clientX, y: e.clientY });
        sound.tap();
    };
    useEffect(() => {
        if (!drag)
            return;
        const move = (e) => setDrag({ x: e.clientX, y: e.clientY });
        const up = (e) => {
            setDrag(null);
            const c = continentAt(e.clientX, e.clientY);
            if (c)
                answer(c, e.clientX, e.clientY);
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
        return () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
        };
    });
    const hint = () => {
        if (solved === 'yes')
            return t('yes', { continent: cNames[q.continent] });
        if (solved === 'reveal')
            return t('reveal', { continent: cNames[q.continent] });
        if (wrong)
            return t('no', { continent: cNames[wrong] });
        return t('where');
    };
    const fill = (c) => (coloured(level) || c === 'antarctica' ? COLOURS[c] : '#f3e9c6');
    const cls = (c) => `cs2-land${solved && c === q?.continent ? (solved === 'yes' ? ' cs2-found' : ' cs2-reveal') : ''}${c === wrong && !solved ? ' cs2-wrong' : ''}`;
    const stickers = CONTINENTS.flatMap((c) => placed.filter((p) => p.continent === c).map((p, i) => ({ p, c, i })));
    return (_jsxs("div", { className: "game continent-sort", children: [_jsx(Hud, { items: [
                    { label: t('score'), value: score },
                    { label: t('item'), value: `${Math.min(index + 1, questions.length)} / ${questions.length}` },
                    { label: t('combo'), value: `×${combo}`, highlight: combo >= 3 },
                ] }), q && (_jsxs("div", { className: `cs2-card${solved ? ' cs2-card-done' : ''}${drag ? ' cs2-card-lifted' : ''}`, onPointerDown: onCardDown, children: [_jsx("span", { className: "cs2-emoji", children: q.emoji }), _jsx("span", { className: "cs2-name", children: itemNames[q.id] })] }, index)), _jsx("p", { className: `cs2-hint${solved === 'yes' ? ' cs2-yes' : ''}`, children: q ? hint() : ' ' }), _jsxs("div", { className: "cs2-sea", ref: shakeRef, children: [world ? (_jsxs("svg", { viewBox: `0 0 ${WIDTH} ${world.height}`, onPointerDown: onMapTap, className: "cs2-svg", children: [_jsxs("defs", { children: [_jsx("clipPath", { id: "cs2-west", children: _jsx("path", { d: world.west }) }), _jsx("clipPath", { id: "cs2-east", children: _jsx("path", { d: world.east }) })] }), CONTINENTS.map((c) => (_jsxs("g", { "data-cont": c, className: cls(c), style: { fill: fill(c) }, children: [_jsx("path", { d: world.land[c] }), c === 'europe' && _jsx("path", { d: world.russia, clipPath: "url(#cs2-west)" }), c === 'asia' && _jsx("path", { d: world.russia, clipPath: "url(#cs2-east)" })] }, c))), showLabels(level) &&
                                CONTINENTS.map((c) => (_jsx("text", { x: world.anchors[c][0], y: world.anchors[c][1] + (c === 'europe' ? -34 : -22), className: "cs2-label", children: cNames[c] }, c))), stickers.map(({ p, c, i }) => {
                                const [dx, dy] = SPOTS[i % SPOTS.length];
                                return (_jsx("text", { x: world.anchors[c][0] + dx, y: world.anchors[c][1] + dy + 24, className: "cs2-sticker", children: p.emoji }, p.id));
                            })] })) : (_jsx("div", { className: "cs2-loading", children: t('loading') })), _jsx(Pops, { pops: pops })] }), drag && q && (_jsx("div", { className: "cs2-ghost", style: { left: drag.x, top: drag.y }, children: q.emoji }))] }));
}
