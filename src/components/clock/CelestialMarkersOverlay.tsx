import type { MoonPhase } from "../../domain/moon";
import {
  PLASTER_RING_CLIP_PATH,
  minutesToDegrees,
  polarToCartesian,
} from "./lib/clockGeometry";
import { ClockSvg, RingClipPath } from "./lib/clockSvgDefs";

const MOON_HOUR = 0;
const SUN_HOUR = 12;
const MOON_RADIUS = 52;
const SUN_RADIUS = 33;
const SUN_RAY_COUNT = 12;

const moonPosition = polarToCartesian(minutesToDegrees(MOON_HOUR * 60));
const sunPosition = polarToCartesian(minutesToDegrees(SUN_HOUR * 60));
const straightRays = getSunRays(0, SUN_RADIUS - 4, 82, 0.115);
const flameRays = getFlameRays(SUN_RADIUS - 4, 68);

interface CelestialMarkersOverlayProps {
  moon: MoonPhase;
  /** The ring's turn in degrees, undone for the moon so it stays upright. */
  rotation: number;
  /** South of the equator the moon is lit from the other side. */
  southern: boolean;
}

export function CelestialMarkersOverlay({
  moon,
  rotation,
  southern,
}: CelestialMarkersOverlayProps) {
  const waxing = moon.phase < 0.5;
  const litOnRight = waxing !== southern;

  return (
    <ClockSvg id="celestial-markers-overlay-svg">
      <defs>
        <radialGradient id="celestial-sun-fill" cx="42%" cy="36%" r="70%">
          <stop offset="0" stopColor="#fff7b8" />
          <stop offset="0.6" stopColor="#fbd24e" />
          <stop offset="1" stopColor="#f0a92a" />
        </radialGradient>
        <radialGradient id="celestial-moon-fill" cx="40%" cy="32%" r="75%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.7" stopColor="#dedbd2" />
          <stop offset="1" stopColor="#b9b5aa" />
        </radialGradient>
        <RingClipPath id="celestial-arc-clip" path={PLASTER_RING_CLIP_PATH} />
        <clipPath id="celestial-moon-lit-clip">
          <path
            d={getLitMoonPath(moon.phase)}
            transform={`translate(${moonPosition.x} ${moonPosition.y}) rotate(${-rotation}) scale(${litOnRight ? 1 : -1} 1)`}
          />
        </clipPath>

        {/* Seas and craters, as worn stone. */}
        <filter
          id="celestial-moon-stone"
          x="0"
          y="0"
          width="100%"
          height="100%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.045"
            numOctaves="4"
            seed="5"
          />
          <feColorMatrix values="0 0 0 0 0.36  0 0 0 0 0.35  0 0 0 0 0.34  0 0 0 -2.2 1.15" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>

      <g clipPath="url(#celestial-arc-clip)">
        <g
          transform={`translate(${sunPosition.x} ${sunPosition.y})`}
          stroke="#a35f08"
          strokeLinejoin="round"
        >
          {flameRays.map((ray) => (
            <path key={ray} d={ray} fill="#f7b52c" strokeWidth="1.2" />
          ))}
          {straightRays.map((ray) => (
            <path key={ray} d={ray} fill="#fbd24e" strokeWidth="1.4" />
          ))}
          <circle
            r={SUN_RADIUS}
            fill="url(#celestial-sun-fill)"
            strokeWidth="2"
          />
        </g>

        <g>
          <circle
            cx={moonPosition.x}
            cy={moonPosition.y}
            r={MOON_RADIUS}
            fill="#1a2644"
          />
          <circle
            cx={moonPosition.x}
            cy={moonPosition.y}
            r={MOON_RADIUS}
            opacity="0.35"
            filter="url(#celestial-moon-stone)"
          />
          <g clipPath="url(#celestial-moon-lit-clip)">
            <circle
              cx={moonPosition.x}
              cy={moonPosition.y}
              r={MOON_RADIUS}
              fill="url(#celestial-moon-fill)"
            />
            <circle
              cx={moonPosition.x}
              cy={moonPosition.y}
              r={MOON_RADIUS}
              filter="url(#celestial-moon-stone)"
            />
          </g>
          <circle
            cx={moonPosition.x}
            cy={moonPosition.y}
            r={MOON_RADIUS}
            fill="none"
            stroke="#c9d3e6"
            strokeOpacity="0.5"
            strokeWidth="1.5"
          />
        </g>
      </g>
    </ClockSvg>
  );
}

/**
 * The lit part of the disc, drawn for a moon lit from the right: the bright
 * limb, then the terminator, which is half an ellipse.
 */
function getLitMoonPath(phase: number) {
  const radius = MOON_RADIUS;
  const share = phase < 0.5 ? phase : 1 - phase;
  const terminatorRadius = Math.abs(Math.cos(2 * Math.PI * share)) * radius;
  const terminatorSweep = share < 0.25 ? 0 : 1;

  return [
    `M 0 ${-radius}`,
    `A ${radius} ${radius} 0 0 1 0 ${radius}`,
    `A ${terminatorRadius.toFixed(2)} ${radius} 0 0 ${terminatorSweep} 0 ${-radius}`,
    "Z",
  ].join(" ");
}

/** Straight pointed rays, every other slot of the sun. */
function getSunRays(
  offset: number,
  innerRadius: number,
  tipRadius: number,
  halfWidth: number,
) {
  return Array.from({ length: SUN_RAY_COUNT }, (_, index) => {
    const angle = ((index + offset) / SUN_RAY_COUNT) * Math.PI * 2;
    const left = point(innerRadius, angle - halfWidth);
    const right = point(innerRadius, angle + halfWidth);
    const tip = point(tipRadius, angle);

    return `M ${left} L ${tip} L ${right} Z`;
  });
}

/** Wavy flame rays between the straight ones. */
function getFlameRays(innerRadius: number, tipRadius: number) {
  return Array.from({ length: SUN_RAY_COUNT }, (_, index) => {
    const angle = ((index + 0.5) / SUN_RAY_COUNT) * Math.PI * 2;
    const middle = (innerRadius + tipRadius) / 2;
    const left = point(innerRadius, angle - 0.1);
    const right = point(innerRadius, angle + 0.1);
    const tip = point(tipRadius, angle + 0.05);

    return [
      `M ${left}`,
      `Q ${point(middle - 6, angle - 0.2)} ${point(middle, angle - 0.02)}`,
      `Q ${point(middle + 8, angle + 0.12)} ${tip}`,
      `Q ${point(middle + 4, angle + 0.24)} ${point(middle - 4, angle + 0.12)}`,
      `Q ${point(middle - 10, angle + 0.02)} ${right}`,
      "Z",
    ].join(" ");
  });
}

function point(radius: number, angle: number) {
  return `${(radius * Math.sin(angle)).toFixed(2)} ${(-radius * Math.cos(angle)).toFixed(2)}`;
}
