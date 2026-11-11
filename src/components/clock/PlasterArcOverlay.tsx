import {
  CLOCK_CENTER,
  PLASTER_RING_CLIP_PATH,
  PLASTER_RING_INNER_RADIUS,
  PLASTER_RING_OUTER_RADIUS,
  TRACK_INNER_RADIUS,
  polarToCartesian,
  seededUnit,
} from "./lib/clockGeometry";
import { ClockSvg } from "./lib/clockSvgDefs";

const crackPaths = [
  "M424 120c-10 19 3 31-7 48-7 12-24 12-26 29-2 13 9 19 4 31-5 13-21 15-28 28",
  "M735 111c14 15 5 32 19 47 12 13 31 9 37 25 5 14-4 25 5 38 7 10 21 11 31 18",
  "M820 148c16 11 13 28 30 39 15 9 31 2 41 15 8 11 2 24 13 34 8 8 21 7 32 12",
  "M912 232c18 4 22 22 40 25 17 3 28-9 42 0 12 8 11 22 24 29 10 5 22 1 33 4",
  "M1007 351c18-2 27 13 44 11 14-2 22-15 36-10",
  "M1047 472c17-6 30 6 46 0",
  "M1066 607c17-6 30 7 47 1",
  "M1043 744c20 0 28 16 47 15",
  "M990 853c18 6 20 24 37 31 13 5 25-3 36 7",
  "M905 955c16 11 13 29 28 40 14 10 29 3 39 16",
  "M793 1034c11 16 2 31 14 46",
  "M656 1078c5 18-8 29-4 47",
  "M520 1077c-5 18 8 29 4 47",
  "M391 1031c-12 15-4 31-17 45",
  "M281 952c-17 9-15 27-31 36-14 8-28 0-39 11",
  "M202 845c-19 3-25 20-42 23-14 2-23-9-36-3",
  "M151 718c-18-2-28 12-45 9",
  "M135 588c-18-7-31 5-48-2",
  "M152 459c-18-4-29 9-46 5",
  "M201 333c-19 1-27 17-45 18",
  "M285 228c-18 7-21 25-39 31-13 5-25-4-37 5",
  "M706 153c-13 9-28 2-38 14-8 10-2 22-11 31",
  "M875 286c-15 4-19 19-34 23-12 3-21-6-32 1",
  "M976 520c-14-6-25 5-39 0-11-4-14-17-26-19",
  "M949 752c-15-2-24 11-39 9-12-2-18-13-30-12",
  "M726 1001c-8-13-23-11-31-24-6-10 0-21-8-30",
  "M467 1005c6-14-5-25 1-38 5-11 18-13 22-24",
  "M255 761c15-2 23 11 38 8 12-2 18-15 30-15",
  "M247 502c13 7 25-3 38 4 10 6 12 19 23 23",
];

const hairlineCracks = [
  "M448 154l18-11 10 15 23-5",
  "M562 126l13 19 20-7 17 13",
  "M713 142l-19 13 8 18-16 17",
  "M848 215l-22 4-7 19-23 3",
  "M976 376l-24-6-14 14-21-8",
  "M1012 632l-23 9-2 22-22 8",
  "M929 864l-23-6-15 15-22-4",
  "M757 1004l-19-15-18 9-17-18",
  "M587 1045l-9-23-22-2-8-22",
  "M344 947l18-12-8-20 18-13",
  "M208 696l23-7 4-21 23-5",
  "M223 425l22 5 13-16 22 7",
  "M376 237l15 16 20-9 16 16",
];

const FINE_CRACK_COUNT = 64;
const fineCracks = Array.from({ length: FINE_CRACK_COUNT }, (_, index) =>
  getFineCrackPath(index),
);

