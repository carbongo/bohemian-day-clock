import { useRef } from "react";

import { getCanonicalHour } from "../../domain/canonicalHours";
import { getFeastDayLabel } from "../../domain/feasts";
import { getMoonPhase } from "../../domain/moon";
import { getSunWindow, type SunWindow } from "../../domain/sun";
import {
  getClockRotationDegrees,
  getClockTime,
  getMinutesOfDay,
  getZonedDate,
  normalizeMinutes,
} from "../../domain/time";
import type { TimeZoneCity } from "../../domain/timeZones";
import type { WaitStatus } from "../../hooks/useWait";
import { CelestialMarkersOverlay } from "./CelestialMarkersOverlay";
import { ClockFace } from "./ClockFace";
import { ClockPointer } from "./ClockPointer";
import { HourLabelsOverlay } from "./HourLabelsOverlay";
import { NightOverlay } from "./NightOverlay";
import { PlasterArcBorders, PlasterArcOverlay } from "./PlasterArcOverlay";
import { RingHitArea } from "./RingHitArea";
import { SunArcOverlay } from "./SunArcOverlay";
import { TimeReadout } from "./TimeReadout";
import { TrackOverlay } from "./TrackOverlay";

interface ClockProps {
  city: TimeZoneCity;
  /** Widget layout: the dial and the time, nothing else. */
  compact: boolean;
  now: Date;
  wait: { status: WaitStatus; minutes: number };
  onPickWait: (minutes: number) => void;
}

const TWILIGHT_MINUTES = 45;
const skyClassName =
  "absolute inset-0 transition-opacity duration-[3000ms] ease-linear";

export function Clock({ city, compact, now, wait, onPickWait }: ClockProps) {
  const time = getClockTime(now, city.timeZone);
  const nowMinutes = getMinutesOfDay(time);
  const sunWindow = getSunWindow(now, city);
  const moon = getMoonPhase(now);
  const clockRotation = useUnwoundRotation(getClockRotationDegrees(time));
  const sky = getSky(nowMinutes, sunWindow);
  const waitSpan =
    wait.status === "choosing" || wait.status === "waiting"
      ? { startMinutes: nowMinutes, durationMinutes: wait.minutes }
      : undefined;

  return (
    <main
      className="min-h-screen overflow-hidden bg-black text-white"
      data-tauri-drag-region={compact ? true : undefined}
    >
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div
          className={`${skyClassName} bg-[radial-gradient(circle_at_50%_42%,#141d38_0%,#080c18_55%,#020203_100%)]`}
          style={{ opacity: sky === "night" ? 1 : 0 }}
        />
        <div
          className={`${skyClassName} bg-[radial-gradient(circle_at_50%_42%,#4a3140_0%,#1c1420_55%,#040304_100%)]`}
          style={{ opacity: sky === "twilight" ? 1 : 0 }}
        />
        <div
          className={`${skyClassName} bg-[radial-gradient(circle_at_50%_42%,#39424d_0%,#171b20_55%,#050506_100%)]`}
          style={{ opacity: sky === "day" ? 1 : 0 }}
        />
      </div>

      <section
        className="pointer-events-none relative mx-auto grid h-screen w-screen place-items-center overflow-hidden"
        aria-label="Bohemian Day Clock"
      >
        <ClockFace />

        <div
          className="absolute inset-0 z-20 m-auto h-full w-full object-contain transition-transform duration-1000 ease-out"
          style={{ transform: `rotate(${clockRotation}deg)` }}
        >
          <PlasterArcOverlay />
          <NightOverlay sunWindow={sunWindow} />
          <SunArcOverlay sunWindow={sunWindow} />
          <CelestialMarkersOverlay
            moon={moon}
            rotation={clockRotation}
            southern={city.latitude < 0}
          />
          <TrackOverlay span={waitSpan} />
          <PlasterArcBorders />
          <HourLabelsOverlay
            moonIsDark={moon.illumination < 0.5}
            sunWindow={sunWindow}
          />
        </div>

        <ClockPointer />
        {compact ? null : (
          <RingHitArea nowMinutes={nowMinutes} onPick={onPickWait} />
        )}

        <TimeReadout
          canonicalHour={getCanonicalHour(nowMinutes, sunWindow)}
          compact={compact}
          dateLabel={getDateLabel(now, city.timeZone)}
          feastLabel={getFeastDayLabel(getZonedDate(now, city.timeZone))}
          moon={moon}
          sunWindow={sunWindow}
          time={time}
          wait={wait}
        />
      </section>
    </main>
  );
}

/**
 * The same angle, expressed as the turn nearest the previous one, so the ring
 * eases a quarter degree past midnight instead of spinning back a full turn.
 */
function useUnwoundRotation(degrees: number) {
  const previous = useRef(degrees);

  previous.current =
    degrees + Math.round((previous.current - degrees) / 360) * 360;

  return previous.current;
}

function getSky(nowMinutes: number, sunWindow: SunWindow) {
  if (sunWindow.status !== "normal") {
    return sunWindow.status === "polar-day" ? "day" : "night";
  }

  const sinceSunrise = normalizeMinutes(nowMinutes - sunWindow.sunriseMinutes);
  const dayLength = normalizeMinutes(
    sunWindow.sunsetMinutes - sunWindow.sunriseMinutes,
  );
  const toSunrise = Math.min(sinceSunrise, 1440 - sinceSunrise);
  const toSunset = Math.abs(sinceSunrise - dayLength);

  if (Math.min(toSunrise, toSunset) <= TWILIGHT_MINUTES) {
    return "twilight";
  }

  return sinceSunrise < dayLength ? "day" : "night";
}

function getDateLabel(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone,
  }).format(date);
}
