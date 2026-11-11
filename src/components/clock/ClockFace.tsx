import { useId } from "react";

import {
  CLOCK_CENTER,
  FACE_RADIUS,
  PLASTER_RING_OUTER_RADIUS,
} from "./lib/clockGeometry";
import { ClockSvg } from "./lib/clockSvgDefs";

const FACE_BACKDROP_RADIUS = PLASTER_RING_OUTER_RADIUS;

const scratchPaths = [
  "M447 209c53 40 92 87 151 126 48 32 93 54 136 96",
  "M470 243c41 33 76 69 122 94 39 22 89 34 126 66",
  "M388 356c97 68 193 134 291 198 58 37 115 75 174 111",
  "M322 421c114 62 211 138 324 201 92 51 186 91 285 123",
  "M406 671c84-72 170-142 244-224 53-58 91-124 136-187",
  "M300 759c83-39 158-91 231-146 92-70 172-153 250-238",
  "M489 799c68-54 130-114 196-169 52-44 109-81 163-122",
  "M586 216c-51 86-91 177-126 270-32 84-59 169-91 253",
  "M706 195c-46 64-77 139-106 212-34 87-74 171-109 257",
  "M788 252c-52 79-91 166-134 250-29 56-63 109-91 166",
  "M294 543c109 11 216 33 324 47 94 13 187 18 281 27",
  "M352 824c79-10 155-34 231-55 102-28 208-42 311-67",
  "M252 610c84 33 171 57 259 78 108 25 218 42 326 64",
  "M390 285c47 24 83 65 128 92 39 24 87 29 127 51",
  "M618 837c42-36 85-69 125-108 36-35 60-81 96-116",
  "M430 907c58-31 113-66 165-105 42-32 84-63 132-85",
];

const hairlinePaths = [
  "M501 179l42 37 55-18 46 24",
  "M694 192l-35 48 24 45-27 58",
  "M817 331l-66 21-24 61-58 19",
  "M931 501l-87-20-48 46-82-12",
  "M865 813l-72-28-59 35-76-17",
  "M608 939l-33-73-76-11-31-66",
  "M364 813l56-51-21-72 47-55",
  "M277 567l76-24 19-68 67-31",
  "M337 382l62 16 37-47 66 20",
  "M517 632l40-52 61 15 48-42",
  "M530 708l56-28 42 38 61-23",
  "M629 492l-43-51 22-53-36-43",
];

const pitMarks = [
  { cx: 371, cy: 554, r: 4.3, opacity: 0.48 },
  { cx: 475, cy: 265, r: 2.5, opacity: 0.34 },
  { cx: 530, cy: 319, r: 3.2, opacity: 0.44 },
  { cx: 604, cy: 391, r: 2.2, opacity: 0.36 },
  { cx: 660, cy: 342, r: 4.6, opacity: 0.45 },
  { cx: 744, cy: 414, r: 2.8, opacity: 0.38 },
  { cx: 811, cy: 370, r: 3.7, opacity: 0.42 },
  { cx: 856, cy: 552, r: 4.8, opacity: 0.5 },
  { cx: 759, cy: 611, r: 2.7, opacity: 0.38 },
  { cx: 676, cy: 669, r: 3.4, opacity: 0.44 },
  { cx: 592, cy: 736, r: 2.5, opacity: 0.37 },
  { cx: 493, cy: 681, r: 4.2, opacity: 0.48 },
  { cx: 414, cy: 737, r: 2.8, opacity: 0.4 },
  { cx: 335, cy: 681, r: 3.7, opacity: 0.45 },
  { cx: 340, cy: 456, r: 2.9, opacity: 0.39 },
  { cx: 501, cy: 843, r: 3.2, opacity: 0.43 },
  { cx: 722, cy: 814, r: 4.1, opacity: 0.47 },
  { cx: 897, cy: 698, r: 2.4, opacity: 0.35 },
];

