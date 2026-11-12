import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useLatest, useShake, useTimeouts } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { SceneShell, useStage } from '../../kit/SceneShell';
import { sound, vibrate } from '../../kit/sound';
import { BAR, beatMs, cellBeats, grade, judge, makePattern, showWhilePlaying } from './logic';
/** Rhythms to play back in one stage. */
const STAGE = 5;
/** Pause before the drum starts, in ms. */
const LEAD = 700;
/** With no tap for this long the player's turn is over. */
const FIRST_TAP_WAIT = 8000;
/** Plays a drum hit `delay` seconds from now; returns the notes so they can be cut off. */
function drum(delay = 0) {
    return [sound.tone(180, 0.18, 'sine', 0.35, delay), sound.tone(100, 0.25, 'triangle', 0.25, delay)];
}
export default function RhythmCopy({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const beat = beatMs(level);
    const [round, setRound] = useState(0);
    const [pattern, setPattern] = useState(() => makePattern(rng, level, 0));
    const [phase, setPhase] = useState('listen');
    // The drum hit sounding now, to light up its note while the rhythm plays.
    const [lit, setLit] = useState(-1);
    const [hit, setHit] = useState(false);
    const [credits, setCredits] = useState(null);
    const stage = useStage(STAGE, onFinish);
    const [message, setMessage] = useState('');
    const [ref, shake] = useShake();
    const later = useTimeouts();
    const tapTimes = useRef([]);
    const notes = useRef([]);
    const idle = useRef(undefined);
    const bounce = () => {
        setHit(true);
        later(() => setHit(false), 110);
    };
    const finishRound = useLatest(() => {
        clearTimeout(idle.current);
        const j = judge(pattern.hits, tapTimes.current, beat, level);
        const g = grade(j.score);
        setCredits(j.credits);
        setPhase('result');
        setMessage(t(g));
        let last;
        if (g === 'oops') {
            sound.bad();
            shake();
            last = stage.miss();
        }
        else
            last = stage.good(Math.round(j.score * pattern.hits.length * 10));
        if (last)
            return;
        later(() => {
            setRound(round + 1);
            setPattern(makePattern(rng, level, round + 1));
        }, 2200);
    });
    const waitForTaps = (ms) => {
        clearTimeout(idle.current);
        idle.current = window.setTimeout(() => finishRound.current(), ms);
    };
    // The drum plays the rhythm at an even tempo, scheduled on the audio clock so it never drifts.
    // No click and no count-in: like a teacher clapping, the pulse lives inside the rhythm.
    useEffect(() => {
        setPhase('listen');
        setLit(-1);
        setCredits(null);
        setMessage('');
        tapTimes.current = [];
        pattern.hits.forEach((h, i) => {
            notes.current.push(...drum((LEAD + h * beat) / 1000));
            later(() => {
                setLit(i);
                bounce();
            }, LEAD + h * beat);
        });
        later(() => {
            setLit(-1);
            setPhase('play');
            waitForTaps(FIRST_TAP_WAIT);
        }, LEAD + pattern.beats * beat);
        // Leaving mid-round must silence the notes already queued up.
        return () => {
            clearTimeout(idle.current);
            notes.current.splice(0).forEach((n) => {
                try {
                    n?.stop();
                }
                catch {
                    // already finished
                }
            });
        };
    }, [pattern]);
    const tap = () => {
        if (phase !== 'play')
            return;
        drum();
        bounce();
        vibrate(15);
        tapTimes.current.push(performance.now());
        if (tapTimes.current.length >= pattern.hits.length)
            finishRound.current();
        // A pause of a bar and a half means the player has finished (or given up on) the rhythm.
        else
            waitForTaps(beat * BAR * 1.5);
    };
    const shown = phase !== 'play' || showWhilePlaying(level);
    let hitIndex = 0;
    let cellStart = 0;
    return (_jsxs(SceneShell, { place: "lake", say: phase === 'result' ? message : phase === 'listen' ? t('listen') : t('yourTurn'), stage: stage, bare: true, className: "rhythm-copy", children: [_jsx("div", { className: "rc-bar", children: shown
                    ? pattern.cells.map((c, ci) => {
                        const from = cellStart;
                        cellStart += cellBeats[c];
                        const dots = c === 'titi' ? 2 : c === 'rest' ? 0 : 1;
                        const first = hitIndex;
                        hitIndex += dots;
                        return (_jsx("span", { className: `rc-cell rc-c-${c}${phase === 'play' ? ' rc-faded' : ''}${lit >= first && lit < first + dots ? ' rc-now' : ''}${from > 0 && from % BAR === 0 ? ' rc-newbar' : ''}`, style: { flexGrow: cellBeats[c] }, children: dots === 0 ? (_jsx("span", { className: "rc-rest" })) : (Array.from({ length: dots }, (_, k) => (_jsx("span", { className: `rc-dot${credits ? (credits[first + k] >= 0.5 ? ' rc-good' : ' rc-miss') : ''}` }, k)))) }, `${round}-${ci}`));
                    })
                    : Array.from({ length: pattern.beats }, (_, b) => (_jsx("span", { className: `rc-cell${b > 0 && b % BAR === 0 ? ' rc-newbar' : ''}`, style: { flexGrow: 1 } }, `${round}-${b}`))) }), _jsx("button", { ref: ref, className: `rc-drum${hit ? ' rc-hit' : ''}${phase === 'play' ? ' rc-ready' : ''}`, onPointerDown: tap, "aria-label": t('drum'), children: _jsxs("svg", { viewBox: "-100 -100 200 200", "aria-hidden": true, focusable: "false", children: [_jsx("ellipse", { cx: "0", cy: "62", rx: "84", ry: "16", fill: "#241a3c", opacity: "0.25" }), _jsx("path", { d: "M-78 -18 V34 A78 26 0 0 0 78 34 V-18Z", fill: "#e2607e" }), _jsx("path", { d: "M30 4 V58 A78 26 0 0 0 78 34 V-18 A78 26 0 0 1 30 4Z", fill: "#c94a6b" }), _jsx("path", { d: "M-78 -8 L-52 46 L-26 0 L0 54 L26 0 L52 46 L78 -8", fill: "none", stroke: "#fff6dc", strokeWidth: "5", strokeLinejoin: "round" }), _jsx("path", { d: "M-78 30 A78 26 0 0 0 78 30", fill: "none", stroke: "#f2c14e", strokeWidth: "10" }), _jsx("ellipse", { cx: "0", cy: "-18", rx: "78", ry: "26", fill: "#f2c14e" }), _jsx("ellipse", { cx: "0", cy: "-18", rx: "66", ry: "20", fill: "#fff6dc" }), _jsxs("g", { className: "rc-sticks", children: [_jsx("path", { d: "M-66 -86 L-14 -24 M66 -86 L14 -24", stroke: "#a8683c", strokeWidth: "9", strokeLinecap: "round" }), _jsx("circle", { cx: "-12", cy: "-22", r: "9", fill: "#8a5a3c" }), _jsx("circle", { cx: "12", cy: "-22", r: "9", fill: "#8a5a3c" })] })] }) })] }));
}
