# AGENTS.md

Bohemian Day Clock: a custom-drawn 24-hour daylight clock. React + TypeScript + Tailwind + Parcel, built to one self-contained `public/index.html`, packaged for desktop with Pake. Public repo, ISC.

## Start

- `npm install`, `npm run start` (Parcel on :8000).
- `npm run typecheck` after code changes; `npm run build` after build, asset or packaging changes. CI runs both.
- `npm run desktop`: desktop package for the current OS ([desktop](docs/desktop.md)).
- Never commit `public/`, `dist/`, `release/`, `.parcel-cache/`, `node_modules/`.
- No third-party game assets, logos, fonts, screenshots or names in the app; all art is drawn here.

## Docs

| Doc                                  | Covers                                                  |
| ------------------------------------ | ------------------------------------------------------- |
| [architecture](docs/architecture.md) | Runtime flow, module map, code constraints.             |
| [desktop](docs/desktop.md)           | Pake packaging, icons, release workflow, Homebrew cask. |
