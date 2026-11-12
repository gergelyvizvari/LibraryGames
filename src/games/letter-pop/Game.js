import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useGameLoop, useShake } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { SceneShell, useStage } from '../../kit/SceneShell';
import { lettersForLevel, riseSpeed, spawnGap } from './logic';
/** Bubbles to pop in one stage. */
const STAGE = 10;
const colors = ['#ff9ff3', '#feca57', '#48dbfb', '#1dd1a1', '#ff6b6b', '#a29bfe'];
export default function LetterPop({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const letters = lettersForLevel(level);
    const state = useRef({ bubbles: [], elapsed: 0, spawnIn: 0.2, nextId: 0 });
    const [bubbles, setBubbles] = useState([]);
    const stage = useStage(STAGE, onFinish);
    const over = stage.over;
    const [ref, shake] = useShake();
    const input = useRef(null);
    useEffect(() => input.current?.focus(), []);
    useGameLoop((dt) => {
        const s = state.current;
        s.elapsed += dt;
        s.spawnIn -= dt;
        if (s.spawnIn <= 0) {
            s.spawnIn = spawnGap(level, s.elapsed);
            s.bubbles.push({ id: s.nextId++, letter: rng.pick([...letters]), x: rng.int(4, 76), y: 105, color: rng.pick(colors) });
        }
        const speed = riseSpeed(level, s.elapsed);
        // A bubble that floats away is not a mistake: another one comes.
        s.bubbles = s.bubbles.map((b) => ({ ...b, y: b.y - speed * dt })).filter((b) => b.y >= -12);
        setBubbles(s.bubbles);
    }, !over);
    const press = (key) => {
        if (over || key.length !== 1)
            return;
        const k = key.toLowerCase();
        const s = state.current;
        // Pop the highest bubble with that letter: it is the closest to escaping.
        const target = s.bubbles.filter((b) => b.letter === k).sort((a, b) => a.y - b.y)[0];
        if (!target) {
            stage.slip();
            shake();
            return;
        }
        s.bubbles = s.bubbles.filter((b) => b.id !== target.id);
        setBubbles(s.bubbles);
        stage.good();
    };
    return (_jsxs(SceneShell, { place: "sea", say: t('say'), stage: stage, bare: true, fill: true, className: "letter-pop", children: [_jsx("div", { className: "lp-water", ref: ref, onPointerDown: () => input.current?.focus(), children: bubbles.map((b) => (_jsx("span", { className: "lp-bubble", style: { left: `${b.x}%`, top: `${b.y}%`, borderColor: b.color, color: b.color }, children: b.letter }, b.id))) }), _jsx("input", { ref: input, className: "td-input", value: "", placeholder: t('typeHere'), onChange: (e) => {
                    const v = e.target.value;
                    if (v)
                        press(v[v.length - 1]);
                }, autoCapitalize: "none", autoCorrect: "off", autoComplete: "off", spellCheck: false })] }));
}
