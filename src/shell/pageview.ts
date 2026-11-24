// Vercel Web Analytics only sees the path, not the #hash, so with our hash router every screen would count as "/".
// We turn the hash into a path ("#/play/makkbolt" → "/play/makkbolt") and send it as an ordinary page view, which the
// free Hobby plan includes (custom events would need Pro). Route and path are the same, so each game is its own row.
export function pagePath(hash: string): string {
  const parts = hash.replace(/^#\/?/, '').split(/[/?]/).filter(Boolean)
  // "#/" and "#/games" are both the games list, the home screen.
  if (parts.length === 0 || (parts.length === 1 && parts[0] === 'games')) return '/'
  return '/' + parts.slice(0, 2).map(encodeURIComponent).join('/')
}
