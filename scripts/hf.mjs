#!/usr/bin/env node
// Pass-through to the HyperFrames CLI with the local headless browser wired in.
//   node scripts/hf.mjs snapshot projects/ai-delivery-team --at 2,5,9
//   node scripts/hf.mjs lint projects/ai-delivery-team
import { hf } from "./lib/env.mjs";

process.exit(hf(process.argv.slice(2)));
