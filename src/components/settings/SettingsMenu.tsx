import { useId, useState } from "react";

import type { TimeZoneCity } from "../../domain/timeZones";
import { ParchmentPanel, Rule } from "../ui/ParchmentPanel";

interface SettingsMenuProps {
  cities: TimeZoneCity[];
  id: string;
  /** True in the desktop app, where the window can be kept on top. */
  isDesktop: boolean;
  selectedTimeZone: string;
  onCityChange: (timeZone: string) => void;
  onCopyLink: () => Promise<boolean>;
}

const labelClassName = "text-sm tracking-[0.14em] text-ink/70 uppercase";
const buttonClassName =
  "w-full cursor-pointer rounded-xs border border-[#4a3212] bg-[#4a3212]/10 px-3 py-1.5 text-base transition hover:bg-[#4a3212]/20 focus-visible:outline-2 focus-visible:outline-rubric";

export function SettingsMenu({
  cities,
  id,
  isDesktop,
  selectedTimeZone,
  onCityChange,
  onCopyLink,
}: SettingsMenuProps) {
  const [filter, setFilter] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const filterId = useId();
  const wanted = filter.trim().toLowerCase();
  const shownCities = cities.filter((city) =>
    city.label.toLowerCase().includes(wanted),
  );

  async function handleCopy() {
    setCopyState((await onCopyLink()) ? "copied" : "failed");
    window.setTimeout(() => setCopyState("idle"), 2000);
  }

  return (
    <ParchmentPanel id={id} title="Settings">
      <label className={labelClassName} htmlFor={filterId}>
        City
      </label>
      <input
        id={filterId}
        className="mt-1 w-full border-b border-[#4a3212]/60 bg-transparent px-1 py-1 text-lg outline-none placeholder:text-ink/45 focus:border-rubric"
        type="search"
        placeholder="Seek a city…"
        autoComplete="off"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
      />
      <ul
        className="ink-scroll mt-2 max-h-[min(15rem,34vh)] overflow-y-auto pr-1"
        aria-label="Cities"
      >
        {shownCities.map((city) => {
          const selected = city.timeZone === selectedTimeZone;

          return (
            <li key={city.timeZone}>
              <button
                type="button"
                className={`flex w-full cursor-pointer items-center gap-2 rounded-xs px-1 py-0.5 text-left text-lg transition hover:bg-[#4a3212]/12 focus-visible:outline-2 focus-visible:outline-rubric ${selected ? "font-bold text-rubric" : ""}`}
                aria-current={selected ? "true" : undefined}
                onClick={() => onCityChange(city.timeZone)}
              >
                <svg className="h-2.5 w-2.5 shrink-0" viewBox="0 0 10 10">
                  <path
                    d="M5 0l5 5-5 5-5-5z"
                    fill={selected ? "#8a1c12" : "none"}
                    stroke={selected ? "#8a1c12" : "#4a3212"}
                    strokeOpacity={selected ? 1 : 0.5}
                  />
                </svg>
                {city.label}
              </button>
            </li>
          );
        })}
        {shownCities.length === 0 ? (
          <li className="px-1 py-1 text-ink/60">
            No such city in the register.
          </li>
        ) : null}
      </ul>
      <Rule />
      <button type="button" className={buttonClassName} onClick={handleCopy}>
        {copyState === "copied"
          ? "Link copied"
          : copyState === "failed"
            ? "Could not copy the link"
            : "Copy a link to this city"}
      </button>
      {isDesktop ? (
        <p className="mt-3 text-center text-sm leading-5 text-ink/75">
          To keep the widget above other windows, choose Window, then Toggle
          Always on Top.
        </p>
      ) : null}
    </ParchmentPanel>
  );
}
