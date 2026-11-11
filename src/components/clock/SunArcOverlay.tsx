import { useId } from "react";

import type { SunWindow } from "../../domain/sun";
import { MINUTES_PER_HOUR, normalizeMinutes } from "../../domain/time";
import {
  PLASTER_RING_CLIP_PATH,
  getClockArcPath,
  getRoundedSunEventHours,
  minutesToDegrees,
  polarToCartesian,
} from "./lib/clockGeometry";
import { ClockSvg, RingClipPath, SoftBlurFilter } from "./lib/clockSvgDefs";

interface SunArcOverlayProps {
  sunWindow: SunWindow;
}

const glowClassName =
  "fill-none stroke-[#fbd45c] stroke-[190] [stroke-linecap:round]";
const coreClassName =
  "fill-none stroke-[#f3a01f]/90 stroke-[170] [stroke-linecap:round]";
const HEART_ARC_RATIO = 0.42;
const markerCircleClassName = "fill-none stroke-amber-200/95 stroke-[2]";

const MIN_CORE_ARC_MINUTES = 60;
const MAX_CORE_ARC_MINUTES = 240;
const CORE_DAYLIGHT_RATIO = 0.2;
const SUN_EVENT_MARKER_RADIUS = 36;

export function SunArcOverlay({ sunWindow }: SunArcOverlayProps) {
  const svgId = useId().replace(/:/g, "");
  const plasterClipPathId = `${svgId}-sun-arc-plaster-ring-clip`;
  const markerClipPathId = `${svgId}-sun-event-marker-ring-clip`;
  const softArcFilterId = `${svgId}-sun-arc-soft-filter`;

  if (sunWindow.status === "polar-night") {
    return null;
  }

  const corePath =
    sunWindow.status === "normal"
      ? getZenithArcPath(sunWindow.sunriseMinutes, sunWindow.sunsetMinutes, 1)
      : getClockArcPath(540, 900);
  const heartPath =
    sunWindow.status === "normal"
      ? getZenithArcPath(
          sunWindow.sunriseMinutes,
          sunWindow.sunsetMinutes,
          HEART_ARC_RATIO,
        )
      : getClockArcPath(660, 780);
  const markerHours =
    sunWindow.status === "normal"
      ? getRoundedSunEventHours(
          sunWindow.sunriseMinutes,
          sunWindow.sunsetMinutes,
        )
      : [];

  return (
    <>
      <ClockSvg id="sun-arc-overlay-svg">
        <defs>
          <RingClipPath id={plasterClipPathId} path={PLASTER_RING_CLIP_PATH} />
          <SoftBlurFilter id={softArcFilterId} stdDeviation={32} />
        </defs>
        <g clipPath={`url(#${plasterClipPathId})`}>
          <g filter={`url(#${softArcFilterId})`}>
            <path className={glowClassName} d={corePath} />
            <path className={coreClassName} d={heartPath} />
          </g>
        </g>
      </ClockSvg>
      {markerHours.length > 0 ? (
        <SunEventHourMarkers
          hours={markerHours}
          plasterClipPathId={markerClipPathId}
        />
      ) : null}
    </>
  );
}

interface SunEventHourMarkersProps {
  hours: number[];
  plasterClipPathId: string;
}

function SunEventHourMarkers({
  hours,
  plasterClipPathId,
}: SunEventHourMarkersProps) {
  return (
    <ClockSvg id="sun-event-markers-overlay-svg">
      <defs>
        <RingClipPath id={plasterClipPathId} path={PLASTER_RING_CLIP_PATH} />
      </defs>
      <g clipPath={`url(#${plasterClipPathId})`}>
        {hours.map((hour) => {
          const position = polarToCartesian(
            minutesToDegrees(hour * MINUTES_PER_HOUR),
          );

          return (
            <circle
              key={hour}
              className={markerCircleClassName}
              cx={position.x}
              cy={position.y}
              r={SUN_EVENT_MARKER_RADIUS}
            />
          );
        })}
      </g>
    </ClockSvg>
  );
}

function getZenithArcPath(
  startMinutes: number,
  endMinutes: number,
  ratio: number,
) {
  const daylightMinutes = normalizeMinutes(endMinutes - startMinutes);
  const solarNoonMinutes = normalizeMinutes(startMinutes + daylightMinutes / 2);
  const coreArcMinutes = getCoreArcMinutes(daylightMinutes) * ratio;

  return getClockArcPath(
    solarNoonMinutes - coreArcMinutes / 2,
    solarNoonMinutes + coreArcMinutes / 2,
  );
}

function getCoreArcMinutes(daylightMinutes: number) {
  const proportionalMinutes = daylightMinutes * CORE_DAYLIGHT_RATIO;
  const cappedMinutes = Math.min(proportionalMinutes, MAX_CORE_ARC_MINUTES);

  return Math.min(
    daylightMinutes,
    Math.max(cappedMinutes, MIN_CORE_ARC_MINUTES),
  );
}
