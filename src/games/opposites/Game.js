import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { useLocale } from '../../i18n';
import { useTimeouts } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { SceneShell, useStage } from '../../kit/SceneShell';
import { sound } from '../../kit/sound';
import { pairs } from './content';
import { dealBoard, isMatch, makeDealer, showPictures } from './logic';
const keyOf = (c) => `${c.side}-${c.pair}`;
export default function Opposites({ level, seed, t, onFinish }) {
    const locale = useLocale();
    const list = pairs[locale] ?? pairs.en;
    const rng = useRef(makeRng(seed)).current;
    const deal = useRef(makeDealer(rng, list, level)).current;
    // One stage is one board: every pair of opposites is a star.
    const [board] = useState(() => dealBoard(rng, deal()));
    const [selected, setSelected] = useState(null);
    const [matched, setMatched] = useState([]);
    const [missed, setMissed] = useState([]);
    const [message, setMessage] = useState(() => ({ text: t('pick'), kind: '' }));
    const stage = useStage(board.pairs.length, onFinish);
    const over = stage.over;
    const later = useTimeouts();
    const pictures = showPictures(level);
    const tap = (c) => {
        if (over || matched.includes(c.pair) || matched.length === board.pairs.length)
            return;
        if (!selected || selected.side === c.side) {
            // First pick, or a change of mind in the same column.
            const again = selected && keyOf(selected) === keyOf(c);
            setSelected(again ? null : c);
            setMissed([]);
            setMessage({ text: again ? t('pick') : t('picked', { word: c.word }), kind: '' });
            sound.tap();
            return;
        }
        if (!isMatch(selected, c)) {
            setMissed([keyOf(selected), keyOf(c)]);
            setSelected(null);
            setMessage({ text: t('no'), kind: 'no' });
            stage.slip();
            later(() => setMissed([]), 500);
            return;
        }
        const [a, b] = selected.side === 'left' ? [selected, c] : [c, selected];
        setMatched([...matched, c.pair]);
        setSelected(null);
        setMessage({ text: t('yes', { a: a.word, b: b.word }), kind: 'yes' });
        stage.good();
    };
    const cardClass = (c) => `op-card op-${c.side}` +
        (matched.includes(c.pair) ? ' op-matched' : '') +
        (selected && keyOf(selected) === keyOf(c) ? ' op-selected' : '') +
        (missed.includes(keyOf(c)) ? ' op-miss' : '');
    return (_jsx(SceneShell, { place: "village", say: message.text, stage: stage, bare: true, className: "opposites", children: _jsx("div", { className: "op-board", children: board.left.map((l, row) => {
                const r = board.right[row];
                return [l, r].map((c) => (_jsxs("button", { className: cardClass(c), onPointerDown: () => tap(c), disabled: over, children: [pictures && c.emoji && _jsx("span", { className: "op-emoji", children: c.emoji }), _jsx("span", { className: "op-word", children: c.word })] }, keyOf(c))));
            }) }) }));
}
