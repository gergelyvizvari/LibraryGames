// Rebuilds src/shell/map/map.webp from map-art.js. Needs Playwright with Chromium (not a project dependency):
//   node tools/map-art/render.cjs
const { writeFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { chromium } = require('playwright')

const here = __dirname
;(async () => {
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1720, height: 900 }, deviceScaleFactor: 2 })
await page.goto(`file://${here}/map-art.html`)
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(1500)
const png = await page.screenshot({ type: 'png' })
// Chromium can encode WebP from a canvas, so no image library is needed.
const webp = await page.evaluate(async (b64) => {
  const img = new Image()
  img.src = `data:image/png;base64,${b64}`
  await img.decode()
  const c = document.createElement('canvas')
  c.width = img.width
  c.height = img.height
  c.getContext('2d').drawImage(img, 0, 0)
  return c.toDataURL('image/webp', 0.82).split(',')[1]
}, png.toString('base64'))
const out = resolve(here, '../../src/shell/map/map.webp')
writeFileSync(out, Buffer.from(webp, 'base64'))
console.log(`${out}: ${Math.round(webp.length * 0.75 / 1024)} kB`)
await browser.close()
})()
