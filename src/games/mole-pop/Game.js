import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { useCountdown, useGameLoop, usePops, useShake } from '../../kit/hooks';
import { clamp, makeRng } from '../../kit/random';
import { sound, vibrate } from '../../kit/sound';
import { Hud, Pops, TimerBar } from '../../kit/ui';
import { HOLES, pickCritter, points, spawnGap, upTime } from './logic';
const DURATION = 45;
const faces = { mole: '🐹', gold: '🌟', bunny: '🐰' };
export default function MolePop({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const state = useRef({ elapsed: 0, spawnIn: 0.6, holes: Array(HOLES).fill(null) });
    const [holes, setHoles] = useState(state.current.holes);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [hits, setHits] = useState(0);
    const [misses, setMisses] = useState(0);
    const [over, setOver] = useState(false);
    const [pops, addPop] = usePops();
    const [ref, shake] = useShake();
    const left = useCountdown(DURATION, () => {
        setOver(true);
        onFinish({ score, accuracy: (hits / Math.max(1, hits + misses)) * clamp(hits / 25, 0, 1) });
    }, !over);
    useGameLoop((dt) => {
        const s = state.current;
        s.elapsed += dt;
        s.spawnIn -= dt;
        let missed = 0;
        s.holes = s.holes.map((h) => {
            if (!h || s.elapsed < h.until)
                return h;
            if (!h.hit && h.kind !== 'bunny')
                missed++;
            return null;
        });
        if (s.spawnIn <= 0) {
            s.spawnIn = spawnGap(level, s.elapsed);
            const free = s.holes.map((h, i) => (h ? -1 : i)).filter((i) => i >= 0);
            if (free.length)
                s.holes[rng.pick(free)] = { kind: pickCritter(rng, level), until: s.elapsed + upTime(level, s.elapsed) };
        }
        if (missed) {
            setMisses((m) => m + missed);
            setCombo(0);
        }
        setHoles([...s.holes]);
    }, !over);
    const whack = (i) => {
        const h = state.current.holes[i];
        if (over || !h || h.hit)
            return;
        state.current.holes[i] = { ...h, hit: true, until: state.current.elapsed + 0.25 };
        const x = ((i % 3) + 0.5) * 33.3;
        const y = (Math.floor(i / 3) + 0.3) * 33.3;
        if (h.kind === 'bunny') {
            setCombo(0);
            setScore((s) => Math.max(0, s + points.bunny));
            setMisses((m) => m + 1);
            sound.bad();
            vibrate(80);
            shake();
            addPop(t('bunny'), x, y, 'bad');
            return;
        }
        const nc = combo + 1;
        const gained = points[h.kind] + Math.min(nc, 10);
        setCombo(nc);
        setHits((n) => n + 1);
        setScore((s) => s + gained);
        sound.good(nc);
        addPop(`+${gained}`, x, y);
    };
    return (_jsxs("div", { className: "game mole-pop", children: [_jsx(TimerBar, { left: left, total: DURATION }), _jsx(Hud, { items: [
                    { label: t('score'), value: score },
                    { label: t('combo'), value: `×${combo}`, highlight: combo >= 5 },
                    { label: t('time'), value: Math.ceil(left) },
                ] }), _jsxs("div", { className: "mp-field", ref: ref, children: [holes.map((h, i) => (_jsx("button", { className: "mp-hole", onPointerDown: () => whack(i), "aria-label": `hole ${i + 1}`, children: _jsx("span", { className: `mp-critter${h ? ' mp-up' : ''}${h?.hit ? ' mp-hit' : ''}`, children: h ? faces[h.kind] : '' }) }, i))), _jsx(Pops, { pops: pops })] })] }));
}
