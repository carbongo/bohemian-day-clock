const SYNODIC_MONTH_DAYS = 29.530588853;
const REFERENCE_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14);
const MS_PER_DAY = 86_400_000;

export interface MoonPhase {
  /** 0 new moon, 0.25 first quarter, 0.5 full moon, 0.75 last quarter. */
  phase: number;
  /** Lit share of the disc, 0 to 1. */
  illumination: number;
  label: string;
}

export function getMoonPhase(date: Date): MoonPhase {
  const days = (date.getTime() - REFERENCE_NEW_MOON_MS) / MS_PER_DAY;
  const phase = (((days / SYNODIC_MONTH_DAYS) % 1) + 1) % 1;

  return {
    phase,
    illumination: (1 - Math.cos(2 * Math.PI * phase)) / 2,
    label: getMoonPhaseLabel(phase),
  };
}

function getMoonPhaseLabel(phase: number) {
  if (phase < 0.03 || phase >= 0.97) return "New Moon";
  if (phase < 0.22) return "Waxing Crescent";
  if (phase < 0.28) return "First Quarter";
  if (phase < 0.47) return "Waxing Gibbous";
  if (phase < 0.53) return "Full Moon";
  if (phase < 0.72) return "Waning Gibbous";
  if (phase < 0.78) return "Last Quarter";

  return "Waning Crescent";
}
