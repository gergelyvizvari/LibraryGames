import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useCountdown, usePops, useTimeouts } from '../../kit/hooks';
import { clamp, makeRng } from '../../kit/random';
import { sound } from '../../kit/sound';
import { Hud, Pops, TimerBar } from '../../kit/ui';
import { E, N, S, W, makeMaze, sizeFor, step } from './logic';
const DURATION = 90;
const keys = { ArrowUp: N, ArrowRight: E, ArrowDown: S, ArrowLeft: W, w: N, d: E, s: S, a: W };
export default function MazeDash({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const newMaze = (solved) => {
        const { w, h } = sizeFor(level, solved);
        return makeMaze(rng, w, h);
    };
    const [maze, setMaze] = useState(() => newMaze(0));
    const [pos, setPos] = useState(0);
    const [trail, setTrail] = useState([0]);
    const [solved, setSolved] = useState(0);
    const [score, setScore] = useState(0);
    const [over, setOver] = useState(false);
    const [busy, setBusy] = useState(false);
    const startedAt = useRef(performance.now());
    const touch = useRef(null);
    const [pops, addPop] = usePops();
    const later = useTimeouts();
    const goal = maze.w * maze.h - 1;
    const left = useCountdown(DURATION, () => {
        setOver(true);
        onFinish({ score, accuracy: clamp(solved / 4, 0, 1) });
    }, !over);
    const move = (dir) => {
        if (over || busy)
            return;
        const next = step(maze, pos, dir);
        if (next === pos) {
            sound.tone(180, 0.05, 'square', 0.06);
            return;
        }
        sound.tone(600, 0.03, 'triangle', 0.08);
        setPos(next);
        setTrail((tr) => (tr.includes(next) ? tr : [...tr, next]));
        if (next !== goal)
            return;
        const seconds = (performance.now() - startedAt.current) / 1000;
        const gained = maze.w * maze.h + Math.max(0, Math.round(30 - seconds));
        setScore((s) => s + gained);
        setSolved((n) => n + 1);
        sound.win();
        addPop(`${t('yum')} +${gained}`, 50, 50);
        setBusy(true);
        later(() => {
            setMaze(newMaze(solved + 1));
            setPos(0);
            setTrail([0]);
            setBusy(false);
            startedAt.current = performance.now();
        }, 900);
    };
    const moveRef = useRef(move);
    moveRef.current = move;
    useEffect(() => {
        const onKey = (e) => {
            const d = keys[e.key];
            if (d) {
                e.preventDefault();
                moveRef.current(d);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);
    const cell = (i) => {
        const o = maze.open[i];
        const wall = '3px solid var(--ink)';
        return {
            borderTop: o & N ? undefined : wall,
            borderRight: o & E ? undefined : wall,
            borderBottom: o & S ? undefined : wall,
            borderLeft: o & W ? undefined : wall,
        };
    };
    return (_jsxs("div", { className: "game maze-dash", children: [_jsx(TimerBar, { left: left, total: DURATION }), _jsx(Hud, { items: [
                    { label: t('score'), value: score },
                    { label: t('mazes'), value: solved, highlight: solved > 0 },
                    { label: t('time'), value: Math.ceil(left) },
                ] }), _jsxs("div", { className: "md-maze", style: { gridTemplateColumns: `repeat(${maze.w}, 1fr)`, aspectRatio: `${maze.w} / ${maze.h}` }, onPointerDown: (e) => (touch.current = { x: e.clientX, y: e.clientY }), onPointerUp: (e) => {
                    const start = touch.current;
                    touch.current = null;
                    if (!start)
                        return;
                    const dx = e.clientX - start.x;
                    const dy = e.clientY - start.y;
                    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24)
                        return;
                    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? E : W) : dy > 0 ? S : N);
                }, children: [maze.open.map((_, i) => (_jsx("div", { className: `md-cell${trail.includes(i) ? ' md-trail' : ''}`, style: cell(i), children: i === pos ? '🐭' : i === goal ? '🧀' : '' }, i))), _jsx(Pops, { pops: pops })] }, solved), _jsxs("div", { className: "md-pad", children: [_jsx("span", {}), _jsx("button", { className: "md-btn", onPointerDown: () => move(N), "aria-label": "up", children: "\u2B06\uFE0F" }), _jsx("span", {}), _jsx("button", { className: "md-btn", onPointerDown: () => move(W), "aria-label": "left", children: "\u2B05\uFE0F" }), _jsx("button", { className: "md-btn", onPointerDown: () => move(S), "aria-label": "down", children: "\u2B07\uFE0F" }), _jsx("button", { className: "md-btn", onPointerDown: () => move(E), "aria-label": "right", children: "\u27A1\uFE0F" })] })] }));
}
