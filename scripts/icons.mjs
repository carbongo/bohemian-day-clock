// Renders every icon from assets/icon.svg. Needs rsvg-convert; the .icns also needs macOS iconutil.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const mark = readFileSync("assets/icon.svg", "utf8").replace(
  /^<svg[^>]*>|<\/svg>\s*$/g,
  "",
);
const tmp = mkdtempSync(join(tmpdir(), "icons-"));

/** The mark at `share` of a square canvas, over an optional background shape. */
function compose(background, share) {
  const offset = (512 * (1 - share)) / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${background}<g transform="translate(${offset} ${offset}) scale(${share})">${mark}</g></svg>`;
}

function render(svg, size, file) {
  const source = join(tmp, "source.svg");

  writeFileSync(source, svg);
  execFileSync("rsvg-convert", [
    "-w",
    String(size),
    "-h",
    String(size),
    "-o",
    file,
    source,
  ]);

  return file;
}

const NIGHT = `<linearGradient id="n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2540"/><stop offset="1" stop-color="#090b12"/></linearGradient>`;
const plain = compose("", 1);
const fullBleed = (share) =>
  compose(`${NIGHT}<rect width="512" height="512" fill="url(#n)"/>`, share);
// macOS app icons sit in a rounded square that leaves a margin on the canvas.
const appIcon = compose(
  `${NIGHT}<rect x="50" y="50" width="412" height="412" rx="92" fill="url(#n)"/>`,
  0.62,
);

mkdirSync("static", { recursive: true });
render(plain, 192, "static/icon-192.png");
render(plain, 512, "static/icon-512.png");
render(fullBleed(0.66), 512, "static/icon-maskable-512.png");
render(fullBleed(0.82), 180, "static/apple-touch-icon.png");
render(appIcon, 1024, "assets/icon.png");

// .ico: PNG images behind a directory, one entry per size.
const icoSizes = [16, 32, 48, 256];
const pngs = icoSizes.map((size) =>
  readFileSync(render(plain, size, join(tmp, `${size}.png`))),
);
const header = Buffer.alloc(6 + 16 * pngs.length);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(pngs.length, 4);
let offset = header.length;
pngs.forEach((png, index) => {
  const entry = 6 + 16 * index;
  header.writeUInt8(icoSizes[index] % 256, entry);
  header.writeUInt8(icoSizes[index] % 256, entry + 1);
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(png.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += png.length;
});
writeFileSync("assets/icon.ico", Buffer.concat([header, ...pngs]));

if (process.platform === "darwin") {
  const iconset = join(tmp, "icon.iconset");

  mkdirSync(iconset);
  for (const size of [16, 32, 128, 256, 512]) {
    render(appIcon, size, join(iconset, `icon_${size}x${size}.png`));
    render(appIcon, size * 2, join(iconset, `icon_${size}x${size}@2x.png`));
  }
  execFileSync("iconutil", ["-c", "icns", iconset, "-o", "assets/icon.icns"]);
}
