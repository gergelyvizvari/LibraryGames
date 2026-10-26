import { useEffect, useState } from 'react'
import { gameById } from '../games/registry'
import { detectLocale, LocaleContext } from '../i18n'
import { GameFrame } from '../kit/GameFrame'
import { daySeed } from '../kit/random'
import { Home } from './Home'

// Tiny hash router: #/ is home, #/play/<id> plays a game, #/daily/<id> plays the daily challenge.
function parse(hash: string) {
  const [, mode, id] = hash.replace(/^#/, '').split('/')
  return { mode, id }
}

export function App() {
  const [route, setRoute] = useState(() => parse(location.hash))
  const [locale] = useState(detectLocale)

  useEffect(() => {
    const onHash = () => setRoute(parse(location.hash))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = (hash: string) => {
    location.hash = hash
  }
  const game = route.id ? gameById(route.id) : undefined

  return (
    <LocaleContext.Provider value={locale}>
      <main className="app">
        {game ? (
          <GameFrame
            key={`${route.mode}-${game.meta.id}`}
            game={game}
            seed={route.mode === 'daily' ? daySeed() : undefined}
            onHome={() => go('/')}
          />
        ) : (
          <Home onPlay={(id, daily) => go(`/${daily ? 'daily' : 'play'}/${id}`)} />
        )}
      </main>
    </LocaleContext.Provider>
  )
}
