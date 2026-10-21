// Motion helpers for HyperFrames compositions in the Pixel Crew style.
//
//   const R = Reel.create({ timing: window.TIMING });
//   R.pop("#card", R.at("onboarder", 1));       // pop in on line 1 of a scene
//   R.captions(document.getElementById("captions"));
//   R.register();                               // window.__timelines.main = R.tl
//
// Every helper writes into one paused GSAP timeline (seekable, deterministic)
// and can drop a sound-effect cue; scripts/cues.mjs exports the cues so
// scripts/soundtrack.py can mix them under the voiceover.
(function () {
  window.__timelines = window.__timelines || {};

  function create(opts = {}) {
    const timing = opts.timing || window.TIMING || { total: 10, scenes: [] };
    const id = opts.id || "main";
    const tl = gsap.timeline({ paused: true });
    const cues = [];
    const byId = Object.fromEntries(timing.scenes.map((s) => [s.id, s]));

    const R = {
      tl,
      timing,
      cues,

      scene(sid) {
        const s = byId[sid];
        if (!s) throw new Error(`unknown scene ${sid}`);
        return s;
      },
      // time of a line (start) in a scene; `which` = "start" | "end"
      at(sid, line = 0, which = "start") {
        const s = R.scene(sid);
        const l = s.lines[Math.min(line, s.lines.length - 1)];
        return l[which];
      },
      // time of a specific word (by index within the line, or by text match)
      word(sid, line, w = 0, which = "s") {
        const l = R.scene(sid).lines[line];
        const key = (x) => x.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
        const idx = typeof w === "number" ? w : l.words.findIndex((x) => key(x.w) === key(w));
        return l.words[Math.max(0, idx)][which];
      },

      cue(t, type, gain = 1) {
        if (t == null || isNaN(t)) return;
        cues.push({ t: Math.round(t * 1000) / 1000, type, gain });
      },

      // ---- entrances ----
      pop(target, t, o = {}) {
        tl.fromTo(
          target,
          { scale: o.from ?? 0.3, opacity: 0, rotation: o.rotFrom ?? 0 },
          { scale: 1, opacity: 1, rotation: o.rot ?? 0, duration: o.dur ?? 0.42, ease: o.ease ?? "back.out(2.4)", stagger: o.stagger ?? 0, immediateRender: true },
          t,
        );
        if (o.sfx !== false) R.cue(t, o.sfx || "pop", o.gain ?? 0.8);
        return R;
      },
      rise(target, t, o = {}) {
        tl.fromTo(
          target,
          { y: o.y ?? 80, opacity: 0 },
          { y: 0, opacity: 1, duration: o.dur ?? 0.45, ease: o.ease ?? "power3.out", stagger: o.stagger ?? 0, immediateRender: true },
          t,
        );
        if (o.sfx) R.cue(t, o.sfx, o.gain ?? 0.6);
        return R;
      },
      slide(target, t, o = {}) {
        const from = { x: o.x ?? 0, y: o.y ?? 0, opacity: o.fade === false ? 1 : 0, rotation: o.rot ?? 0 };
        tl.fromTo(target, from, { x: 0, y: 0, opacity: 1, rotation: o.rotTo ?? 0, duration: o.dur ?? 0.5, ease: o.ease ?? "power4.out", stagger: o.stagger ?? 0, immediateRender: true }, t);
        if (o.sfx) R.cue(t, o.sfx, o.gain ?? 0.6);
        return R;
      },
      fadeIn(target, t, dur = 0.3) {
        tl.fromTo(target, { opacity: 0 }, { opacity: 1, duration: dur, ease: "power1.out", immediateRender: true }, t);
        return R;
      },
      fadeOut(target, t, dur = 0.25) {
        tl.to(target, { opacity: 0, duration: dur, ease: "power1.in" }, t);
        return R;
      },
      // a hard "slam" in: big → normal with a little shake
      slam(target, t, o = {}) {
        tl.fromTo(target, { scale: o.from ?? 2.6, opacity: 0, rotation: (o.rot ?? 0) + 8 }, { scale: 1, opacity: 1, rotation: o.rot ?? 0, duration: 0.32, ease: "power4.in", immediateRender: true }, t);
        tl.to(target, { scale: 1.06, duration: 0.07, yoyo: true, repeat: 1, ease: "sine.inOut" }, t + 0.32);
        R.cue(t + 0.3, o.sfx || "stamp", o.gain ?? 1);
        return R;
      },
      // swap one element out and another in, same spot
      swap(outEl, inEl, t, o = {}) {
        tl.to(outEl, { y: -(o.dist ?? 40), opacity: 0, duration: 0.2, ease: "power2.in" }, t);
        tl.fromTo(inEl, { y: o.dist ?? 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.32, ease: "back.out(2)", immediateRender: true }, t + 0.12);
        if (o.sfx) R.cue(t, o.sfx, o.gain ?? 0.5);
        return R;
      },
      // card flip faking a Y rotation (front → back)
      flip(front, back, t, o = {}) {
        tl.to(front, { scaleX: 0, duration: 0.14, ease: "power2.in" }, t);
        tl.fromTo(back, { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 0.2, ease: "back.out(2)", immediateRender: true }, t + 0.14);
        if (o.sfx !== false) R.cue(t, o.sfx || "blip", o.gain ?? 0.5);
        return R;
      },
      // grow a bar from the left
      grow(target, t, o = {}) {
        tl.fromTo(target, { scaleX: 0, transformOrigin: o.origin || "0% 50%" }, { scaleX: 1, duration: o.dur ?? 0.4, ease: o.ease ?? "power3.out", stagger: o.stagger ?? 0, immediateRender: true }, t);
        if (o.sfx) R.cue(t, o.sfx, o.gain ?? 0.5);
        return R;
      },
      // type text into an element at `cps` characters per second
      type(el, text, t, o = {}) {
        const node = typeof el === "string" ? document.querySelector(el) : el;
        const cps = o.cps ?? 34;
        const dur = o.dur ?? text.length / cps;
        const proxy = { n: 0 };
        node.textContent = "";
        tl.fromTo(
          proxy,
          { n: 0 },
          {
            n: text.length,
            duration: dur,
            ease: "none",
            immediateRender: true,
            onUpdate() {
              node.textContent = text.slice(0, Math.round(proxy.n));
            },
          },
          t,
        );
        if (o.sfx !== false) {
          const step = o.clickEvery ?? 0.07;
          for (let k = 0; k < dur; k += step) R.cue(t + k, "type", 0.35);
        }
        return R;
      },
      // integer counter
      count(el, from, to, t, o = {}) {
        const node = typeof el === "string" ? document.querySelector(el) : el;
        const fmt = o.format || ((v) => String(v));
        const proxy = { v: from };
        node.textContent = fmt(from);
        tl.fromTo(
          proxy,
          { v: from },
          {
            v: to,
            duration: o.dur ?? 0.6,
            ease: o.ease ?? "power1.out",
            immediateRender: true,
            onUpdate() {
              node.textContent = fmt(Math.round(proxy.v));
            },
          },
          t,
        );
        return R;
      },
      // tick a .check element on
      tick(target, t, o = {}) {
        const el = typeof target === "string" ? document.querySelector(target) : target;
        const color = o.color || getComputedStyle(el).getPropertyValue("--tick").trim() || "#1e4ff2";
        tl.set(el, { backgroundColor: color }, t);
        tl.set(el.querySelector("svg"), { opacity: 1 }, t);
        tl.fromTo(el, { scale: 0.6 }, { scale: 1, duration: 0.3, ease: "back.out(3)", immediateRender: false }, t);
        if (o.sfx !== false) R.cue(t, o.sfx || "check", o.gain ?? 0.6);
        return R;
      },
      // looped idle motion, bounded so it ends inside the composition
      bob(target, t0, t1, o = {}) {
        const period = o.period ?? 0.6;
        const reps = Math.max(0, Math.floor((t1 - t0) / period) - 1);
        tl.fromTo(target, { y: 0 }, { y: -(o.amp ?? 10), duration: period / 2, ease: "sine.inOut", yoyo: true, repeat: reps * 2 + 1, immediateRender: false }, t0);
        return R;
      },
      wobble(target, t0, t1, o = {}) {
        if (!gsap.utils.toArray(target).length) return R; // e.g. no separate arm on an image host
        const period = o.period ?? 0.9;
        const reps = Math.max(0, Math.floor((t1 - t0) / period) - 1);
        const origin = o.svgOrigin ? { svgOrigin: o.svgOrigin } : o.origin ? { transformOrigin: o.origin } : {};
        tl.fromTo(target, { rotation: -(o.deg ?? 3), ...origin }, { rotation: o.deg ?? 3, ...origin, duration: period / 2, ease: "sine.inOut", yoyo: true, repeat: reps * 2 + 1, immediateRender: false }, t0);
        return R;
      },
      // drawn eyes squash shut; image hosts fade eyelids (data-lids) in and out
      blink(eyes, times) {
        const els = gsap.utils.toArray(eyes);
        const lids = els.filter((e) => e.hasAttribute("data-lids"));
        const open = els.filter((e) => !e.hasAttribute("data-lids"));
        for (const t of times) {
          if (open.length) tl.to(open, { scaleY: 0.1, transformOrigin: "50% 50%", duration: 0.06, yoyo: true, repeat: 1, ease: "none" }, t);
          if (lids.length) tl.to(lids, { opacity: 1, duration: 0.04, yoyo: true, repeat: 1, repeatDelay: 0.05, ease: "none" }, t);
        }
        return R;
      },
      pulse(target, t, o = {}) {
        tl.to(target, { scale: o.scale ?? 1.08, duration: 0.12, yoyo: true, repeat: 1, ease: "sine.inOut" }, t);
        return R;
      },

      // ---- scene cuts: zoom-whip with radial speed lines ----
      // scenes: array of section elements in order; uses timing scene starts
      cuts(sceneEls, lines, o = {}) {
        const dur = o.dur ?? 0.34;
        sceneEls.forEach((el, i) => {
          const s = timing.scenes[i];
          if (!s) return;
          // the first scene is visible from frame 0; never stack a hide+show
          // pair on it at t=0 (the HyperFrames runtime resolves those to hidden)
          if (i === 0) return;
          tl.set(el, { opacity: 0 }, 0);
          const t = s.start;
          const prev = sceneEls[i - 1];
          if (o.style === "soft") {
            // calm cut: outgoing drifts up and fades, incoming rises in
            tl.to(prev, { y: -40, opacity: 0, duration: 0.32, ease: "power2.in" }, t - 0.3);
            tl.fromTo(el, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power3.out", immediateRender: false }, t - 0.08);
            if (o.sfx !== false) R.cue(t - 0.25, "whoosh", o.gain ?? 0.35);
            return;
          }
          tl.to(prev, { scale: 1.22, filter: "blur(16px)", opacity: 0, duration: dur * 0.8, ease: "power2.in" }, t - dur * 0.55);
          tl.fromTo(el, { scale: 0.86, filter: "blur(14px)", opacity: 0 }, { scale: 1, filter: "blur(0px)", opacity: 1, duration: dur, ease: "power3.out", immediateRender: false }, t - dur * 0.3);
          if (lines) {
            tl.fromTo(lines, { opacity: 0, scale: 0.8, rotation: i * 11 }, { opacity: 0.85, scale: 1.05, duration: dur * 0.5, ease: "power2.out", immediateRender: false }, t - dur * 0.5);
            tl.to(lines, { opacity: 0, scale: 1.4, duration: dur * 0.6, ease: "power2.in" }, t - dur * 0.05);
          }
          R.cue(t - dur * 0.6, "whoosh", 0.7);
        });
        return R;
      },

      // ---- captions: one phrase at a time, popped ----
      captions(container, o = {}) {
        const all = [];
        timing.scenes.forEach((s) => s.lines.forEach((l) => all.push(l)));
        // o.wrap puts the text in a <span> so a brand can style it as a pill
        container.innerHTML = all
          .map((l, i) => {
            const raw = o.clean === false ? l.text : o.clean === "light" ? lightCaption(l.text) : cleanCaption(l.text);
            const text = escapeHtml(raw);
            return `<div class="cap" data-i="${i}">${o.wrap ? `<span>${text}</span>` : text}</div>`;
          })
          .join("");
        const caps = container.querySelectorAll(".cap");
        all.forEach((l, i) => {
          const el = caps[i];
          const start = Math.max(0, l.start - 0.04);
          const next = all[i + 1];
          const end = next ? Math.max(start + 0.2, next.start - 0.04) : timing.total - 0.15;
          tl.fromTo(el, { opacity: 0, scale: 0.82, y: 14 }, { opacity: 1, scale: 1, y: 0, duration: 0.14, ease: "back.out(2.6)", immediateRender: true }, start);
          tl.set(el, { opacity: 0 }, end);
        });
        return R;
      },

      // close the timeline at the composition length and register it
      register() {
        tl.set({}, {}, timing.total);
        window.__timelines[id] = tl;
        window.__reel = { timeline: tl, cues: cues.slice().sort((a, b) => a.t - b.t), total: timing.total, ready: true };
        return R;
      },
    };
    return R;
  }

  function cleanCaption(text) {
    // captions drop sentence punctuation, like the reference style
    return text.replace(/[.,!?;:]+$/g, "").replace(/[.,;:]+(\s)/g, "$1");
  }

  // calmer styles keep inner commas and question marks, drop only end stops
  function lightCaption(text) {
    return text.replace(/[.,;:。，；：、]+$/g, "");
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  }

  window.Reel = { create, cleanCaption };
})();
