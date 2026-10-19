// Choreography for "My AI Client Delivery Team".
// Every beat is pinned to the voiceover through R.at(scene, line) / R.word(...),
// so re-recording or re-timing the voice re-flows the whole video.
// index.html calls buildReel() once fonts and the host image are ready.
window.buildReel = function () {
  const T = window.TIMING;
  const brand = T.brand || {};
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  // ---------------------------------------------------------------- build DOM
  const CREW = [
    ["r1", "01", "INTAKE"],
    ["r2", "02", "PLAN"],
    ["r3", "03", "BUILD"],
    ["r4", "04", "CHECK"],
    ["r5", "05", "REPORT"],
    ["r6", "06", "SUPPORT"],
    ["r7", "07", "RETAIN"],
  ];

  $$("[data-step]").forEach((el) => {
    const n = +el.dataset.step;
    const segs = CREW.map((_, i) => `<i class="${i + 1 < n ? "done" : i + 1 === n ? "now" : ""}"></i>`).join("");
    el.innerHTML = `<span class="count">${n}/7</span><span class="track">${segs}</span><span class="label">${el.dataset.label}</span>`;
  });

  $("#i-crew").innerHTML = CREW.map(
    ([c, n, l], i) => `<div class="member" style="--c: var(--${c})">
      <div class="bot" data-bot="${c}"></div><span class="stem"></span>
      <div class="badge"><b>${n}</b><span>${l}</span><i class="bc" data-barcode="${i + 3}"></i></div>
      <div class="badge-ai"><i data-burst></i></div>
    </div>`,
  ).join("");
  $("#i-tree").innerHTML = CREW.map((_, i) => {
    const x = 72 + 121 * i;
    return `<path class="twig" d="M435 184 C 435 236, ${x} 214, ${x} 266" fill="none" stroke="#0e0f17" stroke-width="5" stroke-linecap="round"/>`;
  }).join("");

  // gantt
  const G = { x0: 236, w: 154, top: 80, rowH: 176 };
  const rows = [
    ["Design", "M1", [0.05, 0.85], 1.5],
    ["Build", "M2", [1.2, 2.4], 2.75],
    ["Launch", "M3", [2.45, 3.4], 3.55],
  ];
  let g = "";
  ["W1", "W2", "W3", "W4"].forEach((w, i) => {
    g += `<span class="wk" style="left:${G.x0 + G.w * i}px">${w}</span><span class="vl" style="left:${G.x0 + G.w * i}px"></span>`;
  });
  rows.forEach(([name, m, [a, b], d], r) => {
    const top = G.top + G.rowH * r;
    const cy = top + G.rowH / 2;
    g += `<span class="hl" style="top:${top}px"></span>`;
    g += `<div class="rl" style="top:${top + 44}px"><b>${name}</b><span>${m}</span></div>`;
    g += `<span class="bar" style="left:${G.x0 + G.w * a}px;width:${G.w * (b - a)}px;top:${cy - 17}px"></span>`;
    g += `<span class="dia-wrap" style="left:${G.x0 + G.w * d - 23}px;top:${cy - 23}px"><i class="dia"></i></span>`;
  });
  $("#p-gantt").innerHTML = g;

  $("#a-days").innerHTML = Array.from({ length: 20 }, (_, i) => `<i>${i + 1}</i>`).join("");

  const TILES = [
    ["r1", "question", "form"],
    ["r2", "list", "plan"],
    ["r3", "code", "site"],
    ["r4", "check", "QA"],
    ["r5", "mail", "update"],
    ["r6", "chat", "reply"],
    ["r7", "refresh", "renewal"],
  ];
  $("#g-tiles").innerHTML = TILES.map(([c, ic, l]) => `<div class="tile" style="--c: var(--${c})"><div class="tt"><i data-icon="${ic}" data-stroke="3"></i></div><span>${l}</span></div>`).join("");
  $("#c-bots").innerHTML = CREW.map(([c]) => `<i class="mb" data-bot="${c}" data-variant="mini"></i>`).join("") + `<span class="gap"></span>the whole team`;

  if (brand.handle) $("#c-handle").textContent = brand.handle;
  if (brand.approver) $("#g-name").textContent = brand.approver;
  if (brand.keyword) $("#c-word2").textContent = brand.keyword.toUpperCase();

  Sprites.hydrate(document);
  $("#lines").innerHTML = Sprites.speedlines(54, 9);

  // ---------------------------------------------------------------- motion
  const R = Reel.create({ timing: T });
  const tl = R.tl;
  const S = (id) => R.scene(id);
  const scenes = ["#s-intro", "#s-onb", "#s-pm", "#s-build", "#s-qa", "#s-rep", "#s-sup", "#s-am", "#s-gate", "#s-cta"].map($);
  R.cuts(scenes, $("#lines"));

  // headers land with each cut
  scenes.slice(1).forEach((el, i) => {
    const t = T.scenes[i + 1].start;
    const step = el.querySelector(".step");
    const title = el.querySelector(".head .title");
    if (step) R.slide(step, t - 0.05, { y: -40, dur: 0.4 });
    if (title) tl.fromTo(title, { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.42, ease: "back.out(2.2)", immediateRender: true }, t);
  });

  // ---- 1 · intro --------------------------------------------------------
  {
    const s = S("intro");
    const members = $$("#i-crew .member");
    const bots = $$("#i-crew .bot");
    // three employees join on "client delivery team"
    const twigs = $$("#i-tree .twig");
    [0, 1, 2].forEach((k) => {
      const t = R.word("intro", 1, k);
      R.pop(members[4 + k], t, { from: 0.2, sfx: "blip", gain: 0.7 });
      R.fadeIn(twigs[4 + k], t, 0.15);
    });
    R.count("#i-count", 4, 7, R.word("intro", 1, 0), { dur: R.at("intro", 1, "end") - R.word("intro", 1, 0), format: (v) => `${v} employees` });
    // "Seven employees" — title swap + crew wave
    const t7 = R.at("intro", 2);
    tl.to(["#i-sub", "#i-main"], { y: -60, opacity: 0, duration: 0.22, ease: "power2.in", stagger: 0.04 }, t7 - 0.05);
    R.slam("#i-seven", t7 + 0.05, { from: 1.8, sfx: "pop", gain: 0.9 });
    bots.forEach((b, i) => tl.to(b, { y: -18, duration: 0.14, yoyo: true, repeat: 1, ease: "sine.out" }, t7 + 0.08 + i * 0.05));
    // "and none of them" — badges flip to AI, frame goes red
    const tn = R.at("intro", 3);
    tl.to("#i-count", { opacity: 0, duration: 0.15 }, tn);
    tl.fromTo("#i-allai", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.25, immediateRender: true }, tn + 0.05);
    tl.to("#i-card", { boxShadow: "12px 12px 0 #e4483f", duration: 0.3 }, tn);
    tl.to(".cc-pill", { boxShadow: "7px 7px 0 #e4483f", duration: 0.3 }, tn);
    members.forEach((m, i) => R.flip(m.querySelector(".badge"), m.querySelector(".badge-ai"), tn + 0.1 + i * 0.07, { sfx: i % 2 ? false : "blip", gain: 0.35 }));
    // "are human" — stamp
    R.slam("#i-stamp", R.at("intro", 4) - 0.05, { rot: -6 });
    // presenter: points and talks
    R.wobble("#i-presenter .p-arm-up", 0.0, s.end, { deg: 3, period: 1.1, svgOrigin: "282 446" });
    R.bob("#i-presenter", 0, s.end, { amp: 8, period: 0.8 });
    R.blink("#i-presenter .p-eyes", [1.4, 3.3]);
    R.blink(bots.map((b) => b.querySelector(".eyes")), [0.9, 2.6]);
  }

  // ---- 2 · onboarder ----------------------------------------------------
  {
    const s = S("onboarder");
    const q = ["What's the goal?", "Who is it for?", "Brand assets?"];
    const t1 = R.at("onboarder", 1);
    R.swap("#o-new", "#o-acme", t1 - 0.1, { dist: 20 });
    q.forEach((txt, i) => {
      const t = t1 + i * 0.28;
      const row = $$("#o-q .q-row")[i];
      tl.to(row.querySelector(".skel"), { opacity: 0, duration: 0.1 }, t);
      R.type(row.querySelector(".qt"), txt, t, { cps: 70, sfx: i === 0 });
      R.tick(row.querySelector(".check"), t + 0.24);
    });
    const tl2 = R.at("onboarder", 2);
    $$("#o-logins .login").forEach((row, i) => {
      const t = tl2 + i * 0.2;
      tl.fromTo(row.querySelectorAll(".icon, .nm"), { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.25, immediateRender: true }, t);
      R.tick(row.querySelector(".check"), t + 0.12, { gain: 0.5 });
    });
    const tf = R.at("onboarder", 4) - 0.1;
    tl.to("#o-empty", { opacity: 0, scale: 0.6, duration: 0.15 }, tf);
    R.pop("#o-files", tf + 0.05, { from: 0.4 });
    R.pop("#o-files .chip", tf + 0.25, { stagger: 0.12, sfx: "blip", gain: 0.4 });
  }

  // ---- 3 · project manager ---------------------------------------------
  {
    const tm = R.word("pm", 1, "milestones");
    const secs = $$("#p-scope .sec");
    // scope breaks into its three sections, then the plan takes over
    secs.forEach((sec, i) => tl.to(sec, { x: [-180, 40, 220][i], y: [-40, 30, 90][i], rotation: [-8, 4, 9][i], duration: 0.35, ease: "power3.out" }, R.word("pm", 1, "scope") + i * 0.05));
    R.cue(R.word("pm", 1, "scope"), "slide", 0.5);
    tl.to("#p-scope", { opacity: 0, scale: 0.85, y: 60, duration: 0.3, ease: "power2.in" }, tm - 0.05);
    R.pop("#p-plan", tm - 0.05, { from: 0.85, dur: 0.4, ease: "back.out(1.6)" });
    R.grow("#p-gantt .bar", R.at("pm", 2) - 0.05, { stagger: 0.12, dur: 0.35, sfx: "slide", gain: 0.4 });
    R.pop("#p-gantt .dia-wrap", R.at("pm", 3), { stagger: 0.14, sfx: "blip", gain: 0.5 });
    R.cue(R.at("pm", 3) + 0.14, "blip", 0.5);
    R.cue(R.at("pm", 3) + 0.28, "blip", 0.5);
  }

  // ---- 4 · builder ------------------------------------------------------
  {
    const s = S("builder");
    R.type("#b-typed", "build acme: the site, the lead flow and this week's posts", s.start + 0.1, { cps: 62 });
    tl.to("#b-working", { opacity: 0.35, duration: 0.25, yoyo: true, repeat: 7, ease: "none" }, s.start + 0.2);
    const outs = ["#b-o1", "#b-o2", "#b-o3"];
    const slots = ["#b-site", "#b-auto", "#b-post"];
    [3, 4, 5].forEach((ln, i) => {
      const t = R.at("builder", ln) - 0.06;
      R.pop(slots[i], t, { from: 0.5, sfx: "pop" });
      tl.fromTo(outs[i], { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.2, immediateRender: true }, t + 0.05);
    });
    R.cue(R.at("builder", 2), "tick", 0.6);
    tl.to("#b-working", { opacity: 0, duration: 0.1 }, R.at("builder", 5, "end"));
    tl.fromTo("#b-done", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(3)", immediateRender: true }, R.at("builder", 5, "end"));
    R.cue(R.at("builder", 5, "end"), "success", 0.6);
    R.bob("#b-bot", s.start, s.end, { amp: 8, period: 0.5 });
  }

  // ---- 5 · QA reviewer --------------------------------------------------
  {
    const s = S("qa");
    // magnifier sweeps the site preview
    tl.fromTo("#q-glass", { x: -90, y: -50 }, { x: 70, y: 20, duration: 1.0, ease: "sine.inOut", immediateRender: true }, s.start + 0.1);
    const rows = $$("#q-brief .qa-row");
    const tick = (i, t) => {
      R.tick(rows[i].querySelector(".check"), t);
      tl.to(rows[i].querySelector(".bgfill"), { opacity: 1, duration: 0.2 }, t);
      tl.to(rows[i], { borderColor: "#22a565", duration: 0.2 }, t);
    };
    tick(0, R.at("qa", 1) + 0.05);
    tick(1, R.at("qa", 1) + 0.45);
    // a bug turns up on the button, gets caught and fixed
    const tb = R.at("qa", 2);
    tl.to("#q-glass", { x: -10, y: 70, duration: 0.3, ease: "power2.out" }, tb - 0.25);
    R.pop("#q-bug", tb, { sfx: "blip", gain: 0.6 });
    tl.to("#q-bug", { scale: 0, opacity: 0, rotation: 90, duration: 0.25, ease: "back.in(2)" }, tb + 0.55);
    tick(2, tb + 0.6);
    R.slam("#q-pass", R.at("qa", 3) - 0.05, { rot: -9 });
    R.pulse("#q-lock", R.at("qa", 3, "end") - 0.2, { scale: 1.06 });
  }

  // ---- 6 · reporter -----------------------------------------------------
  {
    const s = S("reporter");
    tl.fromTo("#r-letter", { y: 330 }, { y: 0, duration: 0.55, ease: "power3.out", immediateRender: true }, R.at("reporter", 1) - 0.15);
    R.cue(R.at("reporter", 1) - 0.15, "slide", 0.7);
    const checks = $$("#r-letter .rep-row:not(.is-next) .check");
    checks.forEach((c, i) => R.tick(c, R.at("reporter", 2) + i * 0.16, { gain: 0.5 }));
    R.pop("#r-letter .rep-h.is-next, #r-letter .rep-row.is-next", R.at("reporter", 3), { from: 0.6, stagger: 0.1, sfx: "blip", gain: 0.4 });
    R.bob("#r-seal", s.start, s.end, { amp: 5, period: 0.6 });
    R.pulse("#r-draft", R.at("reporter", 1) + 0.6, { scale: 1.15 });
  }

  // ---- 7 · support ------------------------------------------------------
  {
    const s = S("support");
    R.pop("#u-typing", s.start + 0.2, { from: 0.5, sfx: "blip", gain: 0.4 });
    tl.to("#u-typing", { opacity: 0.4, duration: 0.2, yoyo: true, repeat: 3, ease: "none" }, s.start + 0.5);
    const ta = R.word("support", 1, "answer");
    tl.to("#u-typing", { opacity: 0, scale: 0.6, duration: 0.12 }, ta - 0.12);
    R.pop("#u-a", ta - 0.05, { from: 0.6, sfx: "pop" });
    // reading the docs
    const td = R.at("support", 2) - 0.1;
    tl.fromTo("#u-glass", { opacity: 0, x: 0 }, { opacity: 1, x: 0, duration: 0.15, immediateRender: true }, td - 0.3);
    tl.to("#u-glass", { x: 600, duration: 0.9, ease: "sine.inOut" }, td - 0.15);
    $$(".doc").forEach((d, i) => tl.to(d.querySelectorAll(".skel i"), { scaleX: 1, duration: 0.25, stagger: 0.06, ease: "power2.out" }, td + i * 0.28));
    R.pop("#u-chips .chip", td + 0.35, { stagger: 0.12, sfx: "blip", gain: 0.4 });
    tl.to("#u-glass", { opacity: 0, duration: 0.2 }, td + 0.95);
    R.slide("#u-draft", R.at("support", 2, "end") - 0.1, { y: 30, sfx: "pop", gain: 0.5 });
  }

  // ---- 8 · account manager ---------------------------------------------
  {
    const s = S("account");
    tl.fromTo("#a-bot", { x: -260 }, { x: 0, duration: 0.6, ease: "power2.out", immediateRender: true }, s.start + 0.05);
    R.bob("#a-bot", s.start, s.end, { amp: 9, period: 0.36 });
    const tc = R.word("account", 1, "check-ins") - 0.12;
    tl.fromTo("#a-sticker", { opacity: 0, scale: 1.8, y: -120, rotation: 10 }, { opacity: 1, scale: 1, y: 0, rotation: -6, duration: 0.32, ease: "back.out(1.8)", immediateRender: true }, tc);
    R.cue(tc + 0.28, "stamp", 0.5);
    const tr = R.at("account", 2) - 0.08;
    R.pop("#a-renew", tr, { from: 0.6, sfx: "pop" });
    tl.fromTo("#a-badge", { rotation: -200 }, { rotation: 0, duration: 0.7, ease: "power3.out", immediateRender: true }, tr + 0.15);
    R.cue(tr + 0.2, "check", 0.6);
    R.slide("#a-next", R.at("account", 3) - 0.05, { y: 200, dur: 0.5, ease: "back.out(1.6)", sfx: "slide", gain: 0.6 });
  }

  // ---- 9 · approval gate ------------------------------------------------
  {
    const s = S("gate");
    const tiles = $$("#g-tiles .tile");
    // deliverables bump against the barrier
    tl.to(tiles, { y: -26, duration: 0.14, yoyo: true, repeat: 1, ease: "power2.out", stagger: 0.05 }, s.start + 0.45);
    R.cue(s.start + 0.5, "tick", 0.5);
    R.swap("#g-t1", "#g-t2", R.at("gate", 1) - 0.1, { dist: 50, sfx: "whoosh", gain: 0.35 });
    const ty = R.word("gate", 1, "approve");
    R.pulse("#g-yes", ty - 0.2, { scale: 1.08 });
    tl.set("#g-yes .btn-on", { opacity: 1 }, ty + 0.1);
    tl.set("#g-yes .btn", { opacity: 0 }, ty + 0.1);
    R.cue(ty + 0.1, "ding", 0.8);
    tl.fromTo("#g-ring", { opacity: 0.9, scale: 0.4 }, { opacity: 0, scale: 1.4, duration: 0.6, ease: "power2.out", immediateRender: false }, ty + 0.1);
    // the gate lifts and the work ships
    const tg = R.at("gate", 2) - 0.1;
    tl.to("#g-bar", { rotation: -75, duration: 0.45, ease: "power2.out" }, tg);
    tl.to("#g-bar", { opacity: 0, duration: 0.25 }, tg + 0.3);
    tl.to("#g-needs", { opacity: 0, y: 20, duration: 0.2 }, tg);
    R.cue(tg, "rise", 0.7);
    tiles.forEach((tile, i) => {
      // fly into the client card (centre 540,505) from the tile row (centre y 854)
      tl.to(tile, { x: 401 - 132 * i, y: -349, scale: 0.25, opacity: 0, duration: 0.45, ease: "power2.in" }, tg + 0.35 + i * 0.09);
      R.cue(tg + 0.7 + i * 0.09, "blip", 0.35);
    });
    R.swap("#g-empty", "#g-delivered", R.at("gate", 3) - 0.05, { dist: 20 });
    R.pulse("#g-client", R.at("gate", 3), { scale: 1.06 });
    R.cue(R.at("gate", 3), "success", 0.8);
  }

  // ---- 10 · CTA ----------------------------------------------------------
  {
    const s = S("cta");
    tl.fromTo("#c-presenter", { y: 500 }, { y: 0, duration: 0.5, ease: "back.out(1.4)", immediateRender: true }, s.start + 0.1);
    R.wobble("#c-presenter .p-arm-up", s.start + 0.5, T.total, { deg: 2.5, period: 1, svgOrigin: "282 446" });
    const kw = (brand.keyword || "DELIVER").toUpperCase();
    const tk = R.word("cta", 0, 1) - 0.05;
    // caret blinks until typing starts (even repeat count → ends visible)
    const blinks = Math.max(0, Math.floor((tk - s.start) / 0.26) - 1);
    tl.to("#c-caret", { opacity: 0, duration: 0.01, yoyo: true, repeat: blinks - (blinks % 2) + 1, repeatDelay: 0.25, ease: "none" }, s.start);
    R.type("#c-typed", kw, tk, { cps: 22 });
    // posted → comment appears, input resets
    const tp = R.at("cta", 1) - 0.05;
    R.pulse("#c-post", tp - 0.12, { scale: 1.2 });
    tl.set(["#c-typed", "#c-caret"], { opacity: 0 }, tp);
    tl.set("#c-placeholder", { opacity: 1 }, tp);
    R.slide("#c-comment", tp, { y: -70, dur: 0.4, ease: "back.out(1.8)", sfx: "pop" });
    tl.fromTo("#c-heart", { scale: 0 }, { scale: 1, duration: 0.4, ease: "back.out(4)", immediateRender: true }, tp + 0.35);
    R.cue(tp + 0.35, "heart", 0.7);
    // DMs
    const td = R.at("cta", 2) - 0.08;
    R.pop("#c-dm", td, { from: 0.6, sfx: "pop" });
    R.pop("#c-bots .mb", td + 0.15, { from: 0.1, stagger: 0.05, sfx: false });
    for (let i = 0; i < 7; i += 2) R.cue(td + 0.15 + i * 0.05, "blip", 0.3);
    R.pop("#c-prompts", R.at("cta", 3) - 0.05, { from: 0.6, sfx: "blip" });
    // follow
    const tf = R.at("cta", 3, "end") + 0.15;
    R.pulse("#c-follow", tf - 0.12, { scale: 1.1 });
    tl.set("#c-follow .done", { opacity: 1 }, tf);
    tl.set("#c-follow .on", { opacity: 0 }, tf);
    R.cue(tf, "check", 0.6);
    R.blink("#c-presenter .p-eyes", [s.start + 1.2, s.start + 2.9]);
  }

  R.captions($("#captions"));
  R.register();
  return R;
};
