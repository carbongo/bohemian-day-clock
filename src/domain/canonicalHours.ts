import type { SunWindow } from "./sun";
import { MINUTES_PER_DAY, normalizeMinutes } from "./time";

const EQUINOX_SUNRISE_MINUTES = 360;
const EQUINOX_SUNSET_MINUTES = 1080;

/**
 * The hour of prayer in force, on unequal hours: daylight and night are each
 * split into twelve, so the hours stretch in summer and shrink in winter.
 * Without a sunrise (polar day or night) the day runs 6:00 to 18:00.
 */
export function getCanonicalHour(minutes: number, sunWindow: SunWindow) {
  const sunrise =
    sunWindow.status === "normal"
      ? sunWindow.sunriseMinutes
      : EQUINOX_SUNRISE_MINUTES;
  const sunset =
    sunWindow.status === "normal"
      ? sunWindow.sunsetMinutes
      : EQUINOX_SUNSET_MINUTES;
  const dayLength = normalizeMinutes(sunset - sunrise);
  const sinceSunrise = normalizeMinutes(minutes - sunrise);

  if (sinceSunrise < dayLength) {
    const dayShare = sinceSunrise / dayLength;

    if (dayShare < 3 / 12) return "Prime";
    if (dayShare < 6 / 12) return "Terce";
    if (dayShare < 9 / 12) return "Sext";
    if (dayShare < 11 / 12) return "None";

    return "Vespers";
  }

  const nightShare = (sinceSunrise - dayLength) / (MINUTES_PER_DAY - dayLength);

  if (nightShare < 2 / 12) return "Compline";
  if (nightShare < 10 / 12) return "Matins";

  return "Lauds";
}
