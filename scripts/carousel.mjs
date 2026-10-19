#!/usr/bin/env node
// Exports every slide of a carousel project as a PNG still and an animated MP4.
//
//   node scripts/carousel.mjs projects/ai-meta-ads-team            # PNG + MP4
//   node scripts/carousel.mjs projects/ai-meta-ads-team --png      # stills only
//   node scripts/carousel.mjs projects/ai-meta-ads-team --slides 1,2 --at 5.5
//
// The project is one HyperFrames composition (index.html) with a `slide`
// variable; slides.js holds the content (window.DECK.slides).
import { mkdirSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import vm from "node:vm";
import puppeteer from "puppeteer-core";
import { findBrowser, hf, ROOT } from "./lib/env.mjs";

const args = process.argv.slice(2);
const proj = resolve(args.find((a) => !a.startsWith("--")) || ".");
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : dflt;
};
const pngOnly = args.includes("--png");
const at = +opt("at", 5.6);
const outDir = opt("out", join(ROOT, "renders", basename(proj)));
mkdirSync(outDir, { recursive: true });

const ctx = { window: {} };
vm.runInNewContext(readFileSync(join(proj, "slides.js"), "utf8"), ctx);
const total = ctx.window.DECK.slides.length;
const pick = opt("slides") ? opt("slides").split(",").map(Number) : Array.from({ length: total }, (_, i) => i + 1);
const pad = (n) => String(n).padStart(2, "0");

// ---- PNG stills (seek the timeline to `at`, screenshot) ----
const browser = await puppeteer.launch({
  executablePath: findBrowser(),
  headless: true,
  args: ["--no-sandbox", "--allow-file-access-from-files", "--font-render-hinting=none"],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const n of pick) {
    await page.goto(`${pathToFileURL(join(proj, "index.html")).href}?slide=${n}`, { waitUntil: "load" });
    await page.waitForFunction("window.__reel && window.__reel.ready", { timeout: 20000 });
    await page.evaluate((t) => {
      window.__reel.timeline.seek(t, false);
    }, at);
    const file = join(outDir, `slide-${pad(n)}.png`);
    await page.screenshot({ path: file, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
    console.log(`png  ${file}`);
  }
  if (errors.length) console.error("page errors:\n  " + errors.join("\n  "));
} finally {
  await browser.close();
}

// ---- animated MP4 per slide (HyperFrames, `slide` variable) ----
if (!pngOnly) {
  for (const n of pick) {
    const file = join(outDir, `slide-${pad(n)}.mp4`);
    const code = hf(["render", proj, "-o", file, "--variables", JSON.stringify({ slide: n }), "--quality", opt("quality", "looks"), "--quiet"]);
    if (code !== 0) process.exit(code);
    console.log(`mp4  ${file}`);
  }
}
