import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useCountdown, useGameLoop, usePops, useShake } from '../../kit/hooks';
import { clamp, makeRng } from '../../kit/random';
import { sound, vibrate } from '../../kit/sound';
import { Hud, Pops, TimerBar } from '../../kit/ui';
import { lettersForLevel, riseSpeed, spawnGap } from './logic';
const DURATION = 60;
const colors = ['#ff9ff3', '#feca57', '#48dbfb', '#1dd1a1', '#ff6b6b', '#a29bfe'];
export default function LetterPop({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const letters = lettersForLevel(level);
    const state = useRef({ bubbles: [], elapsed: 0, spawnIn: 0.2, nextId: 0 });
    const [bubbles, setBubbles] = useState([]);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [popped, setPopped] = useState(0);
    const [missed, setMissed] = useState(0);
    const [over, setOver] = useState(false);
    const [pops, addPop] = usePops();
    const [ref, shake] = useShake();
    const input = useRef(null);
    useEffect(() => input.current?.focus(), []);
    const left = useCountdown(DURATION, () => {
        setOver(true);
        onFinish({ score, accuracy: (popped / Math.max(1, popped + missed)) * clamp(popped / 30, 0, 1) });
    }, !over);
    useGameLoop((dt) => {
        const s = state.current;
        s.elapsed += dt;
        s.spawnIn -= dt;
        if (s.spawnIn <= 0) {
            s.spawnIn = spawnGap(level, s.elapsed);
            s.bubbles.push({ id: s.nextId++, letter: rng.pick([...letters]), x: rng.int(4, 76), y: 105, color: rng.pick(colors) });
        }
        const speed = riseSpeed(level, s.elapsed);
        let escaped = 0;
        s.bubbles = s.bubbles.flatMap((b) => {
            const y = b.y - speed * dt;
            if (y < -12) {
                escaped++;
                return [];
            }
            return [{ ...b, y }];
        });
        if (escaped) {
            setMissed((m) => m + escaped);
            setCombo(0);
        }
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
            setCombo(0);
            sound.bad();
            vibrate(30);
            shake();
            return;
        }
        s.bubbles = s.bubbles.filter((b) => b.id !== target.id);
        setBubbles(s.bubbles);
        const nc = combo + 1;
        const gained = 5 + Math.min(nc, 10);
        setCombo(nc);
        setPopped((p) => p + 1);
        setScore((v) => v + gained);
        sound.good(nc);
        addPop(`+${gained}`, target.x + 5, target.y);
    };
    return (_jsxs("div", { className: "game letter-pop", onPointerDown: () => input.current?.focus(), children: [_jsx(TimerBar, { left: left, total: DURATION }), _jsx(Hud, { items: [
                    { label: t('score'), value: score },
                    { label: t('combo'), value: `×${combo}`, highlight: combo >= 8 },
                    { label: t('time'), value: Math.ceil(left) },
                ] }), _jsxs("div", { className: "lp-water", ref: ref, children: [bubbles.map((b) => (_jsx("span", { className: "lp-bubble", style: { left: `${b.x}%`, top: `${b.y}%`, borderColor: b.color, color: b.color }, children: b.letter }, b.id))), _jsx(Pops, { pops: pops })] }), _jsx("input", { ref: input, className: "td-input", value: "", placeholder: t('typeHere'), onChange: (e) => {
                    const v = e.target.value;
                    if (v)
                        press(v[v.length - 1]);
                }, autoCapitalize: "none", autoCorrect: "off", autoComplete: "off", spellCheck: false })] }));
}
