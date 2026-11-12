import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { useLocale } from '../../i18n';
import { useShake, useTimeouts } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { SceneShell, useStage } from '../../kit/SceneShell';
import { sound } from '../../kit/sound';
import { sentences, sentencesForLevel } from './content';
import { isNext, tilesFor } from './logic';
/** Sentences to build in one stage. */
const STAGE = 4;
export default function SentenceBuilder({ level, seed, t, onFinish }) {
    const locale = useLocale();
    const rng = useRef(makeRng(seed)).current;
    const order = useRef(rng.shuffle(sentencesForLevel(sentences[locale] ?? sentences.en, level))).current;
    const [index, setIndex] = useState(0);
    const sentence = order[index % order.length];
    const [tiles, setTiles] = useState(() => tilesFor(rng, sentence.text));
    const [built, setBuilt] = useState([]);
    const stage = useStage(STAGE, onFinish);
    const [ref, shake] = useShake();
    const later = useTimeouts();
    const total = sentence.text.split(' ').length;
    const tap = (id, word) => {
        if (stage.over || built.includes(id) || built.length === total)
            return;
        if (!isNext(sentence.text, built.length, word)) {
            stage.slip();
            shake();
            return;
        }
        const next = [...built, id];
        setBuilt(next);
        sound.tone(480 + next.length * 50, 0.08, 'triangle', 0.18);
        if (next.length < total)
            return;
        if (stage.good(total * 10))
            return;
        later(() => {
            const nextSentence = order[(index + 1) % order.length];
            setIndex(index + 1);
            setTiles(tilesFor(rng, nextSentence.text));
            setBuilt([]);
        }, 900);
    };
    return (_jsxs(SceneShell, { place: "sea", say: t('say'), stage: stage, bare: true, className: "sentence-builder", children: [_jsx("div", { className: "sb-picture", children: sentence.picture }, index), _jsxs("div", { className: `sb-built${built.length === total ? ' sb-done' : ''}`, children: [built.map((id) => (_jsx("span", { className: "sb-word", children: tiles.find((x) => x.id === id).word }, id))), built.length < total && _jsx("span", { className: "sb-cursor" })] }), _jsx("div", { className: "sb-tiles", ref: ref, children: tiles.map((tile) => (_jsx("button", { className: `sb-tile${built.includes(tile.id) ? ' sb-used' : ''}`, onPointerDown: () => tap(tile.id, tile.word), children: tile.word }, `${index}-${tile.id}`))) })] }));
}
