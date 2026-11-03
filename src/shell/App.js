import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { gameById } from '../games/registry';
import { detectLocale, LocaleContext, saveLocale } from '../i18n';
import { GameFrame } from '../kit/GameFrame';
import { daySeed } from '../kit/random';
import { Home } from './Home';
// Tiny hash router: #/ is home, #/play/<id> plays a game, #/daily/<id> plays the daily challenge.
function parse(hash) {
    const [, mode, id] = hash.replace(/^#/, '').split('/');
    return { mode, id };
}
export function App() {
    const [route, setRoute] = useState(() => parse(location.hash));
    const [locale, setLocale] = useState(detectLocale);
    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);
    const changeLocale = (next) => {
        saveLocale(next);
        setLocale(next);
    };
    useEffect(() => {
        const onHash = () => setRoute(parse(location.hash));
        window.addEventListener('hashchange', onHash);
        return () => window.removeEventListener('hashchange', onHash);
    }, []);
    const go = (hash) => {
        location.hash = hash;
    };
    const game = route.id ? gameById(route.id) : undefined;
    return (_jsx(LocaleContext.Provider, { value: locale, children: _jsx("main", { className: "app", children: game ? (_jsx(GameFrame, { game: game, seed: route.mode === 'daily' ? daySeed() : undefined, onHome: () => go('/') }, `${route.mode}-${game.meta.id}`)) : (_jsx(Home, { onPlay: (id, daily) => go(`/${daily ? 'daily' : 'play'}/${id}`), onLocale: changeLocale })) }) }));
}
