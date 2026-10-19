// Layouts for the Geoneo HK mortgage carousel. One slide per load, picked by
// the `slide` variable (or ?slide=N). Static slides: LinkedIn documents are PDFs.
(function () {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const ic = (name, stroke = 2.2) => `<span class="icon">${Sprites.icon(name, { stroke })}</span>`;

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

  const top = (D) => `<div class="top"><span class="geo-logo">${window.GEONEO_LOGO}</span><span class="geo-kicker">${esc(D.topic)}</span></div>`;
  const foot = (D, withSource = true) => `<div class="foot"><span>${withSource ? esc(D.source) : ""}</span><span class="handle">${esc(D.brand.handle)}</span></div>`;

  // a 0–100 scale: banks band, HSBC marker, Leader line, brokers at 0.0
  function scale(S, o) {
    const x = (v) => o.x0 + (v / 100) * o.w;
    const lead = parseFloat(S.leaderScore);
    const lo = parseFloat(S.banksLow);
    const line = parseFloat(S.line);
    let h = "";
    o.rows.forEach((r) => {
      h += `<i class="track" style="left:${o.x0}px;width:${o.w}px;top:${r.y - 2}px"></i>`;
      h += `<div class="rowlab" style="left:${o.labX}px;top:${r.y - (r.sub ? 26 : 16)}px">${esc(r.label)}${r.sub ? `<small>${esc(r.sub)}</small>` : ""}</div>`;
      if (r.kind === "banks") {
        h += `<i class="band" style="left:${x(lo)}px;width:${x(lead) - x(lo)}px;top:${r.y - 17}px"></i>`;
        h += `<span class="val" style="left:${x(lo) - 78}px;top:${r.y - 16}px">${S.banksLow}</span>`;
        h += `<i class="dot is-lead" style="left:${x(lead)}px;top:${r.y}px"></i>`;
        h += `<span class="val is-lead" style="left:${x(lead) + 26}px;top:${r.y - 16}px">${S.leaderScore}</span>`;
        h += `<span class="lab" style="left:${x(lead) + 26}px;top:${r.y + 20}px">${esc(S.leader)}</span>`;
      } else {
        h += `<i class="dot is-zero" style="left:${x(0)}px;top:${r.y}px"></i>`;
        h += `<span class="val" style="left:${x(0) + 26}px;top:${r.y - 16}px">${S.brokerScore}</span>`;
      }
    });
    const y0 = o.rows[0].y - o.lineTop;
    const y1 = o.rows[o.rows.length - 1].y + 40;
    h += `<i class="rule" style="left:${x(line) - 1}px;top:${y0}px;height:${y1 - y0}px"></i>`;
    h += `<span class="lab" style="left:${x(line) + 12}px;top:${y0 - 6}px;color:var(--geo-text)">Leader line &middot; ${S.line}</span>`;
    if (o.axis) {
      h += `<i class="track" style="left:${o.x0}px;width:${o.w}px;top:${y1 + 18}px;height:1px;background:var(--geo-grey)"></i>`;
      h += `<span class="lab" style="left:${x(0) - 6}px;top:${y1 + 30}px">0</span>`;
      h += `<span class="lab" style="left:${x(100) - 34}px;top:${y1 + 30}px">100</span>`;
    }
    return h;
  }

  const L = {
    cover: (D, S) => `
      ${top(D)}
      <h1 class="geo-h1 ttl" style="--size:108px;top:250px"><div>Decades of</div><div>expertise.</div><div><em>Zero AI visibility.</em></div></h1>
      <p class="geo-sub lede" style="top:600px;max-width:880px">What we found when we scanned Hong Kong&rsquo;s mortgage sector for AI visibility.</p>
      <div class="geo-card cover-scale">
        <div class="geo-kicker">AI visibility score, out of 100</div>
        ${scale(S, { x0: 300, w: 520, labX: 0, lineTop: 50, axis: false, rows: [
          { y: 150, label: "Retail banks", kind: "banks" },
          { y: 240, label: "Specialist brokers", kind: "zero" },
        ] })}
      </div>
      <div class="swipe">Swipe &rarr;</div>
      ${foot(D, false)}`,

    scan: (D, S) => `
      ${top(D)}
      <div class="geo-kicker is-teal kick">The scan</div>
      <h2 class="geo-h2 ttl" style="--size:72px">We asked AI what mortgage buyers ask.</h2>
      <p class="geo-sub lede" style="top:380px">The same questions, on the same engines, for every brand.</p>
      <div class="tiles">
        <div class="geo-card tile" style="position:relative"><b>${S.brands}</b><span>Mortgage brands</span><span class="geo-ic" style="position:absolute;right:34px;top:34px;width:72px;height:72px">${ic("bank")}</span></div>
        <div class="geo-card tile" style="position:relative"><b>${S.questions}</b><span>Shared buyer questions</span><span class="geo-ic" style="position:absolute;right:34px;top:34px;width:72px;height:72px">${ic("chat")}</span></div>
        <div class="geo-card tile" style="position:relative"><b>${S.engines}</b><span>AI engines</span><div class="robots">${["#0e7c86", "#67d6f2", "#b8b8b8", "#0e7c86", "#67d6f2", "#b8b8b8"].map((c) => `<span class="sprite">${Sprites.robot(c, { variant: "flat", px: 3 })}</span>`).join("")}</div></div>
        <div class="geo-card tile" style="position:relative"><b><small>/</small>100</b><span>AI visibility score per brand</span><span class="geo-ic" style="position:absolute;right:34px;top:34px;width:72px;height:72px">${ic("chart")}</span></div>
      </div>
      ${foot(D)}`,

    chart: (D, S) => `
      ${top(D)}
      <div class="geo-kicker is-teal kick">The results</div>
      <h2 class="geo-h2 ttl" style="--size:72px">Every bank showed up. Neither broker did.</h2>
      <div class="geo-card chart abs">
        <div class="geo-kicker" style="position:absolute;left:40px;top:36px">AI visibility score, out of 100</div>
        <div style="position:absolute;left:40px;top:0;right:40px;bottom:0">
          ${scale(S, { x0: 290, w: 560, labX: 0, lineTop: 70, axis: true, rows: [
            { y: 200, label: `${S.banks} retail banks`, sub: `${S.banksLow} to ${S.banksHigh}`, kind: "banks" },
            { y: 320, label: "Specialist broker", sub: "unnamed", kind: "zero" },
            { y: 420, label: "Specialist broker", sub: "unnamed", kind: "zero" },
          ] })}
        </div>
        <div class="lab" style="left:40px;bottom:30px;font-size:18px">Scores across ${S.questions} shared buyer questions and ${S.engines} AI engines.</div>
      </div>
      ${foot(D)}`,

    contrast: (D, S) => `
      ${top(D)}
      <div class="geo-kicker is-teal kick">The contrast</div>
      <h2 class="geo-h2 ttl" style="--size:72px">Same questions. Very different answers.</h2>
      <div class="geo-card half abs" style="left:72px">
        <div class="who">${esc(S.leader)}</div>
        <div class="big is-lead">${S.leaderScore}</div>
        <p>The only brand above the ${S.line}-point Leader line.</p>
        <div class="meter">
          <i class="track" style="left:0;right:0;top:56px"></i>
          <i class="rule" style="left:${0.6 * 376}px;top:24px;height:62px"></i>
          <span class="lab" style="left:${0.6 * 376 - 90}px;top:0">Leader ${S.line}</span>
          <i class="dot is-lead" style="left:${0.662 * 376}px;top:58px"></i>
        </div>
      </div>
      <div class="geo-card half abs" style="left:552px">
        <div class="who">${S.brokers} specialist brokers</div>
        <div class="big is-zero">${S.brokerScore}</div>
        <p>Invisible across all ${S.questions} buyer questions.</p>
        <div class="cells">
          ${[0, 1].map(() => `<span class="lab">Broker &middot; not named in any answer</span><div class="r">${"<i></i>".repeat(8)}</div><div class="r" style="margin-bottom:16px">${"<i></i>".repeat(8)}</div>`).join("")}
        </div>
      </div>
      ${foot(D)}`,

    paradox: (D) => `
      ${top(D)}
      <div class="geo-kicker is-teal kick">The paradox</div>
      <h2 class="geo-h2 ttl" style="--size:72px">Decades of expertise, client trust and market share.</h2>
      <div class="assets">
        ${[
          ["sparkle", "Expertise"],
          ["users", "Client trust"],
          ["chart", "Market share"],
        ].map(([i, t]) => `<div class="geo-card asset"><span class="geo-ic">${ic(i)}</span><b>${t}</b><span class="ok">${ic("check", 3)}</span></div>`).join("")}
      </div>
      <div class="geo-card lost abs"><span class="sprite">${Sprites.robot("#b8b8b8", { variant: "flat", px: 8 })}</span><p>And AI engines still <em>can&rsquo;t find you.</em></p></div>
      ${foot(D)}`,

    why: (D) => `
      ${top(D)}
      <div class="geo-kicker is-teal kick">Why</div>
      <h2 class="geo-h2 ttl" style="--size:72px">The expertise lives where AI can&rsquo;t look.</h2>
      <div class="geo-card col abs" style="left:72px">
        <h5>Where brokers&rsquo; expertise lives</h5>
        <div class="it"><span class="geo-ic">${ic("user")}</span>Advisers</div>
        <div class="it"><span class="geo-ic">${ic("calculator")}</span>Rate calculators</div>
        <div class="it"><span class="geo-ic">${ic("phone")}</span>Phone calls</div>
      </div>
      <div class="geo-card col is-empty abs" style="left:552px">
        <h5>What AI can read</h5>
        <div class="it">Clear facts<span class="ghost"></span></div>
        <div class="it">Dated facts<span class="ghost"></span></div>
        <div class="it">Machine-readable<span class="ghost"></span></div>
      </div>
      <p class="verdict abs">AI can only cite what it can <em>retrieve and verify.</em></p>
      ${foot(D)}`,

    meaning: (D, S) => `
      ${top(D)}
      <div class="geo-kicker is-teal kick">What a zero means</div>
      <h2 class="geo-h2 ttl" style="--size:72px">A ${S.brokerScore} is not a verdict on the business.</h2>
      <div class="eq abs">
        <div class="line"><b>${S.brokerScore}</b><span class="op">&ne;</span><span>a lack of authority</span></div>
        <div class="line"><b>${S.brokerScore}</b><span class="op">&ne;</span><span>a lack of quality</span></div>
        <div class="line is-yes"><b>${S.brokerScore}</b><span class="op">=</span><span>knowledge not published in a form AI can read</span></div>
      </div>
      ${foot(D)}`,

    todo: (D) => `
      ${top(D)}
      <div class="geo-kicker is-teal kick">What to do</div>
      <h2 class="geo-h2 ttl" style="--size:72px">Make what you know readable for AI.</h2>
      <div class="steps">
        <div class="geo-card todo-step" style="position:relative"><span class="geo-ic">${ic("file")}</span><b>Turn expertise into public facts AI can check</b><div class="chips"><span class="geo-chip is-teal">Rates</span><span class="geo-chip is-teal">Fees</span><span class="geo-chip is-teal">Eligibility</span><span class="geo-chip is-teal">Licensing</span></div></div>
        <div class="geo-card todo-step" style="position:relative"><span class="geo-ic">${ic("calendar")}</span><b>Keep them dated and consistent</b><span>On your own site and across every listing.</span></div>
        <div class="geo-card todo-step" style="position:relative"><span class="geo-ic">${ic("chat")}</span><b>Answer the questions buyers actually ask AI</b><span>Start from the buyer&rsquo;s question, not your product page.</span></div>
      </div>
      ${foot(D)}`,

    ask: (D) => `
      ${top(D)}
      <div class="geo-kicker is-teal kick">Over to you</div>
      <h2 class="geo-h2 ask-q" style="--size:68px"><div>Which is harder for your team:</div><div><em>creating new content,</em> or making what you already know readable for AI?</div></h2>
      <div class="geo-card choice abs" style="left:72px"><div class="geo-kicker">Option A</div><b>Creating new content</b></div>
      <div class="geo-card choice abs" style="left:396px"><div class="geo-kicker">Option B</div><b>Making what we know readable</b></div>
      <div class="host"><div class="flip" data-presenter></div></div>
      <div class="sign"><span class="geo-logo">${window.GEONEO_LOGO}</span><span>${esc(D.brand.handle)}</span></div>`,
  };

  window.buildSlide = function (root) {
    const D = window.DECK;
    const n = Math.min(Math.max(1, slideNumber()), D.slides.length);
    const s = D.slides[n - 1];
    root.innerHTML = `<div class="geo-bg${n % 2 ? "" : " is-white"}"></div>` + L[s.type](D, D.scan, s);
    Sprites.hydrate(root);
    const R = Reel.create({ timing: { total: 1, scenes: [] } });
    R.register();
    return R;
  };
})();
