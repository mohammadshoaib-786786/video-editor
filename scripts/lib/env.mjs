// Locates a Chrome/Chromium headless shell for HyperFrames and puppeteer.
// Order: CHROME_PATH / HYPERFRAMES_BROWSER_PATH env, Playwright installs,
// then HyperFrames' own `browser ensure` download.

import { existsSync, readdirSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const HF_BIN = join(ROOT, "node_modules", ".bin", "hyperframes");

export function findBrowser() {
  for (const key of ["CHROME_PATH", "HYPERFRAMES_BROWSER_PATH", "PRODUCER_HEADLESS_SHELL_PATH"]) {
    if (process.env[key] && existsSync(process.env[key])) return process.env[key];
  }
  const pwRoots = [process.env.PLAYWRIGHT_BROWSERS_PATH, "/opt/pw-browsers", join(process.env.HOME || "", ".cache", "ms-playwright")].filter(Boolean);
  for (const root of pwRoots) {
    if (!existsSync(root)) continue;
    for (const d of readdirSync(root).sort().reverse()) {
      for (const rel of ["chrome-linux/headless_shell", "chrome-headless-shell-linux64/chrome-headless-shell", "chrome-linux/chrome"]) {
        const p = join(root, d, rel);
        if (d.startsWith("chromium") && existsSync(p)) return p;
      }
    }
  }
  try {
    const out = execFileSync(HF_BIN, ["browser", "path"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim().split("\n").pop();
    if (out && existsSync(out)) return out;
  } catch {
    // fall through
  }
  return null;
}

export function hfEnv() {
  const env = { ...process.env, HYPERFRAMES_NO_TELEMETRY: "1", DO_NOT_TRACK: "1" };
  const browser = findBrowser();
  if (browser) {
    env.HYPERFRAMES_BROWSER_PATH = browser;
    env.PRODUCER_HEADLESS_SHELL_PATH = browser;
  }
  return env;
}

// Run the HyperFrames CLI with the resolved browser. Returns the exit code.
export function hf(args, opts = {}) {
  const res = spawnSync(HF_BIN, args, { stdio: "inherit", env: hfEnv(), cwd: opts.cwd || ROOT });
  return res.status ?? 1;
}
