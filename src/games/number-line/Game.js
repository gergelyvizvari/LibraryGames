import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { useShake, useTimeouts } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { SceneShell, useStage } from '../../kit/SceneShell';
import { tone } from '../../kit/sound';
import { jumpText, makeQuestion, pathOf, showsLabel, specFor, WINDOW } from './logic';
/** Landings to find in one stage. */
const STAGE = 6;
/** Where a number sits across the line, in % of its width. */
const xOf = (n, lo) => 8 + ((n - lo) / WINDOW) * 84;
/** Every single hop the frog makes, one number at a time. */
function hopsOf(q) {
    const path = pathOf(q);
    const out = [];
    for (let k = 1; k < path.length; k++) {
        const dir = Math.sign(path[k] - path[k - 1]);
        for (let n = path[k - 1] + dir; n !== path[k] + dir; n += dir)
            out.push(n);
    }
    return out;
}
/** The little frog that hops along the stones. */
function Frog() {
    return (_jsxs("svg", { className: "nl-frog-art", viewBox: "-30 -30 60 56", "aria-hidden": true, focusable: "false", children: [_jsx("ellipse", { cx: "0", cy: "20", rx: "24", ry: "5", fill: "#241a3c", opacity: "0.25" }), _jsx("path", { d: "M-24 20 C-28 8 -16 2 -10 10Z M24 20 C28 8 16 2 10 10Z", fill: "#4a9a4e" }), _jsx("ellipse", { cx: "0", cy: "6", rx: "22", ry: "16", fill: "#6cbf5c" }), _jsx("ellipse", { cx: "0", cy: "11", rx: "13", ry: "8", fill: "#e3f4b8" }), _jsx("circle", { cx: "-11", cy: "-13", r: "10", fill: "#6cbf5c" }), _jsx("circle", { cx: "11", cy: "-13", r: "10", fill: "#6cbf5c" }), _jsx("circle", { cx: "-11", cy: "-13", r: "6.6", fill: "#fff" }), _jsx("circle", { cx: "11", cy: "-13", r: "6.6", fill: "#fff" }), _jsx("circle", { cx: "-10.4", cy: "-12.5", r: "4.8", fill: "#33284a" }), _jsx("circle", { cx: "11.6", cy: "-12.5", r: "4.8", fill: "#33284a" }), _jsx("circle", { cx: "-12.2", cy: "-14.6", r: "1.8", fill: "#fff" }), _jsx("circle", { cx: "9.8", cy: "-14.6", r: "1.8", fill: "#fff" }), _jsx("path", { d: "M-7 3 q7 6 14 0", fill: "none", stroke: "#33284a", strokeWidth: "2.2", strokeLinecap: "round" })] }));
}
export default function NumberLine({ level, seed, t, onFinish }) {
    const spec = specFor(level);
    const rng = useRef(makeRng(seed)).current;
    const [q, setQ] = useState(() => makeQuestion(rng, level, rng.int(0, Math.min(4, spec.max - WINDOW + 4))));
    const [frog, setFrog] = useState(q.start);
    const [hop, setHop] = useState(0);
    const [busy, setBusy] = useState(false);
    const [picked, setPicked] = useState(null);
    const [count, setCount] = useState(null);
    // The stone a finger rests on. A finger can slide to the right stone; the answer counts when it lifts.
    const [aim, setAimState] = useState(null);
    const aimRef = useRef(null);
    const setAim = (n) => {
        aimRef.current = n;
        setAimState(n);
    };
    const [message, setMessage] = useState(() => ({ text: t('ask'), kind: '' }));
    const stage = useStage(STAGE, onFinish);
    const over = stage.over;
    const [lineRef, shake] = useShake();
    const later = useTimeouts();
    const sum = `${q.start} ${q.jumps.map(jumpText).join(' ')} = ${q.end}`;
    const tap = (n) => {
        if (over || busy)
            return;
        const right = n === q.end;
        setBusy(true);
        setPicked(n);
        let last = false;
        if (right) {
            setMessage({ text: sum, kind: 'yes' });
            last = stage.good();
        }
        else {
            setMessage({ text: t('no', { start: q.start, jumps: q.jumps.map(jumpText).join(' '), end: q.end }), kind: 'no' });
            stage.slip();
            shake();
        }
        // The frog hops the way, one number at a time. After a miss it hops slower and counts out loud.
        const hops = hopsOf(q);
        const step = right ? 150 : 330;
        hops.forEach((n, i) => {
            later(() => {
                setFrog(n);
                setHop((h) => h + 1);
                if (!right)
                    setCount(i + 1);
                tone(420 + i * 40, 0.07, 'triangle', 0.1);
            }, (right ? 150 : 600) + i * step);
        });
        if (last)
            return;
        later(() => {
            const nq = makeQuestion(rng, level, q.end);
            setQ(nq);
            setFrog(nq.start);
            setPicked(null);
            setCount(null);
            setBusy(false);
            setMessage({ text: t('ask'), kind: '' });
        }, (right ? 150 : 600) + hops.length * step + (right ? 450 : 900));
    };
    /** The stone under the finger, from the stage's left edge: a tap counts when the finger lifts. */
    const tickAt = (e) => {
        const box = e.currentTarget.getBoundingClientRect();
        const pct = ((e.clientX - box.left) / box.width) * 100;
        return Math.min(q.lo + WINDOW, Math.max(q.lo, q.lo + Math.round(((pct - 8) / 84) * WINDOW)));
    };
    const ticks = Array.from({ length: WINDOW + 1 }, (_, i) => q.lo + i);
    return (_jsxs(SceneShell, { place: "peaks", say: message.text, stage: stage, bare: true, className: "number-line", children: [_jsx("div", { className: "nl-jumps", children: q.jumps.map((j, i) => (_jsxs("span", { className: `nl-jump ${j > 0 ? 'nl-fwd' : 'nl-back'}`, children: [_jsx("svg", { viewBox: "-14 -12 28 24", "aria-hidden": true, focusable: "false", style: { transform: j > 0 ? undefined : 'scaleX(-1)' }, children: _jsx("path", { d: "M-11 0 H7 M2 -8 L11 0 L2 8", fill: "none", stroke: "currentColor", strokeWidth: "4.5", strokeLinecap: "round", strokeLinejoin: "round" }) }), jumpText(j)] }, i))) }, `${q.start}-${q.jumps.join()}-${q.lo}`), _jsxs("div", { className: "nl-stage", ref: lineRef, onPointerDown: (e) => {
                    if (over || busy)
                        return;
                    e.currentTarget.setPointerCapture?.(e.pointerId);
                    setAim(tickAt(e));
                }, onPointerMove: (e) => aimRef.current !== null && setAim(tickAt(e)), onPointerUp: () => {
                    const n = aimRef.current;
                    setAim(null);
                    if (n !== null)
                        tap(n);
                }, onPointerCancel: () => setAim(null), children: [_jsxs("span", { className: "nl-frog", style: { left: `${xOf(frog, q.lo)}%` }, children: [_jsx(Frog, {}), count !== null && _jsx("span", { className: "nl-count", children: count })] }, hop), _jsx("div", { className: "nl-line" }), ticks.map((n) => {
                        const state = picked === n ? (n === q.end ? ' nl-right' : ' nl-wrong') : busy && n === q.end && picked !== null ? ' nl-right' : '';
                        return (_jsxs("button", { className: `nl-tick${n === q.start ? ' nl-start' : ''}${state}${aim === n ? ' nl-aim' : ''}`, style: { left: `${xOf(n, q.lo)}%` }, 
                            // Taps and drags are handled by the stage; this is for the keyboard (Enter or Space).
                            onClick: (e) => e.detail === 0 && tap(n), disabled: over, "aria-label": String(n), children: [_jsx("span", { className: "nl-mark" }), _jsx("span", { className: "nl-num", children: showsLabel(n, q, spec.labels) || (busy && n === q.end) ? n : '' })] }, n));
                    })] })] }));
}
