import { useId } from "react";

import type { SunWindow } from "../../domain/sun";
import { normalizeMinutes } from "../../domain/time";
import {
  CLOCK_CENTER,
  PLASTER_RING_CLIP_PATH,
  PLASTER_RING_INNER_RADIUS,
  PLASTER_RING_OUTER_RADIUS,
  SUN_ARC_RADIUS,
  getClockArcPath,
  getRingClipPath,
  minutesToDegrees,
  polarToCartesian,
  seededUnit,
} from "./lib/clockGeometry";
import {
  ClockSvg,
  GlowFilter,
  RingClipPath,
  SoftBlurFilter,
} from "./lib/clockSvgDefs";

interface NightOverlayProps {
  sunWindow: SunWindow;
}

const twilightClassName =
  "fill-none stroke-sky-200/55 stroke-[190] [stroke-linecap:round]";
const nightOuterGlowClassName =
  "fill-none stroke-sky-600/70 stroke-[190] [stroke-linecap:round]";
const nightMidGlowClassName =
  "fill-none stroke-blue-950/100 stroke-[190] [stroke-linecap:round]";
const nightCoreClassName =
  "fill-none stroke-slate-950/90 stroke-[190] [stroke-linecap:round]";

const NIGHT_STAR_INNER_RADIUS = PLASTER_RING_INNER_RADIUS + 18;
const NIGHT_STAR_OUTER_RADIUS = PLASTER_RING_OUTER_RADIUS - 18;
const NIGHT_STAR_CLIP_INNER_RADIUS = PLASTER_RING_INNER_RADIUS;
const NIGHT_STAR_CLIP_OUTER_RADIUS = PLASTER_RING_OUTER_RADIUS;
const TWILIGHT_MINUTES = 70;
const NIGHT_MID_GLOW_ARC_RATIO = 0.88;
const NIGHT_CORE_ARC_RATIO = 0.5;

export function NightOverlay({ sunWindow }: NightOverlayProps) {
  const svgId = useId().replace(/:/g, "");
  const nightStarsClipPathId = `${svgId}-night-stars-clip`;
  const nightStarsRingClipPathId = `${svgId}-night-stars-ring-clip`;
  const nightStarGlowFilterId = `${svgId}-night-star-glow`;
  const nightArcClipPathId = `${svgId}-night-arc-ring-clip`;
  const softGlowFilterId = `${svgId}-night-soft-glow`;

  if (sunWindow.status === "polar-night") {
    return (
      <>
        <NightArc
          corePath={getClockArcPath(
            -720 * NIGHT_CORE_ARC_RATIO,
            720 * NIGHT_CORE_ARC_RATIO,
          )}
          midPath={getClockArcPath(
            -720 * NIGHT_MID_GLOW_ARC_RATIO,
            720 * NIGHT_MID_GLOW_ARC_RATIO,
          )}
          ringClipPathId={nightArcClipPathId}
          softGlowFilterId={softGlowFilterId}
        />
        <NightStarsOverlay
          clipPath={getFullNightRingClipPath()}
          clipPathId={nightStarsClipPathId}
          glowFilterId={nightStarGlowFilterId}
          ringClipPathId={nightStarsRingClipPathId}
          stars={getNightStars(0, 1440)}
        />
      </>
    );
  }

  if (sunWindow.status !== "normal") {
    return null;
  }

  const nightPath = getClockArcPath(
    sunWindow.sunsetMinutes,
    sunWindow.sunriseMinutes,
  );
  const dayDuration = normalizeMinutes(
    sunWindow.sunsetMinutes - sunWindow.sunriseMinutes,
  );
  const twilightMinutes = Math.min(TWILIGHT_MINUTES, dayDuration / 4);
  const twilightPath = getClockArcPath(
    sunWindow.sunsetMinutes - twilightMinutes,
    sunWindow.sunriseMinutes + twilightMinutes,
  );
  const nightMidPath = getNightCenteredArcPath(
    sunWindow.sunsetMinutes,
    sunWindow.sunriseMinutes,
    NIGHT_MID_GLOW_ARC_RATIO,
  );
  const nightCorePath = getNightCenteredArcPath(
    sunWindow.sunsetMinutes,
    sunWindow.sunriseMinutes,
    NIGHT_CORE_ARC_RATIO,
  );
  const nightDuration = normalizeMinutes(
    sunWindow.sunriseMinutes - sunWindow.sunsetMinutes,
  );

  return (
    <>
      <NightArc
        corePath={nightCorePath}
        midPath={nightMidPath}
        path={nightPath}
        twilightPath={twilightPath}
        ringClipPathId={nightArcClipPathId}
        softGlowFilterId={softGlowFilterId}
      />
      <NightStarsOverlay
        clipPath={getNightSegmentClipPath(
          sunWindow.sunsetMinutes,
          sunWindow.sunriseMinutes,
        )}
        clipPathId={nightStarsClipPathId}
        glowFilterId={nightStarGlowFilterId}
        ringClipPathId={nightStarsRingClipPathId}
        stars={getNightStars(sunWindow.sunsetMinutes, nightDuration)}
      />
    </>
  );
}

