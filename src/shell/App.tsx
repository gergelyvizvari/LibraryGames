import { useEffect, useState } from 'react'
import { gameById } from '../games/registry'
import { detectLocale, LocaleContext, saveLocale, type Locale } from '../i18n'
import { GameFrame } from '../kit/GameFrame'
import { daySeed } from '../kit/random'
import { Home } from './Home'
import { WorldMap } from './map/WorldMap'
import { nextGame } from './next'
import { Privacy } from './Privacy'
import { Stickers } from './Stickers'

// Tiny hash router: #/ is the map, #/games the list of all games, #/play/<id> plays a game, #/daily/<id> plays the daily
// challenge, #/stickers is the sticker album, #/privacy is for parents.
function parse(hash: string) {
  const [, mode, id] = hash.replace(/^#/, '').split('/')
  return { mode, id }
}

export function App() {
  const [route, setRoute] = useState(() => parse(location.hash))
  const [locale, setLocale] = useState(detectLocale)

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const changeLocale = (next: Locale) => {
    saveLocale(next)
    setLocale(next)
  }

  useEffect(() => {
    const onHash = () => setRoute(parse(location.hash))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = (hash: string) => {
    location.hash = hash
  }
  const game = route.id ? gameById(route.id) : undefined
  const play = (id: string, daily?: boolean) => go(`/${daily ? 'daily' : 'play'}/${id}`)
  // The map and scene games use the whole window; every other screen is a centred column.
  const full = game ? !!game.meta.scene : !route.mode

  return (
    <LocaleContext.Provider value={locale}>
      <main className={full ? 'app app-full' : 'app'}>
        {game ? (
          <GameFrame
            key={`${route.mode}-${game.meta.id}`}
            game={game}
            seed={route.mode === 'daily' ? daySeed() : undefined}
            daily={route.mode === 'daily'}
            onHome={() => go('/')}
            onNext={() => go(`/play/${nextGame(game.meta.id).meta.id}`)}
          />
        ) : route.mode === 'privacy' ? (
          <Privacy onHome={() => go('/')} />
        ) : route.mode === 'stickers' ? (
          <Stickers onHome={() => go('/')} />
        ) : route.mode === 'games' ? (
          <Home onPlay={play} onLocale={changeLocale} onMap={() => go('/')} />
        ) : (
          <WorldMap onPlay={play} onAllGames={() => go('/games')} onStickers={() => go('/stickers')} />
        )}
      </main>
    </LocaleContext.Provider>
  )
}
