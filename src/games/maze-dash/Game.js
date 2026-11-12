import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useTimeouts } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { SceneTool } from '../../kit/scene';
import { SceneShell, useStage } from '../../kit/SceneShell';
import { sound } from '../../kit/sound';
import { Garden } from './Garden';
import { E, N, S, W, makeMaze, sizeFor, step } from './logic';
/** Mazes in one stage. */
const STAGE = 3;
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
    const [busy, setBusy] = useState(false);
    const touch = useRef(null);
    const later = useTimeouts();
    const goal = maze.w * maze.h - 1;
    const stage = useStage(STAGE, onFinish);
    const over = stage.over;
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
        setSolved((n) => n + 1);
        setBusy(true);
        if (stage.good(maze.w * maze.h))
            return;
        later(() => {
            setMaze(newMaze(solved + 1));
            setPos(0);
            setTrail([0]);
            setBusy(false);
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
    return (_jsx(SceneShell, { place: "woods", say: t('say'), stage: stage, bare: true, className: "maze-dash", tray: _jsxs("div", { className: "md-pad", children: [_jsx("span", {}), _jsx(SceneTool, { kind: "up", label: t('up'), hideLabel: true, onPress: () => move(N) }), _jsx("span", {}), _jsx(SceneTool, { kind: "left", label: t('left'), hideLabel: true, onPress: () => move(W) }), _jsx(SceneTool, { kind: "down", label: t('down'), hideLabel: true, onPress: () => move(S) }), _jsx(SceneTool, { kind: "right", label: t('right'), hideLabel: true, onPress: () => move(E) })] }), children: _jsx("div", { className: "md-maze", style: { aspectRatio: `${maze.w} / ${maze.h}`, ['--md-ratio']: maze.w / maze.h }, onPointerDown: (e) => (touch.current = { x: e.clientX, y: e.clientY }), onPointerUp: (e) => {
                const start = touch.current;
                touch.current = null;
                if (!start)
                    return;
                const dx = e.clientX - start.x;
                const dy = e.clientY - start.y;
                if (Math.max(Math.abs(dx), Math.abs(dy)) < 24)
                    return;
                move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? E : W) : dy > 0 ? S : N);
            }, children: _jsx(Garden, { maze: maze, pos: pos, trail: trail, won: busy }) }, solved) }));
}
