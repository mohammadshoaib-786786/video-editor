#!/usr/bin/env node
// Exports every slide of a carousel project as a PNG still and an animated MP4.
//
//   node scripts/carousel.mjs projects/ai-meta-ads-team            # PNG + MP4
//   node scripts/carousel.mjs projects/ai-meta-ads-team --png      # stills only
//   node scripts/carousel.mjs projects/ai-meta-ads-team --slides 1,2 --at 5.5
//   node scripts/carousel.mjs projects/geoneo-hk-mortgage --png --pdf   # LinkedIn document
//
// The project is one HyperFrames composition (index.html) with a `slide`
// variable; slides.js holds the content (window.DECK.slides).
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
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
const wantPdf = args.includes("--pdf");
const at = +opt("at", 5.6);
const outDir = opt("out", join(ROOT, "renders", basename(proj)));
mkdirSync(outDir, { recursive: true });

const ctx = { window: {} };
vm.runInNewContext(readFileSync(join(proj, "slides.js"), "utf8"), ctx);
const total = ctx.window.DECK.slides.length;
const pick = opt("slides") ? opt("slides").split(",").map(Number) : Array.from({ length: total }, (_, i) => i + 1);
const pad = (n) => String(n).padStart(2, "0");
// frame size from the composition root (1080×1350 carousels, 1080×1440 RedNote covers)
const html = readFileSync(join(proj, "index.html"), "utf8");
const W = +(html.match(/id="root"[^>]*data-width="(\d+)"/) || [])[1] || 1080;
const H = +(html.match(/id="root"[^>]*data-height="(\d+)"/) || [])[1] || 1350;

// ---- PNG stills (seek the timeline to `at`, screenshot) ----
const browser = await puppeteer.launch({
  executablePath: findBrowser(),
  headless: true,
  args: ["--no-sandbox", "--allow-file-access-from-files", "--font-render-hinting=none"],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const n of pick) {
    await page.goto(`${pathToFileURL(join(proj, "index.html")).href}?slide=${n}`, { waitUntil: "load" });
    await page.waitForFunction("window.__reel && window.__reel.ready", { timeout: 20000 });
    await page.evaluate((t) => {
      window.__reel.timeline.seek(t, false);
    }, at);
    const file = join(outDir, `slide-${pad(n)}.png`);
    await page.screenshot({ path: file, clip: { x: 0, y: 0, width: W, height: H } });
    console.log(`png  ${file}`);
    if (wantPdf) {
      // vector page, same pixels: text stays sharp when LinkedIn readers zoom
      await page.pdf({ path: join(outDir, `.page-${pad(n)}.pdf`), width: `${W}px`, height: `${H}px`, printBackground: true, pageRanges: "1" });
    }
  }
  if (errors.length) console.error("page errors:\n  " + errors.join("\n  "));
} finally {
  await browser.close();
}

// ---- one PDF for LinkedIn's document post ----
if (wantPdf) {
  const pages = pick.map((n) => join(outDir, `.page-${pad(n)}.pdf`));
  const out = join(outDir, `${basename(proj)}.pdf`);
  const py = "import sys\nfrom pypdf import PdfWriter\nw = PdfWriter()\nfor p in sys.argv[2:]:\n    w.append(p)\nw.write(sys.argv[1])\n";
  const r = spawnSync("python3", ["-c", py, out, ...pages], { stdio: "inherit" });
  pages.forEach((p) => rmSync(p, { force: true }));
  if (r.status !== 0) process.exit(r.status ?? 1);
  console.log(`pdf  ${out}`);
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
