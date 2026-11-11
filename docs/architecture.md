# Architecture

Client-only app: React 19, TypeScript (strict), Tailwind CSS 4 via PostCSS, Parcel 2. Timezones through `Intl.DateTimeFormat`.

## Runtime flow

1. `src/index.html` loads `src/main.tsx`, which renders `App`.
2. `App` keeps the selected city (`localStorage` key `bohemian-day-clock.selectedTimeZone`) and renders `Clock`, `SettingsMenu` and the GitHub action.
3. `Clock` ticks once per second (`useNow`) and derives `ClockTime` (`domain/time.ts`) and a `SunWindow` (`domain/sun.ts`).
4. Overlays draw in the shared 1200 × 1200 SVG space (`clock/lib/clockGeometry.ts`); the overlay group rotates once per day over the fixed face and pointer.

## Modules

| Path                        | Holds                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------- |
| `src/domain/time.ts`        | clock time, labels, rotation, minute normalisation                                                      |
| `src/domain/sun.ts`         | sunrise/sunset (NOAA official zenith); normal, polar-day or polar-night window                          |
| `src/domain/timeZones.ts`   | IANA timezone → representative city and coordinates; Kutna Hora fallback                                |
| `src/components/clock/`     | `Clock` plus one file per overlay: face, pointer, plaster ring, night, sun arc, markers, hours, readout |
| `src/components/clock/lib/` | `clockGeometry.ts` (polar math, rings, arcs), `clockSvgDefs.tsx` (`ClockSvg`, clip paths, filters)      |
| `src/components/actions/`   | floating action group, button, shortcut key, menu panel: one component per file                         |
| `src/components/settings/`  | `SettingsMenu`: city picker and `S` shortcut                                                            |
| `scripts/inline-output.mjs` | inlines Parcel's CSS and JS into `public/index.html`, deletes sibling assets                            |
| `scripts/desktop.mjs`       | Pake packaging ([desktop](desktop.md))                                                                  |

## Constraints

- `src/domain/` imports no React or DOM.
- Shared drawing math goes in `clockGeometry.ts`, shared SVG defs in `clockSvgDefs.tsx`; overlays never import each other.
- Reusable action UI: one component per file in `src/components/actions/`.
- The build stays one self-contained HTML file: visuals are SVG components, no external assets.
