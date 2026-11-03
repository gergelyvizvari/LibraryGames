import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { makeGameT, useLocale, useT } from '../i18n';
import { useTimeouts } from './hooks';
import { Icon } from './icon';
import { gameProgress, loadProgress, recordRound, stars } from './progress';
import { randomSeed } from './random';
import { sound } from './sound';
import { gameColorVars } from './theme';
import { Confetti } from './ui';
/**
 * Everything around a game: intro card, 3-2-1 countdown, the round itself, results.
 * Games only render the round and call `onFinish` once.
 */
export function GameFrame({ game, seed, onHome }) {
    const locale = useLocale();
    const t = useT();
    const gt = useMemo(() => makeGameT(game.strings, locale), [game, locale]);
    const [phase, setPhase] = useState('intro');
    const [count, setCount] = useState(3);
    const [round, setRound] = useState(0);
    const [roundSeed, setRoundSeed] = useState(() => seed ?? randomSeed());
    const [result, setResult] = useState(null);
    const later = useTimeouts();
    const progress = gameProgress(loadProgress(), game.meta.id);
    useEffect(() => {
        if (phase !== 'countdown')
            return;
        if (count === 0) {
            sound.go();
            setPhase('playing');
            return;
        }
        sound.tick();
        later(() => setCount((c) => c - 1), 650);
    }, [phase, count, later]);
    const start = () => {
        sound.tap();
        setCount(3);
        setPhase('countdown');
    };
    const finish = (r) => {
        const outcome = recordRound(game.meta.id, game.meta.skill, r);
        setResult({ ...r, outcome });
        if (outcome.newRecord || stars(r.accuracy) === 3)
            sound.win();
        later(() => setPhase('results'), 700);
    };
    const again = () => {
        setRound((n) => n + 1);
        setRoundSeed(randomSeed());
        start();
    };
    const { Component } = game;
    return (_jsxs("div", { className: "frame", style: gameColorVars(game.meta.color), children: [_jsxs("header", { className: "frame-bar", children: [_jsx("button", { className: "icon-btn", onClick: onHome, "aria-label": t('home'), children: "\u2715" }), _jsxs("span", { className: "frame-title", children: [_jsx(Icon, { icon: game.meta.icon, className: "frame-icon" }), " ", gt('title')] }), _jsx("span", { className: "frame-level", children: t('level', { level: progress.level }) })] }), phase === 'intro' && (_jsxs("div", { className: "card intro", children: [_jsx("div", { className: "intro-icon", children: _jsx(Icon, { icon: game.meta.icon }) }), _jsx("h1", { children: gt('title') }), _jsx("p", { className: "howto", children: gt('howTo') }), _jsx("p", { className: "muted", children: progress.best > 0 ? t('best', { score: progress.best }) : t('noBestYet') }), _jsx("button", { className: "big-btn", onClick: start, autoFocus: true, children: t('play') })] })), phase === 'countdown' && (_jsx("div", { className: "countdown", children: count > 0 ? count : t('go') }, count)), phase === 'playing' && (_jsx("div", { className: "stage", children: _jsx(Component, { level: progress.level, seed: roundSeed, t: gt, onFinish: finish }, round) })), phase === 'results' && result && (_jsxs("div", { className: "card results", children: [(result.outcome.newRecord || stars(result.accuracy) === 3) && _jsx(Confetti, {}), _jsx("div", { className: "stars", "aria-label": `${stars(result.accuracy)} / 3`, children: [1, 2, 3].map((n) => (_jsx("span", { className: n <= stars(result.accuracy) ? 'star on' : 'star', style: { animationDelay: `${n * 0.15}s` }, children: "\u2605" }, n))) }), _jsx("h1", { children: result.outcome.newRecord ? t('newRecord') : result.accuracy >= 0.6 ? t('greatJob') : t('niceTry') }), _jsx("div", { className: "final-score", children: result.score }), _jsx("p", { className: "muted", children: t('best', { score: result.outcome.progress.games[game.meta.id].best }) }), result.outcome.level > result.outcome.previousLevel && (_jsx("p", { className: "level-up", children: t('levelUp', { level: result.outcome.level }) })), _jsxs("div", { className: "row", children: [_jsx("button", { className: "big-btn", onClick: again, autoFocus: true, children: t('playAgain') }), _jsx("button", { className: "ghost-btn", onClick: onHome, children: t('home') })] })] }))] }));
}
