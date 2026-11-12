import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useShake, useTimeouts } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { SceneTool } from '../../kit/scene';
import { SceneShell, useStage } from '../../kit/SceneShell';
import { sound } from '../../kit/sound';
import { ANIMALS, animalCount, makeSequence, roundPoints, seqLength, showLights, stepMs } from './logic';
import { preloadVoices, voices } from './voices';
const faces = { cat: '🐱', dog: '🐶', cow: '🐮', duck: '🦆', bird: '🐦', frog: '🐸', sheep: '🐑', pig: '🐷', rooster: '🐓', horse: '🐴' };
/** Calls to repeat in one stage. */
const STAGE = 5;
export default function AnimalSounds({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const count = animalCount(level);
    // Shuffle which animals live on the farm, so the board isn't always the same.
    const farm = useRef(rng.shuffle([...ANIMALS]).slice(0, count)).current;
    const lights = showLights(level);
    const ms = stepMs(level);
    const [round, setRound] = useState(0);
    const [seq, setSeq] = useState(() => makeSequence(rng, seqLength(level, 0), count));
    const [phase, setPhase] = useState('listen');
    const [playKey, setPlayKey] = useState(0);
    const [pos, setPos] = useState(0);
    const [lit, setLit] = useState(null);
    const [calling, setCalling] = useState(false);
    const stage = useStage(STAGE, onFinish);
    const [replayed, setReplayed] = useState(false);
    const [message, setMessage] = useState('');
    const [boardRef, shake] = useShake();
    const later = useTimeouts();
    useEffect(() => preloadVoices(farm), []);
    const call = (i, glow) => {
        voices[farm[i]]();
        if (glow)
            setLit(i);
        else
            setCalling(true);
        later(() => {
            setLit((c) => (c === i ? null : c));
            setCalling(false);
        }, ms * 0.7);
    };
    // Play the calls whenever we enter "listen".
    useEffect(() => {
        if (phase !== 'listen')
            return;
        setMessage(t('listen'));
        seq.forEach((a, i) => later(() => call(a, lights), 700 + i * ms));
        later(() => {
            setPos(0);
            setPhase('input');
            setMessage(t('yourTurn'));
        }, 700 + seq.length * ms);
    }, [phase, playKey]);
    const nextRound = () => {
        const r = round + 1;
        later(() => {
            setRound(r);
            setSeq(makeSequence(rng, seqLength(level, r), count));
            setReplayed(false);
            setPhase('listen');
            setPlayKey((k) => k + 1);
        }, 1200);
    };
    const tap = (i) => {
        if (phase !== 'input')
            return;
        if (i !== seq[pos]) {
            shake();
            sound.bad();
            setLit(seq[pos]);
            later(() => setLit(null), 700);
            setMessage(t('oops', { animal: faces[farm[seq[pos]]] }));
            setPhase('between');
            if (!stage.miss())
                nextRound();
            return;
        }
        // A soft tick, not the call again: hearing every sequence twice gets tiring fast.
        sound.tap();
        setLit(i);
        later(() => setLit((c) => (c === i ? null : c)), 300);
        if (pos + 1 < seq.length) {
            setPos(pos + 1);
            return;
        }
        setMessage(t('great'));
        setPhase('between');
        if (!stage.good(roundPoints(seq.length, replayed, 1)))
            nextRound();
    };
    const replay = () => {
        if (phase !== 'input' || pos > 0 || replayed)
            return;
        setReplayed(true);
        setPhase('listen');
        setPlayKey((k) => k + 1);
    };
    return (_jsxs(SceneShell, { place: "lake", say: message, stage: stage, bare: true, className: "animal-sounds", tray: _jsx(SceneTool, { kind: "listen", label: t('again'), onPress: replay, disabled: phase !== 'input' || pos > 0 || replayed }), children: [_jsx("div", { className: `as-ear${calling ? ' as-calling' : ''}`, "aria-hidden": true, children: phase === 'listen' ? '♪' : phase === 'input' ? `${pos} / ${seq.length}` : '' }), _jsx("div", { ref: boardRef, className: `as-farm as-farm-${count}`, children: farm.map((a, i) => (_jsx("button", { className: `as-animal${lit === i ? ' as-lit' : ''}`, onPointerDown: () => tap(i), disabled: phase !== 'input', "aria-label": t(a), children: _jsx("span", { className: "as-face", children: faces[a] }) }, a))) })] }));
}
