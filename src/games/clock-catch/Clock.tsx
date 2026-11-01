import { angles, type Time } from './logic'

/** An analogue clock face, numbers 1 to 12, with a short hour hand and a long minute hand. */
export function Clock({ time, size = 200 }: { time: Time; size?: number }) {
  const { hour, minute } = angles(time)
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className="cc-clock" aria-hidden>
      <circle cx="100" cy="100" r="94" className="cc-face" />
      {Array.from({ length: 60 }, (_, i) => (
        <line
          key={i}
          x1="100"
          y1={i % 5 ? 12 : 10}
          x2="100"
          y2={i % 5 ? 17 : 22}
          className={i % 5 ? 'cc-tick' : 'cc-tick cc-tick-big'}
          transform={`rotate(${i * 6} 100 100)`}
        />
      ))}
      {Array.from({ length: 12 }, (_, i) => {
        const a = ((i + 1) * 30 * Math.PI) / 180
        return (
          <text key={i} x={100 + Math.sin(a) * 66} y={100 - Math.cos(a) * 66 + 9} className="cc-num">
            {i + 1}
          </text>
        )
      })}
      <line x1="100" y1="100" x2="100" y2="54" className="cc-hour" transform={`rotate(${hour} 100 100)`} />
      <line x1="100" y1="100" x2="100" y2="26" className="cc-minute" transform={`rotate(${minute} 100 100)`} />
      <circle cx="100" cy="100" r="7" className="cc-pin" />
    </svg>
  )
}
