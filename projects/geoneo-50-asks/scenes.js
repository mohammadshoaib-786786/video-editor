// Choreography for "We asked AI the same question 50 times." (Geoneo, LinkedIn 4:5).
// Beats are pinned to the voiceover with R.at(scene, line) / R.word(...).
// Accuracy: the only figures on screen are 50 questions, 3 engines, 92%, 4 brands
// within 5 points and 3 brands at 0.0%. The four brands get no bars, because
// their positions aren't known; every bar sits on a full 0–100 scale.
window.buildReel = function () {
  const T = window.TIMING;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const css = getComputedStyle(document.documentElement);
  const C = { teal: css.getPropertyValue("--geo-teal").trim(), blue: css.getPropertyValue("--geo-blue").trim(), grey: css.getPropertyValue("--geo-grey").trim() };

  // ---------------------------------------------------------------- build DOM
  $$("[data-engine]").forEach((el) => {
    el.classList.add("robot");
    el.innerHTML = Sprites.robot(C[el.dataset.engine], { variant: "flat", px: 5 });
  });
  $$("[data-logo]").forEach((el) => (el.innerHTML = window.GEONEO_LOGO));
  Sprites.hydrate(document);

  // ---------------------------------------------------------------- motion
  const R = Reel.create({ timing: T });
  const tl = R.tl;
  const S = (id) => R.scene(id);
  const scenes = ["#s-hook", "#s-test", "#s-r1", "#s-r2", "#s-r3", "#s-why", "#s-close", "#s-cta"].map($);
  R.cuts(scenes, null, { style: "soft", gain: 0.3 });
  tl.fromTo("#progress", { scaleX: 0 }, { scaleX: 1, duration: T.total, ease: "none", immediateRender: true }, 0);
  scenes.slice(1).forEach((el, i) => {
    const k = el.querySelector(".kick");
    if (k) R.rise(k, T.scenes[i + 1].start, { y: 16, dur: 0.35 });
  });

  // ---- 1 · hook: the headline is up from frame 1 ------------------------------
  {
    const s = S("hook");
    R.rise("#h-stack .ghost", 0.1, { y: 30, stagger: 0.05, dur: 0.35 });
    R.rise("#h-q", 0.3, { y: 30, dur: 0.4 });
    R.pop("#h-x50", R.word("hook", 2, "50"), { from: 0.4, sfx: "pop", gain: 0.5 });
    R.bob("#h-host", 0, s.end, { amp: 6, period: 0.9 });
    R.blink("#h-host .p-eyes", [0.7, 1.9]);
  }

  // ---- 2 · the test -------------------------------------------------------------
  {
    R.rise("#t-cat", R.at("test", 0) - 0.05, { y: 30, dur: 0.4 });
    R.rise("#t-eng", R.at("test", 1) - 0.1, { y: 30, dur: 0.4 });
    $$("#t-eng .geo-chip").forEach((chip, i) => R.pop(chip, R.word("test", 2, i) - 0.05, { from: 0.6, dur: 0.3, sfx: "pop", gain: 0.35 }));
    R.rise("#t-qs", R.at("test", 3) - 0.1, { y: 30, dur: 0.4 });
    R.pop("#t-qs .bubbles .icon", R.at("test", 3) + 0.2, { from: 0.4, stagger: 0.07, dur: 0.3, sfx: false });
  }

  // ---- 3 · result one: 92% on a full 0–100 scale --------------------------------
  {
    const s = S("r1");
    R.rise("#r1-chart", s.start + 0.2, { y: 30, dur: 0.4 });
    const t92 = R.word("r1", 2, "92%");
    tl.fromTo("#r1-bar", { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power2.out", immediateRender: true }, t92 - 0.35);
    R.pop("#r1-val", t92 + 0.3, { from: 0.5, sfx: "blip", gain: 0.45 });
    R.rise("#r1-note", R.at("r1", 2, "end"), { y: 12, dur: 0.3 });
  }

  // ---- 4 · result two: four brands within 5 points ----------------------------------
  {
    const s = S("r2");
    R.rise("#r2-card", s.start + 0.15, { y: 30, dur: 0.4 });
    const toks = $$("#r2-card .tok");
    R.pop(toks, R.at("r2", 1) - 0.1, { from: 0.4, stagger: 0.08, dur: 0.35, sfx: "pop", gain: 0.3 });
    // "fought": a little jostle, each its own way
    toks.forEach((t, i) => {
      tl.to(t, { x: [-6, 7, -4, 5][i], y: [3, -5, 4, -3][i], rotation: [-3, 3, -2, 2][i], duration: 0.16, yoyo: true, repeat: 5, ease: "sine.inOut" }, R.word("r2", 1, "fought") + i * 0.03);
    });
    tl.fromTo("#r2-brace i", { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power2.out", immediateRender: true }, R.at("r2", 2));
    R.pop("#r2-brace span", R.word("r2", 3, "5"), { from: 0.5, sfx: "blip", gain: 0.45 });
  }

  // ---- 5 · result three: three market leaders at 0.0% ---------------------------------
  {
    const s = S("r3");
    R.rise("#r3-chart", s.start + 0.15, { y: 30, dur: 0.4 });
    R.rise("#r3-chart .lead", R.at("r3", 1) - 0.05, { y: 16, stagger: 0.1, dur: 0.3 });
    const t0 = R.word("r3", 2, "0.0%");
    R.pop("#r3-chart .lead .zero", t0 - 0.1, { from: 0.2, stagger: 0.1, dur: 0.3, sfx: false });
    R.pop("#r3-chart .lead .zv", t0, { from: 0.5, stagger: 0.1, dur: 0.3, sfx: "blip", gain: 0.45 });
    R.pop("#r3-assets", R.at("r3", 3) - 0.05, { from: 0.6, dur: 0.3, sfx: false });
    R.pop("#r3-aware", R.at("r3", 4) - 0.05, { from: 0.6, dur: 0.3, sfx: false });
    R.pop("#r3-none", R.word("r3", 5, "named") - 0.1, { from: 0.4, sfx: "stamp", gain: 0.35 });
    R.pulse("#r3-chart .lead .zero", R.word("r3", 5, "once"), { scale: 1.25 });
  }

  // ---- 6 · why ------------------------------------------------------------------
  {
    R.rise("#y-a", R.at("why", 1) - 0.1, { y: 30, dur: 0.4 });
    const rowsA = $$("#y-a .it");
    ["pricing", "eligibility", "licensing"].forEach((w, i) => {
      R.pop(rowsA[i], R.word("why", 4, w) - 0.08, { from: 0.85, dur: 0.25, sfx: false });
      R.pulse(rowsA[i].querySelector(".q"), R.word("why", 4, w), { scale: 1.2 });
    });
    R.pop("#y-a-note", R.at("why", 4, "end") + 0.05, { from: 0.6, sfx: false });
    R.rise("#y-b", R.at("why", 5) - 0.1, { y: 30, dur: 0.4 });
    R.pop("#y-b .it .ok", R.word("why", 6, "verify") - 0.2, { from: 0.2, stagger: 0.1, sfx: "check", gain: 0.45 });
    R.pop("#y-b-note", R.at("why", 6, "end") + 0.05, { from: 0.6, sfx: false });
  }

  // ---- 7 · closing line --------------------------------------------------------------
  {
    R.rise("#z-a", R.at("close", 0) - 0.1, { y: 30, dur: 0.4 });
    R.rise("#z-a2", R.at("close", 1) - 0.05, { y: 14, dur: 0.3 });
    R.rise("#z-b", R.at("close", 2) - 0.1, { y: 30, dur: 0.4 });
    R.rise("#z-b2", R.at("close", 3) - 0.05, { y: 14, dur: 0.3 });
    R.pulse("#z-b", R.word("close", 3, "AI"), { scale: 1.03 });
    R.cue(R.word("close", 3, "AI"), "success", 0.4);
  }

  // ---- 8 · end card -------------------------------------------------------------------
  {
    const s = S("cta");
    R.rise("#c-box", s.start + 0.15, { y: 30, dur: 0.4 });
    R.type("#c-kw", "GEO", R.word("cta", 0, "GEO"), { cps: 8, sfx: false });
    tl.to("#c-cur", { opacity: 0, duration: 0.01, yoyo: true, repeat: 7, repeatDelay: 0.4, ease: "none" }, s.start + 0.5);
    tl.fromTo("#c-host", { y: 420 }, { y: 0, duration: 0.6, ease: "back.out(1.3)", immediateRender: true }, s.start + 0.05);
    R.bob("#c-host", s.start + 0.7, T.total, { amp: 6, period: 1 });
    R.blink("#c-host .p-eyes", [s.start + 1.3, s.start + 3.0]);
    R.rise("#c-sign", R.at("cta", 1) + 0.15, { y: 16, dur: 0.4 });
  }

  R.captions($("#captions"), { wrap: true, clean: "light" });
  R.register();
  return R;
};
