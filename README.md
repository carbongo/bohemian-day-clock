<p align="center">
  <img src="assets/icon.png" width="128" alt="Bohemian Day Clock icon">
</p>

<h1 align="center">Bohemian Day Clock</h1>

<p align="center">
  Your whole day on one turning dial: daylight, night, sunrise and sunset for your city.
</p>

<p align="center">
  <a href="https://bohemian-day-clock.vercel.app"><b>Open in your browser</b></a> ·
  <a href="https://github.com/carbongo/bohemian-day-clock/releases/latest"><b>Download for macOS</b></a> ·
  <a href="#install"><b>Homebrew</b></a>
</p>

<p align="center">
  <a href="https://github.com/carbongo/bohemian-day-clock/releases/latest"><img alt="Latest release" src="https://img.shields.io/github/v/release/carbongo/bohemian-day-clock?color=b8963e"></a>
  <a href="https://github.com/carbongo/bohemian-day-clock/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/carbongo/bohemian-day-clock/actions/workflows/ci.yml/badge.svg"></a>
  <a href="LICENSE"><img alt="ISC licence" src="https://img.shields.io/github/license/carbongo/bohemian-day-clock?color=b8963e"></a>
</p>

![Bohemian Day Clock](screenshot.webp)

## Why

A normal clock tells you the time. This one shows where you are in the day: how much light is left, when the sun went up, when it goes down. The ring turns once every 24 hours under a fixed pointer, like an old astronomical clock.

## Features

- **24-hour dial** that turns once a day under a fixed pointer.
- **Real daylight** for the chosen city: sunrise and sunset are calculated, not looked up, and the ring paints day and night to match. Polar day and polar night included.
- **The real moon**: tonight's phase is drawn on the dial, lit from the correct side for your hemisphere.
- **Wait until**: press `T` or click an hour on the ring, and the dial gilds the stretch from now to then. A bell and a notification tell you when the hour has come.
- **The day as a charter would date it**: "Thursday after St Martin", the eve or the feast itself, with the hour of prayer in force, on hours that stretch in summer and shrink in winter.
- **Your city by default**, picked from your timezone; choose another in Settings (`S`). The choice is remembered, and every city has a link you can share: `?city=kutna-hora`.
- **Widget**: press `W`, or make the window small, and only the dial and the time remain.
- **Hand-drawn in SVG**: every ring, crack, star and glow is code, so it is sharp at any size.
- **Works offline**: one self-contained HTML file, no server, no tracking. The website also installs as an app on a phone or a desktop.
- **Desktop app** for macOS (universal), around 12 MB; Windows and Linux build from source.

## Install

| Platform       | How                                                                                                                                                   |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Browser        | [bohemian-day-clock.vercel.app](https://bohemian-day-clock.vercel.app), or download `…_web.html` from a release and open it.                          |
| macOS          | `brew install --cask carbongo/tap/bohemian-day-clock`, or the `.dmg` from [Releases](https://github.com/carbongo/bohemian-day-clock/releases/latest). |
| Windows, Linux | `npm run desktop` ([build from source](#build-from-source)).                                                                                          |

The macOS app is not notarised. Homebrew handles that; with the `.dmg`, open the app once, then allow it in System Settings → Privacy & Security → **Open Anyway**.

## Keyboard

| Key     | Action                                               |
| ------- | ---------------------------------------------------- |
| `T`     | Wait: choose how long, or stop a wait                |
| `↑` `↓` | While choosing: an hour more or less                 |
| `→` `←` | While choosing: five minutes more or less            |
| `Enter` | Start the wait, or dismiss it when the hour has come |
| `Esc`   | Back                                                 |
| `S`     | Settings                                             |
| `W`     | Widget                                               |
| `G`     | GitHub page                                          |

In the desktop app, Window → Toggle Always on Top keeps the widget above other windows.

## Build from source

Needs Node.js 22+.

```sh
npm install
npm run start       # dev server on http://localhost:8000
npm run build       # public/index.html, one self-contained file
npm run desktop     # desktop app for this OS (needs Rust), into release/
npm run icons       # every icon, from assets/icon.svg (needs rsvg-convert)
```

How it is put together: [docs/architecture.md](docs/architecture.md). Packaging and releases: [docs/desktop.md](docs/desktop.md).

## Contributing

Issues and pull requests are welcome. Keep changes focused, keep the build a single file, and run `npm run typecheck` and `npm run build` before opening a PR.

## Disclaimer

An unofficial fan project, loosely inspired by the medieval clock in Kingdom Come: Deliverance. All artwork is original React/SVG; it contains no game assets, logos, fonts or screenshots. Not affiliated with or endorsed by Warhorse Studios; Kingdom Come: Deliverance and Warhorse Studios are trademarks of their respective owners.

## Licence

[ISC](LICENSE) © Georgii Antipin

The typeface is a subset of [Almendra](https://fonts.google.com/specimen/Almendra) by Ana Sanfelippo, under the [SIL Open Font License](src/assets/fonts/OFL.txt).
