// Choreography for "10:40pm" (Praxcia). No voiceover: the beats follow the
// brief's edit plan, which script.json carries as scene and line times, so
// R.at(scene, line) still drives everything.
window.buildReel = function () {
  const T = window.TIMING;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const rnd = rng(1040);

  // ---------------------------------------------------------------- build DOM
  // lit windows on the night buildings
  const wins = [];
  [[30, 260, 70, 1180], [820, 1060, 140, 1180], [250, 830, 160, 700]].forEach(([x0, x1, y0, y1]) => {
    for (let x = x0; x < x1 - 30; x += 64) {
      for (let y = y0; y < y1 - 40; y += 92) {
        if (rnd() < 0.3) wins.push(`<i style="left:${x}px;top:${y}px;background:${rnd() < 0.7 ? "rgba(255,190,110,.55)" : "rgba(120,220,230,.4)"}"></i>`);
      }
    }
  });
  $("#wins").innerHTML = wins.join("");
  // the same windows by day: glass, not lamps
  $("#wins-day").innerHTML = wins.map((w) => w.replace(/background:[^"]+/, "background:rgba(96,118,134,.45)")).join("");

  // rain: a tile of short streaks, two layers at different speeds
  let streaks = "";
  for (let i = 0; i < 70; i++) {
    const x = Math.round(rnd() * 400);
    const y = Math.round(rnd() * 400);
    const l = 18 + Math.round(rnd() * 30);
    streaks += `<line x1="${x}" y1="${y}" x2="${x - l * 0.18}" y2="${y + l}"/>`;
  }
  const rainTile = `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" stroke="rgb(200,225,255)" stroke-width="1.6" stroke-linecap="round" opacity="0.8">${streaks}</svg>`)}")`;
  $$(".rain").forEach((r) => (r.style.backgroundImage = rainTile));

  // neon smeared across the wet pavement
  $("#reflect").innerHTML = [
    [60, 120, "#ff4b5c"],
    [912, 110, "#3de0d0"],
    [806, 140, "#ff6fae"],
    [330, 420, "rgba(190,255,220,.6)"],
  ]
    .map(([x, w, c]) => `<i style="left:${x}px;width:${w}px;background:linear-gradient(${c},transparent)"></i>`)
    .join("");

  // dust in the screen light
  $$(".dust").forEach((d) => {
    let h = "";
    for (let i = 0; i < 16; i++) h += `<i style="left:${260 + rnd() * 560}px;top:${380 + rnd() * 900}px"></i>`;
    d.innerHTML = h;
  });

  // notifications: blurred, unreadable
  const note = (ok) => `<div class="n${ok ? " ok" : ""}"><i></i><i></i></div>`;
  $("#notes2").innerHTML = [0, 1, 2, 3, 4].map(() => note(false)).join("");
  $("#notes5").innerHTML = note(false) + note(true);

  // a full week of bookings, blurred
  const colors = ["#ff5a36", "#2bb3a3", "#f6b73c", "#7a6cf0", "#ef6f9c", "#4aa3df"];
  let cal = "";
  for (let i = 0; i < 7; i++) cal += `<i style="background:#e4e0d8"></i>`;
  for (let i = 0; i < 42; i++) cal += rnd() < 0.88 ? `<i style="background:${colors[Math.floor(rnd() * colors.length)]};opacity:${0.75 + rnd() * 0.25}"></i>` : `<i></i>`;
  $("#cal").innerHTML = cal;

  // the rewind replays the night street
  $("#rw-street").appendChild($("#street").cloneNode(true)).removeAttribute("id");

  // film grain: one noise tile, nudged every frame-and-a-half
  const cv = document.createElement("canvas");
  cv.width = cv.height = 256;
  const g = cv.getContext("2d");
  const img = g.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(rnd() * 255);
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  $("#grain").style.backgroundImage = `url(${cv.toDataURL()})`;

  // on-screen words sit on a dark pill so they read over the bright shots
  $$(".ov").forEach((o) => (o.innerHTML = `<span>${o.innerHTML}</span>`));
  Sprites.hydrate(document);

  // ---------------------------------------------------------------- motion
  const R = Reel.create({ timing: T });
  const tl = R.tl;
  const S = (id) => R.scene(id);
  const shots = ["#s-enquiry", "#s-unanswered", "#s-late", "#s-rewind", "#s-system", "#s-booked", "#s-end"].map((s) => $(s));
  R.cuts(shots, null, { style: "hard" });

  const show = (el, a, b, o = {}) => {
    tl.fromTo(el, { opacity: 0, y: o.y ?? 24, scale: o.scale ?? 1 }, { opacity: 1, y: 0, scale: 1, duration: o.dur ?? 0.28, ease: o.ease ?? "power3.out", immediateRender: true }, a);
    if (b != null) tl.to(el, { opacity: 0, duration: 0.18 }, b - 0.18);
  };
  for (let k = 0; k < 300; k++) tl.set("#grain", { backgroundPosition: `${Math.round(rnd() * 256)}px ${Math.round(rnd() * 256)}px` }, k / 12);
  $$(".rain.r1").forEach((r) => tl.fromTo(r, { backgroundPosition: "0px 0px" }, { backgroundPosition: "-70px 400px", duration: 0.32, ease: "none", repeat: 60, immediateRender: true }, 0));
  $$(".rain.r2").forEach((r) => tl.fromTo(r, { backgroundPosition: "0px 0px" }, { backgroundPosition: "-110px 640px", duration: 0.5, ease: "none", repeat: 40, immediateRender: true }, 0));
  $$(".dust i").forEach((d) => tl.to(d, { x: (rnd() - 0.5) * 120, y: -40 - rnd() * 120, opacity: 0.2 + rnd() * 0.6, duration: 5 + rnd() * 3, ease: "sine.inOut" }, rnd() * 2));

  // ---- shot 1 · 10:40pm: push in through the glass, the phone lights up --------
  {
    const s = S("enquiry");
    tl.fromTo("#street", { scale: 1 }, { scale: 1.55, duration: s.end + 0.05, ease: "power1.inOut", transformOrigin: "560px 1170px", immediateRender: true }, 0);
    $$("#reflect i").forEach((r, i) => tl.to(r, { scaleY: 1.08, skewX: i % 2 ? 2 : -2, duration: 0.9, yoyo: true, repeat: 5, ease: "sine.inOut" }, i * 0.2));
    [0.4, R.at("enquiry", 1) + 0.05].forEach((t) => {
      tl.fromTo("#s1-glow", { opacity: 0.25 }, { opacity: 1, duration: 0.12, yoyo: true, repeat: 1, repeatDelay: 0.5, ease: "power2.out", immediateRender: false }, t);
      R.cue(t, "ping", 0.8);
    });
    tl.fromTo("#minibus", { x: 0 }, { x: 2300, duration: 1.7, ease: "none", immediateRender: true }, 2.5);
    R.cue(2.6, "slide", 0.35);
    show("#o1", R.at("enquiry", 0), R.at("enquiry", 0, "end"));
    show("#b1", R.at("enquiry", 1), R.at("enquiry", 1, "end"), { y: 30, scale: 0.92, ease: "back.out(1.8)" });
  }

  // ---- shot 2 · unanswered: notifications stack, the phone buzzes on the wood ----
  {
    const s = S("unanswered");
    tl.set("#p2", { rotation: -6 }, 0);
    tl.fromTo("#s-unanswered .desk", { scale: 1 }, { scale: 1.07, duration: s.end - s.start, ease: "none", immediateRender: true }, s.start);
    const notes = $$("#notes2 .n");
    notes.forEach((n, i) => {
      const t = s.start + 0.45 + i * 0.95;
      tl.fromTo(n, { opacity: 0, y: -30, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.6)", immediateRender: true }, t);
      tl.fromTo("#p2", { x: 0 }, { x: 5, duration: 0.045, yoyo: true, repeat: 7, ease: "none", immediateRender: false }, t);
      tl.fromTo("#s-unanswered .deskglow", { opacity: 0.6 }, { opacity: 1, duration: 0.1, yoyo: true, repeat: 1, repeatDelay: 0.3, immediateRender: false }, t);
      R.cue(t, "ping", 0.55);
      R.cue(t + 0.02, "buzz", 0.7);
    });
    show("#o2", R.at("unanswered", 0), R.at("unanswered", 0, "end"));
  }

  // ---- shot 3 · 11:00am: shutter up, a tram goes by, the reply comes too late ----
  {
    const s = S("late");
    tl.fromTo("#s3-shutter", { height: 460 }, { height: 0, duration: 0.9, ease: "power2.inOut", immediateRender: true }, s.start + 0.15);
    R.cue(s.start + 0.15, "shutter", 0.8);
    tl.fromTo("#tram", { x: 0 }, { x: -2500, duration: 2.2, ease: "none", immediateRender: true }, s.start + 1.2);
    R.cue(s.start + 1.3, "ding", 0.35);
    R.cue(s.start + 1.55, "ding", 0.3);
    tl.fromTo("#w1", { x: 0 }, { x: 1500, duration: 4.6, ease: "none", immediateRender: true }, s.start);
    tl.fromTo("#w2", { x: 1500 }, { x: -200, duration: 4.2, ease: "none", immediateRender: true }, s.start + 0.6);
    show("#o3", R.at("late", 0), R.at("late", 0, "end"));
    show("#chat3", R.at("late", 0) + 1.0, s.end, { y: 50 });
    show("#c3-seen", R.at("late", 0) + 1.3, null, { y: 10 });
    show("#c3-sorry", R.at("late", 1), null, { y: 20, scale: 0.94, ease: "back.out(1.8)" });
    R.cue(R.at("late", 1), "ping", 0.45);
  }

  // ---- 15s · rewind to the same night ----------------------------------------------
  {
    const s = S("rewind");
    R.cue(s.start - 0.02, "rewind", 0.9);
    tl.fromTo("#rw-street .street", { scale: 1.55 }, { scale: 1, duration: s.end - s.start, ease: "power2.in", transformOrigin: "560px 1170px", immediateRender: true }, s.start);
    $$("#glitch i").forEach((b, i) => {
      for (let k = 0; k < 8; k++) tl.set(b, { top: Math.round(300 + rnd() * 1300), height: 20 + Math.round(rnd() * 90), opacity: rnd() < 0.3 ? 0 : 1 }, s.start + k * 0.12 + i * 0.03);
    });
    tl.fromTo(".rew", { opacity: 1 }, { opacity: 0.2, duration: 0.12, yoyo: true, repeat: 7, ease: "steps(1)", immediateRender: false }, s.start);
    show("#o4", R.at("rewind", 0), R.at("rewind", 0, "end"), { y: 0 });
  }

  // ---- shot 2, green: the system answers in seconds ----------------------------------
  {
    const s = S("system");
    tl.set("#p5", { rotation: -6 }, 0);
    tl.fromTo("#s-system .desk", { scale: 1.07 }, { scale: 1.12, duration: s.end - s.start, ease: "none", immediateRender: true }, s.start);
    const [n1, n2] = $$("#notes5 .n");
    const tq = R.at("system", 0);
    const ta = R.at("system", 1);
    tl.fromTo(n1, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.3, immediateRender: true }, tq);
    tl.fromTo(n2, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.3, immediateRender: true }, ta);
    R.cue(tq + 0.02, "ping", 0.55);
    show("#o5", tq, s.end);
    show("#chat5", tq - 0.05, s.end, { y: 50 });
    show("#c5-q", tq + 0.05, null, { y: 16 });
    show("#c5-typing", tq + 0.45, ta - 0.02, { y: 10 });
    $$("#c5-typing i").forEach((d, i) => tl.fromTo(d, { y: 0 }, { y: -8, duration: 0.18, yoyo: true, repeat: 3, ease: "sine.inOut", immediateRender: false }, tq + 0.5 + i * 0.1));
    show("#c5-a", ta, null, { y: 20, scale: 0.94, ease: "back.out(1.8)" });
    show("#c5-auto", ta + 0.15, null, { y: 0, scale: 0.6, ease: "back.out(2.4)" });
    R.cue(ta, "check", 0.7);
    R.cue(ta + 0.2, "success", 0.5);
  }

  // ---- shot 4 · morning: the calendar's full, she's having her milk tea ------------
  {
    const s = S("booked");
    tl.fromTo("#room", { scale: 1 }, { scale: 1.07, duration: s.end - s.start + 0.1, ease: "none", transformOrigin: "50% 60%", immediateRender: true }, s.start);
    $$(".steam i").forEach((st, i) => tl.fromTo(st, { y: 0, opacity: 0 }, { y: -50, opacity: 0.9, duration: 0.9, yoyo: true, repeat: 1, ease: "sine.inOut", immediateRender: true }, s.start + i * 0.25));
    show("#o6", R.at("booked", 0), R.at("booked", 0, "end"));
  }

  // ---- end card --------------------------------------------------------------------
  {
    const s = S("end");
    // the second half lands with the voiceover's "They need a follow-up system."
    const ps = $$("#e-a p");
    const tNeed = T.vo && T.vo[6] ? T.vo[6].start - 0.1 : R.at("end", 0) + 0.3;
    R.rise(ps.slice(0, 2), R.at("end", 0) + 0.05, { y: 30, stagger: 0.12, dur: 0.4 });
    R.rise(ps.slice(2), tNeed, { y: 30, stagger: 0.12, dur: 0.4 });
    tl.to("#e-a", { opacity: 0, duration: 0.2 }, R.at("end", 1) - 0.2);
    tl.fromTo("#e-b", { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(1.6)", immediateRender: true }, R.at("end", 1));
    R.cue(R.at("end", 1), "pop", 0.4);
    tl.fromTo("#grain", { opacity: 0.16 }, { opacity: 0.08, duration: 0.3, immediateRender: false }, s.start);
  }

  R.register();
  return R;
};
