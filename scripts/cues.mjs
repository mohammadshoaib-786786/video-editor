#!/usr/bin/env node
// Loads a composition in headless Chromium and exports the sound-effect cues
// its motion helpers registered (window.__reel.cues) to build/cues.json.
//   node scripts/cues.mjs projects/ai-delivery-team
import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";
import { findBrowser } from "./lib/env.mjs";

const proj = resolve(process.argv[2] || ".");
const browser = await puppeteer.launch({
  executablePath: findBrowser(),
  headless: true,
  args: ["--no-sandbox", "--allow-file-access-from-files", "--disable-gpu"],
});
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(pathToFileURL(join(proj, "index.html")).href, { waitUntil: "load" });
  await page.waitForFunction("window.__reel && window.__reel.ready", { timeout: 20000 }).catch(() => {});
  const cues = await page.evaluate(() => (window.__reel ? window.__reel.cues : null));
  if (errors.length) console.error("page errors:\n  " + errors.join("\n  "));
  if (!cues) {
    console.error("composition did not expose window.__reel.cues (did it call R.register()?)");
    process.exit(1);
  }
  writeFileSync(join(proj, "build", "cues.json"), JSON.stringify(cues, null, 1));
  console.log(`cues: ${cues.length} → ${join(proj, "build", "cues.json")}`);
} finally {
  await browser.close();
}
