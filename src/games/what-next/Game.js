import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { useShake, useTimeouts } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { SceneShell, useStage } from '../../kit/SceneShell';
import { makePuzzle } from './logic';
import { Piece } from './pieces';
/** Rows to finish in one stage. */
const STAGE = 6;
export default function WhatNext({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const [puzzle, setPuzzle] = useState(() => makePuzzle(rng, level));
    const [round, setRound] = useState(0);
    const [solved, setSolved] = useState(false);
    const stage = useStage(STAGE, onFinish);
    const [ref, shake] = useShake();
    const later = useTimeouts();
    const choose = (o) => {
        if (stage.over || solved)
            return;
        if (o !== puzzle.answer) {
            stage.slip();
            shake();
            return;
        }
        setSolved(true);
        if (stage.good())
            return;
        later(() => {
            setPuzzle(makePuzzle(rng, level));
            setRound((r) => r + 1);
            setSolved(false);
        }, 700);
    };
    return (_jsxs(SceneShell, { place: "woods", say: t('say'), stage: stage, bare: true, className: "what-next", children: [_jsx("div", { className: "wn-shelf", ref: ref, children: _jsxs("div", { className: "wn-row", children: [puzzle.shown.map((s, i) => (_jsx("span", { className: "wn-item", style: { animationDelay: `${i * 0.04}s` }, children: _jsx(Piece, { symbol: s }) }, i))), _jsx("span", { className: `wn-item wn-slot${solved ? ' wn-solved' : ''}`, children: solved ? _jsx(Piece, { symbol: puzzle.answer }) : '?' })] }) }, round), _jsx("div", { className: "wn-choices", children: puzzle.options.map((o, i) => (_jsx("button", { className: "wn-choice", onPointerDown: () => choose(o), "aria-label": t('option', { n: i + 1 }), children: _jsx(Piece, { symbol: o }) }, `${round}-${o}`))) })] }));
}
