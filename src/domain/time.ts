export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const MINUTES_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR;

export interface ClockTime {
  hours: number;
  minutes: number;
  seconds: number;
}

export function getClockTime(date: Date, timeZone?: string): ClockTime {
  if (timeZone) {
    return getClockTimeInTimeZone(date, timeZone);
  }

  return {
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
  };
}

export interface ZonedDate {
  year: number;
  month: number;
  day: number;
  /** 0 Sunday to 6 Saturday. */
  weekday: number;
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function getZonedDate(date: Date, timeZone: string): ZonedDate {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "numeric",
    timeZone,
    weekday: "short",
    year: "numeric",
  }).formatToParts(date);

  return {
    year: Number(getDateTimePart(parts, "year")),
    month: Number(getDateTimePart(parts, "month")),
    day: Number(getDateTimePart(parts, "day")),
    weekday: WEEKDAY_INDEX[getDateTimePart(parts, "weekday")] ?? 0,
  };
}

export function getMinutesOfDay({ hours, minutes }: ClockTime) {
  return hours * MINUTES_PER_HOUR + minutes;
}

/** "45 min", "1 hour", "2 hours 5 min". */
export function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  const hourLabel = hours === 1 ? "1 hour" : `${hours} hours`;

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return hourLabel;

  return `${hourLabel} ${minutes} min`;
}

export function formatMinutesOfDay(minutes: number) {
  const normalized = normalizeMinutes(Math.round(minutes));

  return `${formatTimePart(Math.floor(normalized / MINUTES_PER_HOUR))}:${formatTimePart(normalized % MINUTES_PER_HOUR)}`;
}

export function getClockRotationDegrees({ hours, minutes }: ClockTime) {
  return 180 - (hours * MINUTES_PER_HOUR + minutes) * 0.25;
}

export function getTimeLabel({ hours, minutes, seconds }: ClockTime) {
  return [
    formatTimePart(hours),
    formatTimePart(minutes),
    formatTimePart(seconds),
  ];
}

function formatTimePart(value: number) {
  return value.toString().padStart(2, "0");
}

function getClockTimeInTimeZone(date: Date, timeZone: string): ClockTime {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hour12: false,
    hourCycle: "h23",
    minute: "2-digit",
    second: "2-digit",
    timeZone,
  }).formatToParts(date);

  return {
    hours: Number(getDateTimePart(parts, "hour")),
    minutes: Number(getDateTimePart(parts, "minute")),
    seconds: Number(getDateTimePart(parts, "second")),
  };
}

function getDateTimePart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
) {
  const value = parts.find((part) => part.type === type)?.value;

  if (!value) {
    throw new Error(`Missing ${type} date part.`);
  }

  return value;
}

export function normalizeMinutes(minutes: number) {
  return ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}
