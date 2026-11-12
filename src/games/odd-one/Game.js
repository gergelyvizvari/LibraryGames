import { jsx as _jsx } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { useShake } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { SceneShell, useStage } from '../../kit/SceneShell';
import { STAGE, makeBoard } from './logic';
export default function OddOne({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const [board, setBoard] = useState(() => makeBoard(rng, level, 0));
    const stage = useStage(STAGE, onFinish);
    const [ref, shake] = useShake();
    const tap = (i) => {
        if (stage.over)
            return;
        if (i !== board.oddIndex) {
            stage.slip();
            shake();
            return;
        }
        if (!stage.good(10 + board.size))
            setBoard(makeBoard(rng, level, stage.done + 1));
    };
    return (_jsx(SceneShell, { place: "lake", say: t('find'), stage: stage, bare: true, className: "odd-one", children: _jsx("div", { className: "oo-grid", ref: ref, style: { gridTemplateColumns: `repeat(${board.size}, 1fr)`, fontSize: `${Math.max(1.4, 4.2 - board.size * 0.45)}rem` }, children: Array.from({ length: board.size * board.size }, (_, i) => (_jsx("button", { className: "oo-cell", onPointerDown: () => tap(i), children: i === board.oddIndex ? board.odd : board.common }, i))) }, stage.done) }));
}
