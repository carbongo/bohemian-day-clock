import {
  HOURS_PER_DAY,
  MINUTES_PER_DAY,
  MINUTES_PER_HOUR,
} from "../../domain/time";
import {
  CLOCK_CENTER,
  TRACK_INNER_RADIUS,
  TRACK_OUTER_RADIUS,
  TRACK_RADIUS,
  TRACK_WIDTH,
  getClockArcPath,
  minutesToDegrees,
  polarToCartesian,
} from "./lib/clockGeometry";
import { ClockSvg, GlowFilter } from "./lib/clockSvgDefs";

const HALF_HOURS = Array.from(
  { length: HOURS_PER_DAY * 2 },
  (_, index) => index,
);

interface TrackOverlayProps {
  /** The stretch to gild, in minutes of the day: a wait from now to its end. */
  span?: { startMinutes: number; durationMinutes: number };
}

/** The dark band inside the ring, ruled every half hour, that a wait gilds. */
export function TrackOverlay({ span }: TrackOverlayProps) {
  return (
    <ClockSvg id="track-overlay-svg">
      <defs>
        <linearGradient id="track-gilt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1a2" />
          <stop offset="0.5" stopColor="#e6b93e" />
          <stop offset="1" stopColor="#b07c18" />
        </linearGradient>
        <GlowFilter id="track-gilt-glow" stdDeviation={5} />
      </defs>

      <circle
        cx={CLOCK_CENTER}
        cy={CLOCK_CENTER}
        r={TRACK_RADIUS}
        fill="none"
        stroke="#110c07"
        strokeWidth={TRACK_WIDTH}
      />

      {span ? (
        <g filter="url(#track-gilt-glow)">
          {span.durationMinutes >= MINUTES_PER_DAY ? (
            <circle
              cx={CLOCK_CENTER}
              cy={CLOCK_CENTER}
              r={TRACK_RADIUS}
              fill="none"
              stroke="url(#track-gilt)"
              strokeWidth={TRACK_WIDTH - 8}
            />
          ) : (
            <path
              d={getClockArcPath(
                span.startMinutes,
                span.startMinutes + span.durationMinutes,
                TRACK_RADIUS,
              )}
              fill="none"
              stroke="url(#track-gilt)"
              strokeWidth={TRACK_WIDTH - 8}
            />
          )}
        </g>
      ) : null}

      <g stroke="#b8902f" strokeLinecap="butt">
        {HALF_HOURS.map((index) => {
          const angle = minutesToDegrees((index * MINUTES_PER_HOUR) / 2);
          const inner = polarToCartesian(angle, TRACK_INNER_RADIUS);
          const outer = polarToCartesian(angle, TRACK_OUTER_RADIUS);

          return (
            <line
              key={index}
              x1={inner.x.toFixed(2)}
              y1={inner.y.toFixed(2)}
              x2={outer.x.toFixed(2)}
              y2={outer.y.toFixed(2)}
              strokeWidth={index % 2 === 0 ? 2.2 : 1.3}
              strokeOpacity={index % 2 === 0 ? 0.95 : 0.7}
            />
          );
        })}
      </g>
    </ClockSvg>
  );
}