interface NightArcProps {
  corePath?: string;
  midPath?: string;
  path?: string;
  twilightPath?: string;
  ringClipPathId: string;
  softGlowFilterId: string;
}

function NightArc({
  corePath,
  midPath,
  path,
  twilightPath,
  ringClipPathId,
  softGlowFilterId,
}: NightArcProps) {
  const glowShapes = path ? (
    <>
      <path className={nightOuterGlowClassName} d={path} />
      <path className={nightMidGlowClassName} d={midPath ?? path} />
    </>
  ) : (
    <>
      <circle
        className={nightOuterGlowClassName}
        cx={CLOCK_CENTER}
        cy={CLOCK_CENTER}
        r={SUN_ARC_RADIUS}
      />
      {midPath ? (
        <path className={nightMidGlowClassName} d={midPath} />
      ) : (
        <circle
          className={nightMidGlowClassName}
          cx={CLOCK_CENTER}
          cy={CLOCK_CENTER}
          r={SUN_ARC_RADIUS}
        />
      )}
    </>
  );
  const coreShape = corePath ? (
    <path className={nightCoreClassName} d={corePath} />
  ) : (
    <circle
      className={nightCoreClassName}
      cx={CLOCK_CENTER}
      cy={CLOCK_CENTER}
      r={SUN_ARC_RADIUS}
    />
  );

  return (
    <ClockSvg id="night-arc-overlay-svg">
      <defs>
        <RingClipPath id={ringClipPathId} path={PLASTER_RING_CLIP_PATH} />
        <SoftBlurFilter id={softGlowFilterId} stdDeviation={28} />
      </defs>
      <g clipPath={`url(#${ringClipPathId})`}>
        <g filter={`url(#${softGlowFilterId})`}>
          {twilightPath ? (
            <path className={twilightClassName} d={twilightPath} />
          ) : null}
          {glowShapes}
          {coreShape}
        </g>
      </g>
    </ClockSvg>
  );
}

interface NightStar {
  angle: number;
  opacity: number;
  radius: number;
  size: number;
  x: number;
  y: number;
}

interface NightStarsOverlayProps {
  clipPath: string;
  clipPathId: string;
  glowFilterId: string;
  ringClipPathId: string;
  stars: NightStar[];
}

function NightStarsOverlay({
  clipPath,
  clipPathId,
  glowFilterId,
  ringClipPathId,
  stars,
}: NightStarsOverlayProps) {
  return (
    <ClockSvg id="night-stars-overlay-svg">
      <defs>
        <RingClipPath id={ringClipPathId} path={PLASTER_RING_CLIP_PATH} />
        <clipPath id={clipPathId}>
          <path d={clipPath} fillRule="evenodd" clipRule="evenodd" />
        </clipPath>
        <GlowFilter id={glowFilterId} stdDeviation={6} />
      </defs>

      <g clipPath={`url(#${ringClipPathId})`}>
        <g clipPath={`url(#${clipPathId})`}>
          {stars.map((star) => (
            <g
              key={`${star.x}-${star.y}`}
              transform={`translate(${star.x.toFixed(3)} ${star.y.toFixed(3)}) rotate(${star.angle.toFixed(3)}) scale(${star.size.toFixed(3)})`}
              opacity={star.opacity}
              filter={`url(#${glowFilterId})`}
            >
              <path
                d="M0 -1 L0.12 -0.28 L0.5 -0.5 L0.28 -0.12 L1 0 L0.28 0.12 L0.5 0.5 L0.12 0.28 L0 1 L-0.12 0.28 L-0.5 0.5 L-0.28 0.12 L-1 0 L-0.28 -0.12 L-0.5 -0.5 L-0.12 -0.28 Z"
                fill="#f6c744"
              />
              <path
                d="M0 -0.58 L0.07 -0.16 L0.3 -0.3 L0.16 -0.07 L0.58 0 L0.16 0.07 L0.3 0.3 L0.07 0.16 L0 0.58 L-0.07 0.16 L-0.3 0.3 L-0.16 0.07 L-0.58 0 L-0.16 -0.07 L-0.3 -0.3 L-0.07 -0.16 Z"
                fill="#fff1a6"
              />
            </g>
          ))}
        </g>
      </g>
    </ClockSvg>
  );
}

