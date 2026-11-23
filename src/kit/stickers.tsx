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

/** An emoji drawn as its painted sticker, sized like the text around it (1em, set by `font-size`). */
export function Emoji({ e, className = '' }: { e: string; className?: string }) {
  const src = stickerUrl(e)
  if (!src) return <>{e}</>
  return <img className={`sticker ${className}`} src={src} alt={e} draggable={false} />
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
