import { useT } from '../i18n'
import { sound } from '../kit/sound'

/** The heart that keeps a game among the favourites: an outline when off, rose when on. */
export function FavButton({ on, onToggle, className = '' }: { on: boolean; onToggle: () => void; className?: string }) {
  const t = useT()
  const label = t(on ? 'fav.remove' : 'fav.add')
  return (
    <button
      className={`fav-btn${on ? ' fav-on' : ''} ${className}`}
      aria-label={label}
      aria-pressed={on}
      title={label}
      onClick={(e) => {
        e.stopPropagation()
        sound.tap()
        onToggle()
      }}
    >
      <Heart />
    </button>
  )
}

export function Heart() {
  return (
    <svg className="fav-heart" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M12 20.500C5.500 16 3 12.600 3 9.300 3 6.600 5.100 4.500 7.700 4.500c1.700 0 3.300.9 4.300 2.400 1-1.500 2.600-2.400 4.300-2.400 2.600 0 4.700 2.100 4.700 4.800 0 3.300-2.500 6.700-9 11.200z" />
    </svg>
  )
}
