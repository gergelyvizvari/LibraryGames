import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { CritterGuide } from '../../kit/critters';
import { useTimeouts } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { SceneTool } from '../../kit/scene';
import { SceneShell, useStage } from '../../kit/SceneShell';
import { sound } from '../../kit/sound';
import { DELIVERIES, makeVillage, run, slotsFor } from './logic';
import { PostCap, VillageMap } from './Village';
/** Time for one step of the hedgehog, in ms. */
const STEP = 430;
const turn = { up: 0, right: 90, down: 180, left: 270 };
function Arrow({ dir }) {
    return (_jsx("svg", { viewBox: "-16 -16 32 32", "aria-hidden": true, focusable: "false", children: _jsx("path", { transform: `rotate(${turn[dir]})`, d: "M0 -11 L12 4 H5 V12 H-5 V4 H-12Z", fill: "currentColor", stroke: "currentColor", strokeWidth: "3", strokeLinejoin: "round" }) }));
}
export default function HedgehogPost({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const [village, setVillage] = useState(() => makeVillage(rng, level));
    const [cards, setCards] = useState([]);
    const [at, setAt] = useState(village.start);
    const [trail, setTrail] = useState([]);
    const [active, setActive] = useState(null);
    const [wrong, setWrong] = useState(null);
    const [walking, setWalking] = useState(false);
    const [delivered, setDelivered] = useState(false);
    const [oops, setOops] = useState(false);
    const [say, setSay] = useState(t('say'));
    const stage = useStage(DELIVERIES, onFinish);
    const later = useTimeouts();
    const slots = slotsFor(village);
    const locked = walking || delivered || stage.over;
    const add = (d) => {
        if (locked)
            return;
        if (cards.length >= slots) {
            sound.tone(200, 0.06, 'square', 0.05);
            setSay(t('full'));
            return;
        }
        sound.tone(520 + cards.length * 30, 0.05, 'triangle', 0.1);
        // Quick taps can come before the next render, so build on the newest list.
        setCards((now) => (now.length >= slots ? now : [...now, d]));
        setWrong(null);
        setSay(t('ready'));
    };
    const remove = (i) => {
        if (locked)
            return;
        sound.tap();
        setCards((now) => now.filter((_, j) => j !== i));
        setWrong(null);
    };
    const back = () => {
        if (locked || !cards.length)
            return;
        remove(cards.length - 1);
    };
    const go = () => {
        if (locked)
            return;
        if (!cards.length) {
            sound.tap();
            setSay(t('say'));
            return;
        }
        const { cells, outcome } = run(village, cards);
        setWalking(true);
        setWrong(null);
        setTrail([]);
        setSay(t('walking'));
        cells.forEach((c, i) => later(() => {
            setAt(c);
            setActive(i);
            setTrail(cells.slice(0, i));
            sound.tone(480 + (i % 4) * 60, 0.06, 'triangle', 0.08);
        }, STEP * (i + 1)));
        const end = STEP * (cells.length + 1);
        if (outcome.kind === 'home') {
            later(() => {
                setDelivered(true);
                setActive(null);
                setSay(t('done'));
                if (stage.good())
                    return;
                later(() => {
                    const fresh = makeVillage(rng, level);
                    setVillage(fresh);
                    setAt(fresh.start);
                    setCards([]);
                    setTrail([]);
                    setDelivered(false);
                    setWalking(false);
                    setSay(t('say'));
                }, 1900);
            }, end - STEP / 2);
            return;
        }
        // Blocked or out of cards: the hedgehog shakes its head, then walks back to the post box; the cards stay to fix.
        later(() => {
            stage.slip();
            setOops(true);
            setActive(null);
            if (outcome.kind === 'blocked')
                setWrong(outcome.at);
            setSay(t(outcome.kind === 'blocked' ? 'blocked' : 'short'));
        }, end);
        later(() => {
            setOops(false);
            setAt(village.start);
            setTrail([]);
            setWalking(false);
        }, end + 1100);
    };
    return (_jsxs(SceneShell, { place: "woods", say: say, stage: stage, bare: true, className: "hedgehog-post", guide: _jsx(CritterGuide, { kind: "hedgehog", mood: delivered ? 'happy' : oops ? 'sad' : 'idle', children: _jsx(PostCap, {}) }), tray: _jsxs("div", { className: "hp-tray", children: [_jsx("div", { className: "hp-arrows", children: ['up', 'down', 'left', 'right'].map((d) => (_jsx(SceneTool, { kind: d, label: t(d), hideLabel: true, onPress: () => add(d), disabled: locked }, d))) }), _jsxs("div", { className: "hp-actions", children: [_jsx(SceneTool, { kind: "undo", label: t('undo'), hideLabel: true, onPress: back, disabled: locked || !cards.length }), _jsxs("button", { className: "hp-go", onPointerDown: go, disabled: locked || !cards.length, children: [_jsx("svg", { viewBox: "-10 -10 20 20", "aria-hidden": true, focusable: "false", children: _jsx("path", { d: "M-6 -8 L8 0 L-6 8Z", fill: "currentColor" }) }), t('go')] })] })] }), children: [_jsx("div", { className: "hp-board", children: _jsx(VillageMap, { village: village, at: at, trail: trail, delivered: delivered, oops: oops }) }, stage.done), _jsx("ol", { className: "hp-cards", "aria-label": t('cards'), style: { ['--hp-slots']: slots }, children: Array.from({ length: slots }, (_, i) => {
                    const d = cards[i];
                    if (!d)
                        return _jsx("li", { className: "hp-slot" }, i);
                    const state = wrong === i ? ' hp-wrong' : active === i ? ' hp-now' : active !== null && i < active ? ' hp-past' : '';
                    return (_jsx("li", { children: _jsx("button", { className: `hp-card${state}`, onPointerDown: () => remove(i), "aria-label": t(d), disabled: locked, children: _jsx(Arrow, { dir: d }) }) }, i));
                }) })] }));
}
