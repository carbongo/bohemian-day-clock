import type { SunWindow } from "../../domain/sun";
import {
  HOURS_PER_DAY,
  MINUTES_PER_HOUR,
  normalizeMinutes,
} from "../../domain/time";
import {
  getRoundedSunEventHours,
  minutesToDegrees,
  polarToCartesian,
} from "./lib/clockGeometry";
import { ClockSvg } from "./lib/clockSvgDefs";

const HOURS = Array.from({ length: HOURS_PER_DAY }, (_, hour) => hour);
const textClassName = "font-dial text-[46px] font-bold";
const dayTextClassName = `${textClassName} fill-[#1b140d]`;
const nightTextClassName = `${textClassName} fill-white`;
const sunEventTextClassName = `${textClassName} fill-amber-200`;
const moonHourTextClassName = `${textClassName} fill-[#1b140d]`;
const sunHourTextClassName = `${textClassName} fill-[#2a1503]`;

const litMoonHourTextClassName = `${textClassName} fill-[#f3ecd8]`;

interface HourLabelsOverlayProps {
  /** True when the moon at 24 is mostly dark, so its numeral must be light. */
  moonIsDark: boolean;
  sunWindow: SunWindow;
}

export function HourLabelsOverlay({
  moonIsDark,
  sunWindow,
}: HourLabelsOverlayProps) {
  const sunEventHours =
    sunWindow.status === "normal"
      ? getRoundedSunEventHours(
          sunWindow.sunriseMinutes,
          sunWindow.sunsetMinutes,
        )
      : [];

  return (
    <ClockSvg id="hour-labels-overlay-svg">
      {HOURS.map((hour) => {
        const angle = minutesToDegrees(hour * MINUTES_PER_HOUR);
        const position = polarToCartesian(angle);

        return (
          <text
            key={hour}
            className={
              hour === 0 && moonIsDark
                ? litMoonHourTextClassName
                : getHourTextClassName(sunWindow, sunEventHours, hour)
            }
            x={position.x}
            y={position.y}
            textAnchor="middle"
            dominantBaseline="central"
            transform={`rotate(${angle} ${position.x} ${position.y})`}
          >
            {hour === 0 ? "24" : hour}
          </text>
        );
      })}
    </ClockSvg>
  );
}

function getHourTextClassName(
  sunWindow: SunWindow,
  sunEventHours: number[],
  hour: number,
) {
  if (hour === 0) {
    return moonHourTextClassName;
  }

  if (hour === 12) {
    return sunHourTextClassName;
  }

  if (sunEventHours.includes(hour)) {
    return sunEventTextClassName;
  }

  return isNightHour(sunWindow, hour) ? nightTextClassName : dayTextClassName;
}

function isNightHour(sunWindow: SunWindow, hour: number) {
  if (sunWindow.status !== "normal") {
    return sunWindow.status === "polar-night";
  }

  const hourMinutes = hour * MINUTES_PER_HOUR;
  const nightStart = sunWindow.sunsetMinutes;
  const nightDuration = normalizeMinutes(
    sunWindow.sunriseMinutes - sunWindow.sunsetMinutes,
  );

  return normalizeMinutes(hourMinutes - nightStart) < nightDuration;
}
