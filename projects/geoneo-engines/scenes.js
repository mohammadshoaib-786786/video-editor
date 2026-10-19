// Choreography for "The engine changes" (Geoneo, LinkedIn 4:5).
// Beats are pinned to the voiceover with R.at(scene, line) / R.word(...).
window.buildReel = function () {
  const T = window.TIMING;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const css = getComputedStyle(document.documentElement);
  const C = { teal: css.getPropertyValue("--geo-teal").trim(), blue: css.getPropertyValue("--geo-blue").trim(), grey: css.getPropertyValue("--geo-grey").trim() };

  // the engines, each with the headline that announced it (wry, not literal)
  const ENGINES = [
    ["ChatGPT", "teal", "“kills search”"],
    ["Perplexity", "blue", "“kills SEO”"],
    ["AI Overviews", "grey", "“kills the click”"],
    ["Gemini", "teal", "“kills the website”"],
    ["Copilot", "blue", "“kills the browser”"],
    ["DeepSeek", "grey", "“kills the moat”"],
    ["Qwen", "teal", "“kills the stack”"],
    ["Kimi", "blue", "“kills everything”"],
  ];
  const bot = (i, px = 5) => `<span class="robot">${Sprites.robot(C[ENGINES[i][1]], { variant: "flat", px })}</span>`;

  // ---------------------------------------------------------------- build DOM
  $("#p-grid").innerHTML =
    ENGINES.map(([name, , tag], i) => `<div class="geo-card eng" style="position:relative">${bot(i)}<b>${name}</b><span>${tag}</span></div>`).join("") +
    `<div class="geo-card eng is-next" style="position:relative"><span class="q">?</span><b>Next month</b><span>“kills this list”</span></div>`;

  const roll = [...ENGINES, ...ENGINES.slice(0, 4)];
  $("#t-roll").innerHTML = roll.map(([name], i) => `<div>${bot(i % ENGINES.length, 6)}${name}</div>`).join("");

  $$("[data-engine]").forEach((el) => (el.outerHTML = bot(+el.dataset.engine, 3)));

  // job: engines above and below the facts card, wired to it
  const chipX = [64, 308, 552, 796];
  let chips = "";
  let wires = "";
  ENGINES.forEach(([name], i) => {
    const top = i < 4;
    const x = chipX[i % 4];
    const y = top ? 300 : 930;
    chips += `<div class="geo-card echip" style="left:${x}px;top:${y}px">${bot(i, 3)}${name}<span class="tick"><i data-icon="check" data-stroke="3.4"></i></span></div>`;
    const cx = x + 110;
    const tx = 380 + (i % 4) * 107;
    wires += top
      ? `<path d="M${cx} 366 C ${cx} 400, ${tx} 392, ${tx} 420"/>`
      : `<path d="M${cx} 930 C ${cx} 896, ${tx} 888, ${tx} 860"/>`;
  });
  $("#j-chips").innerHTML = chips;
  $("#j-lines").innerHTML = wires;
  $("#j-facts").style.top = "420px";
  $("#j-facts").style.height = "440px";

  $("#a-chips").innerHTML = ENGINES.map(([name], i) => `<span class="geo-chip">${bot(i, 3)}${name}</span>`).join("");
  $$("[data-logo]").forEach((el) => (el.innerHTML = window.GEONEO_LOGO));

  Sprites.hydrate(document);

  // ---------------------------------------------------------------- motion
  const R = Reel.create({ timing: T });
  const tl = R.tl;
  const S = (id) => R.scene(id);
  const scenes = ["#s-hook", "#s-parade", "#s-turn", "#s-const", "#s-change", "#s-job", "#s-ask"].map($);
  R.cuts(scenes, null, { style: "soft", gain: 0.3 });
  tl.fromTo("#progress", { scaleX: 0 }, { scaleX: 1, duration: T.total, ease: "none", immediateRender: true }, 0);

  // kickers and titles settle in with each cut
  scenes.slice(1).forEach((el, i) => {
    const t = T.scenes[i + 1].start;
    const k = el.querySelector(".kick");
    if (k) R.rise(k, t, { y: 16, dur: 0.35 });
  });

  // ---- 1 · hook -----------------------------------------------------------
  {
    const s = S("hook");
    const tk = R.word("hook", 1, 0);
    tl.fromTo("#h-title em", { scale: 1 }, { scale: 1.08, duration: 0.14, yoyo: true, repeat: 1, ease: "sine.inOut", transformOrigin: "50% 60%" }, tk);
    R.slam("#h-rip", tk + 0.02, { rot: -10, from: 2.2, gain: 0.55 });
    tl.fromTo("#h-book", { rotation: 0 }, { rotation: -2.5, duration: 0.3, ease: "back.out(3)" }, tk + 0.34);
    R.pop("#h-alleged", R.at("hook", 2) - 0.1, { from: 0.6, rot: -6, sfx: false });
    R.bob("#h-host", 0, s.end, { amp: 7, period: 0.9 });
    R.blink("#h-host .p-eyes", [0.9, 2.6]);
  }

  // ---- 2 · parade ---------------------------------------------------------
  {
    const cards = $$("#p-grid .eng");
    const times = [0, 1, 2, 3, 4, 5].map((l) => R.at("parade", l) - 0.06);
    times.push(R.word("parade", 6, 0) - 0.06, R.word("parade", 6, 1) - 0.06, R.at("parade", 7) - 0.06);
    cards.forEach((c, i) => R.pop(c, times[i], { from: 0.6, dur: 0.36, ease: "back.out(1.8)", sfx: "pop", gain: 0.45 }));
    cards.forEach((c, i) => R.blink(c.querySelector(".eyes"), [times[i] + 1.1]));
  }

  // ---- 3 · turn -----------------------------------------------------------
  {
    const s = S("turn");
    const rows = roll.length - 1;
    tl.fromTo("#t-roll", { y: 0 }, { y: -170 * rows, duration: s.end - s.start + 0.4, ease: "power1.inOut", immediateRender: true }, s.start);
    for (let k = 0; k < 6; k++) R.cue(s.start + 0.2 + k * 0.4, "tick", 0.25);
    const tb = R.at("turn", 1) - 0.05;
    R.rise("#t-b", tb, { y: 30, dur: 0.4 });
    R.rise("#t-q", tb + 0.1, { y: 30, dur: 0.45, sfx: "pop", gain: 0.35 });
    tl.fromTo("#t-b em", { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2.5)", immediateRender: true }, R.at("turn", 2) - 0.05);
    R.cue(R.at("turn", 2), "check", 0.5);
  }

  // ---- 4 · what hasn't changed ---------------------------------------------
  {
    const rows = $$("#s-const .row");
    const at = [R.at("constants", 0), R.at("constants", 1), R.at("constants", 2), R.at("constants", 4)];
    rows.forEach((row, i) => {
      R.slide(row, at[i] - 0.08, { x: -70, dur: 0.45 });
      R.pop(row.querySelector(".ok"), at[i] + 0.35, { from: 0.2, sfx: i === 3 ? "blip" : "check", gain: 0.45 });
    });
    R.pulse(rows[3], R.at("constants", 5) + 0.2, { scale: 1.03 });
  }

  // ---- 5 · where and in which language -----------------------------------------
  {
    const s = S("change");
    R.rise(["#x-en", "#x-zh"], R.at("change", 1) - 0.15, { y: 40, stagger: 0.12, dur: 0.45 });
    R.type("#x-en-q", "Which providers would you recommend?", R.at("change", 1) + 0.1, { cps: 46, sfx: false });
    R.type("#x-zh-q", "你会推荐哪些服务商？", R.at("change", 2) + 0.05, { cps: 16, sfx: false });
    R.pop("#x-en .reveal", R.at("change", 3) - 0.05, { from: 0.85, stagger: 0.12, dur: 0.3, sfx: false });
    R.cue(R.word("change", 3, "ChatGPT") - 0.1, "check", 0.5);
    R.pop("#x-zh .reveal", R.at("change", 4) - 0.05, { from: 0.85, stagger: 0.18, dur: 0.3, sfx: false });
    R.cue(R.word("change", 4, "DeepSeek"), "blip", 0.5);
    R.pulse("#x-zh .is-missing", R.word("change", 4, "DeepSeek") + 0.1, { scale: 1.05 });
    void s;
  }

  // ---- 6 · the job -------------------------------------------------------------
  {
    const s = S("job");
    R.grow("#j-a s i", R.word("job", 0, "chase"), { dur: 0.35 });
    R.swap("#j-a", "#j-b", R.at("job", 1) - 0.1, { dist: 24 });
    R.pop("#j-facts", s.start + 0.15, { from: 0.85, dur: 0.4, ease: "back.out(1.6)", sfx: false });
    tl.fromTo("#j-chips .echip", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.04, immediateRender: true }, s.start + 0.2);
    $$("#j-lines path").forEach((p, i) => {
      const len = p.getTotalLength();
      tl.fromTo(p, { strokeDashoffset: len, strokeDasharray: `${len} ${len}` }, { strokeDashoffset: 0, duration: 0.35, ease: "power2.out", immediateRender: true }, R.at("job", 2) - 0.1 + i * 0.03);
      tl.set(p, { strokeDasharray: "8 8" }, R.at("job", 2) + 0.4 + i * 0.03);
    });
    R.pop("#j-chips .tick", R.at("job", 3) - 0.08, { from: 0.2, stagger: 0.04, sfx: false });
    R.cue(R.at("job", 3), "success", 0.5);
  }

  // ---- 7 · the question ----------------------------------------------------------
  {
    const s = S("ask");
    const lines = $$("#a-title div");
    R.rise(lines[1], R.at("ask", 1) - 0.1, { y: 26, dur: 0.4 });
    R.rise(lines[2], R.at("ask", 2) - 0.1, { y: 26, dur: 0.4 });
    R.pop("#a-chips .geo-chip", s.start + 0.5, { from: 0.6, stagger: 0.06, dur: 0.3, sfx: false });
    tl.fromTo("#a-host", { y: 420 }, { y: 0, duration: 0.6, ease: "back.out(1.3)", immediateRender: true }, s.start + 0.05);
    R.bob("#a-host", s.start + 0.7, T.total, { amp: 6, period: 1 });
    R.blink("#a-host .p-eyes", [s.start + 1.4, s.start + 3.2]);
    R.rise("#a-sign", R.at("ask", 2, "end") + 0.1, { y: 16, dur: 0.4 });
  }

  R.captions($("#captions"), { wrap: true, clean: "light" });
  R.register();
  return R;
};
