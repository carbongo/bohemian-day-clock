# Architecture

Client-only app: React 19, TypeScript (strict), Tailwind CSS 4 via PostCSS, Parcel 2. Timezones through `Intl.DateTimeFormat`.

## Runtime flow

1. `src/index.html` loads `src/main.tsx`, which renders `App` and registers `sw.js` when the page is served over HTTPS.
2. `App` ticks once per second (`useNow`) and owns the city, the wait (`useWait`), Settings and widget mode; it renders `Clock` and the key prompts.
3. `Clock` derives `ClockTime`, the `SunWindow`, the moon phase, the feast-day label and the canonical hour from `src/domain/`.
4. Overlays draw in the shared 1200 × 1200 SVG space (`clock/lib/clockGeometry.ts`); the overlay group rotates once per day over the fixed face and pointer.

## State

| What        | Where                                                                                                           |
| ----------- | --------------------------------------------------------------------------------------------------------------- |
| City        | `?city=<slug or IANA zone>`, else `localStorage` `bohemian-day-clock.selectedTimeZone`, else the local timezone |
| Wait        | `localStorage` `bohemian-day-clock.waitUntil` (epoch ms); 5 minutes to 24 hours                                 |
| Widget mode | `localStorage` `bohemian-day-clock.widget`; forced under a 380 px window side                                   |

## Modules

| Path                           | Holds                                                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `src/domain/time.ts`           | clock time, zoned date, labels, rotation, minute normalisation                                                           |
| `src/domain/sun.ts`            | sunrise/sunset (NOAA official zenith); normal, polar-day or polar-night window                                           |
| `src/domain/moon.ts`           | moon phase and lit share, from the mean synodic month                                                                    |
| `src/domain/feasts.ts`         | fixed feasts and those that move with Easter; the day named by the nearest one                                           |
| `src/domain/canonicalHours.ts` | hour of prayer on unequal hours                                                                                          |
| `src/domain/timeZones.ts`      | IANA timezone → representative city and coordinates; city slugs; Kutna Hora fallback                                     |
| `src/hooks/useWait.ts`         | the wait: choosing, waiting, arrived; rings `src/app/bell.ts` (Web Audio, no sound file)                                 |
| `src/components/clock/`        | `Clock` plus one file per overlay: face, pointer, plaster ring, night, sun arc, markers, track, hours, hit area, readout |
| `src/components/clock/lib/`    | `clockGeometry.ts` (polar math, rings, arcs), `clockSvgDefs.tsx` (`ClockSvg`, clip paths, filters)                       |
| `src/components/actions/`      | key prompt and keycap: one component per file                                                                            |
| `src/components/settings/`     | `SettingsMenu`: city list and link                                                                                       |
| `src/components/ui/`           | `ParchmentPanel`                                                                                                         |
| `src/styles/tailwind.css`      | embedded typeface, theme colours, `parchment` and `gilt-text` utilities, `--u` (1% of the dial)                          |
| `src/assets/fonts/`            | subset `.woff2` files of Almendra, renamed "Dial Text", with `OFL.txt`                                                   |
| `static/`                      | `manifest.webmanifest`, `sw.js` and icons, copied beside the built page                                                  |
| `scripts/inline-output.mjs`    | inlines Parcel's CSS and JS into `public/index.html`, adds the favicon and links, copies `static/`                       |
| `scripts/icons.mjs`            | every icon from `assets/icon.svg` (`npm run icons`)                                                                      |
| `scripts/desktop.mjs`          | Pake packaging ([desktop](desktop.md))                                                                                   |

## Constraints

- `src/domain/` imports no React or DOM.
- Shared drawing math goes in `clockGeometry.ts`, shared SVG defs in `clockSvgDefs.tsx`; overlays never import each other.
- Reusable action UI: one component per file in `src/components/actions/`.
- `public/index.html` works alone, with no other file and no network: visuals are SVG components, textures are SVG filters, fonts are inlined. `static/` only adds installing as an app.
- Dial text sizes are multiples of `--u`.
