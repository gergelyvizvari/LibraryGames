import { useEffect, useRef, useState } from 'react'
import { gameById } from '../games/registry'
import { detectLocale, LocaleContext, saveLocale, type Locale } from '../i18n'
import { GameFrame } from '../kit/GameFrame'
import { daySeed } from '../kit/random'
import { Home } from './Home'
import { WorldMap } from './map/WorldMap'
import { nextGame } from './next'
import { Privacy } from './Privacy'
import { Stickers } from './Stickers'

// Tiny hash router: #/ is the list of all games (also at #/games, for old links), #/map the storybook map, #/play/<id>
// plays a game, #/daily/<id> plays the daily challenge, #/stickers is the sticker album, #/privacy is for parents.
// The list is the home screen: it is the easiest place to find a game; the map is one tap away.
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
  // The screen shown before this one, so the map knows which game the player has just left.
  const before = useRef(route)
  useEffect(() => {
    before.current = route
  }, [route])
  // Where "back" leads from a game or the album: the list or the map, whichever the player came from.
  const home = useRef('/')
  if (!route.id && (route.mode === 'map' || route.mode === undefined || route.mode === '' || route.mode === 'games')) home.current = route.mode === 'map' ? '/map' : '/'
  const left = before.current.id ? gameById(before.current.id)?.meta.id : undefined
  const play = (id: string, daily?: boolean) => go(`/${daily ? 'daily' : 'play'}/${id}`)
  // The map and scene games fill the window and never scroll; the games list and the album are as wide but scroll.
  const onMap = route.mode === 'map'
  const full = game ? !!game.meta.scene : onMap
  const wide = !game && !onMap && route.mode !== 'privacy'

  return (
    <LocaleContext.Provider value={locale}>
      <main className={full ? 'app app-full' : wide ? 'app app-wide' : 'app'}>
        {game ? (
          <GameFrame
            key={`${route.mode}-${game.meta.id}`}
            game={game}
            seed={route.mode === 'daily' ? daySeed() : undefined}
            daily={route.mode === 'daily'}
            onHome={() => go(home.current)}
            onNext={() => go(`/play/${nextGame(game.meta.id).meta.id}`)}
          />
        ) : route.mode === 'privacy' ? (
          <Privacy onHome={() => go('/')} />
        ) : route.mode === 'stickers' ? (
          <Stickers onHome={() => go(home.current)} onPlay={play} />
        ) : onMap ? (
          <WorldMap onPlay={play} onAllGames={() => go('/')} onStickers={() => go('/stickers')} onLocale={changeLocale} from={left} />
        ) : (
          <Home onPlay={play} onLocale={changeLocale} onMap={() => go('/map')} />
        )}
      </main>
    </LocaleContext.Provider>
  )
}
