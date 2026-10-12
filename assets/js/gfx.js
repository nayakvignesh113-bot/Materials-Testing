/* Shared graphics: SVG helpers and procedural micrograph generators (seeded, deterministic). */
(function () {
  'use strict';
  const U = LAB.U;
  const G = (LAB.G = {});

  /* ---------------- SVG helpers ---------------- */
  G.r = (x, y, w, h, cls, extra) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${cls || ''}" ${extra || ''}/>`;
  G.t = (x, y, s, cls, extra) => `<text x="${x}" y="${y}" class="${cls || ''}" ${extra || ''}>${s}</text>`;
  G.l = (x1, y1, x2, y2, cls, w, extra) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls || 'ln'}" stroke-width="${w || 1.5}" ${extra || ''}/>`;
  G.svg = (vb, inner, label) => `<svg viewBox="${vb}" role="img" aria-label="${label || 'Apparatus schematic'}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  G.set = (svg, id, attr, val) => { const el = svg && svg.querySelector('#' + id); if (el) el.setAttribute(attr, val); return el; };
  G.txt = (svg, id, s) => { const el = svg && svg.querySelector('#' + id); if (el) el.textContent = s; };
  G.show = (svg, id, on) => { const el = svg && svg.querySelector('#' + id); if (el) el.style.display = on ? '' : 'none'; };

  /* Universal testing machine frame (viewBox 0 0 520 360). Moving crosshead group id="xh".
     Returns markup; caller supplies specimen/fixtures. */
  G.utm = function (inner, label) {
    return G.svg('0 0 520 360', `
      ${G.r(0, 0, 520, 360, 'bg')}
      ${G.r(60, 326, 400, 22, 'mach', 'rx="3"')}
      ${G.r(96, 30, 18, 300, 'steel')}${G.r(406, 30, 18, 300, 'steel')}
      ${G.r(78, 22, 364, 34, 'mach', 'rx="3"')}
      ${G.r(236, 56, 48, 16, 'mach2')}${G.t(246, 68, 'LOAD CELL', 'm', 'style="font-size:7px;fill:var(--panel-ink)"')}
      ${inner}
      <g transform="translate(442,90)">${G.r(0, 0, 70, 96, 'disp', 'rx="4"')}${G.t(8, 16, 'LOAD kN', 'm', 'style="fill:var(--panel-ink);font-size:8px"')}${G.t(8, 36, '0.00', 'big', 'id="dL"')}${G.t(8, 58, 'DISP mm', 'm', 'style="fill:var(--panel-ink);font-size:8px"')}${G.t(8, 78, '0.00', 'big', 'id="dD"')}</g>
      ${G.t(70, 343, '', 'm', 'id="cap" style="fill:var(--panel-ink)"')}`, label || 'Universal testing machine');
  };
  /* compression platens etc can use the same */
  G.xh = (y) => `<g id="xh" transform="translate(0,${y})">${G.r(78, 0, 364, 26, 'mach', 'rx="3"')}${G.r(100, 6, 10, 14, 'steelD')}${G.r(410, 6, 10, 14, 'steelD')}</g>`;

  /* ---------------- seeded noise ---------------- */
  G.noise = function (seed) {
    const r = U.rng(seed); const P = new Float32Array(512); for (let i = 0; i < 512; i++) P[i] = r();
    const hsh = (x, y) => P[((x * 73856093) ^ (y * 19349663)) & 511];
    const sm = t => t * t * (3 - 2 * t);
    const v = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = sm(x - xi), yf = sm(y - yi); const a = hsh(xi, yi), b = hsh(xi + 1, yi), c = hsh(xi, yi + 1), d = hsh(xi + 1, yi + 1); return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf; };
    return (x, y, oct) => { let s = 0, amp = 1, f = 1, n = 0; for (let o = 0; o < (oct || 3); o++) { s += amp * v(x * f, y * f); n += amp; amp *= .5; f *= 2; } return s / n; };
  };

  /* ---------------- Voronoi tessellation with distance-to-boundary ---------------- */
  G.voronoi = function (W, H, n, rng, opt) {
    opt = opt || {}; const r0 = Math.sqrt(W * H / n); const md = (opt.reg == null ? 0.6 : opt.reg) * r0; const pad = r0 * 1.2;
    const ntot = Math.round(n * (W + 2 * pad) * (H + 2 * pad) / (W * H));
    const B = r0; const gx = Math.ceil((W + 2 * pad) / B) + 1, gy = Math.ceil((H + 2 * pad) / B) + 1; const grid = Array.from({ length: gx * gy }, () => []);
    const seeds = []; let tries = 0;
    while (seeds.length < ntot && tries < ntot * 60) {
      tries++; const x = -pad + rng() * (W + 2 * pad), y = -pad + rng() * (H + 2 * pad);
      const cx = Math.floor((x + pad) / B), cy = Math.floor((y + pad) / B); let ok = true;
      for (let j = -1; j <= 1 && ok; j++) for (let i = -1; i <= 1 && ok; i++) { const c = grid[(cy + j) * gx + cx + i]; if (!c) continue; for (const k of c) { const s = seeds[k]; if ((s.x - x) ** 2 + (s.y - y) ** 2 < md * md) { ok = false; break; } } }
      if (!ok) continue; grid[cy * gx + cx].push(seeds.length); seeds.push({ x, y });
    }
    const lab = new Int32Array(W * H), ed = new Float32Array(W * H), area = new Int32Array(seeds.length);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const cx = Math.floor((x + pad) / B), cy = Math.floor((y + pad) / B); let b1 = -1, b2 = -1, d1 = 1e18, d2 = 1e18;
      for (let j = -3; j <= 3; j++) { const row = cy + j; if (row < 0 || row >= gy) continue; for (let i = -3; i <= 3; i++) { const col = cx + i; if (col < 0 || col >= gx) continue; const c = grid[row * gx + col]; for (const k of c) { const s = seeds[k]; const d = (s.x - x) ** 2 + (s.y - y) ** 2; if (d < d1) { d2 = d1; b2 = b1; d1 = d; b1 = k; } else if (d < d2) { d2 = d; b2 = k; } } } }
      const idx = y * W + x; lab[idx] = b1; area[b1]++;
      if (b2 >= 0) { const s1 = seeds[b1], s2 = seeds[b2]; ed[idx] = (d2 - d1) / (2 * Math.sqrt((s1.x - s2.x) ** 2 + (s1.y - s2.y) ** 2)); } else ed[idx] = 99;
    }
    return { W, H, seeds, lab, ed, area, n: seeds.length };
  };
  /* intercept count of a segment with grain boundaries (exact by label change along the segment) */
  G.intercepts = function (vor, x1, y1, x2, y2) {
    const L = Math.hypot(x2 - x1, y2 - y1); const steps = Math.ceil(L * 2); let prev = null, n = 0; const pts = [];
    for (let k = 0; k <= steps; k++) { const t = k / steps; const x = Math.round(x1 + (x2 - x1) * t), y = Math.round(y1 + (y2 - y1) * t); if (x < 0 || y < 0 || x >= vor.W || y >= vor.H) continue; const l = vor.lab[y * vor.W + x]; if (prev != null && l !== prev) { n++; pts.push([x, y]); } prev = l; }
    return { n, pts };
  };

  /* ---------------- canvas helpers ---------------- */
  G.canvas = (W, H) => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  G.fill = function (c, fn, tint) {
    const g = c.getContext('2d'); const W = c.width, H = c.height; const im = g.createImageData(W, H); const d = im.data;
    for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) { let v = fn(i, x, y); let r, gg, b; if (Array.isArray(v)) { r = v[0]; gg = v[1]; b = v[2]; } else if (tint === 'optical') { r = v * 1.0 + 6; gg = v * .965 + 3; b = v * .87; } else if (tint === 'brass') { r = v * 1.02 + 10; gg = v * .93 + 2; b = v * .66; } else { r = gg = b = v; } d[i * 4] = r; d[i * 4 + 1] = gg; d[i * 4 + 2] = b; d[i * 4 + 3] = 255; }
    g.putImageData(im, 0, 0); return g;
  };
  G.scaleBar = function (c, umPerPx, label, opt) {
    opt = opt || {}; const g = c.getContext('2d'); const W = c.width, H = c.height; const targets = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
    let um = targets[0]; for (const t of targets) if (t / umPerPx <= W * 0.22) um = t; const px = um / umPerPx;
    const x = W - px - 18, y = H - 18; g.fillStyle = opt.bg || 'rgba(0,0,0,.55)'; g.fillRect(x - 8, y - 20, px + 16, 30);
    g.fillStyle = '#fff'; g.fillRect(x, y, px, 4); g.font = '600 12px "IBM Plex Mono",monospace'; g.textAlign = 'center'; g.fillText((um >= 1000 ? um / 1000 + ' mm' : um + ' µm'), x + px / 2, y - 5);
    if (label) { g.textAlign = 'left'; g.fillStyle = 'rgba(0,0,0,.55)'; const w = g.measureText(label).width; g.fillRect(10, H - 30, w + 14, 22); g.fillStyle = '#fff'; g.fillText(label, 17, H - 14); }
  };

  /* ---------------- optical micrograph generator ----------------
     type: ferrite | ferrite-pearlite | pearlite | pearlite-cementite | martensite | tempered-martensite |
           bainite | grey-ci | sg-iron | white-ci | malleable | al-si | alpha-brass | alpha-beta-brass | copper
     o: {W,H,seed,mag,fP (pearlite area fraction), dg (grain size µm), sp (lamellar spacing scale)} */
  G.micro = function (type, o) {
    o = Object.assign({ W: 560, H: 420, seed: 1, mag: 200, fP: 0.5, dg: 30 }, o);
    const W = o.W, H = o.H, rng = U.rng(o.seed * 7 + 13), nz = G.noise(o.seed + 99);
    const umpx = (1150 * 100 / o.mag) / W; // field of view ≈ 1.15 mm at 100×
    const c = G.canvas(W, H); const phase = new Uint8Array(W * H); let info = { umpx };
    const grains = (dg, reg) => { const n = U.clamp(Math.round((W * umpx) * (H * umpx) / (dg * dg)), 6, 3200); return G.voronoi(W, H, n, rng, { reg }); };
    const lam = (x, y, ang, sp, ph) => Math.sin((x * Math.cos(ang) + y * Math.sin(ang)) * 2 * Math.PI / sp + ph);
    const sp0 = U.clamp(0.75 / umpx, 1.7, 6) * (o.sp || 1);
    const g = c.getContext('2d');
    if (type === 'ferrite' || type === 'ferrite-pearlite' || type === 'pearlite' || type === 'pearlite-cementite' || type === 'copper') {
      const v = grains(o.dg, 0.55); const nG = v.n; const isP = new Uint8Array(nG); const ang = new Float32Array(nG), shade = new Float32Array(nG), ph = new Float32Array(nG), spg = new Float32Array(nG);
      for (let k = 0; k < nG; k++) { ang[k] = rng() * Math.PI; shade[k] = rng(); ph[k] = rng() * 6.28; spg[k] = sp0 * (0.8 + 0.5 * rng()); }
      let fP = type === 'ferrite' || type === 'copper' ? 0 : type === 'ferrite-pearlite' ? o.fP : 1;
      if (fP > 0 && fP < 1) { const ord = [...Array(nG).keys()].sort(() => rng() - .5); let acc = 0; const tot = W * H; for (const k of ord) { if (acc / tot >= fP) break; if (v.area[k] === 0) continue; isP[k] = 1; acc += v.area[k]; } }
      else if (fP >= 1) isP.fill(1);
      const cemW = type === 'pearlite-cementite' ? U.clamp(1.2 / umpx, 1.5, 4) * (o.cem || 1) : 0;
      G.fill(c, (i, x, y) => {
        const k = v.lab[i], e = v.ed[i]; const n = nz(x * .05, y * .05, 2);
        if (cemW && e < cemW) { phase[i] = 2; return 236 + 8 * n; }
        if (isP[k]) { phase[i] = 1; const s = lam(x, y, ang[k], spg[k], ph[k]); const base = (s > -0.25 ? 78 : 172) + 20 * n; return e < 0.8 ? 70 : base; }
        if (type === 'copper') { const tw = Math.sin((x * Math.cos(ang[k]) + y * Math.sin(ang[k])) / 26 + ph[k]); return e < 0.9 ? 95 : (150 + 70 * shade[k] + (tw > 0.85 && shade[k] > .4 ? -40 : 0) + 10 * n); }
        return e < 0.9 ? 78 : 214 + 12 * shade[k] + 10 * n;
      }, type === 'copper' ? 'brass' : 'optical');
      info.vor = v; info.isP = isP; info.fPtrue = phase.reduce((a, p) => a + (p === 1 ? 1 : 0), 0) / (W * H);
    } else if (type === 'martensite' || type === 'tempered-martensite' || type === 'bainite') {
      const v = grains(Math.max(o.dg, 25), 0.5); const tm = type !== 'martensite';
      G.fill(c, (i, x, y) => { const e = v.ed[i]; const n = nz(x * .08, y * .08, 3); return (tm ? 120 : 165) + 50 * (n - .5) - (e < 1 ? 30 : 0); }, 'optical');
      g.lineCap = 'round';
      const N = Math.round(W * H / (tm ? 180 : 230));
      for (let k = 0; k < N; k++) {
        const x = rng() * W, y = rng() * H; const gi = v.lab[(Math.floor(y) * W + Math.floor(x))]; const base = ((gi * 2.399) % Math.PI) + (rng() < .5 ? 0 : Math.PI / 3) + (rng() < .33 ? Math.PI / 3 : 0);
        const L = (type === 'bainite' ? 14 : 8 + rng() * 30) * U.clamp(o.mag / 400, .5, 2); const dark = rng() < (tm ? .7 : .55);
        g.strokeStyle = dark ? `rgba(${tm ? 40 : 60},${tm ? 36 : 55},${tm ? 30 : 45},${tm ? .55 : .7})` : 'rgba(235,228,210,.6)'; g.lineWidth = (tm ? 1 : 1.2) + rng() * 1.6;
        g.beginPath(); g.moveTo(x - Math.cos(base) * L / 2, y - Math.sin(base) * L / 2); g.lineTo(x + Math.cos(base) * L / 2, y + Math.sin(base) * L / 2); g.stroke();
      }
      if (tm) { g.fillStyle = 'rgba(25,22,18,.5)'; for (let k = 0; k < W * H / 90; k++) { g.fillRect(rng() * W, rng() * H, 1.2, 1.2); } }
      info.vor = v;
    } else if (type === 'grey-ci' || type === 'sg-iron' || type === 'malleable') {
      const v = grains(18, 0.55); const ang = []; for (let k = 0; k < v.n; k++) ang.push(rng() * Math.PI);
      const nod = []; const ferr = o.ferrite == null ? (type === 'sg-iron' ? 0.35 : 0.1) : o.ferrite;
      if (type !== 'grey-ci') { const R = type === 'malleable' ? 10 : 9; const n = Math.round(W * H / (umpx > 1.5 ? 2600 : 5200)); for (let k = 0; k < n; k++) { nod.push({ x: rng() * W, y: rng() * H, r: (R * (0.6 + rng() * .8)) * U.clamp(200 / o.mag * 1.8, .5, 2.2) * (o.nodScale || 1) }); } }
      // spatial hash for nodules
      const cell = 40, gx = Math.ceil(W / cell) + 1, hash = {}; nod.forEach((q, i) => { const k = Math.floor(q.y / cell) * gx + Math.floor(q.x / cell); (hash[k] = hash[k] || []).push(q); });
      const nearH = (x, y) => { let best = 1e9; const cx = Math.floor(x / cell), cy = Math.floor(y / cell); for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) { const a = hash[(cy + j) * gx + cx + i]; if (!a) continue; for (const q of a) { const d = Math.hypot(q.x - x, q.y - y) - q.r * (type === 'malleable' ? (0.7 + 0.5 * Math.sin(Math.atan2(y - q.y, x - q.x) * 5 + q.x)) : 1); if (d < best) best = d; } } return best; };
      G.fill(c, (i, x, y) => {
        const k = v.lab[i]; const n = nz(x * .06, y * .06, 2);
        if (nod.length) { const d = nearH(x, y); if (d < 0) { phase[i] = 3; return 45 + 25 * n; } if (d < (o.halo != null ? o.halo : 12) * (type === 'sg-iron' ? 1 : .6)) { phase[i] = 0; return 220 + 10 * n; } }
        if (ferr > 0 && ((k * 0.618) % 1) < ferr * 0.6) return 218 + 10 * n;
        const s = lam(x, y, ang[k], sp0, k); phase[i] = 1; return (s > 0.2 ? 92 : 172) + 18 * n;
      }, 'optical');
      if (type === 'grey-ci') { // graphite flakes
        g.lineCap = 'round'; const N = Math.round(W * H / 2600);
        for (let k = 0; k < N; k++) { let x = rng() * W, y = rng() * H, a = rng() * Math.PI * 2; const L = 30 + rng() * 90; const w = 2 + rng() * 2.6; g.strokeStyle = 'rgb(38,36,34)'; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < L; s += 4) { a += (rng() - .5) * .35; x += Math.cos(a) * 4; y += Math.sin(a) * 4; g.lineTo(x, y); } g.stroke(); }
      }
      info.nodules = nod.length;
    } else if (type === 'white-ci') {
      const v = grains(26, 0.5);
      G.fill(c, (i, x, y) => { const k = v.lab[i], e = v.ed[i]; const n = nz(x * .04, y * .04, 3); const dend = n > 0.55 || (e > 9 && ((k * .37) % 1) < .45); if (dend) { phase[i] = 1; return 80 + 30 * nz(x * .3, y * .3, 1); } phase[i] = 2; const dots = Math.sin(x * .9 + nz(x * .2, y * .2) * 6) * Math.sin(y * .9) > 0.82; return dots ? 95 : 232 + 10 * n; }, 'optical');
    } else if (type === 'al-si') {
      const v = grains(o.dg || 45, 0.5); const ew = U.clamp(5 / umpx, 4, 16);
      G.fill(c, (i, x, y) => { const e = v.ed[i]; const n = nz(x * .05, y * .05, 2); if (e < ew) { phase[i] = 1; return 200 + 15 * n; } return 226 + 10 * n; }, 'optical');
      g.lineCap = 'round'; const N = Math.round(W * H / 55);
      for (let k = 0; k < N; k++) { const x = rng() * W, y = rng() * H; const i = Math.floor(y) * W + Math.floor(x); if (v.ed[i] > ew) continue; const a = rng() * Math.PI; const L = (o.modified ? 2 + rng() * 3 : 5 + rng() * 16) * U.clamp(o.mag / 300, .6, 2); g.strokeStyle = 'rgba(70,72,78,.9)'; g.lineWidth = o.modified ? 1.6 : 1.3 + rng(); g.beginPath(); g.moveTo(x - Math.cos(a) * L / 2, y - Math.sin(a) * L / 2); g.lineTo(x + Math.cos(a) * L / 2, y + Math.sin(a) * L / 2); g.stroke(); }
      info.vor = v;
    } else if (type === 'alpha-brass' || type === 'alpha-beta-brass') {
      const v = grains(o.dg || 40, 0.55); const ang = [], sh = [], isB = [], ph = [];
      for (let k = 0; k < v.n; k++) { ang.push(rng() * Math.PI); sh.push(rng()); ph.push(rng() * 50); isB.push(type === 'alpha-beta-brass' && rng() < (o.fB || 0.42) ? 1 : 0); }
      G.fill(c, (i, x, y) => {
        const k = v.lab[i], e = v.ed[i]; const n = nz(x * .05, y * .05, 2); if (e < 0.9) return 80;
        if (isB[k]) { phase[i] = 1; return 105 + 25 * sh[k] + 10 * n; }
        const t = (x * Math.cos(ang[k]) + y * Math.sin(ang[k]) + ph[k]); const twin = sh[k] > .35 && (Math.abs(((t / 34) % 2 + 2) % 2 - 1) < .16);
        return 165 + 60 * (twin ? 1 - sh[k] : sh[k]) + 8 * n;
      }, 'brass');
      info.vor = v;
    }
    info.phase = phase; return { canvas: c, phase, info };
  };
  /* point-count grid helper: returns grid points and how many fall on phase p */
  G.pointGrid = function (W, H, nx, ny) { const pts = []; for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) pts.push([Math.round((i + .5) * W / nx), Math.round((j + .5) * H / ny)]); return pts; };
  G.drawGrid = function (c, pts, color) { const g = c.getContext('2d'); g.strokeStyle = color || '#ff3b30'; g.lineWidth = 1.6; pts.forEach(([x, y]) => { g.beginPath(); g.moveTo(x - 6, y); g.lineTo(x + 6, y); g.moveTo(x, y - 6); g.lineTo(x, y + 6); g.stroke(); }); };
})();

/* ---------------- indentation microscope view (Brinell / Vickers / Knoop) ----------------
   opt: {kind:'ball'|'pyramid', d1,d2 (mm), fov (mm across canvas), seed, reticle:true, label} */
(function () {
  const G = LAB.G, U = LAB.U;
  G.indentView = function (c, opt) {
    const W = c.width, H = c.height; const nz = G.noise(opt.seed || 3); const r = U.rng((opt.seed || 3) * 31);
    const px = W / opt.fov; // pixels per mm
    const scratchA = r() * Math.PI;
    G.fill(c, (i, x, y) => { const s = Math.sin((x * Math.cos(scratchA) + y * Math.sin(scratchA)) * 0.9 + nz(x * .02, y * .02) * 8); return 168 + 26 * nz(x * .03, y * .03, 3) + (s > 0.97 ? -18 : 0); }, opt.tint || 'optical');
    const g = c.getContext('2d'); const cx = W / 2, cy = H / 2;
    const items = opt.items || [{ x: 0, y: 0, d1: opt.d1, d2: opt.d2 }];
    items.forEach(it => {
      const x0 = cx + it.x * px, y0 = cy + it.y * px; const a = it.d1 * px / 2, b = it.d2 * px / 2;
      if (opt.kind === 'ball') {
        const gr = g.createRadialGradient(x0 - a * .25, y0 - b * .25, a * .1, x0, y0, Math.max(a, b)); gr.addColorStop(0, 'rgb(70,66,60)'); gr.addColorStop(.85, 'rgb(40,38,35)'); gr.addColorStop(1, 'rgb(215,210,198)');
        g.fillStyle = gr; g.beginPath(); g.ellipse(x0, y0, a, b, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = 'rgba(240,236,226,.9)'; g.lineWidth = 2; g.stroke();
      } else {
        g.fillStyle = 'rgb(48,45,40)'; g.beginPath(); g.moveTo(x0 - a, y0); g.lineTo(x0, y0 - b); g.lineTo(x0 + a, y0); g.lineTo(x0, y0 + b); g.closePath(); g.fill();
        g.strokeStyle = 'rgba(120,115,105,.9)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x0 - a, y0); g.lineTo(x0 + a, y0); g.moveTo(x0, y0 - b); g.lineTo(x0, y0 + b); g.stroke();
        g.strokeStyle = 'rgba(235,230,220,.8)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x0 - a, y0); g.lineTo(x0, y0 - b); g.lineTo(x0 + a, y0); g.lineTo(x0, y0 + b); g.closePath(); g.stroke();
      }
    });
    if (opt.reticle !== false && items.length === 1) {
      const it = items[0]; const a = it.d1 * px / 2;
      g.strokeStyle = 'rgba(30,140,255,.95)'; g.lineWidth = 1.4; [cx - a, cx + a].forEach(x => { g.beginPath(); g.moveTo(x, cy - H * .38); g.lineTo(x, cy + H * .38); g.stroke(); });
      // graticule
      g.strokeStyle = 'rgba(255,255,255,.85)'; g.fillStyle = 'rgba(255,255,255,.9)'; g.font = '11px "IBM Plex Mono",monospace'; g.textAlign = 'center';
      const step = niceMM(opt.fov / 10); const y = H - 34; g.beginPath(); g.moveTo(20, y); g.lineTo(W - 20, y); g.stroke();
      for (let v = 0, k = 0; v * px < W - 40; v += step / 5, k++) { const x = 20 + v * px; const big = k % 5 === 0; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - (big ? 10 : 5)); g.stroke(); if (big) g.fillText(U.f(v, step < 0.1 ? 2 : 1), x, y + 14); }
      g.textAlign = 'right'; g.fillText('mm', W - 20, y + 14);
    }
    if (opt.label) { g.fillStyle = 'rgba(0,0,0,.55)'; g.font = '600 12px "IBM Plex Mono",monospace'; const w = g.measureText(opt.label).width; g.fillRect(10, 10, w + 14, 22); g.fillStyle = '#fff'; g.textAlign = 'left'; g.fillText(opt.label, 17, 26); }
  };
  function niceMM(x) { const m = Math.pow(10, Math.floor(Math.log10(x))); const k = x / m; return (k < 1.5 ? 1 : k < 3.5 ? 2 : k < 7.5 ? 5 : 10) * m; }
})();
