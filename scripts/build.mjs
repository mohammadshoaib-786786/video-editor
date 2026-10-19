#!/usr/bin/env node
// One command from script to MP4:
//
//   node scripts/build.mjs projects/ai-delivery-team            # voice → cues → mix → render
//   node scripts/build.mjs projects/ai-delivery-team --no-voice # keep the current voice/timing
//   node scripts/build.mjs projects/ai-delivery-team --no-render --snap 1,5,9
//   node scripts/build.mjs projects/ai-delivery-team --quality draft
//
// Steps
//   1. setup        link kit/ into the project, copy fonts + GSAP
//   2. voice.py     Kokoro narration + word timings → build/timing.js
//   3. cues.mjs     export the sound-effect cues the composition schedules
//   4. soundtrack   chiptune bed + SFX + voice → build/mix.wav
//   5. render       HyperFrames → renders/<project>.mp4
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { hf, ROOT } from "./lib/env.mjs";

const args = process.argv.slice(2);
const proj = resolve(args.find((a) => !a.startsWith("--")) || ".");
const flag = (name) => args.includes(`--${name}`);
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : dflt;
};
const name = basename(proj);

function run(label, cmd, cmdArgs) {
  const t0 = Date.now();
  console.log(`\n▸ ${label}`);
  const r = spawnSync(cmd, cmdArgs, { stdio: "inherit", cwd: ROOT });
  if (r.status !== 0) {
    console.error(`✗ ${label} failed`);
    process.exit(r.status ?? 1);
  }
  console.log(`  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

mkdirSync(join(proj, "build"), { recursive: true });
run("setup", "node", [join(ROOT, "scripts/setup.mjs")]);
if (!flag("no-voice")) {
  const vargs = [join(ROOT, "scripts/voice.py"), proj];
  if (opt("voice")) vargs.push("--voice", opt("voice"));
  if (opt("speed")) vargs.push("--speed", opt("speed"));
  run("voice", "python3", vargs);
}
run("cues", "node", [join(ROOT, "scripts/cues.mjs"), proj]);
run("soundtrack", "python3", [join(ROOT, "scripts/soundtrack.py"), proj]);

if (opt("snap")) {
  console.log("\n▸ snapshot");
  hf(["snapshot", proj, "--at", opt("snap"), "--no-end", "-o", join(proj, "build", "snaps")]);
}
if (!flag("no-render")) {
  const out = opt("out", join(ROOT, "renders", `${name}.mp4`));
  mkdirSync(join(ROOT, "renders"), { recursive: true });
  console.log("\n▸ render");
  const code = hf(["render", proj, "-o", out, "--quality", opt("quality", "looks")]);
  if (code !== 0) process.exit(code);
  console.log(`\n✓ ${out}`);
}
