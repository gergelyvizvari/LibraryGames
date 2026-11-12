import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { useGameLoop, useShake } from '../../kit/hooks';
import { SceneShell, useStage } from '../../kit/SceneShell';
import { sound } from '../../kit/sound';
import { drop, speedFor } from './logic';
/** Floors to build in one stage. */
const STAGE = 8;
const START = { x: 30, w: 40 };
const VISIBLE = 9;
const colors = ['#ff6b6b', '#feca57', '#1dd1a1', '#48dbfb', '#a29bfe', '#ff9ff3', '#ff9f43'];
export default function TowerStack({ level, t, onFinish }) {
    const [tower, setTower] = useState([START]);
    const moving = useRef({ x: 0, dir: 1 });
    const [movingX, setMovingX] = useState(0);
    const stage = useStage(STAGE, onFinish);
    const over = stage.over;
    const [falling, setFalling] = useState([]);
    const fallId = useRef(0);
    const [ref, shake] = useShake();
    const top = tower[tower.length - 1];
    const floors = tower.length - 1;
    const speed = speedFor(level, floors);
    useGameLoop((dt) => {
        const m = moving.current;
        m.x += m.dir * speed * dt;
        const max = 100 - top.w;
        if (m.x >= max) {
            m.x = max;
            m.dir = -1;
        }
        else if (m.x <= 0) {
            m.x = 0;
            m.dir = 1;
        }
        setMovingX(m.x);
    }, !over);
    const tap = () => {
        if (over)
            return;
        const r = drop({ x: moving.current.x, w: top.w }, top);
        if (!r.placed) {
            // A block that misses the tower just falls: nothing is lost, the next one comes.
            stage.slip();
            shake();
            setFalling((f) => [...f, { id: fallId.current++, x: moving.current.x, w: top.w, floor: floors + 1 }]);
            return;
        }
        setTower([...tower, r.placed]);
        if (!r.perfect) {
            sound.tone(300 + floors * 25, 0.12, 'triangle', 0.2);
            if (r.cut > 0) {
                const cutX = moving.current.x < top.x ? moving.current.x : r.placed.x + r.placed.w;
                setFalling((f) => [...f, { id: fallId.current++, x: cutX, w: r.cut, floor: floors + 1 }]);
            }
        }
        // Start the next block from the side it is furthest from.
        moving.current = { x: moving.current.dir > 0 ? 0 : 100 - r.placed.w, dir: moving.current.dir };
        stage.good(r.perfect ? 25 : 10);
    };
    const base = Math.max(0, tower.length - VISIBLE);
    const shown = tower.slice(base);
    const rowH = 100 / (VISIBLE + 2);
    const y = (floor) => 100 - (floor - base + 1) * rowH;
    return (_jsx(SceneShell, { place: "meadow", say: t('tap'), stage: stage, bare: true, fill: true, className: "tower-stack", children: _jsxs("div", { className: "ts-sky", ref: ref, onPointerDown: tap, children: [shown.map((b, i) => (_jsx("div", { className: "ts-block", style: { left: `${b.x}%`, width: `${b.w}%`, top: `${y(base + i)}%`, height: `${rowH}%`, background: colors[(base + i) % colors.length] } }, base + i))), !over && (_jsx("div", { className: "ts-block ts-moving", style: { left: `${movingX}%`, width: `${top.w}%`, top: `${y(tower.length)}%`, height: `${rowH}%`, background: colors[tower.length % colors.length] } })), falling.map((f) => (_jsx("div", { className: "ts-block ts-falling", style: { left: `${f.x}%`, width: `${f.w}%`, top: `${y(f.floor)}%`, height: `${rowH}%` }, onAnimationEnd: () => setFalling((all) => all.filter((a) => a.id !== f.id)) }, f.id)))] }) }));
}
