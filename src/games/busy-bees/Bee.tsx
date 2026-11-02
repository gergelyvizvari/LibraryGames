/** A small drawn bee, facing right. */
export function Bee() {
  return (
    <svg viewBox="0 0 48 40" className="bb-bee-svg" aria-hidden="true">
      <ellipse cx="20" cy="9" rx="8" ry="7" fill="#e8f7ff" stroke="#2d3142" strokeWidth="2.5" />
      <ellipse cx="30" cy="10" rx="7" ry="6" fill="#e8f7ff" stroke="#2d3142" strokeWidth="2.5" />
      <path d="M4 24 L10 22 L10 27 Z" fill="#2d3142" />
      <ellipse cx="24" cy="25" rx="16" ry="11" fill="#feca57" stroke="#2d3142" strokeWidth="3" />
      <path d="M17 15 Q14 25 17 35 L22 36 Q19 25 22 14 Z M27 14 Q24 25 27 36 L31 35 Q28 25 31 15 Z" fill="#2d3142" />
      <circle cx="35" cy="22" r="2.6" fill="#2d3142" />
      <circle cx="36" cy="21" r="0.9" fill="#fff" />
      <path d="M34 28 Q36 30 38 28" fill="none" stroke="#2d3142" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