export function ClockFace() {
  const svgId = useId().replace(/:/g, "");
  const faceClipPathId = `${svgId}-face-clip`;
  const faceFillId = `${svgId}-face-fill`;
  const faceShadeId = `${svgId}-face-shade`;
  const faceGrainId = `${svgId}-face-grain`;
  const faceMottleId = `${svgId}-face-mottle`;
  const dialShadowId = `${svgId}-dial-shadow`;

  return (
    <ClockSvg id="clock-face-svg" className="z-10">
      <defs>
        <clipPath id={faceClipPathId}>
          <circle cx={CLOCK_CENTER} cy={CLOCK_CENTER} r={FACE_RADIUS} />
        </clipPath>

        <radialGradient id={faceFillId} cx="50%" cy="44%" r="60%">
          <stop offset="0" stopColor="#7a5230" />
          <stop offset="0.45" stopColor="#5f3d20" />
          <stop offset="0.8" stopColor="#3f2713" />
          <stop offset="1" stopColor="#24150a" />
        </radialGradient>

        <radialGradient id={faceShadeId} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#c99b62" stopOpacity="0.14" />
          <stop offset="0.6" stopColor="#2a1a0c" stopOpacity="0" />
          <stop offset="0.9" stopColor="#0d0703" stopOpacity="0.5" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.9" />
        </radialGradient>

        {/* Fine streaks, like brushed wood. */}
        <filter id={faceGrainId} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.018 0.42"
            numOctaves="3"
            seed="11"
          />
          <feColorMatrix values="0 0 0 0 0.09  0 0 0 0 0.05  0 0 0 0 0.02  0 0 0 -1.7 0.92" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>

        {/* Large stains, like handled leather. */}
        <filter id={faceMottleId} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.0075"
            numOctaves="4"
            seed="3"
          />
          <feColorMatrix values="0 0 0 0 0.06  0 0 0 0 0.03  0 0 0 0 0.01  0 0 0 -2.6 1.5" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>

        <filter id={dialShadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>

      <circle
        cx={CLOCK_CENTER}
        cy={CLOCK_CENTER + 12}
        r={FACE_BACKDROP_RADIUS + 4}
        fill="#000000"
        opacity="0.75"
        filter={`url(#${dialShadowId})`}
      />
      <circle
        cx={CLOCK_CENTER}
        cy={CLOCK_CENTER}
        r={FACE_BACKDROP_RADIUS}
        fill="#1b120a"
      />

      <g clipPath={`url(#${faceClipPathId})`}>
        <circle
          cx={CLOCK_CENTER}
          cy={CLOCK_CENTER}
          r={FACE_RADIUS}
          fill={`url(#${faceFillId})`}
        />
        <circle
          cx={CLOCK_CENTER}
          cy={CLOCK_CENTER}
          r={FACE_RADIUS}
          filter={`url(#${faceMottleId})`}
        />
        <circle
          cx={CLOCK_CENTER}
          cy={CLOCK_CENTER}
          r={FACE_RADIUS}
          filter={`url(#${faceGrainId})`}
        />

        <g
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="rotate(-7 600 600)"
        >
          <g stroke="#150c05" strokeOpacity="0.3" strokeWidth="1.4">
            {scratchPaths.map((path) => (
              <path key={path} d={path} />
            ))}
          </g>
          <g
            stroke="#d9b98a"
            strokeOpacity="0.07"
            strokeWidth="0.8"
            transform="translate(-2 -2)"
          >
            {scratchPaths.map((path) => (
              <path key={path} d={path} />
            ))}
          </g>
          <g stroke="#0b0907" strokeOpacity="0.17" strokeWidth="0.7">
            {hairlinePaths.map((path) => (
              <path key={path} d={path} />
            ))}
          </g>
        </g>

        <g fill="#030303" opacity="0.58">
          {pitMarks.map((pit) => (
            <circle
              key={`${pit.cx}-${pit.cy}`}
              cx={pit.cx}
              cy={pit.cy}
              r={pit.r}
              opacity={pit.opacity}
            />
          ))}
        </g>

        <circle
          cx={CLOCK_CENTER}
          cy={CLOCK_CENTER}
          r={FACE_RADIUS}
          fill={`url(#${faceShadeId})`}
        />
      </g>
    </ClockSvg>
  );
}
