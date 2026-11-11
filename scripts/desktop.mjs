// Packages public/index.html as a desktop app with Pake for the current OS.
// Output: release/Bohemian-Day-Clock_<version>_<platform>.<ext>
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, renameSync, statSync } from "node:fs";
import { platform } from "node:os";

const PAKE = "pake-cli@3.18.0";
const { version } = JSON.parse(readFileSync("package.json", "utf8"));

const os = platform();
const perOs = {
  darwin: { icon: "assets/icon.icns", args: ["--hide-title-bar", "--multi-arch", "--targets", "universal"], outputs: { dmg: "macos-universal" } },
  win32: { icon: "assets/icon.ico", args: [], outputs: { msi: "windows-x64" } },
  linux: { icon: "assets/icon.png", args: ["--targets", "deb,appimage"], outputs: { deb: "linux-amd64", AppImage: "linux-x86_64" } },
}[os];

if (!perOs) throw new Error(`Unsupported OS: ${os}`);

const started = Date.now();
execFileSync(
  "npx",
  [
    "-y",
    PAKE,
    "./public",
    "--name",
    "Bohemian Day Clock",
    "--identifier",
    "io.github.carbongo.bohemian-day-clock",
    "--icon",
    perOs.icon,
    "--width",
    "880",
    "--height",
    "900",
    "--app-version",
    version,
    ...perOs.args,
  ],
  { stdio: "inherit", shell: os === "win32" },
);

mkdirSync("release", { recursive: true });
for (const [ext, suffix] of Object.entries(perOs.outputs)) {
  const built = readdirSync(".").find((f) => f.endsWith(`.${ext}`) && statSync(f).mtimeMs >= started);
  if (!built) throw new Error(`Pake produced no .${ext}`);
  const target = `release/Bohemian-Day-Clock_${version}_${suffix}.${ext}`;
  renameSync(built, target);
  console.log(target);
}
