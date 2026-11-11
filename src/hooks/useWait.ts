import { useCallback, useEffect, useState } from "react";

import { primeBell, ringBell } from "../app/bell";
import { MINUTES_PER_DAY, MINUTES_PER_HOUR } from "../domain/time";

const WAIT_STORAGE_KEY = "bohemian-day-clock.waitUntil";
const MIN_WAIT_MINUTES = 5;
const MS_PER_MINUTE = 60_000;

export type WaitStatus = "idle" | "choosing" | "waiting" | "arrived";

export interface Wait {
  status: WaitStatus;
  /** Minutes chosen while choosing, minutes left while waiting. */
  minutes: number;
  /** Opens the chooser, or closes it again. */
  toggleChooser: () => void;
  adjust: (deltaMinutes: number) => void;
  choose: (minutes: number) => void;
  start: () => void;
  /** Stops a running wait, closes the chooser or dismisses an arrival. */
  clear: () => void;
}

export function useWait(now: Date, onArrive: () => void): Wait {
  const [targetMs, setTargetMs] = useState(readStoredTarget);
  const [chosenMinutes, setChosenMinutes] = useState<number>();
  const [arrived, setArrived] = useState(false);
  const nowMs = now.getTime();
  const due = targetMs !== undefined && nowMs >= targetMs;

  useEffect(() => {
    if (!due) {
      return;
    }

    setTargetMs(undefined);
    storeTarget(undefined);
    setArrived(true);
    ringBell();
    onArrive();
  }, [due, onArrive]);

  const choose = useCallback((minutes: number) => {
    setArrived(false);
    setChosenMinutes(clampWait(minutes));
  }, []);

  const clear = useCallback(() => {
    setArrived(false);
    setChosenMinutes(undefined);
    setTargetMs(undefined);
    storeTarget(undefined);
  }, []);

  const status: WaitStatus =
    chosenMinutes !== undefined
      ? "choosing"
      : targetMs !== undefined
        ? "waiting"
        : arrived
          ? "arrived"
          : "idle";

  return {
    status,
    minutes:
      chosenMinutes ??
      (targetMs === undefined
        ? 0
        : Math.max(0, Math.ceil((targetMs - nowMs) / MS_PER_MINUTE))),
    toggleChooser: () =>
      chosenMinutes === undefined ? choose(MINUTES_PER_HOUR) : clear(),
    adjust: (deltaMinutes) =>
      choose((chosenMinutes ?? MINUTES_PER_HOUR) + deltaMinutes),
    choose,
    start: () => {
      if (chosenMinutes === undefined) {
        return;
      }

      // Whole minutes from now, landing on the minute like the dial does.
      const target =
        Math.floor(Date.now() / MS_PER_MINUTE) * MS_PER_MINUTE +
        chosenMinutes * MS_PER_MINUTE;

      primeBell();
      requestNotificationPermission();
      setChosenMinutes(undefined);
      setTargetMs(target);
      storeTarget(target);
    },
    clear,
  };
}

function clampWait(minutes: number) {
  return Math.min(MINUTES_PER_DAY, Math.max(MIN_WAIT_MINUTES, minutes));
}

function requestNotificationPermission() {
  try {
    if ("Notification" in window && Notification.permission === "default") {
      void Notification.requestPermission();
    }
  } catch {
    // Notifications are optional: the bell and the dial still announce it.
  }
}

function readStoredTarget() {
  try {
    const stored = Number(window.localStorage.getItem(WAIT_STORAGE_KEY));

    return stored > Date.now() ? stored : undefined;
  } catch {
    return undefined;
  }
}

function storeTarget(targetMs: number | undefined) {
  try {
    if (targetMs === undefined) {
      window.localStorage.removeItem(WAIT_STORAGE_KEY);
    } else {
      window.localStorage.setItem(WAIT_STORAGE_KEY, String(targetMs));
    }
  } catch {
    // The wait still runs for this visit when localStorage is unavailable.
  }
}
