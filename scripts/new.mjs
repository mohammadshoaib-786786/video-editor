#!/usr/bin/env node
// Start a new project from one of the samples.
//   node scripts/new.mjs reel my-topic        # copies projects/ai-delivery-team
//   node scripts/new.mjs carousel my-topic    # copies projects/ai-meta-ads-team
import { cpSync, existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT } from "./lib/env.mjs";

const [kind, name] = process.argv.slice(2);
const templates = { reel: "ai-delivery-team", carousel: "ai-meta-ads-team" };
if (!templates[kind] || !name || !/^[a-z0-9-]+$/.test(name)) {
  console.error("usage: node scripts/new.mjs <reel|carousel> <name-in-kebab-case>");
  process.exit(1);
}
const from = join(ROOT, "projects", templates[kind]);
const to = join(ROOT, "projects", name);
if (existsSync(to)) {
  console.error(`projects/${name} already exists`);
  process.exit(1);
}
cpSync(from, to, {
  recursive: true,
  filter: (src) => !/[\\/](kit|build|\.hyperframes)$/.test(src),
});
spawnSync("node", [join(ROOT, "scripts", "setup.mjs")], { stdio: "inherit" });
console.log(`created projects/${name} from projects/${templates[kind]}`);
console.log(kind === "reel" ? "next: edit script.json, index.html, scenes.js → node scripts/build.mjs projects/" + name : "next: edit slides.js → node scripts/carousel.mjs projects/" + name);
