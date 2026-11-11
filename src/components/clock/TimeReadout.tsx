import type { ReactNode } from "react";

import type { MoonPhase } from "../../domain/moon";
import type { SunWindow } from "../../domain/sun";
import {
  formatDuration,
  formatMinutesOfDay,
  getMinutesOfDay,
  getTimeLabel,
  type ClockTime,
} from "../../domain/time";
import type { WaitStatus } from "../../hooks/useWait";

interface TimeReadoutProps {
  canonicalHour: string;
  compact: boolean;
  dateLabel: string;
  feastLabel: string;
  moon: MoonPhase;
  sunWindow: SunWindow;
  time: ClockTime;
  wait: { status: WaitStatus; minutes: number };
}

const captionClassName =
  "pointer-events-none absolute inset-0 z-40 m-auto grid h-[calc(var(--u)*54)] w-[calc(var(--u)*54)] place-items-center overflow-hidden text-center font-dial text-vellum [text-shadow:0_calc(var(--u)*0.2)_calc(var(--u)*0.5)_rgb(0_0_0/0.7)]";
const smallTextClassName =
  "text-[calc(var(--u)*3.1)] leading-[calc(var(--u)*4)]";
const tinyTextClassName =
  "text-[calc(var(--u)*2.4)] leading-[calc(var(--u)*3.2)] text-vellum/75";
const bigTextClassName =
  "gilt-text text-[calc(var(--u)*12.5)] font-bold leading-[calc(var(--u)*12.5)]";
const iconClassName = "h-[calc(var(--u)*4.2)] w-[calc(var(--u)*4.2)] text-gilt";

export function TimeReadout({
  canonicalHour,
  compact,
  dateLabel,
  feastLabel,
  moon,
  sunWindow,
  time,
  wait,
}: TimeReadoutProps) {
  const [hours, minutes] = getTimeLabel(time);
  const clock = `${hours}:${minutes}`;
  const waitEnd = formatMinutesOfDay(getMinutesOfDay(time) + wait.minutes);

  if (compact) {
    return (
      <figcaption className={captionClassName}>
        <div className="flex flex-col items-center gap-[calc(var(--u)*1.5)]">
          <span className="gilt-text text-[calc(var(--u)*17)] font-bold leading-[calc(var(--u)*17)]">
            {clock}
          </span>
          <p className="text-[calc(var(--u)*4.4)] leading-[calc(var(--u)*5)]">
            {wait.status === "waiting"
              ? `${formatDuration(wait.minutes)} left`
              : sunWindow.city.label}
          </p>
        </div>
      </figcaption>
    );
  }

  if (wait.status === "choosing") {
    return (
      <figcaption className={captionClassName}>
        <div className="flex w-full flex-col items-center gap-[calc(var(--u)*2.2)]">
          <p className="text-[calc(var(--u)*3.6)] leading-[calc(var(--u)*4.6)]">
            How long do you
            <br />
            wish to wait?
          </p>
          <span className="gilt-text text-[calc(var(--u)*8.6)] font-bold leading-[calc(var(--u)*9)]">
            {formatDuration(wait.minutes)}
          </span>
          <Divider />
          <p className={smallTextClassName}>Until {waitEnd}</p>
          <p className={tinyTextClassName}>or click an hour on the dial</p>
        </div>
      </figcaption>
    );
  }

  return (
    <figcaption className={captionClassName}>
      <div className="flex w-full flex-col items-center gap-[calc(var(--u)*1.7)]">
        <p className={smallTextClassName}>
          {wait.status === "waiting"
            ? `Waiting until ${waitEnd}`
            : wait.status === "arrived"
              ? "The wait is over"
              : feastLabel}
        </p>
        <span className={bigTextClassName}>{clock}</span>
        <Divider />
        <div className="flex w-full items-start justify-center gap-[calc(var(--u)*2)]">
          <Metric icon={<SunIcon rising />} label="Sunrise">
            {sunWindow.sunriseLabel}
          </Metric>
          <div className="flex w-[calc(var(--u)*19)] flex-col items-center">
            <p className={`${smallTextClassName} max-w-full truncate`}>
              {sunWindow.city.label}
            </p>
            <p className={tinyTextClassName}>{canonicalHour}</p>
          </div>
          <Metric icon={<SunIcon />} label="Sunset">
            {sunWindow.sunsetLabel}
          </Metric>
        </div>
        <div className="flex items-center gap-[calc(var(--u)*1.4)]">
          <MoonIcon phase={moon.phase} />
          <p className={tinyTextClassName}>
            {wait.status === "waiting"
              ? `${formatDuration(wait.minutes)} left`
              : `${moon.label} · ${dateLabel}`}
          </p>
        </div>
      </div>
    </figcaption>
  );
}

/** A gold rule with a lozenge at its middle. */
function Divider() {
  return (
    <svg
      className="h-[calc(var(--u)*1.6)] w-[calc(var(--u)*44)]"
      viewBox="0 0 440 16"
      aria-hidden="true"
    >
      <path
        d="M0 8H206M234 8H440"
        stroke="#d9b24a"
        strokeOpacity="0.65"
        strokeWidth="1.2"
      />
      <path d="M220 1l8 7-8 7-8-7z" fill="#d9b24a" />
      <path d="M206 8l5-3.5v7zM234 8l-5-3.5v7z" fill="#d9b24a" opacity="0.7" />
    </svg>
  );
}

interface MetricProps {
  children: ReactNode;
  icon: ReactNode;
  label: string;
}

function Metric({ children, icon, label }: MetricProps) {
  return (
    <div
      className={`flex w-[calc(var(--u)*10)] flex-col items-center gap-[calc(var(--u)*0.4)] ${smallTextClassName}`}
    >
      <div className={iconClassName} aria-hidden="true">
        {icon}
      </div>
      <span className="sr-only">{label}</span>
      <p>{children}</p>
    </div>
  );
}

function SunIcon({ rising = false }: { rising?: boolean }) {
  return (
    <svg className="h-full w-full" viewBox="0 0 24 24" fill="none">
      <path d="M5 17a7 7 0 0 1 14 0z" fill="currentColor" />
      <path
        d={`M2 20h20M12 3.5v4M4.6 9.2 6.3 10.9M19.4 9.2l-1.7 1.7${rising ? "M9.5 5.5 12 3l2.5 2.5" : "M9.5 5 12 7.5 14.5 5"}`}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function MoonIcon({ phase }: { phase: number }) {
  const share = phase < 0.5 ? phase : 1 - phase;
  const terminator = Math.abs(Math.cos(2 * Math.PI * share)) * 9;

  return (
    <svg
      className="h-[calc(var(--u)*3)] w-[calc(var(--u)*3)]"
      viewBox="-12 -12 24 24"
      aria-hidden="true"
    >
      <circle r="9" fill="#1a2644" stroke="#d9b24a" strokeWidth="1.2" />
      <path
        d={`M0 -9A9 9 0 0 1 0 9A${terminator.toFixed(2)} 9 0 0 ${share < 0.25 ? 0 : 1} 0 -9Z`}
        fill="#f3e6c0"
        transform={phase < 0.5 ? undefined : "scale(-1 1)"}
      />
    </svg>
  );
}
