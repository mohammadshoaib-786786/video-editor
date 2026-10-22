// Choreography for "Fix your website today. AI catches up later." (Geoneo, LinkedIn 4:5).
// Beats are pinned to the voiceover with R.at(scene, line) / R.word(...).
window.buildReel = function () {
  const T = window.TIMING;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const css = getComputedStyle(document.documentElement);
  const C = { teal: css.getPropertyValue("--geo-teal").trim(), blue: css.getPropertyValue("--geo-blue").trim(), grey: css.getPropertyValue("--geo-grey").trim() };
  const tealSoft = css.getPropertyValue("--geo-teal-soft").trim();

  // ---------------------------------------------------------------- build DOM
  $$("[data-engine]").forEach((el) => {
    el.classList.add("robot");
    el.innerHTML = Sprites.robot(C[el.dataset.engine], { variant: "flat", px: 5 });
  });
  $("#u-days").innerHTML = ["M", "T", "W", "T", "F", "S", "S"].map((d) => `<div class="d">${d}<i>&ndash;</i></div>`).join("");

  // the plan's axis: months 0–6 over 600 px
  $("#p-axis").innerHTML =
    `<span class="axcap">Months</span><i class="base"></i>` +
    [0, 1, 2, 3, 4, 5, 6].map((m) => `<i class="tk" style="left:${300 + m * 100}px"></i><span class="n" style="left:${300 + m * 100}px">${m}</span>`).join("");

  // monthly check: search-grounded moves first (early movement around week 8),
  // training-based catches up from month 4
  const ROWS = [
    ["Search-grounded", [0, "early", 1, 1, 1, 1]],
    ["Training-based", [0, 0, 0, 1, 1, 1]],
  ];
  $("#k-grid").innerHTML =
    `<div class="gr"><span></span>${[1, 2, 3, 4, 5, 6].map((m) => `<span class="gh">Month ${m}</span>`).join("")}</div>` +
    ROWS.map(([name, cells]) => `<div class="gr"><span class="gl">${name}</span>${cells.map((v) => `<span class="c" data-v="${v}"><i data-icon="check" data-stroke="3.2"></i></span>`).join("")}</div>`).join("") +
    `<div class="legend"><span><i style="background:${C.teal}"></i>caught up</span><span><i style="background:${tealSoft};border:1.5px solid ${C.teal}"></i>early movement</span><span><i style="border:1.5px solid ${C.grey}"></i>not yet</span></div>`;

  $$("[data-logo]").forEach((el) => (el.innerHTML = window.GEONEO_LOGO));
  Sprites.hydrate(document);

  // ---------------------------------------------------------------- motion
  const R = Reel.create({ timing: T });
  const tl = R.tl;
  const S = (id) => R.scene(id);
  const scenes = ["#s-hook", "#s-two", "#s-search", "#s-train", "#s-turn", "#s-take", "#s-cta"].map($);
  R.cuts(scenes, null, { style: "soft", gain: 0.3 });
  tl.fromTo("#progress", { scaleX: 0 }, { scaleX: 1, duration: T.total, ease: "none", immediateRender: true }, 0);
  scenes.slice(1).forEach((el, i) => {
    const k = el.querySelector(".kick");
    if (k) R.rise(k, T.scenes[i + 1].start, { y: 16, dur: 0.35 });
  });
  const draw = (paths, t, gap = 0.08) =>
    paths.forEach((p, i) => {
      const len = p.getTotalLength();
      tl.fromTo(p, { strokeDasharray: `${len} ${len}`, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.3, ease: "power2.out", immediateRender: true }, t + i * gap);
    });

  // ---- 1 · hook: the headline is up from frame 1; the proof arrives under it
  {
    const s = S("hook");
    R.rise("#h-site", 0.12, { y: 40, dur: 0.45 });
    R.pop("#h-updated", R.word("hook", 0, "today") + 0.05, { from: 0.4, sfx: "check", gain: 0.5 });
    R.rise("#h-ai", R.at("hook", 1) - 0.1, { y: 40, dur: 0.45 });
    R.pop("#h-old", R.word("hook", 1, "later"), { from: 0.5, sfx: "blip", gain: 0.35 });
    tl.fromTo("#h-old .clock", { rotation: 0 }, { rotation: 360, duration: 1.1, ease: "none", repeat: 1, transformOrigin: "50% 50%", immediateRender: true }, R.word("hook", 1, "later"));
    R.bob("#h-host", 0, s.end, { amp: 6, period: 0.9 });
    R.blink("#h-host .p-eyes", [0.8, 2.1]);
  }

  // ---- 2 · two kinds, two speeds -------------------------------------------
  {
    R.rise(["#w-a", "#w-b"], R.at("two", 0) + 0.05, { y: 40, stagger: 0.15, dur: 0.45 });
    const go = R.at("two", 2);
    tl.fromTo("#w-a .runner", { x: 0 }, { x: 610, duration: 0.95, ease: "power2.inOut", immediateRender: true }, go);
    tl.fromTo("#w-a .speed", { x: -30, opacity: 0 }, { x: 560, opacity: 1, duration: 0.95, ease: "power2.inOut", immediateRender: true }, go);
    tl.to("#w-a .speed", { opacity: 0, duration: 0.2 }, go + 0.95);
    R.pulse("#w-a .flag", go + 0.95, { scale: 1.1 });
    R.cue(go + 0.95, "check", 0.45);
    tl.fromTo("#w-b .runner", { x: 0 }, { x: 190, duration: 2.4, ease: "none", immediateRender: true }, go);
    tl.set("#w-b .flag", { opacity: 0.4 }, 0);
    R.blink("#w-a .eyes", [go + 1.3]);
    R.blink("#w-b .eyes", [go + 0.6, go + 1.8]);
  }

  // ---- 3 · search-grounded, and the plan's first marker ---------------------
  {
    const s = S("search");
    R.rise("#s-n1", s.start + 0.25, { y: 30, dur: 0.4 });
    R.rise("#s-n2", R.at("search", 1) - 0.1, { y: 30, dur: 0.4 });
    draw($$("#s-search .wires path").slice(0, 2), R.at("search", 1) - 0.05);
    R.rise("#s-n3", R.at("search", 2) - 0.1, { y: 30, dur: 0.4 });
    draw($$("#s-search .wires path").slice(2), R.at("search", 2) - 0.05);
    R.pop("#s-found", R.at("search", 4), { from: 0.4, sfx: "check", gain: 0.5 });
    R.pulse("#s-n3", R.at("search", 5), { scale: 1.04 });

    R.rise("#plan", R.at("search", 6) - 0.15, { y: 40, dur: 0.5 });
    tl.set("#p-b", { opacity: 0.35 }, 0);
    tl.fromTo("#p-a-fill", { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power2.inOut", immediateRender: true }, R.at("search", 8));
    R.pop("#p-a-dot", R.word("search", 9, "8") - 0.05, { from: 0.2, sfx: "blip", gain: 0.45 });
    R.rise("#p-a-lab", R.word("search", 9, "8"), { y: 12, dur: 0.3 });
  }

  // ---- 4 · training-based, and the plan's second marker ---------------------
  {
    const s = S("training");
    R.rise("#t-m1", s.start + 0.25, { y: 30, dur: 0.4 });
    draw($$("#s-train .wires path"), R.at("training", 3));
    R.rise("#t-m2", R.at("training", 4) - 0.1, { y: 30, dur: 0.4 });
    R.pop("#t-new", R.word("training", 5, "newer"), { from: 0.4, sfx: "check", gain: 0.5 });
    tl.to("#p-b", { opacity: 1, duration: 0.3 }, s.start + 0.2);
    tl.fromTo("#p-b-band", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.out", immediateRender: true }, R.at("training", 6));
    R.rise("#p-b-lab", R.at("training", 7), { y: 12, dur: 0.3, sfx: "blip", gain: 0.4 });
    tl.to("#plan", { y: -40, opacity: 0, duration: 0.32, ease: "power2.in" }, S("turn").start - 0.3);
  }

  // ---- 5 · the turn: nothing moved, and that's normal ------------------------
  {
    const s = S("turn");
    R.rise("#u-site", s.start + 0.2, { y: 30, dur: 0.4 });
    R.pulse("#u-site .geo-chip", R.word("turn", 1, "today"), { scale: 1.08 });
    R.rise("#u-l2", R.at("turn", 2) - 0.1, { y: 20, dur: 0.35 });
    R.rise("#u-week", R.at("turn", 2) - 0.05, { y: 30, dur: 0.4 });
    R.pop("#u-days .d", R.word("turn", 3, "next"), { from: 0.6, stagger: 0.05, dur: 0.3, sfx: false });
    R.rise("#u-l3", R.at("turn", 4) - 0.1, { y: 20, dur: 0.35 });
    R.pop("#u-ok", R.at("turn", 4) + 0.1, { from: 0.5, sfx: "check", gain: 0.5 });
  }

  // ---- 6 · takeaway: fix first, then check monthly ----------------------------
  {
    const s = S("takeaway");
    R.rise("#k-fix", s.start + 0.15, { y: 30, dur: 0.4 });
    R.pop("#k-fix .geo-chip", R.at("takeaway", 0) + 0.45, { from: 0.6, stagger: 0.08, dur: 0.3, sfx: false });
    R.rise("#k-ask", R.at("takeaway", 1) - 0.1, { y: 30, dur: 0.4 });
    const rows = $$("#k-grid .gr").slice(1);
    const t0 = R.at("takeaway", 2);
    for (let m = 0; m < 6; m++) {
      const t = t0 + m * 0.36;
      rows.forEach((row) => {
        const cell = row.querySelectorAll(".c")[m];
        const v = cell.dataset.v;
        if (v === "1") {
          tl.to(cell, { backgroundColor: C.teal, borderColor: C.teal, duration: 0.2 }, t);
          tl.to(cell.querySelector(".icon"), { opacity: 1, duration: 0.15 }, t + 0.05);
        } else if (v === "early") {
          tl.to(cell, { backgroundColor: tealSoft, borderColor: C.teal, duration: 0.2 }, t);
        }
      });
      R.cue(t, "tick", 0.2);
    }
  }

  // ---- 7 · end card ---------------------------------------------------------
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
