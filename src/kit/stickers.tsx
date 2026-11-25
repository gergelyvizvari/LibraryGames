import { Fragment } from 'react'

/**
 * Painted stickers that stand in for emoji: every picture a game shows as an emoji has a painted twin in
 * kit/stickers/, named by its code points in hex (🦁 → 1f981.webp, 🧑‍🚀 → 1f9d1-200d-1f680.webp). Games keep their
 * emoji as data and draw them with `<Emoji e="🦁" />`, which shows the painting (or the emoji itself when there is
 * no painting for it). Only the stickers a game draws are downloaded.
 */
const ART = import.meta.glob<string>('./stickers/*.webp', { eager: true, import: 'default' })

/** The file name of an emoji's sticker, without the variation selector (🌧️ and 🌧 share one). */
export const stickerKey = (e: string) =>
  [...e.replace(/️/g, '')].map((c) => c.codePointAt(0)!.toString(16)).join('-')

/** The URL of an emoji's painted sticker, if there is one. */
export const stickerUrl = (e: string): string | undefined => ART[`./stickers/${stickerKey(e)}.webp`]

/** The painted sticker of an emoji as a picture of its own, such as a game's album stamp. Throws when there is none. */
export function paintedSticker(e: string): string {
  const url = stickerUrl(e)
  if (!url) throw new Error(`No painted sticker for ${e}`)
  return url
}

const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' })

/** Emoji drawn as painted stickers, sized like the text around them (1em, set by `font-size`). A string of several
 * (a sentence's picture, 🐦🎶) becomes a row of stickers; any character without a sticker stays as it is. */
export function Emoji({ e, className = '' }: { e: string; className?: string }) {
  return (
    <>
      {[...graphemes.segment(e)].map(({ segment }, i) => {
        const src = stickerUrl(segment)
        return src ? <img key={i} className={`sticker ${className}`} src={src} alt={segment} draggable={false} /> : <Fragment key={i}>{segment}</Fragment>
      })}
    </>
  )
}

/** The same sticker inside an SVG, by its centre and size in the SVG's units. */
export function SvgEmoji({ e, x, y, size, className }: { e: string; x: number; y: number; size: number; className?: string }) {
  const src = stickerUrl(e)
  if (!src)
    return (
      <text x={x} y={y + size * 0.35} fontSize={size} textAnchor="middle" className={className}>
        {e}
      </text>
    )
  return <image href={src} x={x - size / 2} y={y - size / 2} width={size} height={size} className={className} />
}
