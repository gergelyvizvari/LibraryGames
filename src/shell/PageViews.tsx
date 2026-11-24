import { useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { pagePath } from './pageview'

// Giving Analytics a route turns off its own tracking, so each screen is counted exactly once, when the hash changes.
export function PageViews() {
  const [path, setPath] = useState(() => pagePath(location.hash))
  useEffect(() => {
    const onHash = () => setPath(pagePath(location.hash))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return <Analytics route={path} path={path} />
}
