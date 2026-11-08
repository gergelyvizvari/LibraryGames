/**
 * Turns page zoom off for the whole site: a zoomed screen jumps around under small fingers, and every
 * screen is already sized to fit. Returns a function that turns it back on (for tests).
 *
 * - Phones: the viewport meta (`user-scalable=no`, which also undoes a zoom already made on Android),
 *   plus `touch-action: pan-x pan-y` on the page in styles.css for pinch and double tap.
 * - Safari (iPhone and Mac) ignores `user-scalable=no`, so its pinch `gesture*` events are cancelled.
 * - Computers: a trackpad pinch arrives as a wheel event with Ctrl held; Ctrl/Cmd with + - 0 are keys.
 */
export function lockZoom(): () => void {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]')
  const before = meta?.content
  if (meta && before && !before.includes('user-scalable')) meta.content = `${before}, maximum-scale=1, user-scalable=no`
  const block = (e: Event) => e.preventDefault()
  const wheel = (e: WheelEvent) => {
    if (e.ctrlKey) e.preventDefault()
  }
  const key = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && ['+', '=', '-', '_', '0'].includes(e.key)) e.preventDefault()
  }
  const gestures = ['gesturestart', 'gesturechange', 'gestureend']
  for (const g of gestures) document.addEventListener(g, block)
  window.addEventListener('wheel', wheel, { passive: false })
  window.addEventListener('keydown', key)
  return () => {
    if (meta && before) meta.content = before
    for (const g of gestures) document.removeEventListener(g, block)
    window.removeEventListener('wheel', wheel)
    window.removeEventListener('keydown', key)
  }
}
