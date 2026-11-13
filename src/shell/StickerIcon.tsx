/**
 * A round smiley sticker with its edge peeling up, so it reads as "stickers" even to a child who cannot read,
 * and does not look like the gold star of played games next to it.
 */
export function StickerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="wm-sticker-icon" aria-hidden focusable="false">
      <circle cx="12.4" cy="12.8" r="10.6" fill="rgba(60, 40, 90, 0.18)" />
      <path d="M22.1 14.7 A10.4 10.4 0 1 0 14.7 22.1 Z" fill="#fff" />
      <path d="M20.3 14.3 A8.5 8.5 0 1 0 14.3 20.3 Z" fill="#ff8fab" />
      <circle cx="8.6" cy="9.6" r="1.35" fill="#5a2340" />
      <circle cx="14.2" cy="9.6" r="1.35" fill="#5a2340" />
      <path d="M7.6 13.2 Q11.4 16.6 15.2 13.2" fill="none" stroke="#5a2340" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22.1 14.7 Q15.6 15.4 14.7 22.1 Z" fill="#efe3c9" stroke="#d8c8a6" strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
  )
}
