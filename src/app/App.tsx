import { useCallback, useEffect, useState } from "react";

import { Action } from "../components/actions/Action";
import { Clock } from "../components/clock/Clock";
import { SettingsMenu } from "../components/settings/SettingsMenu";
import { formatDuration } from "../domain/time";
import {
  findCityByLinkValue,
  getCitySlug,
  getResolvedTimeZone,
  getTimeZoneCity,
  getTimeZoneCities,
  isKnownTimeZoneCity,
  type TimeZoneCity,
} from "../domain/timeZones";
import { useNow } from "../hooks/useNow";
import { useWait } from "../hooks/useWait";

const SELECTED_CITY_STORAGE_KEY = "bohemian-day-clock.selectedTimeZone";
const WIDGET_STORAGE_KEY = "bohemian-day-clock.widget";
const CITY_LINK_PARAMETER = "city";
const APP_NAME = "Bohemian Day Clock";
const APP_URL = "https://bohemian-day-clock.vercel.app/";
const REPOSITORY_URL = "https://github.com/carbongo/bohemian-day-clock";
const SETTINGS_MENU_ID = "settings-menu";
/** Below this side, in CSS pixels, the window is a widget whatever the mode. */
const WIDGET_MAX_SIDE = 380;

export function App() {
  const now = useNow();
  const [selectedTimeZone, setSelectedTimeZone] = useState(getInitialTimeZone);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [widget, setWidget] = useState(
    () => readStored(WIDGET_STORAGE_KEY) === "1",
  );
  const smallWindow = useSmallWindow();
  const selectedCity = getTimeZoneCity(selectedTimeZone);
  const cityLabel = selectedCity.label;
  const announceArrival = useCallback(
    () => notifyArrival(cityLabel),
    [cityLabel],
  );
  const wait = useWait(now, announceArrival);
  const compact = widget || smallWindow;

  useEffect(() => {
    document.title =
      wait.status === "waiting"
        ? `${formatDuration(wait.minutes)} left · ${APP_NAME}`
        : wait.status === "arrived"
          ? `The wait is over · ${APP_NAME}`
          : APP_NAME;
  }, [wait.status, wait.minutes]);

  useEffect(() => {
    if (!settingsOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSettingsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [settingsOpen]);

  function handleCityChange(timeZone: string) {
    const city = getTimeZoneCity(timeZone);

    setSelectedTimeZone(city.timeZone);
    store(SELECTED_CITY_STORAGE_KEY, city.timeZone);
    showCityInAddress(city);
  }

  function toggleWidget() {
    setSettingsOpen(false);
    setWidget((current) => {
      store(WIDGET_STORAGE_KEY, current ? "0" : "1");

      return !current;
    });
  }

  return (
    <>
      <Clock
        city={selectedCity}
        compact={compact}
        now={now}
        wait={wait}
        onPickWait={wait.choose}
      />
      <div
        className={`fixed right-3 bottom-3 z-50 flex flex-col items-end gap-1 ${compact ? "opacity-0 transition-opacity focus-within:opacity-100 hover:opacity-100" : ""}`}
      >
        {settingsOpen && !compact ? (
          <div className="mb-2">
            <SettingsMenu
              cities={getTimeZoneCities()}
              id={SETTINGS_MENU_ID}
              isDesktop={"__TAURI__" in window}
              selectedTimeZone={selectedCity.timeZone}
              onCityChange={handleCityChange}
              onCopyLink={() => copyCityLink(selectedCity)}
            />
          </div>
        ) : null}
        {compact ? (
          widget ? (
            <Action label="Full clock" shortcutKey="w" onPress={toggleWidget} />
          ) : null
        ) : wait.status === "choosing" ? (
          <>
            <Action label="Start" shortcutKey="Enter" onPress={wait.start} />
            <Action
              label="+1 Hour"
              shortcutKey="ArrowUp"
              onPress={() => wait.adjust(60)}
            />
            <Action
              label="−1 Hour"
              shortcutKey="ArrowDown"
              onPress={() => wait.adjust(-60)}
            />
            <Action
              label="+5 Min"
              shortcutKey="ArrowRight"
              onPress={() => wait.adjust(5)}
            />
            <Action
              label="−5 Min"
              shortcutKey="ArrowLeft"
              onPress={() => wait.adjust(-5)}
            />
            <Action label="Back" shortcutKey="Escape" onPress={wait.clear} />
          </>
        ) : (
          <>
            {wait.status === "arrived" ? (
              <Action
                label="Dismiss"
                shortcutKey="Enter"
                onPress={wait.clear}
              />
            ) : wait.status === "waiting" ? (
              <Action
                label="Stop Waiting"
                shortcutKey="t"
                onPress={wait.clear}
              />
            ) : (
              <Action
                label="Wait"
                shortcutKey="t"
                onPress={wait.toggleChooser}
              />
            )}
            <Action
              controls={SETTINGS_MENU_ID}
              isOpen={settingsOpen}
              label="Settings"
              shortcutKey="s"
              onPress={() => setSettingsOpen((current) => !current)}
            />
            <Action label="Widget" shortcutKey="w" onPress={toggleWidget} />
            <Action href={REPOSITORY_URL} label="GitHub" shortcutKey="g" />
          </>
        )}
      </div>
    </>
  );
}

function useSmallWindow() {
  const [small, setSmall] = useState(isSmallWindow);

  useEffect(() => {
    const update = () => setSmall(isSmallWindow());

    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, []);

  return small;
}

function isSmallWindow() {
  return Math.min(window.innerWidth, window.innerHeight) < WIDGET_MAX_SIDE;
}

/** A city named in the link wins over the remembered one, then the local one. */
function getInitialTimeZone() {
  const linked = new URLSearchParams(window.location.search).get(
    CITY_LINK_PARAMETER,
  );
  const linkedCity = linked ? findCityByLinkValue(linked) : undefined;

  if (linkedCity) {
    return linkedCity.timeZone;
  }

  const storedTimeZone = readStored(SELECTED_CITY_STORAGE_KEY);

  if (storedTimeZone && isKnownTimeZoneCity(storedTimeZone)) {
    return storedTimeZone;
  }

  return getTimeZoneCity(getResolvedTimeZone()).timeZone;
}

function getCityLink(city: TimeZoneCity, base: string) {
  const url = new URL(base);

  url.searchParams.set(CITY_LINK_PARAMETER, getCitySlug(city));

  return url.toString();
}

/** Keeps the address bar a link to the chosen city, where there is one. */
function showCityInAddress(city: TimeZoneCity) {
  if (!window.location.protocol.startsWith("http")) {
    return;
  }

  try {
    window.history.replaceState(
      null,
      "",
      getCityLink(city, window.location.href),
    );
  } catch {
    // The link can still be copied from Settings.
  }
}

async function copyCityLink(city: TimeZoneCity) {
  // The desktop app and a saved file have no address worth sharing.
  const onTheWeb =
    window.location.protocol.startsWith("http") && !("__TAURI__" in window);
  const base = onTheWeb
    ? window.location.origin + window.location.pathname
    : APP_URL;

  try {
    await navigator.clipboard.writeText(getCityLink(city, base));

    return true;
  } catch {
    return false;
  }
}

function notifyArrival(cityLabel: string) {
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("The wait is over", {
        body: `The hour you waited for has come in ${cityLabel}.`,
      });
    }
  } catch {
    // The bell and the dial still announce it.
  }
}

function readStored(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function store(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // The clock still works for this visit when localStorage is unavailable.
  }
}
