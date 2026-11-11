# Desktop app and releases

- [Pake](https://github.com/tw93/pake) (Tauri 2, system webview) wraps `public/index.html`; version pinned in `scripts/desktop.mjs`.
- `npm run desktop` builds the web file, then packages for the current OS into `release/`. Needs Rust; macOS universal also needs `rustup target add x86_64-apple-darwin aarch64-apple-darwin`.

| OS      | Package                                        | Icon               |
| ------- | ---------------------------------------------- | ------------------ |
| macOS   | `…_macos-universal.dmg` (ad-hoc signed)        | `assets/icon.icns` |
| Windows | `…_windows-x64.msi`                            | `assets/icon.ico`  |
| Linux   | `…_linux-amd64.deb`, `…_linux-x86_64.AppImage` | `assets/icon.png`  |

- Icons and `assets/social-preview.png` are renders of the dial itself (headless Chrome, round mask).

## Release

1. Bump `version` in `package.json`, commit, push `master`.
2. `git tag v<version> && git push origin v<version>`: `.github/workflows/release.yml` builds all three OSes and publishes a GitHub Release with the packages, the single-file `…_web.html` and `SHA256SUMS.txt`.
3. Homebrew: in `carbongo/homebrew-tap`, set `version` and `sha256` (from `SHA256SUMS.txt`, the `.dmg` line) in `Casks/bohemian-day-clock.rb`; push `main`.

- The web build deploys to Vercel (`bohemian-day-clock.vercel.app`) from `master`.
- macOS builds are not notarised (no Developer ID): the cask clears quarantine; a direct `.dmg` download needs System Settings → Privacy & Security → Open Anyway after the first launch.
