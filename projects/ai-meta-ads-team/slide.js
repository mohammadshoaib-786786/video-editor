// Builds one carousel slide (picked by the `slide` variable, or ?slide=N when
// opened directly) from window.DECK and animates it on a 6 s timeline.
// The last ~2 s hold still, so the PNG export and the video poster match.
(function () {
  const css = getComputedStyle(document.documentElement);
  const colorOf = (v) => (v.startsWith("#") ? v : css.getPropertyValue("--" + v).trim());
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const pad = (n) => String(n).padStart(2, "0");

  function slideNumber() {
    try {
      const v = window.__hyperframes && window.__hyperframes.getVariables && window.__hyperframes.getVariables();
      if (v && v.slide) return +v.slide;
    } catch (e) {
      // fall through to the query string
    }
    const q = new URLSearchParams(location.search).get("slide");
    return q ? +q : 1;
  }

  // shrink a nowrap title until it fits its box
  function fit(el, max) {
    let size = max;
    el.style.setProperty("--size", size + "px");
    while (el.scrollWidth > el.clientWidth + 1 && size > 30) {
      size -= 2;
      el.style.setProperty("--size", size + "px");
    }
  }

  function toolIcon(spec, color) {
    const [kind, name] = spec.split(":");
    const svg = kind === "glyph" ? Sprites.glyph(name) : Sprites.icon(name, { stroke: 2.4 });
    return `<span class="icon" style="color:${color}">${svg}</span>`;
  }

  function header(deck, n, total, crumbs) {
    return `<div class="cz-top">
      <span class="cz-count">${pad(n)} / ${pad(total)}</span>
      ${crumbs.map((c, i) => `<span class="crumb ${i ? "is-dim" : ""}">${esc(c)}</span>`).join('<span class="crumb is-dim">·</span>')}
      ${n < total ? '<span class="swipe">swipe →</span>' : ""}
    </div>`;
  }

  function footer(deck, n, total, middle) {
    return `<div class="cz-foot"><span>${esc(deck.brand.name)} · ${esc(deck.brand.tagline)}</span><span>${esc(middle)}</span><span>${pad(n)} / ${pad(total)}</span></div>`;
  }

  // ------------------------------------------------------------ layouts
  function cover(deck, s, n, total) {
    const robots = deck.steps
      .map((st, i) => {
        const x = 100 + i * 146.7;
        return `<div class="cz-bot" style="left:${x - 42}px;top:850px;width:84px;--accent:var(--r${i + 1})">
          <div class="sprite" style="width:84px;height:60px">${Sprites.robot(colorOf("r" + (i + 1)), { variant: "flat", px: 6 })}</div>
          <span class="lbl" style="color:var(--r${i + 1});margin-left:-30px;width:144px">${esc(st)}</span></div>`;
      })
      .join("");
    const lines = deck.steps
      .map((_, i) => {
        const x = 100 + i * 146.7;
        return `<path class="ln" d="M540 712 C 540 790, ${x.toFixed(1)} 770, ${x.toFixed(1)} 846" style="stroke:var(--r${i + 1})"/>`;
      })
      .join("");
    return `
      <div class="cz-glow" style="top:330px"></div>
      ${header(deck, n, total, ["Claude Code", deck.series])}
      <div class="cz-kicker" style="top:196px;text-align:center">${esc(s.kicker)}</div>
      <h1 class="cz-title fit" data-max="132" style="top:250px;text-align:center"><span class="ink">${esc(s.title[0])}</span></h1>
      <h1 class="cz-title fit" data-max="120" style="top:384px;text-align:center">${esc(s.title[1])}</h1>
      <svg class="cz-arrows" viewBox="0 0 1080 1350" style="stroke-width:3">${lines}</svg>
      <div class="pillrow" style="position:absolute;left:0;right:0;top:600px;display:flex;justify-content:center">
        <div class="cz-pill" style="position:relative"><b>${esc(s.pill[0])}</b><span>${esc(s.pill[1])}</span></div>
      </div>
      ${robots}
      <div class="cz-hand" style="left:0;right:0;top:1040px;text-align:center">${esc(s.hand)} →</div>
      ${footer(deck, n, total, "7 employees · 1 account")}`;
  }

  function employee(deck, s, n, total) {
    const idx = deck.slides.filter((x) => x.type === "employee").indexOf(s);
    const accent = colorOf(s.color);
    const skills = s.skills
      .map(
        ([ic, t, d], i) =>
          `<div class="cz-card cz-skill" style="top:${340 + i * 112}px;width:490px;height:96px">
            <span class="ic">${Sprites.icon(ic, { stroke: 2.3 }).replace("<svg", '<svg class="icon"')}</span>
            <div><b>${esc(t)}</b><span>${esc(d)}</span></div></div>`,
      )
      .join("");
    const notePos = [
      [600, 704, -4],
      [744, 694, 3],
      [888, 708, -2],
      [744, 826, 2],
    ];
    const notes = s.tools
      .map(([spec, label, col], i) => {
        const [x, y, r] = notePos[i];
        return `<div class="cz-note" data-rot="${r}" style="left:${x}px;top:${y}px;width:128px">${toolIcon(spec, col)}<span>${esc(label)}</span></div>`;
      })
      .join("");
    const items = s.delivers.map((d) => `<span><i></i>${esc(d)}</span>`).join('<span class="sep"></span>');
    const flow = s.flow.map(([t, d]) => `<div class="cz-card flow-step"><b>${esc(t).toUpperCase()}</b><span>${esc(d)}</span></div>`).join('<span class="to">→</span>');
    const stepper = deck.steps
      .map((st, i) => {
        const cls = i === idx ? "is-now" : i < idx ? "is-done" : "";
        return `<div class="st ${cls}" style="left:${(i / (deck.steps.length - 1)) * 100}%"><i></i>${esc(st).toUpperCase()}</div>`;
      })
      .join("");
    return `
      <div class="cz-glow" style="top:120px;left:-80px"></div>
      ${header(deck, n, total, [deck.series, `Employee ${pad(idx + 1)}`])}
      <div class="cz-kicker" style="top:140px">Employee ${pad(idx + 1)} / ${pad(deck.steps.length)} &nbsp;·&nbsp; ${esc(s.dept)}</div>
      <h1 class="cz-title fit" data-max="104" style="top:178px">${esc(s.name)}</h1>
      <div class="cz-sub" style="top:282px">${esc(s.line)}</div>
      ${skills}
      <div class="cz-status" id="status" style="right:56px;top:350px"><span id="status-text"></span><span class="cur"></span></div>
      <div class="sprite" id="bot" style="position:absolute;left:628px;top:440px;width:224px;height:160px">${Sprites.robot(accent, { variant: "flat", px: 16 })}</div>
      <div class="sprite" id="prop" style="position:absolute;left:868px;top:470px;width:130px;height:130px">${Sprites.prop(s.prop, accent, 10)}</div>
      <div class="cz-dept" id="dept" style="left:640px;top:618px">${esc(s.dept)}</div>
      ${notes}
      <div class="cz-hand" id="hand" style="left:330px;top:812px">the toolkit</div>
      <svg class="cz-arrows" viewBox="0 0 1080 1350">
        <path class="draw" d="M552 322 C 588 322, 604 362, 610 430" />
        <path class="draw" d="M600 418 l 10 14 l 8 -15" />
        <path class="draw" d="M500 846 C 540 846, 560 820, 590 780" />
        <path class="draw" d="M583 784 l 10 -6 l 2 12" />
        <path class="draw" d="M310 860 C 230 880, 200 900, 190 930" />
        <path class="draw" d="M182 922 l 8 10 l 8 -10" />
      </svg>
      <div class="cz-card cz-strip" id="strip" style="top:942px"><h5>What it delivers</h5><div class="items">${items}</div></div>
      <div class="cz-flow" id="flow" style="top:1062px">${flow}</div>
      <div class="cz-stepper" id="stepper" style="top:1172px"><span class="line"></span>${stepper}</div>
      ${footer(deck, n, total, `${deck.steps[idx]} · one job`)}`;
  }

  function loop(deck, s, n, total) {
    const cx = 540;
    const cy = 846;
    const r = 292;
    const k = deck.steps.length;
    const pt = (i, rad = r) => {
      const a = ((-90 + (i * 360) / k) * Math.PI) / 180;
      return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
    };
    const bots = deck.steps
      .map((st, i) => {
        const [x, y] = pt(i);
        return `<div class="cz-bot loop-bot" style="left:${(x - 46).toFixed(1)}px;top:${(y - 40).toFixed(1)}px;width:92px">
          <div class="sprite" style="width:84px;height:60px;margin:0 auto">${Sprites.robot(colorOf("r" + (i + 1)), { variant: "flat", px: 6 })}</div>
          <span class="lbl" style="color:var(--r${i + 1});margin:8px -40px 0">${esc(st)}</span></div>`;
      })
      .join("");
    const arcs = deck.steps
      .map((_, i) => {
        const a0 = -90 + (i * 360) / k + 15;
        const a1 = -90 + ((i + 1) * 360) / k - 15;
        const p = (deg, rad = r) => [cx + rad * Math.cos((deg * Math.PI) / 180), cy + rad * Math.sin((deg * Math.PI) / 180)];
        const [x0, y0] = p(a0);
        const [x1, y1] = p(a1);
        // arrowhead at the end, pointing along the circle
        const t = ((a1 + 90) * Math.PI) / 180;
        const hx = Math.cos(t) * 14;
        const hy = Math.sin(t) * 14;
        const nx = Math.cos((a1 * Math.PI) / 180) * 9;
        const ny = Math.sin((a1 * Math.PI) / 180) * 9;
        return `<path class="draw" d="M${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" style="stroke:var(--r${i + 1})"/>
          <path class="draw" d="M${(x1 - hx + nx).toFixed(1)} ${(y1 - hy + ny).toFixed(1)} L ${x1.toFixed(1)} ${y1.toFixed(1)} L ${(x1 - hx - nx).toFixed(1)} ${(y1 - hy - ny).toFixed(1)}" style="stroke:var(--r${i + 1})"/>`;
      })
      .join("");
    const [gx, gy] = pt(2.5, r + 4);
    return `
      ${header(deck, n, total, [deck.series, "The loop"])}
      <div class="cz-kicker" style="top:140px">${esc(s.kicker)}</div>
      <h1 class="cz-title fit" data-max="96" style="top:178px"><span class="ink">${esc(s.title[0])}</span></h1>
      <h1 class="cz-title fit" data-max="96" style="top:270px">${esc(s.title[1])}</h1>
      <div class="cz-sub" style="top:378px;white-space:normal;line-height:1.35;max-width:900px">${esc(s.sub)}</div>
      <svg class="cz-arrows" viewBox="0 0 1080 1350" style="stroke-width:5">${arcs}</svg>
      <div class="pillrow" style="position:absolute;left:0;right:0;top:${cy - 52}px;display:flex;justify-content:center">
        <div class="cz-pill" style="position:relative"><b>claude-code</b><span>the ad account</span></div>
      </div>
      ${bots}
      <div id="gate" style="position:absolute;left:${(gx - 150).toFixed(1)}px;top:${(gy - 30).toFixed(1)}px;width:300px;display:flex;justify-content:center">
        <span class="pill" style="background:var(--gold);font-size:19px;padding:8px 16px;gap:8px"><span class="icon" style="width:22px;height:22px">${Sprites.icon("lock", { stroke: 2.6 })}</span>${esc(s.gate)}</span>
      </div>
      <div class="cz-hand" id="hand" style="left:96px;top:1150px">${esc(s.hand)}</div>
      ${footer(deck, n, total, "7 employees · 1 loop")}`;
  }

  function cta(deck, s, n, total) {
    const perks = s.perks
      .map((p) => `<div class="perk" style="display:flex;align-items:center;gap:16px;height:62px;font:700 31px var(--f-body)"><span class="icon" style="width:36px;height:36px;color:var(--accent)">${Sprites.icon("check", { stroke: 3.2 })}</span>${esc(p)}</div>`)
      .join("");
    const robots = deck.steps.map((_, i) => `<div class="sprite rb" style="width:84px;height:60px">${Sprites.robot(colorOf("r" + (i + 1)), { variant: "flat", px: 6 })}</div>`).join("");
    return `
      <div class="cz-glow" style="top:330px"></div>
      ${header(deck, n, total, [deck.series, "Get it"])}
      <div class="cz-kicker" style="top:176px;text-align:center">${esc(s.kicker)}</div>
      <h1 class="cz-title fit" data-max="150" style="top:226px;text-align:center"><span class="ink">${esc(s.title[0])}</span></h1>
      <div class="cz-card" id="box" style="left:120px;right:120px;top:420px;height:150px;border-radius:75px;display:flex;align-items:center;gap:26px;padding:0 44px 0 30px;border:3px solid var(--ink);box-shadow:10px 10px 0 var(--accent)">
        <span style="width:84px;height:84px;border-radius:50%;background:var(--gold);border:3px solid var(--ink);flex:none"></span>
        <span style="flex:1;font:900 92px var(--f-display);letter-spacing:-0.03em;color:var(--accent)"><span id="kw"></span><span class="cur" id="kwcur" style="display:inline-block;width:6px;height:78px;margin-left:6px;vertical-align:-8px;background:var(--ink)"></span></span>
        <span style="font:800 38px var(--f-body);color:#1d8cf8">Post</span>
      </div>
      <div class="cz-sub" style="top:618px;text-align:center;font-size:36px;font-weight:600">${esc(s.sub)}</div>
      <div class="cz-card" id="perks" style="left:230px;right:230px;top:700px;padding:22px 34px">${perks}</div>
      <div id="robots" style="position:absolute;left:0;right:0;top:972px;display:flex;justify-content:center;gap:22px">${robots}</div>
      <div class="cz-hand" id="hand" style="left:812px;top:760px;transform-origin:0 50%">${esc(s.hand)}</div>
      <svg class="cz-arrows" viewBox="0 0 1080 1350"><path class="draw" d="M870 820 C 880 860, 870 880, 846 900" /><path class="draw" d="M852 888 l -8 14 l 15 0" /></svg>
      <div style="position:absolute;left:0;right:0;top:1086px;display:flex;justify-content:center">
        <div class="cz-card" id="follow" style="position:relative;display:flex;align-items:center;gap:18px;padding:14px 18px 14px 14px;border-radius:999px">
          <div style="width:70px;height:70px;border-radius:50%;padding:4px;background:conic-gradient(#f9b234,#e4483f,#b13bd6,#4b62f0,#f9b234)"><div style="width:100%;height:100%;border-radius:50%;overflow:hidden;background:#c9d4fb;border:3px solid #fff">${Sprites.face()}</div></div>
          <b style="font:800 32px var(--f-body)">${esc(deck.brand.handle)}</b>
          <span style="padding:10px 22px;border-radius:12px;background:#1d8cf8;color:#fff;font:800 26px var(--f-body)">Follow</span>
        </div>
      </div>
      ${footer(deck, n, total, "free · in your DMs")}`;
  }

  // ------------------------------------------------------------ motion
  function animate(R, root, s) {
    const tl = R.tl;
    const q = (sel) => root.querySelectorAll(sel);
    const one = (sel) => root.querySelector(sel);
    R.slide(one(".cz-top"), 0, { y: -30, dur: 0.4 });
    R.fadeIn(one(".cz-foot"), 0.1, 0.4);
    if (one(".cz-kicker")) R.rise(one(".cz-kicker"), 0.08, { y: 20 });
    q(".cz-title").forEach((el, i) => R.rise(el, 0.14 + i * 0.12, { y: 50, dur: 0.5 }));
    if (one(".cz-sub")) R.rise(one(".cz-sub"), 0.36, { y: 20 });
    if (one(".cz-glow")) R.fadeIn(one(".cz-glow"), 0.2, 0.8);
    q(".cz-arrows .draw, .cz-arrows .ln").forEach((p, i) => {
      const len = p.getTotalLength();
      tl.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.45, ease: "power2.out", immediateRender: true }, (s.type === "loop" ? 0.9 : 1.25) + i * (s.type === "loop" ? 0.09 : 0.06));
    });

    if (s.type === "cover") {
      R.pop(one(".cz-pill"), 0.5, { from: 0.6, sfx: false });
      R.pop(q(".cz-bot"), 1.0, { from: 0.2, stagger: 0.08, sfx: false });
      R.bob(q(".cz-bot .sprite"), 1.8, 6, { amp: 6, period: 0.7 });
      R.rise(one(".cz-hand"), 1.7, { y: 20 });
    }
    if (s.type === "employee") {
      R.slide(q(".cz-skill"), 0.42, { x: -60, stagger: 0.09, dur: 0.5 });
      R.pop(one("#bot"), 0.55, { from: 0.3, sfx: false });
      R.bob(one("#bot"), 1.0, 6, { amp: 8, period: 0.8 });
      R.blink(one("#bot .eyes"), [1.9, 3.4]);
      R.pop(one("#prop"), 0.75, { from: 0.2, rotFrom: -40, sfx: false });
      R.wobble(one("#prop"), 1.2, 6, { deg: 6, period: 1.2 });
      R.pop(one("#dept"), 0.9, { from: 0.6, sfx: false });
      R.fadeIn(one("#status"), 0.6, 0.2);
      R.type(one("#status-text"), s.status, 0.7, { cps: 30, sfx: false });
      tl.to(one("#status .cur"), { opacity: 0, duration: 0.01, yoyo: true, repeat: 9, repeatDelay: 0.38, ease: "none" }, 1.6);
      q(".cz-note").forEach((note, i) => {
        const r = +note.dataset.rot;
        tl.fromTo(note, { y: -50, opacity: 0, rotation: r * 4 }, { y: 0, opacity: 1, rotation: r, duration: 0.45, ease: "back.out(2)", immediateRender: true }, 1.0 + i * 0.1);
      });
      R.rise(one("#hand"), 1.45, { y: 14 });
      R.rise(one("#strip"), 1.6, { y: 30 });
      R.rise(q("#flow > *"), 1.78, { y: 24, stagger: 0.07 });
      R.fadeIn(one("#stepper"), 2.0, 0.4);
      tl.fromTo(one("#stepper .is-now i"), { scale: 0.4 }, { scale: 1, duration: 0.5, ease: "back.out(3)", immediateRender: true }, 2.1);
    }
    if (s.type === "loop") {
      R.pop(one(".cz-pill"), 0.5, { from: 0.6, sfx: false });
      R.pop(q(".loop-bot"), 0.7, { from: 0.2, stagger: 0.09, sfx: false });
      R.bob(q(".loop-bot .sprite"), 1.6, 6, { amp: 5, period: 0.7 });
      tl.fromTo(one("#gate"), { scale: 2, opacity: 0, rotation: 8 }, { scale: 1, opacity: 1, rotation: -3, duration: 0.35, ease: "power4.in", immediateRender: true }, 1.85);
      R.rise(one("#hand"), 2.2, { y: 16 });
    }
    if (s.type === "cta") {
      R.pop(one("#box"), 0.5, { from: 0.7, sfx: false });
      R.type(one("#kw"), s.title[1], 0.9, { cps: 9, sfx: false });
      tl.to(one("#kwcur"), { opacity: 0, duration: 0.01, yoyo: true, repeat: 7, repeatDelay: 0.4, ease: "none" }, 1.5);
      R.rise(one("#perks"), 1.3, { y: 30 });
      R.slide(q(".perk"), 1.45, { x: -30, stagger: 0.12 });
      R.pop(q(".rb"), 1.9, { from: 0.2, stagger: 0.07, sfx: false });
      R.bob(q(".rb"), 2.6, 6, { amp: 6, period: 0.6 });
      R.rise(one("#hand"), 2.2, { y: 16 });
      R.pop(one("#follow"), 2.4, { from: 0.7, sfx: false });
    }
  }

  window.buildSlide = function (root) {
    const deck = window.DECK;
    const n = Math.min(Math.max(1, slideNumber()), deck.slides.length);
    const s = deck.slides[n - 1];
    const total = deck.slides.length;
    root.style.setProperty("--accent", s.color ? `var(--${s.color})` : "var(--r1)");
    const layout = { cover, employee, loop, cta }[s.type];
    root.innerHTML = layout(deck, s, n, total);
    root.querySelectorAll(".fit").forEach((el) => fit(el, +el.dataset.max || 100));
    const R = Reel.create({ timing: { total: 6, scenes: [] } });
    animate(R, root, s);
    R.register();
    return R;
  };
})();
