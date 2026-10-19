// Sprite + icon library for the Pixel Crew style. Everything is generated as
// inline SVG strings so a composition needs no image files and renders the
// same on every machine.
(function () {
  const INK = "#0e0f17";

  // ---------- colour helpers ----------
  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix(hex, other, t) {
    const a = hexToRgb(hex);
    const b = hexToRgb(other);
    const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  }
  const shade = (hex, t = 0.28) => mix(hex, "#000000", t);
  const tint = (hex, t = 0.3) => mix(hex, "#ffffff", t);

  // ---------- pixel robots ----------
  // K outline · C body · D shade · H highlight · E eye
  const MAPS = {
    // outlined "crew" robot used in the reel
    crew: [
      "....KKKKKKKK....",
      "...KHHHHHHHHK...",
      "..KCCCCCCCCCCK..",
      ".KCCCCCCCCCCCCK.",
      ".KCCEEECCEEECCK.",
      "KKCCCCCCCCCCCCKK",
      "KCCCCCCCCCCCCCCK",
      "KDKCCCCCCCCCCKDK",
      "KKKCCCCCCCCCCKKK",
      "..KDCCCCCCCCDK..",
      "..KDDDKKKKDDDK..",
      "..KDDK....KDDK..",
      "..KKKK....KKKK..",
    ],
    // flat, outline-free robot used in the editorial carousel
    flat: [
      "...CCCCCCCC...",
      "..CCCCCCCCCC..",
      "..CEEECCEEEC..",
      "..CEEECCEEEC..",
      "..CCCCCCCCCC..",
      "CCCCCCCCCCCCCC",
      "CC.CCCCCCCC.CC",
      "...CCCCCCCC...",
      "...CCC..CCC...",
      "...CCC..CCC...",
    ],
    // tiny 8x7 head used inside chips and avatars
    mini: [
      ".KKKKKK.",
      "KCCCCCCK",
      "KCECCECK",
      "KCCCCCCK",
      "KKCCCCKK",
      ".KCKKCK.",
      ".KK..KK.",
    ],
  };

  function robot(color, opts = {}) {
    const map = MAPS[opts.variant || "crew"];
    const px = opts.px || 10;
    const w = map[0].length;
    const h = map.length;
    const fill = {
      C: color,
      D: shade(color, 0.3),
      H: tint(color, 0.28),
      K: INK,
      E: INK,
    };
    let body = "";
    let eyes = "";
    map.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        if (ch === ".") return;
        const r = `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${fill[ch]}"/>`;
        if (ch === "E") eyes += r;
        else body += r;
      });
    });
    // eyes sit on top of a body-coloured backing so a blink (scaleY) reveals body
    const eyeBack = map
      .map((row, y) => [...row].map((ch, x) => (ch === "E" ? `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${color}"/>` : "")).join(""))
      .join("");
    const eyeRows = map.map((r, y) => (r.includes("E") ? y : -1)).filter((y) => y >= 0);
    const eyeCy = eyeRows.length ? (eyeRows[0] + eyeRows[eyeRows.length - 1] + 1) / 2 : 0;
    return `<svg viewBox="0 0 ${w} ${h}" width="${w * px}" height="${h * px}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">${body}${eyeBack}<g class="eyes" style="transform-origin:${w / 2}px ${eyeCy}px">${eyes}</g></svg>`;
  }

  // ---------- pixel props (held next to a robot) ----------
  // K ink · A accent · W white · S accent shade
  const PROPS = {
    magnifier: [
      "...KKKKK.....",
      "..K.....K....",
      ".K..WW...K...",
      ".K..W....K...",
      ".K.......K...",
      ".K.......K...",
      "..K.....K....",
      "...KKKKKA....",
      "........AA...",
      ".........AA..",
      "..........AA.",
      "...........A.",
    ],
    pencil: [
      "..........KK",
      ".........KAK",
      "........KAAK",
      ".......KAAK.",
      "......KAAK..",
      ".....KAAK...",
      "....KAAK....",
      "...KAAK.....",
      "..KWWK......",
      "..KWK.......",
      ".KKK........",
      "KK..........",
    ],
    wrench: [
      "..KK....KK..",
      "..KAK..KAK..",
      "..KAAKKAAK..",
      "...KAAAAK...",
      "....KAAK....",
      "....KAAK....",
      "....KAAK....",
      "....KAAK....",
      "....KAAK....",
      "....KSSK....",
      "....KKKK....",
    ],
    rocket: [
      ".....KK.....",
      "....KAAK....",
      "...KAAAAK...",
      "...KAWWAK...",
      "...KAWWAK...",
      "...KAAAAK...",
      "..KKAAAAKK..",
      ".KAKAAAAKAK.",
      ".KK.KAAK.KK.",
      ".....KK.....",
      "....K..K....",
      "...K....K...",
    ],
    sliders: [
      "..KK........",
      "KKAAKKKKKKKK",
      "..KK........",
      "............",
      ".......KK...",
      "KKKKKKKAAKKK",
      ".......KK...",
      "............",
      "....KK......",
      "KKKKAAKKKKKK",
      "....KK......",
    ],
    chart: [
      "K...........",
      "K.........AA",
      "K.........AA",
      "K......SS.AA",
      "K......SS.AA",
      "K...AA.SS.AA",
      "K...AA.SS.AA",
      "K.S.AA.SS.AA",
      "K.S.AA.SS.AA",
      "KKKKKKKKKKKK",
    ],
    chat: [
      ".KKKKKKKKKK.",
      "KWWWWWWWWWWK",
      "KWWWWWWWWWWK",
      "KWAAWWAAWWAK",
      "KWWWWWWWWWWK",
      "KWWWWWWWWWWK",
      ".KKKKKWWKKK.",
      ".....KWK....",
      ".....KK.....",
    ],
  };

  function pixels(map, palette, px = 10) {
    const w = map[0].length;
    const h = map.length;
    let body = "";
    map.forEach((row, y) =>
      [...row].forEach((ch, x) => {
        if (ch !== "." && palette[ch]) body += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${palette[ch]}"/>`;
      }),
    );
    return `<svg viewBox="0 0 ${w} ${h}" width="${w * px}" height="${h * px}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  }

  function prop(name, accent = "#2350f0", px = 10) {
    return pixels(PROPS[name] || PROPS.magnifier, { K: INK, A: accent, S: shade(accent, 0.25), W: "#ffffff" }, px);
  }

  // ---------- Claude-style starburst ----------
  function burst(color = "#d97757", rays = 10) {
    let arms = "";
    for (let i = 0; i < rays; i++) {
      const a = (360 / rays) * i + (i % 2 ? 7 : 0);
      const len = i % 3 === 0 ? 46 : i % 2 ? 40 : 43;
      arms += `<rect x="-5.5" y="${-len}" width="11" height="${len}" rx="5.5" fill="${color}" transform="rotate(${a})"/>`;
    }
    return `<svg viewBox="-50 -50 100 100" xmlns="http://www.w3.org/2000/svg"><g>${arms}</g><circle r="9" fill="${color}"/></svg>`;
  }

  // ---------- line icons (24 grid, stroke = currentColor) ----------
  const P = {
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    key: '<circle cx="7.5" cy="12" r="3.5"/><path d="M11 12h10M17.5 12v3.5M20.5 12v2.5"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/><path d="M12 14.5v2.5"/>',
    folder: '<path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H9l2 2.5h8.5A1.5 1.5 0 0 1 21 10v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18z"/>',
    file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
    mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.2 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
    search: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5"/>',
    user: '<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20.5c1-4 4-6 7.5-6s6.5 2 7.5 6"/>',
    inbox: '<path d="M3.5 13.5L6 5h12l2.5 8.5V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19z"/><path d="M3.5 13.5H9l1 2h4l1-2h5.5"/>',
    code: '<path d="M8.5 7L3.5 12l5 5M15.5 7l5 5-5 5"/>',
    chat: '<path d="M4 5.5h16v10H10l-4.5 4v-4H4z"/>',
    refresh: '<path d="M19.5 9A8 8 0 0 0 5 8M4.5 15a8 8 0 0 0 14.5 1"/><path d="M19.5 4v5h-5M4.5 20v-5h5"/>',
    question: '<path d="M9 9a3 3 0 1 1 4.5 2.6c-1 .6-1.5 1.3-1.5 2.4"/><path d="M12 17.5v.5"/>',
    list: '<path d="M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.5M4.5 12h.5M4.5 17.5h.5"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
    hash: '<path d="M9.5 4L7.5 20M16.5 4l-2 16M4.5 9h16M3.5 15h16"/>',
    pen: '<path d="M4 20l1-4.5L16 4.5l3.5 3.5L8.5 19z"/><path d="M14 6.5L17.5 10"/>',
    rocket: '<path d="M12 3c3.5 2 5 5.5 5 9.5l-2.5 3h-5L7 12.5C7 8.5 8.5 5 12 3z"/><circle cx="12" cy="10" r="1.8"/><path d="M9.5 15.5L7 19l3-.5M14.5 15.5L17 19l-3-.5"/>',
    chart: '<path d="M4 4v16h16"/><path d="M8 15l3.5-4 3 2.5L19 8"/>',
    sliders: '<path d="M5 6h14M5 12h14M5 18h14"/><circle cx="9" cy="6" r="2" fill="white"/><circle cx="15" cy="12" r="2" fill="white"/><circle cx="8" cy="18" r="2" fill="white"/>',
    image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M4 17l5-4.5 4 3.5 3-2.5 4 3.5"/>',
    play: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M10 9v6l5-3z"/>',
    megaphone: '<path d="M4 10v4h3l7 4V6L7 10z"/><path d="M17.5 9.5a3.5 3.5 0 0 1 0 5"/>',
    bolt: '<path d="M13 3L5 13.5h6l-1 7.5 8-10.5h-6z"/>',
    send: '<path d="M4 11.5L20 4l-6 16-3-6.5z"/><path d="M11 13.5L20 4"/>',
    dollar: '<path d="M12 3.5v17M16 7.5c-.6-1.4-2.1-2-4-2-2.4 0-4 1.1-4 3s1.7 2.6 4 3 4 1.2 4 3.1-1.6 3-4 3c-2 0-3.5-.7-4.2-2.2"/>',
    users: '<circle cx="9" cy="9" r="3.5"/><path d="M2.5 19.5c.7-3.5 3.3-5.5 6.5-5.5s5.8 2 6.5 5.5"/><path d="M15.5 5.6a3.5 3.5 0 0 1 0 6.8M17.5 14.3c2.1.7 3.5 2.6 4 5.2"/>',
    tv: '<rect x="3" y="5" width="18" height="12.5" rx="2"/><path d="M8.5 20.5h7"/>',
    sparkle: '<path d="M12 3.5l2 6.5 6.5 2-6.5 2-2 6.5-2-6.5-6.5-2 6.5-2z"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
    arrowRight: '<path d="M4 12h15M13.5 6.5L19 12l-5.5 5.5"/>',
  };

  function icon(name, opts = {}) {
    const sw = opts.stroke || 2.4;
    const color = opts.color || "currentColor";
    const fill = opts.fill || "none";
    return `<svg viewBox="0 0 24 24" fill="${fill}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">${P[name] || ""}</svg>`;
  }

  // simple filled glyphs for social / tool "logos" (generic shapes, not brand marks)
  const GLYPH = {
    infinity:
      '<path d="M7 8.2c-2.3 0-4 1.7-4 3.8s1.7 3.8 4 3.8c2 0 3.3-1.6 5-3.8 1.7-2.2 3-3.8 5-3.8 2.3 0 4 1.7 4 3.8s-1.7 3.8-4 3.8c-2 0-3.3-1.6-5-3.8C10.3 9.8 9 8.2 7 8.2z" fill="none" stroke="currentColor" stroke-width="2.6"/>',
    camera:
      '<rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="17" cy="7" r="1.3" fill="currentColor"/>',
    note: '<path d="M14 3.5c.4 2.6 2.3 4.4 5 4.6v3.2c-1.9 0-3.5-.6-5-1.6v6.1a5 5 0 1 1-5-5h.2v3.3H9a1.8 1.8 0 1 0 1.8 1.8V3.5z" fill="currentColor"/>',
    alien:
      '<circle cx="12" cy="13.5" r="7" fill="currentColor"/><circle cx="9.3" cy="13" r="1.3" fill="white"/><circle cx="14.7" cy="13" r="1.3" fill="white"/><path d="M9.3 16.3c1.6 1 3.8 1 5.4 0" stroke="white" stroke-width="1.2" fill="none" stroke-linecap="round"/><circle cx="17.5" cy="4.5" r="1.6" fill="currentColor"/><path d="M12 6.5l1.2-4 4.3 2" stroke="currentColor" stroke-width="1.3" fill="none"/>',
  };

  function glyph(name) {
    return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${GLYPH[name] || ""}</svg>`;
  }

  // ---------- presenter (replace with your own avatar PNG/SVG any time) ----------
  // Two looks share one skeleton (same canvas, joints and class names, so the
  // reel's arm wobble / blink keep working):
  //   "tee"  flat cartoon creator: black tee, spiky hair
  //   "suit" navy suit, white shirt, charcoal tie, wavy swept-back hair
  // Pick per call (`presenter({ look: "suit" })`) or for a whole project with
  // `window.AVATAR = { look: "suit", ... }` before Sprites.hydrate().
  function presenter(opts = {}) {
    const o = { ...(window.AVATAR || {}), ...opts };
    return o.look === "suit" ? presenterSuit(o) : presenterTee(o);
  }

  function presenterSuit(opts) {
    const skin = opts.skin || "#d8a487";
    const skinShade = shade(skin, 0.14);
    const hair = opts.hair || "#1a1619";
    const hairHi = opts.hairHighlight || "#3b3439";
    const suit = opts.suit || "#253163";
    const suitShade = shade(suit, 0.3);
    const lapel = tint(suit, 0.1);
    const tie = opts.tie || "#3b3a40";
    const shirt = "#fbfbfd";
    const s = `stroke="${INK}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"`;
    const thin = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
    return `<svg viewBox="${opts.viewBox || "0 0 420 1000"}" preserveAspectRatio="${opts.viewBox ? "xMidYMin slice" : "xMidYMid meet"}" xmlns="http://www.w3.org/2000/svg">
  <g class="p-legs">
    <path d="M150 640 L146 900 L198 900 L206 700 L214 700 L222 900 L274 900 L270 640 Z" fill="${suit}" ${s}/>
    <path d="M206 704 L206 760" stroke="${suitShade}" stroke-width="5"/>
    <path d="M126 904 h78 q12 0 12 14 v10 q0 8-10 8 h-88 q-12 0-12-11 q0-21 20-21z" fill="#1e1b20" ${s}/>
    <path d="M216 904 h78 q20 0 20 21 q0 11-12 11 h-88 q-10 0-10-8 v-10 q0-14 12-14z" fill="#1e1b20" ${s}/>
    <path d="M136 914 h40 M240 914 h40" stroke="#4a4550" stroke-width="4" stroke-linecap="round"/>
  </g>
  <g class="p-arm-down">
    <path d="M128 452 Q106 532 108 616" fill="none" stroke="${INK}" stroke-width="50" stroke-linecap="round"/>
    <path d="M128 452 Q106 532 108 616" fill="none" stroke="${suit}" stroke-width="36" stroke-linecap="round"/>
    <path d="M108 620 L108 636" stroke="${INK}" stroke-width="44" stroke-linecap="round"/>
    <path d="M108 620 L108 636" stroke="${shirt}" stroke-width="30" stroke-linecap="round"/>
    <circle cx="109" cy="656" r="22" fill="${skin}" ${s}/>
  </g>
  <g class="p-body">
    <path d="M150 410 Q210 394 270 410 L300 440 L294 524 L276 526 L280 676 L140 676 L144 526 L126 524 L120 440 Z" fill="${suit}" ${s}/>
    <path d="M176 402 L244 402 L232 566 L188 566 Z" fill="${shirt}" ${thin}/>
    <path d="M200 440 L220 440 L227 548 L210 566 L193 548 Z" fill="${tie}" ${thin}/>
    <path d="M199 424 L221 424 L224 444 L196 444 Z" fill="${tie}" ${thin}/>
    <path d="M180 398 L210 428 L198 448 L172 412 Z" fill="${shirt}" ${thin}/>
    <path d="M240 398 L210 428 L222 448 L248 412 Z" fill="${shirt}" ${thin}/>
    <path d="M172 410 L208 566 L194 574 L152 480 L166 448 Z" fill="${lapel}" ${thin}/>
    <path d="M248 410 L212 566 L226 574 L268 480 L254 448 Z" fill="${lapel}" ${thin}/>
    <path d="M140 660 L210 640 L280 660" fill="none" stroke="${suitShade}" stroke-width="5"/>
    <circle cx="210" cy="600" r="6" fill="${suitShade}" stroke="${INK}" stroke-width="3"/>
    <path d="M240 486 L266 478 L268 498 L242 506 Z" fill="${shirt}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M236 504 L276 494" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
  </g>
  <g class="p-head">
    <g fill="${hair}" stroke="${INK}" stroke-width="6" stroke-linejoin="round">
      <path d="M314 232 C 340 240, 356 260, 354 288 C 342 272, 326 268, 308 270 Z"/>
      <path d="M132 236 C 108 244, 96 264, 100 290 C 110 274, 126 268, 142 270 Z"/>
    </g>
    <g fill="none" stroke-linecap="round">
      <path d="M194 114 C 190 102, 196 94, 208 90" stroke="${INK}" stroke-width="12"/>
      <path d="M194 114 C 190 102, 196 94, 208 90" stroke="${hair}" stroke-width="4"/>
      <path d="M266 106 C 276 98, 288 98, 298 104" stroke="${INK}" stroke-width="12"/>
      <path d="M266 106 C 276 98, 288 98, 298 104" stroke="${hair}" stroke-width="4"/>
    </g>
    <path d="M132 296 C 118 288, 114 268, 120 252 C 110 226, 114 196, 130 176 C 136 140, 168 116, 204 110 C 236 92, 284 98, 306 128 C 326 146, 334 176, 328 204 C 334 226, 330 250, 316 266 C 322 280, 314 292, 300 290 L 286 240 L 140 240 C 140 262, 140 282, 132 296 Z" fill="${hair}" ${s}/>
    <rect x="193" y="350" width="34" height="54" fill="${skinShade}" ${s}/>
    <ellipse cx="143" cy="284" rx="13" ry="21" fill="${skin}" ${s}/>
    <ellipse cx="277" cy="284" rx="13" ry="21" fill="${skin}" ${s}/>
    <path d="M146 236 Q146 182 210 178 Q274 182 274 236 L274 300 Q270 372 210 388 Q150 372 146 300 Z" fill="${skin}" ${s}/>
    <path d="M142 266 C 136 240, 140 214, 158 198 C 176 210, 198 212, 222 202 C 246 192, 266 198, 278 220 C 284 236, 286 252, 284 268 L 300 262 C 318 236, 322 200, 306 172 C 290 142, 254 128, 218 132 C 184 134, 156 148, 144 172 C 134 196, 134 236, 142 266 Z" fill="${hair}" ${s}/>
    <path d="M160 200 C 148 220, 152 244, 142 266" fill="none" stroke="${INK}" stroke-width="18" stroke-linecap="round"/>
    <path d="M160 200 C 148 220, 152 244, 142 266" fill="none" stroke="${hair}" stroke-width="8" stroke-linecap="round"/>
    <g fill="none" stroke="${hairHi}" stroke-linecap="round">
      <path d="M170 186 C 196 160, 236 152, 272 166" stroke-width="7"/>
      <path d="M188 136 C 222 120, 268 122, 298 146" stroke-width="6"/>
      <path d="M302 186 C 314 204, 318 226, 312 246" stroke-width="5"/>
    </g>
    <g class="p-face">
      <path d="M162 246 Q180 238 198 244" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
      <path d="M222 244 Q240 238 258 246" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
      <g class="p-eyes" style="transform-origin:210px 274px">
        <path d="M168 273 Q182 263 196 273" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
        <path d="M224 273 Q238 263 252 273" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
        <ellipse cx="182" cy="276" rx="8" ry="9.5" fill="#22160f"/>
        <ellipse cx="238" cy="276" rx="8" ry="9.5" fill="#22160f"/>
        <circle cx="185" cy="272" r="3" fill="#fff"/>
        <circle cx="241" cy="272" r="3" fill="#fff"/>
      </g>
      <path d="M212 270 Q207 292 204 302 Q211 307 219 302" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="p-mouth" d="M192 332 Q210 343 230 332 Q211 338 192 332 Z" fill="#b8676a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    </g>
  </g>
  <g class="p-arm-up" style="transform-origin:280px 440px">
    <path d="M282 446 Q326 370 334 278" fill="none" stroke="${INK}" stroke-width="50" stroke-linecap="round"/>
    <path d="M282 446 Q326 370 334 278" fill="none" stroke="${suit}" stroke-width="36" stroke-linecap="round"/>
    <path d="M335 270 L337 256" stroke="${INK}" stroke-width="44" stroke-linecap="round"/>
    <path d="M335 270 L337 256" stroke="${shirt}" stroke-width="30" stroke-linecap="round"/>
    <g class="p-hand">
      <rect x="314" y="196" width="50" height="58" rx="18" fill="${skin}" ${s}/>
      <rect x="332" y="142" width="20" height="72" rx="10" fill="${skin}" ${s}/>
      <path d="M318 226 h-10" ${s}/>
    </g>
  </g>
</svg>`;
  }

  function presenterTee(opts) {
    const skin = opts.skin || "#e8b48e";
    const skinShade = shade(skin, 0.12);
    const hair = opts.hair || "#1c1b20";
    const tee = opts.tee || "#17171c";
    const pants = opts.pants || "#25262d";
    const s = `stroke="${INK}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"`;
    return `<svg viewBox="${opts.viewBox || "0 0 420 1000"}" preserveAspectRatio="${opts.viewBox ? "xMidYMin slice" : "xMidYMid meet"}" xmlns="http://www.w3.org/2000/svg">
  <g class="p-legs">
    <path d="M150 640 L146 900 L198 900 L206 700 L214 700 L222 900 L274 900 L270 640 Z" fill="${pants}" ${s}/>
    <path d="M128 902 h78 q10 0 10 14 v12 q0 8-10 8 h-86 q-12 0-12-12 q0-22 20-22z" fill="#fff" ${s}/>
    <path d="M214 902 h78 q20 0 20 22 q0 12-12 12 h-86 q-10 0-10-8 v-12 q0-14 10-14z" fill="#fff" ${s}/>
  </g>
  <g class="p-arm-down">
    <path d="M128 452 Q104 540 108 640" fill="none" stroke="${INK}" stroke-width="44" stroke-linecap="round"/>
    <path d="M128 452 Q104 540 108 640" fill="none" stroke="${skin}" stroke-width="30" stroke-linecap="round"/>
    <circle cx="109" cy="652" r="22" fill="${skin}" ${s}/>
  </g>
  <g class="p-body">
    <path d="M150 410 Q210 392 270 410 L300 440 L292 520 L272 520 L276 660 L144 660 L148 520 L122 520 L118 440 Z" fill="${tee}" ${s}/>
    <path d="M178 406 Q210 436 242 406" fill="none" stroke="#3a3a44" stroke-width="5"/>
    <path d="M190 440 Q210 452 230 440" fill="none" stroke="#c9a24a" stroke-width="3"/>
  </g>
  <g class="p-arm-up" style="transform-origin:280px 440px">
    <path d="M282 446 Q330 360 338 250" fill="none" stroke="${INK}" stroke-width="44" stroke-linecap="round"/>
    <path d="M282 446 Q330 360 338 250" fill="none" stroke="${skin}" stroke-width="30" stroke-linecap="round"/>
    <path d="M268 470 L300 438 L318 470 L290 500 Z" fill="${tee}" ${s}/>
    <g class="p-hand">
      <rect x="314" y="196" width="50" height="58" rx="18" fill="${skin}" ${s}/>
      <rect x="332" y="142" width="20" height="72" rx="10" fill="${skin}" ${s}/>
      <path d="M318 226 h-10" ${s}/>
    </g>
  </g>
  <g class="p-head">
    <rect x="190" y="346" width="40" height="52" fill="${skinShade}" ${s}/>
    <ellipse cx="128" cy="276" rx="16" ry="24" fill="${skin}" ${s}/>
    <ellipse cx="292" cy="276" rx="16" ry="24" fill="${skin}" ${s}/>
    <path d="M132 230 Q130 168 210 162 Q290 168 288 230 L292 300 Q286 372 210 380 Q134 372 128 300 Z" fill="${skin}" ${s}/>
    <path d="M124 252 Q112 160 168 132 Q210 108 258 128 Q306 148 298 254 Q286 214 270 200 Q236 214 196 196 Q164 186 150 214 Q134 230 124 252 Z" fill="${hair}" ${s}/>
    <path d="M176 136 L188 108 L204 132 L222 104 L236 132 L254 112 L262 140" fill="${hair}" ${s}/>
    <g class="p-face">
      <path d="M162 246 Q180 236 196 246" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
      <path d="M226 246 Q242 236 258 246" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
      <g class="p-eyes" style="transform-origin:210px 274px">
        <ellipse cx="180" cy="274" rx="9" ry="12" fill="${INK}"/>
        <ellipse cx="240" cy="274" rx="9" ry="12" fill="${INK}"/>
        <circle cx="183" cy="270" r="3" fill="#fff"/>
        <circle cx="243" cy="270" r="3" fill="#fff"/>
      </g>
      <path d="M210 284 Q204 304 214 308" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <path class="p-mouth" d="M180 326 Q210 352 240 326 Q210 336 180 326 Z" fill="#7a2b2b" ${s} stroke-width="6"/>
    </g>
  </g>
</svg>`;
  }

  // head-and-shoulders crop for avatar circles
  function face(opts = {}) {
    return presenter({ ...opts, viewBox: "70 92 280 300" });
  }

  // ---------- background doodles (seeded, deterministic) ----------
  function rng(seed) {
    let s = seed >>> 0 || 1;
    return () => {
      s ^= s << 13;
      s ^= s >>> 17;
      s ^= s << 5;
      return ((s >>> 0) % 100000) / 100000;
    };
  }
  const DOODLE = {
    tri: '<path d="M32 10 L56 52 H8 Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>',
    ring: '<circle cx="32" cy="32" r="18" fill="none" stroke="currentColor" stroke-width="4"/>',
    cross: '<path d="M16 16 L48 48 M48 16 L16 48" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
    plus: '<path d="M32 12 V52 M12 32 H52" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
    squiggle: '<path d="M8 40 Q16 20 24 36 T40 32 T56 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
  };
  function doodles(el, seed = 7, count = 14, box = { w: 1080, h: 1920 }) {
    const r = rng(seed);
    const kinds = Object.keys(DOODLE);
    let html = "";
    for (let i = 0; i < count; i++) {
      const k = kinds[Math.floor(r() * kinds.length)];
      const x = Math.round(r() * (box.w - 64));
      const y = Math.round(r() * (box.h - 64));
      const rot = Math.round(r() * 360);
      const sc = (0.6 + r() * 0.8).toFixed(2);
      html += `<i class="doodle" style="left:${x}px;top:${y}px;transform:rotate(${rot}deg) scale(${sc})"><svg viewBox="0 0 64 64">${DOODLE[k]}</svg></i>`;
    }
    el.innerHTML = html;
  }

  // ---------- speed lines (radial whip) ----------
  function speedlines(count = 46, seed = 3, box = { w: 1080, h: 1920 }) {
    const r = rng(seed);
    const cx = box.w / 2;
    const cy = box.h / 2;
    let lines = "";
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + r() * 0.08;
      const r0 = 420 + r() * 380;
      const r1 = r0 + 260 + r() * 520;
      const w = 3 + r() * 6;
      lines += `<line x1="${(cx + Math.cos(a) * r0).toFixed(1)}" y1="${(cy + Math.sin(a) * r0).toFixed(1)}" x2="${(cx + Math.cos(a) * r1).toFixed(1)}" y2="${(cy + Math.sin(a) * r1).toFixed(1)}" stroke-width="${w.toFixed(1)}"/>`;
    }
    return `<svg viewBox="0 0 ${box.w} ${box.h}" width="${box.w}" height="${box.h}" stroke="currentColor" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">${lines}</svg>`;
  }

  function barcode(seed = 1, bars = 18) {
    const r = rng(seed);
    let x = 0;
    let out = "";
    for (let i = 0; i < bars; i++) {
      const w = r() > 0.6 ? 2.2 : 1.1;
      out += `<rect x="${x.toFixed(1)}" y="0" width="${w}" height="20" fill="${INK}"/>`;
      x += w + 1.2;
    }
    return `<svg viewBox="0 0 ${x.toFixed(1)} 20" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">${out}</svg>`;
  }

  // Fill declarative placeholders:
  //   <i data-icon="key"></i>  <div data-bot="r3" data-variant="flat"></div>
  //   <div data-burst></div>   <div data-face></div>   <div data-presenter></div>
  //   <i data-barcode="4"></i> <div class="doodles" data-seed="7" data-count="14"></div>
  function hydrate(root = document) {
    const css = getComputedStyle(document.documentElement);
    const color = (v) => (v.startsWith("#") || v.startsWith("rgb") ? v : css.getPropertyValue("--" + v).trim() || v);
    root.querySelectorAll("[data-icon]").forEach((el) => {
      el.innerHTML = icon(el.dataset.icon, { stroke: el.dataset.stroke ? +el.dataset.stroke : undefined });
      el.classList.add("icon");
    });
    root.querySelectorAll("[data-glyph]").forEach((el) => {
      el.innerHTML = glyph(el.dataset.glyph);
      el.classList.add("icon");
    });
    root.querySelectorAll("[data-bot]").forEach((el) => {
      el.innerHTML = robot(color(el.dataset.bot), { variant: el.dataset.variant || "crew" });
      el.classList.add("sprite");
    });
    root.querySelectorAll("[data-burst]").forEach((el) => {
      el.innerHTML = burst(el.dataset.burst || undefined);
      el.classList.add("icon");
    });
    root.querySelectorAll("[data-face]").forEach((el) => (el.innerHTML = face()));
    root.querySelectorAll("[data-presenter]").forEach((el) => (el.innerHTML = presenter()));
    root.querySelectorAll("[data-barcode]").forEach((el) => (el.innerHTML = barcode(+el.dataset.barcode || 1)));
    root.querySelectorAll(".doodles[data-seed]").forEach((el) => {
      const box = el.parentElement.getBoundingClientRect();
      doodles(el, +el.dataset.seed, +(el.dataset.count || 14), { w: box.width || 1080, h: box.height || 1920 });
    });
  }

  window.Sprites = { robot, prop, pixels, burst, icon, glyph, presenter, face, hydrate, doodles, speedlines, barcode, rng, shade, tint, mix };
})();