function getNightStars(startMinutes: number, durationMinutes: number) {
  const starCount = clamp(Math.round(durationMinutes / 80), 5, 18);
  const smallStarCount = starCount * 2;
  const smallStars = Array.from({ length: smallStarCount }, (_, index) =>
    makeNightStar({
      durationMinutes,
      index,
      opacityEnd: 0.82,
      opacityStart: 0.58,
      progress: (index + 0.5) / smallStarCount,
      saltOffset: 400,
      sizeEnd: 11,
      sizeStart: 6,
      startMinutes,
      totalCount: smallStarCount,
    }),
  );
  const largeStars = Array.from({ length: starCount }, (_, index) =>
    makeNightStar({
      durationMinutes,
      index,
      opacityEnd: 0.96,
      opacityStart: 0.72,
      progress: (index + 0.5) / starCount,
      saltOffset: 0,
      sizeEnd: 30,
      sizeStart: 15,
      startMinutes,
      totalCount: starCount,
    }),
  );

  return [...smallStars, ...largeStars];
}

interface NightStarOptions {
  durationMinutes: number;
  index: number;
  opacityEnd: number;
  opacityStart: number;
  progress: number;
  saltOffset: number;
  sizeEnd: number;
  sizeStart: number;
  startMinutes: number;
  totalCount: number;
}

function makeNightStar({
  durationMinutes,
  index,
  opacityEnd,
  opacityStart,
  progress,
  saltOffset,
  sizeEnd,
  sizeStart,
  startMinutes,
  totalCount,
}: NightStarOptions) {
  const angularJitter = (seededUnit(index, saltOffset + 17) - 0.5) * 0.34;
  const radialJitter = seededUnit(index, saltOffset + 41);
  const minutes = normalizeMinutes(
    startMinutes +
      durationMinutes * clamp(progress + angularJitter / totalCount, 0, 1),
  );
  const angle = minutesToDegrees(minutes);
  const radius = lerp(
    NIGHT_STAR_INNER_RADIUS,
    NIGHT_STAR_OUTER_RADIUS,
    radialJitter,
  );
  const position = polarToCartesian(angle, radius);

  return {
    angle: angle + seededUnit(index, saltOffset + 83) * 25,
    opacity: lerp(
      opacityStart,
      opacityEnd,
      seededUnit(index, saltOffset + 107),
    ),
    radius,
    size: lerp(
      sizeStart * 1.25,
      sizeEnd / 1.5,
      seededUnit(index, saltOffset + 131),
    ),
    x: position.x,
    y: position.y,
  } satisfies NightStar;
}

function getNightSegmentClipPath(startMinutes: number, endMinutes: number) {
  const startAngle = minutesToDegrees(startMinutes);
  const endAngle = minutesToDegrees(endMinutes);
  const outerStart = polarToCartesian(startAngle, NIGHT_STAR_CLIP_OUTER_RADIUS);
  const outerEnd = polarToCartesian(endAngle, NIGHT_STAR_CLIP_OUTER_RADIUS);
  const innerStart = polarToCartesian(startAngle, NIGHT_STAR_CLIP_INNER_RADIUS);
  const innerEnd = polarToCartesian(endAngle, NIGHT_STAR_CLIP_INNER_RADIUS);
  const nightMinutes = normalizeMinutes(endMinutes - startMinutes);
  const largeArcFlag = nightMinutes > 720 ? 1 : 0;

  return [
    `M ${outerStart.x.toFixed(3)} ${outerStart.y.toFixed(3)}`,
    `A ${NIGHT_STAR_CLIP_OUTER_RADIUS} ${NIGHT_STAR_CLIP_OUTER_RADIUS} 0 ${largeArcFlag} 1 ${outerEnd.x.toFixed(3)} ${outerEnd.y.toFixed(3)}`,
    `L ${innerEnd.x.toFixed(3)} ${innerEnd.y.toFixed(3)}`,
    `A ${NIGHT_STAR_CLIP_INNER_RADIUS} ${NIGHT_STAR_CLIP_INNER_RADIUS} 0 ${largeArcFlag} 0 ${innerStart.x.toFixed(3)} ${innerStart.y.toFixed(3)}`,
    "Z",
  ].join(" ");
}

function getFullNightRingClipPath() {
  return getRingClipPath(
    NIGHT_STAR_CLIP_INNER_RADIUS,
    NIGHT_STAR_CLIP_OUTER_RADIUS,
  );
}

function getNightCenteredArcPath(
  startMinutes: number,
  endMinutes: number,
  ratio: number,
) {
  const nightMinutes = normalizeMinutes(endMinutes - startMinutes);
  const arcMinutes = nightMinutes * ratio;
  const midnightMinutes = normalizeMinutes(startMinutes + nightMinutes / 2);

  return getClockArcPath(
    midnightMinutes - arcMinutes / 2,
    midnightMinutes + arcMinutes / 2,
  );
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
