#!/usr/bin/env node
// Copies runtime vendor files (GSAP, fonts) into kit/vendor and links the
// shared kit into every project. HyperFrames only serves files that live
// inside the project folder, so each project gets a `kit` symlink.
//
//   node scripts/setup.mjs            # vendor files + link every project
//   node scripts/setup.mjs --copy     # copy the kit instead of symlinking

import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const NM = join(ROOT, "node_modules");
const VENDOR = join(ROOT, "kit", "vendor");
const copyMode = process.argv.includes("--copy");

const files = [
  ["gsap/dist/gsap.min.js", "gsap.min.js"],
  ["@fontsource-variable/inter/files/inter-latin-wght-normal.woff2", "fonts/inter-latin-wght-normal.woff2"],
  ["@fontsource/archivo-black/files/archivo-black-latin-400-normal.woff2", "fonts/archivo-black-latin-400-normal.woff2"],
  ["@fontsource/nunito/files/nunito-latin-800-normal.woff2", "fonts/nunito-latin-800-normal.woff2"],
  ["@fontsource/nunito/files/nunito-latin-900-normal.woff2", "fonts/nunito-latin-900-normal.woff2"],
  ["@fontsource/caveat/files/caveat-latin-700-normal.woff2", "fonts/caveat-latin-700-normal.woff2"],
  ...[400, 500, 700, 800].map((w) => [
    `@fontsource/jetbrains-mono/files/jetbrains-mono-latin-${w}-normal.woff2`,
    `fonts/jetbrains-mono-latin-${w}-normal.woff2`,
  ]),
  ...[500, 600, 700, 800].map((w) => [`@fontsource/inter-tight/files/inter-tight-latin-${w}-normal.woff2`, `fonts/inter-tight-latin-${w}-normal.woff2`]),
  ...[400, 500, 600, 700].map((w) => [`@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-${w}-normal.woff2`, `fonts/ibm-plex-mono-latin-${w}-normal.woff2`]),
];

mkdirSync(join(VENDOR, "fonts"), { recursive: true });
for (const [src, dest] of files) {
  const from = join(NM, src);
  if (!existsSync(from)) {
    console.error(`missing ${src} — run npm install first`);
    process.exit(1);
  }
  cpSync(from, join(VENDOR, dest));
}

// Simplified Chinese (Noto Sans SC 500 body, 700 headlines): fontsource splits
// it into unicode-range chunks; copy them all with a rewritten stylesheet and
// the browser loads only the chunks a page actually uses.
const scDir = join(NM, "@fontsource/noto-sans-sc");
if (existsSync(scDir)) {
  mkdirSync(join(VENDOR, "fonts", "noto-sc"), { recursive: true });
  for (const weight of [500, 700]) {
    const css = readFileSync(join(scDir, `${weight}.css`), "utf8").replace(/url\(\.\/files\/([^)]+)\)/g, (_, f) => {
      if (f.endsWith(".woff2")) cpSync(join(scDir, "files", f), join(VENDOR, "fonts", "noto-sc", f));
      return `url(noto-sc/${f})`;
    });
    writeFileSync(join(VENDOR, "fonts", `noto-sans-sc-${weight}.css`), css.replace(/,\s*url\(noto-sc\/[^)]+\.woff\) format\('woff'\)/g, ""));
  }
}

const projectsDir = join(ROOT, "projects");
for (const name of existsSync(projectsDir) ? readdirSync(projectsDir) : []) {
  const dir = join(projectsDir, name);
  if (!lstatSync(dir).isDirectory()) continue;
  if (!existsSync(join(dir, "index.html")) && !existsSync(join(dir, "slides"))) continue;
  const link = join(dir, "kit");
  if (existsSync(link) || isSymlink(link)) rmSync(link, { recursive: true, force: true });
  if (copyMode) cpSync(join(ROOT, "kit"), link, { recursive: true, dereference: true });
  else symlinkSync(relative(dir, join(ROOT, "kit")), link);
  // Slide decks keep one composition per folder; each needs the kit too.
  const slides = join(dir, "slides");
  if (existsSync(slides)) {
    for (const s of readdirSync(slides)) {
      const sd = join(slides, s);
      if (!lstatSync(sd).isDirectory()) continue;
      const sl = join(sd, "kit");
      if (existsSync(sl) || isSymlink(sl)) rmSync(sl, { recursive: true, force: true });
      if (copyMode) cpSync(join(ROOT, "kit"), sl, { recursive: true, dereference: true });
      else symlinkSync(relative(sd, join(ROOT, "kit")), sl);
    }
  }
}
console.log(`kit ready (${copyMode ? "copied" : "linked"})`);

function isSymlink(p) {
  try {
    return lstatSync(p).isSymbolicLink();
  } catch {
    return false;
  }
}