/** A crack wandering in from one edge of the ring, sometimes forking. */
function getFineCrackPath(index: number) {
  const fromOuter = seededUnit(index, 3) > 0.45;
  const reach = 0.35 + seededUnit(index, 5) * 0.75;
  const steps = 5;
  const width = PLASTER_RING_OUTER_RADIUS - PLASTER_RING_INNER_RADIUS;
  let angle =
    (index / FINE_CRACK_COUNT) * 360 + (seededUnit(index, 7) - 0.5) * 6;
  const points: string[] = [];
  let fork = "";

  for (let step = 0; step <= steps; step += 1) {
    const travelled = (step / steps) * reach * width;
    const radius = fromOuter
      ? PLASTER_RING_OUTER_RADIUS - travelled
      : PLASTER_RING_INNER_RADIUS + travelled;
    const point = polarToCartesian(angle, radius);

    points.push(`${point.x.toFixed(1)} ${point.y.toFixed(1)}`);

    if (step === 2 && seededUnit(index, 11) > 0.5) {
      const end = polarToCartesian(
        angle + (seededUnit(index, 13) - 0.5) * 9,
        radius + (fromOuter ? -1 : 1) * width * 0.22,
      );

      fork = ` M ${point.x.toFixed(1)} ${point.y.toFixed(1)} L ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
    }

    angle += (seededUnit(index * 9 + step, 17) - 0.5) * 2.6;
  }

  return `M ${points.join(" L ")}${fork}`;
}

export function PlasterArcOverlay() {
  return (
    <ClockSvg id="plaster-arc-overlay-svg">
      <defs>
        <radialGradient id="plaster-fill" cx="50%" cy="50%" r="55%">
          <stop offset="55%" stopColor="#f4f1df" />
          <stop offset="82%" stopColor="#ebe7d4" />
          <stop offset="100%" stopColor="#d8d1b6" />
        </radialGradient>

        <linearGradient id="plaster-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.26" />
          <stop offset="0.48" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#4a4f60" stopOpacity="0.12" />
        </linearGradient>

        {/* Blotches of damp and age in the plaster. */}
        <filter id="plaster-stain" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.011"
            numOctaves="4"
            seed="8"
          />
          <feColorMatrix values="0 0 0 0 0.47  0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 -1.9 0.95" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>

        {/* The grit of the plaster itself. */}
        <filter id="plaster-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            seed="2"
          />
          <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.28  0 0 0 0 0.24  0 0 0 -1.2 0.62" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>

        <clipPath id="plaster-ring-clip">
          <path
            d={PLASTER_RING_CLIP_PATH}
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </clipPath>
      </defs>

      <path
        d={PLASTER_RING_CLIP_PATH}
        fill="url(#plaster-fill)"
        fillRule="evenodd"
      />
      <path
        d={PLASTER_RING_CLIP_PATH}
        fill="url(#plaster-shade)"
        fillRule="evenodd"
      />
      <path
        d={PLASTER_RING_CLIP_PATH}
        fillRule="evenodd"
        filter="url(#plaster-stain)"
      />
      <path
        d={PLASTER_RING_CLIP_PATH}
        fillRule="evenodd"
        filter="url(#plaster-grain)"
      />

      <g clipPath="url(#plaster-ring-clip)">
        <g
          fill="none"
          stroke="#5d5a5c"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.55"
        >
          {fineCracks.map((path) => (
            <path key={path} d={path} strokeWidth="1.1" />
          ))}
          {crackPaths.map((path) => (
            <path key={path} d={path} strokeWidth="1.7" />
          ))}
          {hairlineCracks.map((path) => (
            <path key={path} d={path} strokeWidth="0.9" />
          ))}
        </g>
        <g
          fill="none"
          stroke="#ffffff"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.15"
          transform="translate(-1 -1)"
        >
          {crackPaths.map((path) => (
            <path key={path} d={path} strokeWidth="0.8" />
          ))}
        </g>
      </g>
    </ClockSvg>
  );
}

export function PlasterArcBorders() {
  return (
    <ClockSvg id="plaster-arc-borders-svg">
      <defs>
        <radialGradient
          id="gold-outer-border"
          cx={CLOCK_CENTER}
          cy={CLOCK_CENTER}
          r={PLASTER_RING_OUTER_RADIUS + 3}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.988" stopColor="#8c650e" />
          <stop offset="0.992" stopColor="#d3a226" />
          <stop offset="0.996" stopColor="#f5d25a" />
          <stop offset="1" stopColor="#fff1a2" />
        </radialGradient>
        <radialGradient
          id="gold-inner-border"
          cx={CLOCK_CENTER}
          cy={CLOCK_CENTER}
          r={PLASTER_RING_INNER_RADIUS + 5}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.986" stopColor="#fff1a2" />
          <stop offset="0.991" stopColor="#f5d25a" />
          <stop offset="0.996" stopColor="#d3a226" />
          <stop offset="1" stopColor="#8c650e" />
        </radialGradient>
        <filter
          id="gold-border-shadow"
          x="70"
          y="70"
          width="1060"
          height="1060"
          filterUnits="userSpaceOnUse"
        >
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="2.6"
            floodColor="#000000"
            floodOpacity="0.4"
          />
        </filter>
      </defs>

      <g fill="none" filter="url(#gold-border-shadow)">
        <circle
          cx={CLOCK_CENTER}
          cy={CLOCK_CENTER}
          r={PLASTER_RING_OUTER_RADIUS}
          stroke="#68480f"
          strokeWidth="10"
        />
        <circle
          cx={CLOCK_CENTER}
          cy={CLOCK_CENTER}
          r={PLASTER_RING_OUTER_RADIUS - 2}
          stroke="url(#gold-outer-border)"
          strokeWidth="6"
        />
        <circle
          cx={CLOCK_CENTER}
          cy={CLOCK_CENTER}
          r={PLASTER_RING_INNER_RADIUS}
          stroke="#68480f"
          strokeWidth="10"
        />
        <circle
          cx={CLOCK_CENTER}
          cy={CLOCK_CENTER}
          r={PLASTER_RING_INNER_RADIUS + 2}
          stroke="url(#gold-inner-border)"
          strokeWidth="6"
        />
        <circle
          cx={CLOCK_CENTER}
          cy={CLOCK_CENTER}
          r={TRACK_INNER_RADIUS}
          stroke="#68480f"
          strokeWidth="9"
        />
        <circle
          cx={CLOCK_CENTER}
          cy={CLOCK_CENTER}
          r={TRACK_INNER_RADIUS + 1.5}
          stroke="#e9c552"
          strokeWidth="4"
        />
      </g>
    </ClockSvg>
  );
}
