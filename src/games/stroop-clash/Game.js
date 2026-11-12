import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { useShake } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { SceneShell, useStage } from '../../kit/SceneShell';
import { answerFor, colourCount, colours, makeCard } from './logic';
/** Cards to get right in one stage. */
const STAGE = 8;
export default function StroopClash({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const [card, setCard] = useState(() => makeCard(rng, level));
    const [n, setN] = useState(0);
    const stage = useStage(STAGE, onFinish);
    const [ref, shake] = useShake();
    const choose = (i) => {
        if (stage.over)
            return;
        if (i !== answerFor(card)) {
            stage.slip();
            shake();
        }
        else if (stage.good())
            return;
        setCard(makeCard(rng, level));
        setN((k) => k + 1);
    };
    return (_jsxs(SceneShell, { place: "lake", say: card.rule === 'ink' ? t('tapInk') : t('tapWord'), stage: stage, bare: true, className: "stroop", children: [_jsx("div", { className: `sc-word${card.rule === 'word' ? ' sc-flip' : ''}`, ref: ref, style: { color: colours[card.ink].css }, children: t(colours[card.word].key) }, n), _jsx("div", { className: "sc-buttons", children: colours.slice(0, colourCount(level)).map((c, i) => (_jsx("button", { className: "sc-btn", style: { background: c.css }, "aria-label": t(c.key), onPointerDown: () => choose(i) }, c.key))) })] }));
}
