import { jsx as _jsx } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { useGameLoop, useShake } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { SceneShell, useStage } from '../../kit/SceneShell';
import { HOLES, pickCritter, points, spawnGap, upTime } from './logic';
/** Moles to tap in one stage. */
const STAGE = 10;
const faces = { mole: '🐹', gold: '🌟', bunny: '🐰' };
export default function MolePop({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const state = useRef({ elapsed: 0, spawnIn: 0.6, holes: Array(HOLES).fill(null) });
    const [holes, setHoles] = useState(state.current.holes);
    const stage = useStage(STAGE, onFinish);
    const over = stage.over;
    const [ref, shake] = useShake();
    useGameLoop((dt) => {
        const s = state.current;
        s.elapsed += dt;
        s.spawnIn -= dt;
        // A mole that goes back down untapped is not a mistake: another one comes.
        s.holes = s.holes.map((h) => (!h || s.elapsed < h.until ? h : null));
        if (s.spawnIn <= 0) {
            s.spawnIn = spawnGap(level, s.elapsed);
            const free = s.holes.map((h, i) => (h ? -1 : i)).filter((i) => i >= 0);
            if (free.length)
                s.holes[rng.pick(free)] = { kind: pickCritter(rng, level), until: s.elapsed + upTime(level, s.elapsed) + 0.4 };
        }
        setHoles([...s.holes]);
    }, !over);
    const whack = (i) => {
        const h = state.current.holes[i];
        if (over || !h || h.hit)
            return;
        state.current.holes[i] = { ...h, hit: true, until: state.current.elapsed + 0.25 };
        if (h.kind === 'bunny') {
            stage.slip();
            shake();
            return;
        }
        stage.good(points[h.kind]);
    };
    return (_jsx(SceneShell, { place: "meadow", say: t('say'), stage: stage, bare: true, className: "mole-pop", children: _jsx("div", { className: "mp-field", ref: ref, children: holes.map((h, i) => (_jsx("button", { className: "mp-hole", onPointerDown: () => whack(i), "aria-label": `hole ${i + 1}`, children: _jsx("span", { className: `mp-critter${h ? ' mp-up' : ''}${h?.hit ? ' mp-hit' : ''}`, children: h ? faces[h.kind] : '' }) }, i))) }) }));
}
