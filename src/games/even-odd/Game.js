import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useGameLoop, useLatest, useShake, useTimeouts } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { SceneShell, useStage } from '../../kit/SceneShell';
import { binFor, explain, fallSeconds, makeDealer, showDots, swipeBin } from './logic';
/** Numbers to sort in one stage. */
const STAGE = 10;
/** Dots in pairs, two rows, so an odd number has one dot left over. */
function Dots({ n }) {
    const cols = Math.ceil(n / 2);
    return (_jsx("span", { className: "eo-dots", style: { gridTemplateColumns: `repeat(${cols}, 1fr)` }, children: Array.from({ length: cols * 2 }, (_, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const filled = col * 2 + row < n;
            const lone = n % 2 === 1 && col === cols - 1 && row === 0;
            return _jsx("span", { className: `eo-dot${filled ? '' : ' eo-dot-empty'}${lone ? ' eo-dot-lone' : ''}` }, i);
        }) }));
}
export default function EvenOdd({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const deal = useRef(makeDealer(rng, level)).current;
    const nextId = useRef(0);
    // The falling number lives in a ref (the game loop and taps both change it) and is copied to state to draw it.
    const cur = useRef(null);
    if (!cur.current)
        cur.current = { id: nextId.current++, n: deal(), y: 0 };
    const [drop, setDrop] = useState(cur.current);
    const show = (d) => {
        cur.current = d;
        setDrop(d);
    };
    const [message, setMessage] = useState(() => ({ text: t('hint'), kind: '' }));
    const [glow, setGlow] = useState(null);
    const stage = useStage(STAGE, onFinish);
    const over = stage.over;
    const [fieldRef, shake] = useShake();
    const later = useTimeouts();
    const swipeFrom = useRef(null);
    const dots = showDots(level);
    const fall = fallSeconds(level);
    const nextDrop = () => {
        later(() => show({ id: nextId.current++, n: deal(), y: 0 }), 380);
    };
    const missed = (n) => {
        const why = explain(n);
        setMessage({ text: t(why.key, why.vars), kind: 'no' });
        stage.slip();
        shake();
    };
    useGameLoop((dt) => {
        const d = cur.current;
        if (d.gone)
            return;
        const y = d.y + (100 / fall) * dt;
        if (y < 100)
            return show({ ...d, y });
        // It reached the bottom without an answer: show where it belonged.
        const bin = binFor(d.n);
        show({ ...d, y: 100, gone: { bin, right: false } });
        setGlow({ bin, right: false });
        later(() => setGlow(null), 500);
        missed(d.n);
        nextDrop();
    }, !over);
    const answer = (bin) => {
        const drop = cur.current;
        if (over || drop.gone)
            return;
        const right = binFor(drop.n) === bin;
        show({ ...drop, gone: { bin, right } });
        setGlow({ bin, right });
        later(() => setGlow(null), 450);
        if (!right) {
            nextDrop();
            missed(drop.n);
            return;
        }
        setMessage({ text: `${drop.n}: ${t(bin)}!`, kind: 'yes' });
        if (!stage.good())
            nextDrop();
    };
    // Arrow keys work too, for anyone on a computer.
    const answerRef = useLatest(answer);
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'ArrowLeft')
                answerRef.current('even');
            if (e.key === 'ArrowRight')
                answerRef.current('odd');
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [answerRef]);
    const binClass = (bin) => `eo-bin eo-bin-${bin}${glow?.bin === bin ? (glow.right ? ' eo-bin-right' : ' eo-bin-wrong') : ''}`;
    return (_jsxs(SceneShell, { place: "peaks", say: message.text, stage: stage, bare: true, fill: true, className: "even-odd", children: [_jsx("div", { ref: fieldRef, className: "eo-field", onPointerDown: (e) => (swipeFrom.current = { x: e.clientX, y: e.clientY }), onPointerUp: (e) => {
                    const from = swipeFrom.current;
                    swipeFrom.current = null;
                    if (!from)
                        return;
                    const bin = swipeBin(e.clientX - from.x, e.clientY - from.y);
                    if (bin)
                        answer(bin);
                }, onPointerCancel: () => (swipeFrom.current = null), children: _jsxs("div", { className: `eo-drop${dots ? ' eo-drop-dots' : ''}${drop.gone ? ` eo-gone-${drop.gone.bin}` : ''}${drop.gone && !drop.gone.right ? ' eo-drop-wrong' : ''}`, style: { top: `${drop.y * 0.78}%` }, children: [_jsx("span", { className: "eo-num", children: drop.n }), dots && _jsx(Dots, { n: drop.n })] }, drop.id) }), _jsxs("div", { className: "eo-bins", children: [_jsxs("button", { className: binClass('even'), onPointerDown: () => answer('even'), disabled: over, children: [_jsxs("span", { className: "eo-bin-dots", children: ["\u25CF\u25CF", _jsx("br", {}), "\u25CF\u25CF"] }), t('even')] }), _jsxs("button", { className: binClass('odd'), onPointerDown: () => answer('odd'), disabled: over, children: [_jsxs("span", { className: "eo-bin-dots", children: ["\u25CF\u25CF\u25CF", _jsx("br", {}), "\u25CF\u25CF"] }), t('odd')] })] })] }));
}
