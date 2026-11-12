import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale } from '../../i18n';
import { useTimeouts } from '../../kit/hooks';
import { clamp, makeRng } from '../../kit/random';
import { SceneShell, useStage } from '../../kit/SceneShell';
import { stories, storiesForLevel } from './content';
const STORIES_PER_ROUND = 4;
export default function FlashRead({ level, seed, t, onFinish }) {
    const locale = useLocale();
    const rng = useRef(makeRng(seed)).current;
    const picked = useMemo(() => rng.shuffle(storiesForLevel(stories[locale] ?? stories.en, level)).slice(0, STORIES_PER_ROUND), [rng, locale, level]);
    const [index, setIndex] = useState(0);
    const [wpm, setWpm] = useState(() => clamp(50 + level * 20, 70, 300));
    const [phase, setPhase] = useState('reading');
    const [word, setWord] = useState(0);
    const stage = useStage(picked.length, onFinish);
    const [feedback, setFeedback] = useState('');
    const later = useTimeouts();
    const story = picked[index];
    const words = useMemo(() => story.text.split(' '), [story]);
    const options = useMemo(() => rng.shuffle(story.options), [rng, story]);
    useEffect(() => {
        if (phase !== 'reading')
            return;
        if (word >= words.length) {
            later(() => setPhase('question'), 400);
            return;
        }
        // Pause a little longer at the end of a sentence.
        const extra = /[.!?,]$/.test(words[word]) ? 1.6 : 1;
        later(() => setWord((w) => w + 1), (60000 / wpm) * extra);
    }, [phase, word, words, wpm, later]);
    const answer = (o) => {
        if (phase !== 'question')
            return;
        const right = o === story.options[0];
        let last;
        if (right) {
            setFeedback(t('correct'));
            setWpm((w) => w + 20);
            last = stage.good(wpm);
        }
        else {
            setFeedback(t('notQuite', { answer: story.options[0] }));
            setWpm((w) => Math.max(60, w - 15));
            last = stage.miss();
        }
        setPhase('feedback');
        if (last)
            return;
        later(() => {
            setIndex(index + 1);
            setWord(0);
            setPhase('reading');
        }, right ? 900 : 1800);
    };
    return (_jsxs(SceneShell, { place: "sea", say: phase === 'reading' ? t('read') : phase === 'question' ? t('ask') : feedback, stage: stage, bare: true, className: "flash-read", children: [phase === 'reading' && (_jsxs("div", { className: "fr-stage", children: [_jsx("div", { className: "fr-word", children: words[Math.min(word, words.length - 1)] }, word), _jsx("div", { className: "fr-progress", children: _jsx("div", { style: { width: `${(word / words.length) * 100}%` } }) })] })), phase !== 'reading' && (_jsxs("div", { className: "fr-question", children: [_jsx("h2", { children: story.question }), phase === 'question' && (_jsx("div", { className: "choices choices-stacked", children: options.map((o) => (_jsx("button", { className: "choice-btn", onClick: () => answer(o), children: o }, o))) }))] }))] }));
}
