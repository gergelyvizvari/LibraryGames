import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'

/** Files in `public/` that the app does not need to run (only link previews use them). */
const NOT_OFFLINE = ['og-image.png']

/**
 * Vite plugin: writes /sw.js from `tools/offline/sw.js` with the list of every built file, so the whole app is
 * saved on the device and works without a connection. The version changes whenever any file does.
 */
export function offline() {
  return {
    name: 'lg-offline',
    apply: 'build',
    generateBundle(_, bundle) {
      const built = Object.keys(bundle).map((name) => `/${name}`)
      const shipped = readdirSync('public').filter((name) => !NOT_OFFLINE.includes(name))
      // The page is written after this hook; it names the hashed entry files, so the list still changes with it.
      const files = [...new Set(['/index.html', ...built, ...shipped.map((name) => `/${name}`)])].sort()
      const hash = createHash('sha256').update(files.join('\n'))
      for (const name of shipped) hash.update(readFileSync(`public/${name}`))
      const source = readFileSync('tools/offline/sw.js', 'utf8')
        .replace("'__VERSION__'", JSON.stringify(hash.digest('hex').slice(0, 12)))
        .replace('__FILES__', JSON.stringify(files))
      this.emitFile({ type: 'asset', fileName: 'sw.js', source })
    },
  }
}
