/* Set-up animations played before each test: measuring, mounting, gripping, attaching instruments, zeroing.
   Each step: { op: index into opSteps, title, note, d: seconds, draw(layer, u, ctx) }.
   draw is called every frame for the current step (u: 0→1, ctx.active = true) and for all previous steps
   (u = 1, ctx.active = false) so that their end state persists. Base drawing is re-rendered when the test starts. */
(function () {
  const U = LAB.U, G = LAB.G;
  const S = (LAB.SETUP = {});
  const E = U.ease;
  /* ---------- small drawing helpers (return SVG strings) ---------- */
  const tag = (x, y, t, ax, ay) => { const w = Math.max(30, String(t).length * 6.6 + 14); return `<g class="su-tag">${ax != null ? `<line x1="${ax}" y1="${ay}" x2="${x + 6}" y2="${y + 10}" stroke="var(--straw)" stroke-width="1.6"/><circle cx="${ax}" cy="${ay}" r="2.6" fill="var(--straw)"/>` : ''}<rect x="${x}" y="${y}" width="${w}" height="20" rx="4"/><text x="${x + 7}" y="${y + 14}">${t}</text></g>`; };
  const micV = (x, yTop, yBot, c) => { const g = (1 - c) * 12, aY = yTop - g, sY = yBot + g; return `<g><path d="M${x} ${aY - 9} H${x + 38} V${sY + 34} H${x + 9}" fill="none" stroke="var(--machine)" stroke-width="7" stroke-linejoin="round"/><rect x="${x - 6}" y="${aY - 9}" width="12" height="9" class="steelD"/><rect x="${x - 5}" y="${sY}" width="10" height="22" class="steelD"/><rect x="${x - 9}" y="${sY + 22}" width="18" height="18" rx="2" class="acc"/></g>`; };
  const micH = (y, xL, xR, c) => { const g = (1 - c) * 12, aX = xL - g, sX = xR + g; return `<g><path d="M${aX - 9} ${y} V${y - 38} H${sX + 34} V${y - 9}" fill="none" stroke="var(--machine)" stroke-width="7" stroke-linejoin="round"/><rect x="${aX - 9}" y="${y - 6}" width="9" height="12" class="steelD"/><rect x="${sX}" y="${y - 5}" width="22" height="10" class="steelD"/><rect x="${sX + 22}" y="${y - 9}" width="18" height="18" rx="2" class="acc"/></g>`; };
  const cloth = (x0, x1, y, u) => { const x = x0 + (x1 - x0) * (0.5 - 0.5 * Math.cos(u * Math.PI * 4)); return `<rect x="${x - 14}" y="${y - 7}" width="28" height="12" rx="3" fill="var(--surface)" stroke="var(--muted)"/><path d="M${x - 10} ${y - 1} h20 M${x - 10} ${y + 2} h20" stroke="var(--line)"/>`; };
  const drops = (x0, x1, y, u, n, cls) => { let s = ''; for (let i = 0; i < n; i++) { if (i / n > u) break; s += `<ellipse cx="${x0 + (x1 - x0) * (i + .5) / n}" cy="${y}" rx="4" ry="2.4" class="${cls || 'fluid'}" opacity=".85"/>`; } return s; };
  const tick = (x, y) => `<path d="M${x} ${y} l5 6 l10 -12" fill="none" stroke="var(--ok)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  const dimH = (x0, x1, y, t) => `<g><line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="var(--accent)" stroke-width="1.5"/><line x1="${x0}" y1="${y - 6}" x2="${x0}" y2="${y + 6}" stroke="var(--accent)" stroke-width="1.5"/><line x1="${x1}" y1="${y - 6}" x2="${x1}" y2="${y + 6}" stroke="var(--accent)" stroke-width="1.5"/>${t ? `<text x="${(x0 + x1) / 2 - t.length * 3.2}" y="${y - 6}">${t}</text>` : ''}</g>`;
  const dimV = (x, y0, y1, t) => `<g><line x1="${x}" y1="${y0}" x2="${x}" y2="${y1}" stroke="var(--accent)" stroke-width="1.5"/><line x1="${x - 6}" y1="${y0}" x2="${x + 6}" y2="${y0}" stroke="var(--accent)" stroke-width="1.5"/><line x1="${x - 6}" y1="${y1}" x2="${x + 6}" y2="${y1}" stroke="var(--accent)" stroke-width="1.5"/>${t ? `<text x="${x + 8}" y="${(y0 + y1) / 2 + 4}">${t}</text>` : ''}</g>`;
  const tongs = (x, y) => `<path d="M${x} ${y} l-46 -34 M${x} ${y + 6} l-46 -26" stroke="var(--machine)" stroke-width="3" stroke-linecap="round"/>`;
  const blink = u => (u > 0.85 || Math.floor(u * 8) % 2 === 0);
  const sv = (sim, key) => { const r = (sim.specimen || []).find(x => String(x[0]).includes(key)); return r ? r[1] + (r[2] ? ' ' + r[2] : '') : ''; };
  const zero = (c, ids, u, vals) => ids.forEach((id, i) => c.txt(id, blink(u) ? (vals ? vals[i] : '0.00') : ''));
  const third = (u, n) => Math.min(n - 1, Math.floor(u * n));
  const sub = (u, n) => (u * n) % 1;

  /* ===================== 1 Tensile ===================== */
  const bone = (y) => `<path d="M150 ${y - 15} H180 Q186 ${y - 8} 190 ${y - 8} H330 Q334 ${y - 8} 340 ${y - 15} H370 V${y + 15} H340 Q334 ${y + 8} 330 ${y + 8} H190 Q186 ${y + 8} 180 ${y + 15} H150 Z" class="spec"/>`;
  S.tensile = [
    { op: 0, d: 3.4, title: 'Measure gauge diameter', note: s => `Micrometer at three positions along the gauge: ${sv(s, 'Diameter readings')}`, draw(L, u, c) {
      c.show('sp', false); c.show('extm', false); if (!c.active) { L.innerHTML = ''; return; }
      const k = third(u, 3), xs = [212, 260, 308], v = (String(sv(c.sim, 'Diameter readings')).split(',')[k] || '').replace('mm', '').trim() + ' mm';
      L.innerHTML = bone(150) + micV(xs[k], 142, 158, E(Math.min(1, sub(u, 3) * 2))) + (sub(u, 3) > .5 ? tag(300, 70, `d${'₁₂₃'[k]} = ${v.trim()}`, xs[k], 132) : ''); } },
    { op: 0, d: 2.6, title: 'Mark the gauge length', note: s => `Punch marks at L₀ = 5.65√S₀ = ${U.f(s.L0, 1)} mm on the parallel length`, draw(L, u, c) {
      if (!c.active) { L.innerHTML = ''; return; } const h = 64 * Math.min(1, u * 1.5);
      L.innerHTML = bone(150) + `<circle cx="${260 - h}" cy="150" r="2.4" class="ink"/><circle cx="${260 + h}" cy="150" r="2.4" class="ink"/>` + (u > .6 ? dimH(196, 324, 120, `L₀ = ${U.f(c.sim.L0, 1)} mm`) : ''); } },
    { op: 1, d: 3.2, title: 'Insert specimen and close the wedge grips', note: 'Specimen is aligned on the loading axis; wedge jaws close on the shoulders', draw(L, u, c) {
      c.show('sp', true); const m = E(Math.min(1, u * 2)), cl = E(U.clamp(u * 2 - 1, 0, 1)); c.set('sp', 'transform', `translate(0,${70 * (1 - m)})`);
      const j = (y) => { const o = 10 * (1 - cl); return `<rect x="${240 - o}" y="${y}" width="9" height="30" rx="1" class="mach"/><rect x="${271 + o}" y="${y}" width="9" height="30" rx="1" class="mach"/>`; };
      L.innerHTML = j(76) + j(226) + (c.active && u > .6 ? tag(312, 60, 'Upper grip closed', 278, 90) + tag(312, 232, 'Lower grip closed', 278, 240) : ''); } },
    { op: 1, d: 2.4, title: 'Check alignment and zero the channels', note: 'Load and displacement set to zero before any load is applied', draw(L, u, c) {
      if (!c.active) { L.innerHTML = ''; c.txt('dL', '0.00'); c.txt('dD', '0.00'); return; } zero(c, ['dL', 'dD'], u);
      L.innerHTML = `<line x1="260" y1="58" x2="260" y2="262" stroke="var(--accent)" stroke-dasharray="4 4"/>` + tag(122, 190, 'Axis aligned', 258, 190) + (u > .5 ? tag(360, 196, 'Zeroed', 470, 186) + tick(486, 215) : ''); } },
    { op: 2, d: 3, title: 'Attach the clip-on extensometer', note: 'Knife edges seated on the gauge marks; extensometer gauge = L₀', draw(L, u, c) {
      c.show('extm', true); c.set('extm', 'transform', `translate(${90 * (1 - E(u))},0)`); L.innerHTML = c.active && u > .7 ? tag(306, 150, 'Knife edges on gauge marks', 270, 130) : ''; } }
  ];

  /* ===================== 2 Compression ===================== */
  S.compression = [
    { op: 0, d: 3.2, title: 'Measure height and diameter', note: s => `Vernier calliper: h₀ = ${U.f(s.h0, 2)} mm; ${sv(s, 'Diameter') || sv(s, 'Cross-section')}`, draw(L, u, c) {
      c.show('sp', false); if (!c.active) { L.innerHTML = ''; return; } const t = u < .5 ? E(u * 2) : E(u * 2 - 1);
      L.innerHTML = `<rect x="140" y="170" width="40" height="70" rx="3" class="spec"/><line x1="120" y1="240" x2="200" y2="240" class="lnm" stroke-width="2"/>` + (u < .5 ? micV(160, 170, 240, t) + tag(212, 140, `h₀ = ${U.f(c.sim.h0, 2)} mm`, 162, 168) : micH(205, 140, 180, t) + tag(212, 140, (sv(c.sim, 'Diameter') || sv(c.sim, 'Cross-section')).replace(/\(.*?\)/, ''), 186, 205)); } },
    { op: 0, d: 2.4, title: 'Clean the platens', note: s => s.mu && s.mu < 0.1 ? 'Platen faces cleaned, then a thin MoS₂ film applied' : 'Platen faces wiped clean and dry', draw(L, u, c) { L.innerHTML = c.active ? cloth(228, 292, 102, u) + cloth(228, 292, 236, 1 - u) + (u > .5 ? tag(320, 104, c.sim.mu && c.sim.mu < .1 ? 'MoS₂ lubricant' : 'Dry, clean', 296, 100) : '') : ''; } },
    { op: 1, d: 2.8, title: 'Place the specimen centrally', note: 'Concentric rings on the lower platen locate the specimen on the axis', draw(L, u, c) {
      c.show('sp', true); c.set('sp', 'transform', `translate(${-130 * (1 - E(u))},0)`); L.innerHTML = c.active ? `<line x1="260" y1="60" x2="260" y2="262" stroke="var(--accent)" stroke-dasharray="4 4"/>` + (u > .7 ? tag(310, 160, 'Centred on axis', 264, 160) : '') : ''; } },
    { op: 2, d: 2.6, title: 'Fit compressometer and safety guard', note: s => s.k && s.k.brittle ? 'Transparent guard closed: cast iron can shatter' : 'Compressometer gauge length = h₀', draw(L, u, c) {
      const y = -60 * (1 - E(u)); const g = c.sim.k && c.sim.k.brittle ? `<rect x="196" y="84" width="128" height="170" rx="6" fill="var(--surface)" opacity="${.25 * E(u)}" stroke="var(--accent)" stroke-dasharray="5 4"/>` : '';
      L.innerHTML = `<g transform="translate(0,${y})"><rect x="206" y="104" width="6" height="110" class="acc"/><rect x="308" y="104" width="6" height="110" class="acc"/></g>` + g + (c.active && u > .6 ? tag(330, 120, c.sim.k && c.sim.k.brittle ? 'Guard closed' : 'Compressometer on', 314, 130) : ''); } },
    { op: 2, d: 2.2, title: 'Apply seating load and zero', note: 'A small seating load removes slack; load and deformation then set to zero', draw(L, u, c) { if (!c.active) { c.txt('dL', '0.00'); c.txt('dD', '0.00'); return; } zero(c, ['dL', 'dD'], u); L.innerHTML = u > .5 ? tag(360, 196, 'Zeroed', 470, 186) + tick(486, 215) : ''; } }
  ];

  /* ===================== 3 Shear ===================== */
  S.shear = [
    { op: 0, d: 3, title: 'Measure bar diameter at both shear planes', note: s => `Micrometer readings; specimen 1 mean d = ${U.f(s.specs[0].d, 3)} mm`, draw(L, u, c) {
      ['barL', 'barM', 'barR'].forEach(id => c.show(id, false)); if (!c.active) { L.innerHTML = ''; return; } const k = u < .5 ? 0 : 1, xs = [225, 295];
      L.innerHTML = `<rect x="150" y="130" width="220" height="14" rx="3" class="spec"/>` + micV(xs[k], 130, 144, E(Math.min(1, sub(u, 2) * 2))) + tag(310, 70, `d = ${U.f(c.sim.specs[0].d, 3)} mm`, xs[k], 120); } },
    { op: 1, d: 2.8, title: 'Insert the bar through the fixture bores', note: s => s.specs && s.truth.nPl === 2 ? 'Bar passes through both outer blocks and the central blade (double shear)' : 'Bar passes through the block and the cutter (single shear)', draw(L, u, c) {
      ['barL', 'barM', 'barR'].forEach(id => { c.show(id, true); c.set(id, 'transform', `translate(${-170 * (1 - E(u))},0)`); }); L.innerHTML = ''; } },
    { op: 2, d: 2.4, title: 'Centre the fixture under the crosshead', note: 'Central blade directly under the loading axis', draw(L, u, c) { L.innerHTML = c.active ? `<line x1="260" y1="58" x2="260" y2="262" stroke="var(--accent)" stroke-dasharray="4 4"/>` + (u > .5 ? tag(320, 150, 'On axis', 264, 150) : '') : ''; } },
    { op: 3, d: 2, title: 'Zero the load', note: 'Load display set to zero before loading', draw(L, u, c) { if (!c.active) { c.txt('dL', '0.00'); c.txt('dD', '0.00'); L.innerHTML = ''; return; } zero(c, ['dL', 'dD'], u); L.innerHTML = u > .5 ? tag(360, 196, 'Zeroed', 470, 186) + tick(486, 215) : ''; } }
  ];

  /* ===================== 4 Torsion ===================== */
  S.torsion = [
    { op: 0, d: 3.2, title: 'Measure diameter at three places', note: s => `Micrometer: ${sv(s, 'Diameter readings')}`, draw(L, u, c) {
      c.show('trop', false); c.set('helix', 'd', ''); if (!c.active) { L.innerHTML = ''; return; } const k = third(u, 3), xs = [190, 260, 330]; const v = (String(sv(c.sim, 'Diameter readings')).split(',')[k] || '').replace('mm', '').trim() + ' mm';
      L.innerHTML = micV(xs[k], 151, 169, E(Math.min(1, sub(u, 3) * 2))) + tag(150, 100, `d${'₁₂₃'[k]} = ${v.trim()}`, xs[k], 140); } },
    { op: 0, d: 2.4, title: 'Scribe a longitudinal reference line', note: 'The line turns into a helix during twisting and shows the shear strain', draw(L, u, c) {
      const x = 118 + 284 * (c.active ? E(u) : 1); c.set('helix', 'd', `M118 160 L${x} 160`); L.innerHTML = c.active ? `<path d="M${x} 160 l10 -16 l6 4 z" class="ink"/>` : ''; } },
    { op: 1, d: 2.8, title: 'Clamp the ends in the chucks', note: 'Both ends gripped coaxially; slip would add false twist', draw(L, u, c) {
      const o = 12 * (1 - E(u)); const j = x => `<rect x="${x}" y="${139 - o}" width="16" height="10" class="mach"/><rect x="${x}" y="${171 + o}" width="16" height="10" class="mach"/>`;
      L.innerHTML = j(120) + j(384) + (c.active && u > .6 ? tag(170, 210, 'Chuck jaws tight', 136, 182) : ''); } },
    { op: 1, d: 2.6, title: 'Mount the troptometer on the gauge length', note: s => `Twist meter arms clamped ${s.truth.L} mm apart`, draw(L, u, c) { c.show('trop', true); c.set('trop', 'transform', `translate(0,${-60 * (1 - E(u))})`); L.innerHTML = c.active && u > .6 ? tag(250, 100, 'Troptometer on gauge length', 262, 132) : ''; } },
    { op: 2, d: 2, title: 'Zero torque and angle', note: 'Both channels set to zero', draw(L, u, c) { if (!c.active) { c.txt('dT', '0.00'); c.txt('dA', '0.0'); L.innerHTML = ''; return; } zero(c, ['dT', 'dA'], u, ['0.00', '0.0']); L.innerHTML = u > .5 ? tick(368, 52) : ''; } }
  ];

  /* ===================== 5 Bending ===================== */
  S.bending = [
    { op: 0, d: 3.2, title: 'Measure width and depth', note: s => `Vernier calliper: b = ${U.f(s.truth.b, 2)} mm, h = ${U.f(s.truth.h, 2)} mm`, draw(L, u, c) {
      ['beam', 'hang', 'dial'].forEach(id => c.show(id, false)); if (!c.active) { L.innerHTML = ''; return; } const T = c.sim.truth; const w = 100, hh = Math.max(16, Math.min(80, 100 * T.h / T.b)); const x = 60, y = 60;
      L.innerHTML = `<rect x="${x}" y="${y}" width="${w}" height="${hh}" class="spec"/><text x="${x}" y="${y - 8}">Beam cross-section</text>` + (u < .5 ? micH(y + hh + 22, x, x + w, E(u * 2)) + tag(190, 70, `b = ${U.f(T.b, 2)} mm`) : micV(x + w + 18, y, y + hh, E(u * 2 - 1)) + tag(190, 70, `h = ${U.f(T.h, 2)} mm`)); } },
    { op: 1, d: 2.4, title: 'Set the span', note: s => `${s.cant ? 'Cantilever length' : 'Span between knife edges'} L = ${s.truth.L} mm`, draw(L, u, c) { const x0 = c.sim.cant ? 110 : 70, x1 = c.sim.cant ? 470 : 450; L.innerHTML = c.active ? dimH(x0, x0 + (x1 - x0) * E(u), 214, u > .7 ? `L = ${c.sim.truth.L} mm` : '') : ''; } },
    { op: 1, d: 2.4, title: 'Place the beam on the supports', note: s => s.cant ? 'Clamped at the fixed end' : 'Resting on knife edges, overhang equal at both ends', draw(L, u, c) { c.show('beam', true); c.set('beam', 'transform', `translate(0,${-50 * (1 - E(u))})`); L.innerHTML = ''; } },
    { op: 2, d: 2.2, title: s => 'Hang the load hanger at the load point', note: s => s.M && s.M.wood ? 'Loading nose of the UTM positioned at mid-span' : 'Hanger placed exactly at mid-span (or free end)', draw(L, u, c) { c.show('hang', true); c.op('hang', E(u)); L.innerHTML = ''; } },
    { op: 2, d: 2.4, title: 'Set the dial gauge and zero it', note: 'Plunger touches the beam at the load point; bezel turned to zero', draw(L, u, c) { c.show('dial', true); const cant = c.sim.cant; c.set('dial', 'transform', `translate(${cant ? 440 : 290},${140 - 30 * (1 - E(u))})`); c.set('ndl', 'transform', `rotate(${(1 - E(u)) * 200} 0 -84)`); L.innerHTML = c.active && u > .7 ? tag(380, 110, 'Dial at zero') : ''; } }
  ];

  /* ===================== 6 Impact ===================== */
  S.impact = [
    { op: 0, d: 3, title: 'Check the notch', note: s => s.mode === 'izod' ? 'Izod V-notch 2 mm deep, 45°, root radius 0.25 mm' : 'Charpy V-notch 2 mm deep, 45°, root radius 0.25 mm (notch gauge)', draw(L, u, c) {
      c.show('spg', false); if (!c.active) { L.innerHTML = ''; return; } const y = 150 + 76 * E(Math.min(1, u * 1.5));
      L.innerHTML = `<path d="M340 240 H410 L418 254 L426 240 H496 V280 H340 Z" class="spec"/><path d="M398 ${y} H438 V${y + 14} H426 L418 ${y + 28} L410 ${y + 14} H398 Z" fill="var(--surface)" stroke="var(--accent)" stroke-width="1.5"/>` + (u > .7 ? tag(340, 296, 'Notch gauge fits ✓') : ''); } },
    { op: 0, d: 3.2, title: 'Free swing to measure friction loss', note: s => `Released without a specimen: β₀ = ${U.f(s.truth.beta0, 1)}°, loss = ${U.f(s.truth.Eloss, 2)} J`, draw(L, u, c) {
      const a = c.sim.alpha, b0 = c.sim.truth.beta0; const ang = !c.active ? a : u < .5 ? a - (a + b0) * E(u * 2) : -b0 + (a + b0) * E(u * 2 - 1); c.set('arm', 'transform', `rotate(${ang} 260 60)`);
      L.innerHTML = c.active && u > .4 ? tag(330, 40, `β₀ = ${U.f(b0, 1)}°`) : ''; } },
    { op: 1, d: 3, title: s => s.mode === 'izod' ? 'Specimen at room temperature' : 'Condition specimens in the bath', note: s => s.mode === 'izod' ? 'Three Izod specimens tested at 27 °C' : `Each specimen soaked ≥ 10 min at its test temperature (${s.list.map(x => x.T).join(', ')} °C)`, draw(L, u, c) {
      if (!c.active) { L.innerHTML = ''; return; } const iz = c.sim.mode === 'izod';
      L.innerHTML = iz ? tag(330, 220, 'T = 27 °C') : `<rect x="370" y="180" width="130" height="80" rx="6" class="fluid" opacity=".35"/><rect x="390" y="215" width="60" height="10" class="spec"/><rect x="470" y="150" width="8" height="90" rx="4" class="surf" stroke="var(--ink)"/><rect x="471" y="${240 - 70 * (1 - u)}" width="6" height="${70 * (1 - u) + 2}" class="bad"/>` + tag(330, 270, `T = ${c.sim.list[0].T} °C`); } },
    { op: 2, d: 2.6, title: 'Transfer and centre the specimen (≤ 5 s)', note: 'Centring tongs place the notch on the striker line', draw(L, u, c) {
      c.show('spg', true); const m = 1 - E(u); c.set('spg', 'transform', `translate(${150 * m},${-50 * m})`); L.innerHTML = c.active ? tongs(220 + 150 * m, 270 - 50 * m) : ''; } },
    { op: 2, d: 2, title: 'Latch the pendulum and stand clear', note: s => `Pendulum held at α = ${s.alpha}°; guard closed; release when ready`, draw(L, u, c) { c.set('arm', 'transform', `rotate(${c.sim.alpha} 260 60)`); L.innerHTML = c.active && u > .3 ? tag(320, 40, `Latched at α = ${c.sim.alpha}°`) : ''; } }
  ];

  /* ===================== 7 Fatigue ===================== */
  S.fatigue = [
    { op: 0, d: 2.8, title: 'Measure minimum diameter', note: s => `Micrometer at the neck: d = ${U.f(s.list[0].d, 3)} mm (specimen 1)`, draw(L, u, c) { c.show('wt', false); if (!c.active) { L.innerHTML = ''; return; } L.innerHTML = micV(260, 146, 156, E(u)) + tag(300, 104, `d_min = ${U.f(c.sim.list[0].d, 3)} mm`, 262, 136); } },
    { op: 1, d: 3, title: 'Mount in collets and check run-out', note: 'Collets tightened; dial indicator run-out ≤ 0.013 mm', draw(L, u, c) {
      const r = (u * 720) % 360; L.innerHTML = `<g transform="rotate(${c.active ? r : 0} 176 151)"><rect x="168" y="138" width="16" height="26" class="mach"/></g><g transform="rotate(${c.active ? -r : 0} 344 151)"><rect x="336" y="138" width="16" height="26" class="mach"/></g>` + (c.active ? `<circle cx="300" cy="104" r="16" class="surf" stroke="var(--ink)"/><line x1="300" y1="104" x2="${300 + 12 * Math.sin(u * 9)}" y2="${104 - 12 * Math.cos(u * 9)}" class="lnb" stroke-width="2"/><line x1="300" y1="120" x2="300" y2="141" class="lnm" stroke-width="2"/>` + (u > .6 ? tag(330, 96, 'Run-out 0.008 mm ✓') : '') : ''); } },
    { op: 2, d: 2.6, title: 'Hang the load', note: s => `W = ${U.f(s.list[0].W, 1)} N gives σ_a = ${U.f(s.list[0].sa, 0)} MPa`, draw(L, u, c) { c.show('wt', true); c.set('wt', 'transform', `translate(0,${-70 * (1 - E(u))})`); L.innerHTML = c.active && u > .6 ? tag(300, 230, `W = ${U.f(c.sim.list[0].W, 1)} N`, 284, 231) : ''; } },
    { op: 2, d: 2, title: 'Zero the counter, start the motor', note: '4500 rpm; automatic cut-off at fracture', draw(L, u, c) { if (!c.active) { c.txt('dN', '0'); L.innerHTML = ''; return; } c.txt('dN', blink(u) ? '0' : ''); L.innerHTML = u > .5 ? tag(150, 110, '4500 rpm') : ''; } }
  ];

  /* ===================== 8 Creep ===================== */
  const cw = (c, i, fn) => { const g = c.q('w' + i); if (g) fn(g.children[0], g.children[1], g); };
  S.creep = [
    { op: 0, d: 2.8, title: 'Measure wire diameter and mark gauge length', note: s => `d = ${U.f(s.truth.d, 2)} mm; gauge length 100 mm`, draw(L, u, c) { [0, 1, 2].forEach(i => cw(c, i, (w, wt, g) => { g.style.display = 'none'; })); if (!c.active) { L.innerHTML = ''; return; } L.innerHTML = `<rect x="200" y="110" width="140" height="6" class="spec"/>` + micV(270, 110, 116, E(u)) + tag(300, 60, `d = ${U.f(c.sim.truth.d, 2)} mm`, 272, 100); } },
    { op: 1, d: 2.6, title: 'Mount the wires in the three stations', note: 'Upper ends clamped to the frame; gauge marks inside the bath', draw(L, u, c) { [0, 1, 2].forEach(i => cw(c, i, (w, wt, g) => { g.style.display = ''; wt.style.display = 'none'; g.setAttribute('transform', `translate(0,${-30 * (1 - E(u))})`); })); L.innerHTML = ''; } },
    { op: 1, d: 2.6, title: 'Soak at test temperature', note: s => `${s.Tc} °C held for 15 min before loading`, draw(L, u, c) { L.innerHTML = `<rect x="40" y="60" width="440" height="150" rx="6" class="bad" opacity="${.12 * (c.active ? u : 1)}"/>` + (c.active ? tag(360, 70, `${c.sim.Tc} °C ± 1`) : ''); } },
    { op: 2, d: 2.8, title: 'Apply the dead weights smoothly', note: s => `Loads give σ = ${s.truth.s.map(v => U.f(v, 1)).join(', ')} MPa`, draw(L, u, c) { [0, 1, 2].forEach(i => cw(c, i, (w, wt) => { wt.style.display = ''; wt.setAttribute('transform', `translate(0,${-60 * (1 - E(u))})`); })); L.innerHTML = ''; } },
    { op: 3, d: 2.2, title: 'Attach LVDTs and start the logger', note: 'Extension logged against time from the moment of loading', draw(L, u, c) { L.innerHTML = [0, 1, 2].map(i => `<rect x="${100 + i * 140}" y="${90 - 20 * (1 - E(u))}" width="8" height="40" class="acc"/>`).join('') + (c.active && u > .6 ? tag(360, 30, 'Logger running') : ''); } }
  ];

  /* ===================== 9 Brinell ===================== */
  S.brinell = [
    { op: 0, d: 2.6, title: 'Prepare a flat, clean surface', note: 'Ground and polished; free of scale and oil', draw(L, u, c) { L.innerHTML = c.active ? cloth(216, 304, 175, u) + (u > .6 ? tag(330, 200, 'Flat, polished', 300, 178) : '') : ''; } },
    { op: 1, d: 2.6, title: 'Fit ball and set the test force', note: s => `${s.D} mm tungsten carbide ball; F = ${s.P} kgf; dwell ${s.dwell} s`, draw(L, u, c) { L.innerHTML = c.active ? `<circle cx="260" cy="138" r="${12 + 3 * Math.sin(u * 12)}" fill="none" stroke="var(--straw)" stroke-width="2"/>` + tag(300, 40, `Ø${c.sim.D} mm WC ball · ${c.sim.P} kgf`, 268, 132) : ''; } },
    { op: 2, d: 2.4, title: 'Raise the specimen to touch the ball', note: 'Elevating screw raised until the specimen just contacts the ball', draw(L, u, c) { c.set('tbl', 'transform', `translate(0,${30 * (1 - E(u))})`); L.innerHTML = c.active && u > .7 ? tag(330, 200, 'Contact', 290, 176) : ''; } }
  ];

  /* ===================== 10 Rockwell ===================== */
  S.rockwell = [
    { op: 0, d: 2.8, title: 'Verify on a standard test block', note: s => `Reading on the certified block is within tolerance for HR${s.S.name[2]}`, draw(L, u, c) { c.show('spR', false); if (!c.active) { L.innerHTML = ''; return; } L.innerHTML = `<rect x="170" y="164" width="60" height="16" class="steelD"/>` + (u > .5 ? tag(250, 140, 'Test block ✓', 230, 170) : ''); } },
    { op: 1, d: 2.4, title: 'Place the specimen on the anvil', note: 'Seated flat, clean underside, ≥ 3 diameters from edges', draw(L, u, c) { c.show('spR', true); c.set('spR', 'transform', `translate(${-150 * (1 - E(u))},0)`); L.innerHTML = ''; } },
    { op: 2, d: 2.6, title: 'Apply minor load and set the dial', note: 'Minor load 10 kgf; large pointer set to the set point', draw(L, u, c) { c.set('ind', 'transform', `translate(0,${8 * E(u)})`); c.set('ndl', 'transform', `rotate(${(1 - E(u)) * 300} 390 110)`); L.innerHTML = c.active && u > .6 ? tag(310, 166, '10 kgf · SET') : ''; } }
  ];

  /* ===================== 11 Vickers ===================== */
  S.vickers = [
    { op: 0, d: 2.4, title: 'Place the polished specimen on the stage', note: s => s.trav ? 'Etched cross-section of the carburised part, surface edge in view' : 'Mirror-polished surface, perpendicular to the indenter', draw(L, u, c) { c.set('spV', 'transform', `translate(${-160 * (1 - E(u))},0)`); L.innerHTML = ''; } },
    { op: 1, d: 2.8, title: 'Focus with the objective', note: 'Image brought into sharp focus before indenting', draw(L, u, c) { if (!c.active) { L.innerHTML = ''; return; } const b = (1 - E(u)) * 3;
      L.innerHTML = `<circle cx="440" cy="210" r="34" class="surf" stroke="var(--ink)"/><g style="filter:blur(${b}px)">${[0, 1, 2, 3].map(i => `<path d="M${414 + i * 13} 186 l6 22 l-10 14" fill="none" stroke="var(--ink)" stroke-width="1.5"/>`).join('')}</g>` + tag(380, 252, u > .7 ? 'In focus' : 'Focusing…'); } },
    { op: 1, d: 2.2, title: 'Select load and dwell time', note: s => s.trav ? 'HV 0.5, dwell 15 s; first indentation 0.1 mm from the surface' : 'Load series HV 0.5 → HV 30, dwell 15 s', draw(L, u, c) { L.innerHTML = c.active ? tag(350, 196, c.sim.trav ? 'HV 0.5 · 15 s' : 'HV 0.5–30 · 15 s') : ''; } }
  ];

  /* ===================== 12 Wear ===================== */
  S.wear = [
    { op: 0, d: 3, title: 'Clean, dry and weigh the pin', note: s => `Acetone ultrasonic clean; m₁ = ${U.f(s.truth.m1, 4)} g`, draw(L, u, c) { c.show('pin', false); c.show('wtW', false); if (!c.active) { L.innerHTML = ''; return; }
      L.innerHTML = `<rect x="80" y="110" width="120" height="34" rx="4" class="mach"/><rect x="104" y="96" width="74" height="6" class="steelD"/><rect x="134" y="${60 + 26 * E(Math.min(1, u * 2))}" width="14" height="36" class="spec"/><rect x="92" y="118" width="96" height="18" rx="2" class="disp"/><text x="98" y="131" style="fill:var(--straw)">${u > .55 ? U.f(c.sim.truth.m1, 4) + ' g' : '·····'}</text>`; } },
    { op: 0, d: 2.4, title: 'Measure pin diameter', note: s => `Micrometer: ${sv(s, 'Pin diameter')}`, draw(L, u, c) { if (!c.active) { L.innerHTML = ''; return; } L.innerHTML = `<rect x="130" y="70" width="14" height="60" class="spec"/>` + micH(110, 130, 144, E(u)) + tag(100, 140, sv(c.sim, 'Pin diameter')); } },
    { op: 2, d: 2.6, title: 'Mount the pin perpendicular to the disc', note: 'Pin clamped in the holder; face flat on the track', draw(L, u, c) { c.show('pin', true); c.set('pin', 'transform', `translate(0,${-46 * (1 - E(u))})`); L.innerHTML = c.active && u > .7 ? tag(150, 160, '90° to disc', 252, 172) : ''; } },
    { op: 2, d: 2.4, title: 'Apply the normal load', note: s => `Dead weight on the loading arm: F_N = ${s.F} N`, draw(L, u, c) { c.show('wtW', true); c.set('wtW', 'transform', `translate(0,${-50 * (1 - E(u))})`); L.innerHTML = ''; } },
    { op: 3, d: 2.2, title: 'Set disc speed and zero the channels', note: s => `N = ${s.rpm} rpm for the chosen sliding velocity; friction and wear channels zeroed`, draw(L, u, c) { if (!c.active) { c.txt('dF', '0.00'); c.txt('dM', '0.000'); c.txt('dW', '0'); L.innerHTML = ''; return; } zero(c, ['dF', 'dM', 'dW'], u, ['0.00', '0.000', '0']); L.innerHTML = tag(60, 30, `${c.sim.rpm} rpm`); } }
  ];

  /* ===================== 13 Ultrasonic ===================== */
  S.ultrasonic = [
    { op: 0, d: 2.4, title: 'Clean the test surface', note: 'Loose scale and dirt removed for good coupling', draw(L, u, c) { c.set('probe', 'transform', 'translate(60,-60)'); L.innerHTML = c.active ? cloth(50, 470, 116, u) : ''; } },
    { op: 0, d: 2.6, title: 'Connect probe and set the pulser', note: s => `Normal 0° probe, ${s.truth.f} MHz, single-crystal pulse-echo mode`, draw(L, u, c) { L.innerHTML = `<path d="M60 ${26} C60 ${10} 20 10 14 40" fill="none" stroke="var(--ink)" stroke-width="2" stroke-dasharray="${300 * (c.active ? E(u) : 1)} 400"/>` + (c.active && u > .6 ? tag(90, 20, `${c.sim.truth.f} MHz · 0° · pulse-echo`) : ''); } },
    { op: 0, d: 2.4, title: 'Apply couplant', note: 'Glycerine film along the scan line removes the air gap', draw(L, u, c) { L.innerHTML = drops(40, 480, 118, c.active ? u : 1, 18); } },
    { op: 0, d: 2.2, title: 'Place the probe on the surface', note: 'Probe seated with steady pressure; calibration on the 25 mm block follows', draw(L, u, c) { c.set('probe', 'transform', `translate(60,${-60 * (1 - E(u))})`); } }
  ];

  /* ===================== 14 MPI ===================== */
  S.mpi = [
    { op: 0, d: 2.4, title: 'Pre-clean the shaft', note: 'Oil, scale and paint removed', draw(L, u, c) { L.innerHTML = c.active ? cloth(80, 440, 104, u) : ''; } },
    { op: 0, d: 2.8, title: 'Check bath concentration', note: 'Settling test in the centrifuge tube: 0.1–0.4 mL per 100 mL (fluorescent)', draw(L, u, c) { if (!c.active) { L.innerHTML = ''; return; } const h = 14 * E(u); L.innerHTML = `<path d="M40 14 H60 V56 L50 66 L40 56 Z" fill="var(--surface)" stroke="var(--ink)"/><path d="M41 ${56 - h} H59 V56 L50 65 L41 56 Z" class="straw" opacity=".9"/>` + (u > .6 ? tag(70, 30, '0.2 mL / 100 mL ✓') : ''); } },
    { op: 1, d: 2.6, title: 'Clamp the shaft between the head-stocks', note: s => `Contact pads tight; L/D = ${U.f(s.truth.LD, 1)}`, draw(L, u, c) { const o = 26 * (1 - E(u)); c.set('hs1', 'transform', `translate(${-o},0)`); c.set('hs2', 'transform', `translate(${o},0)`); c.set('shaftR', 'transform', `translate(0,${-30 * (1 - E(Math.min(1, u * 2)))})`); L.innerHTML = ''; } },
    { op: 1, d: 2.8, title: 'Verify the field with a pie gauge', note: s => `Coil ${U.f(s.truth.Icoil, 0)} A / head shot ${U.f(s.truth.Ihead, 0)} A; pie gauge shows field direction`, draw(L, u, c) { if (!c.active) { L.innerHTML = ''; return; } let sp = ''; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; sp += `<line x1="380" y1="120" x2="${380 + 16 * Math.cos(a)}" y2="${120 + 16 * Math.sin(a)}" stroke="var(--ink)"/>`; }
      L.innerHTML = `<polygon points="${[...Array(8)].map((_, i) => `${380 + 17 * Math.cos(i * Math.PI / 4 + .39)},${120 + 17 * Math.sin(i * Math.PI / 4 + .39)}`).join(' ')}" fill="var(--surface)" stroke="var(--ink)"/>${sp}<line x1="${380 - 14}" y1="120" x2="${380 + 14}" y2="120" stroke="var(--bad)" stroke-width="3" opacity="${E(u)}"/>` + tag(330, 160, 'Indication on pie gauge ✓', 380, 136); } }
  ];

  /* ===================== 15 Dye penetrant ===================== */
  S.dpt = [
    { op: 0, d: 2.4, title: 'Check surface temperature', note: 'Contact thermometer: 28 °C, within the 10–52 °C range', draw(L, u, c) { L.innerHTML = c.active ? `<rect x="100" y="${52 - 30 * (1 - E(u))}" width="8" height="40" rx="4" class="surf" stroke="var(--ink)"/>` + (u > .5 ? tag(120, 50, '28 °C ✓') : '') : ''; } },
    { op: 0, d: 2.4, title: 'Check the lighting', note: 'White light ≥ 1000 lux at the surface', draw(L, u, c) { L.innerHTML = c.active ? `<path d="M240 6 h40 l-8 14 h-24 z" class="mach"/>` + [0, 1, 2, 3, 4].map(i => `<line x1="${246 + i * 7}" y1="22" x2="${210 + i * 25}" y2="${22 + 20 * E(u)}" stroke="var(--straw)" stroke-width="1.5"/>`).join('') + (u > .6 ? tag(300, 6, '1200 lux ✓') : '') : ''; } },
    { op: 0, d: 2.4, title: 'Check and shake the penetrant kit', note: 'Cleaner, penetrant and developer from the same family and batch', draw(L, u, c) { c.set('can', 'transform', `translate(${470 + (c.active ? 5 * Math.sin(u * 50) : 0)},20)`); L.innerHTML = c.active && u > .5 ? tag(330, 120, 'Same family ✓', 476, 100) : ''; } }
  ];

  /* ===================== 16 Specimen preparation ===================== */
  S.specprep = [
    { op: 0, d: 2.4, title: 'Mark the section to be examined', note: 'Plane of interest marked; specimen about 15 mm square', draw(L, u, c) { L.innerHTML = c.active ? `<line x1="230" y1="${110}" x2="${230 + 60 * E(u)}" y2="110" stroke="var(--bad)" stroke-width="2" stroke-dasharray="5 4"/>` + (u > .6 ? tag(300, 70, 'Section plane', 290, 110) : '') : ''; } },
    { op: 0, d: 2.4, title: 'Check coolant on the cut-off wheel', note: 'Coolant flooding the cut prevents heat damage', draw(L, u, c) { L.innerHTML = c.active ? `<circle cx="100" cy="80" r="34" class="mach2"/><circle cx="100" cy="80" r="6" class="ink"/>` + drops(80, 124, 122, u, 6) + tag(150, 60, 'Coolant on ✓') : ''; } },
    { op: 0, d: 2.4, title: 'Fit the first SiC paper and start the water', note: 'P220 on the wheel; water flowing; wheel 300 rpm', draw(L, u, c) { c.set('wheel', 'class', 'mut'); L.innerHTML = c.active ? drops(140, 380, 146, u, 12) + (u > .5 ? tag(340, 190, 'P220 · water on') : '') : ''; } }
  ];

  /* ===================== 17 Microstructure ===================== */
  S.microstructure = [
    { op: 0, d: 2.2, title: 'Clean the objective lens', note: 'Lens tissue only; never touch the lens', draw(L, u, c) { L.innerHTML = c.active ? `<rect x="${350 + 20 * Math.sin(u * 20)}" y="160" width="30" height="10" rx="2" fill="var(--surface)" stroke="var(--muted)"/>` : ''; } },
    { op: 0, d: 2.6, title: 'Place the specimen face down on the stage', note: s => `Specimen ${s.code}, polished and etched face towards the objective`, draw(L, u, c) { L.innerHTML = `<rect x="${345 + 120 * (1 - (c.active ? E(u) : 1))}" y="102" width="40" height="18" rx="3" class="spec"/>`; } },
    { op: 0, d: 2.2, title: 'Select the 10× objective', note: 'Start at low magnification to find a representative field', draw(L, u, c) { c.set('obj', 'transform', `translate(${c.active ? 20 * (1 - E(u)) : 0},0)`); L.innerHTML = c.active && u > .6 ? tag(390, 160, '10× objective', 372, 150) : ''; } }
  ];

  /* ===================== 18 Grain size ===================== */
  S.grainsize = [
    { op: 0, d: 3, title: 'Calibrate magnification with a stage micrometer', note: '1 mm scale with 0.01 mm divisions imaged at 100×', draw(L, u, c) { if (!c.active) { L.innerHTML = ''; return; } let t = ''; for (let i = 0; i <= 10; i++) t += `<line x1="${400 + i * 8}" y1="120" x2="${400 + i * 8}" y2="${i % 5 ? 128 : 134}" stroke="var(--ink)"/>`; L.innerHTML = `<circle cx="440" cy="130" r="40" class="surf" stroke="var(--ink)" opacity="${E(u)}"/><line x1="400" y1="120" x2="480" y2="120" stroke="var(--ink)"/>${t}` + tag(372, 180, '0.1 mm = 80 px ✓'); } },
    { op: 0, d: 2.8, title: 'Load the cold-rolled specimen into the furnace', note: s => `Annealing at ${s.T} °C for 1 h`, draw(L, u, c) { if (!c.active) { L.innerHTML = ''; return; } const x = 230 - 120 * E(u), y = 160 - 50 * E(u); L.innerHTML = `<rect x="${x}" y="${y}" width="22" height="10" class="spec"/>` + tongs(x + 40, y + 30) + tag(40, 170, `${c.sim.T} °C · 1 h`); } }
  ];

  /* ===================== 19 Jominy ===================== */
  S.jominy = [
    { op: 0, d: 2.6, title: 'Check the free water jet', note: 'Nozzle 12.5 mm; unimpeded jet height 63.5 mm', draw(L, u, c) { c.show('bar', false); c.op('jet', c.active ? .9 : 0); L.innerHTML = c.active ? dimV(370, 228, 228 - 64 * E(u), u > .6 ? '63.5 mm' : '') : ''; } },
    { op: 0, d: 2.2, title: 'Check water temperature', note: 'Water at 5–30 °C (24 °C measured)', draw(L, u, c) { L.innerHTML = c.active ? `<rect x="380" y="200" width="8" height="40" rx="4" class="surf" stroke="var(--ink)"/><rect x="381" y="${238 - 14 * E(u)}" width="6" height="${14 * E(u) + 1}" class="fluid"/>` + tag(398, 206, '24 °C ✓') : ''; } },
    { op: 0, d: 2.8, title: 'Austenitise the bar in the furnace', note: s => `${s.Ta} °C for 30 min, packed in charcoal against decarburisation`, draw(L, u, c) { c.op('fglow', .3 + .6 * (c.active ? E(u) : 1)); L.innerHTML = c.active ? `<rect x="${200 - 116 * E(u)}" y="${120 - 30 * E(u)}" width="32" height="70" rx="2" class="spec"/>` + tag(40, 220, `${c.sim.Ta} °C · 30 min`) : ''; } }
  ];

  /* ===================== 20 Heat treatment ===================== */
  S.heattreat = [
    { op: 0, d: 2.4, title: 'Number the seven specimens', note: 'Stamped 1–7 on the side face', draw(L, u, c) { c.show('sp', false); L.innerHTML = c.active ? [...Array(7)].map((_, i) => `<circle cx="${180 + i * 34}" cy="216" r="10" class="spec"/>${i / 7 < u ? `<text x="${176 + i * 34}" y="220">${i + 1}</text>` : ''}`).join('') : ''; } },
    { op: 0, d: 2.4, title: 'Check furnace temperature', note: s => `Thermocouple reading ${s.truth.Th} °C (Ac₃ + 40 °C)`, draw(L, u, c) { c.op('glow', .3 + .6 * (c.active ? E(u) : 1)); L.innerHTML = c.active ? tag(160, 40, `${c.sim.truth.Th} °C`, 120, 70) : ''; } },
    { op: 0, d: 2.8, title: 'Load specimens with tongs', note: 'All seven soaked together for 1 hour', draw(L, u, c) { L.innerHTML = c.active ? [...Array(7)].map((_, i) => { const t = U.clamp(u * 1.6 - i * .09, 0, 1); return `<circle cx="${180 + i * 34 - (180 + i * 34 - (60 + (i % 4) * 22)) * E(t)}" cy="${216 - (216 - (80 + Math.floor(i / 4) * 30)) * E(t)}" r="8" class="${t > .9 ? 'bad' : 'spec'}"/>`; }).join('') : ''; } },
    { op: 2, d: 2.4, title: 'Prepare the quench tanks', note: 'Water 25 °C and oil 60 °C, agitated', draw(L, u, c) { L.innerHTML = c.active ? [...Array(10)].map((_, i) => `<circle cx="${200 + (i % 5) * 12 + (i > 4 ? 90 : 0)}" cy="${165 - ((u * 60 + i * 9) % 50)}" r="2.5" fill="var(--surface)" opacity=".8"/>`).join('') + tag(190, 196, 'Water 25 °C · Oil 60 °C') : ''; } }
  ];

  /* ===================== 21 XRD ===================== */
  S.xrd = [
    { op: 0, d: 2.8, title: 'Pack the powder into the holder', note: 'Back-loaded and pressed flat with a glass slide to avoid preferred orientation', draw(L, u, c) { c.show('xs', false); if (!c.active) { L.innerHTML = ''; return; } L.innerHTML = `<rect x="40" y="100" width="80" height="16" class="mach2"/><rect x="56" y="102" width="48" height="10" class="spec"/><rect x="36" y="${70 + 26 * E(u)}" width="88" height="5" fill="var(--surface)" stroke="var(--accent)"/>` + (u > .7 ? tag(140, 96, 'Flat surface ✓') : ''); } },
    { op: 0, d: 2.4, title: 'Mount the holder at the goniometer centre', note: 'Specimen surface on the focusing circle', draw(L, u, c) { c.show('xs', true); c.set('xs', 'transform', `translate(${-180 * (1 - E(u))},${-90 * (1 - E(u))})`); L.innerHTML = ''; } },
    { op: 1, d: 2.8, title: 'Close the enclosure and ramp the tube', note: 'Interlock closed; tube raised slowly to 40 kV / 30 mA', draw(L, u, c) { L.innerHTML = c.active ? `<rect x="70" y="40" width="380" height="225" rx="10" fill="var(--accent)" opacity=".06" stroke="var(--accent)" stroke-dasharray="6 5"/>` + tag(300, 50, `${Math.round(40 * E(u))} kV · ${Math.round(30 * E(u))} mA`) : ''; } }
  ];

  /* ===================== 22 SEM ===================== */
  S.sem = [
    { op: 0, d: 2.6, title: 'Mount the specimen on a stub', note: 'Fracture face up, conductive carbon tape; surface never touched', draw(L, u, c) { c.show('ss', false); if (!c.active) { L.innerHTML = ''; return; } L.innerHTML = `<rect x="60" y="210" width="46" height="8" rx="2" class="steelD"/><rect x="74" y="218" width="18" height="18" class="steelD"/><rect x="62" y="206" width="42" height="4" class="ink" opacity="${E(u)}"/><rect x="70" y="${196 - 30 * (1 - E(u))}" width="26" height="10" class="spec"/>` + tag(120, 190, 'Carbon tape'); } },
    { op: 0, d: 2.6, title: 'Load the stub and close the chamber', note: 'Stage set to working distance 10 mm before pumping', draw(L, u, c) { c.show('ss', true); c.set('ss', 'transform', `translate(${-180 * (1 - E(u))},0)`); L.innerHTML = c.active && u > .6 ? tag(330, 240, 'WD 10 mm', 276, 200) : ''; } }
  ];

  /* ---------- interlock reasons: shown when a later action is chosen before this step ---------- */
  const WHY = {
    tensile: ['Every stress is calculated from the measured area, and the bar cannot be measured once it is gripped.', 'Gauge marks are needed to position the extensometer and to measure elongation after fracture.', 'The specimen must be held in both grips before anything is zeroed or attached.', 'Load and extension must start from zero with the specimen on axis, otherwise every reading carries an offset.', 'The modulus can only be measured if the extensometer is fitted before loading starts.'],
    compression: ['Height and diameter set the area and strain; they must be known before the specimen is loaded.', 'Dirty platens tilt the specimen and change friction; clean them before the specimen goes in.', 'The specimen must sit centrally on the lower platen before instruments or guards are fitted.', 'The compressometer and guard go on before any load is applied.', 'Readings must start from zero after the seating load removes slack.'],
    shear: ['The shear area comes from the measured diameter, so measure before the bar goes into the fixture.', 'The bar must pass through the fixture bores before the fixture is positioned.', 'The fixture must be centred under the crosshead before loading.', 'The load reading must be zeroed before the blade is pushed down.'],
    torsion: ['J depends on d⁴, so the diameter must be measured before the bar is clamped.', 'The reference line is scribed while the bar is free, before it goes into the chucks.', 'Both ends must be clamped before the troptometer can be fitted.', 'The troptometer measures elastic twist, so it must be on before torque is applied.', 'Torque and angle must read zero before twisting starts.'],
    bending: ['I depends on h³, so the section must be measured before the beam is placed.', 'The span must be set before the beam is placed on the supports.', 'The beam must rest on the supports before load or gauges are applied.', 'The hanger must be at the load point before the dial gauge is set against the beam.', 'The dial must be zeroed with the hanger in place, before weights are added.'],
    impact: ['A damaged or out-of-size notch makes the result meaningless; check it before conditioning.', 'Friction loss is measured with no specimen on the anvils, so do the free swing first.', 'Specimens must reach the test temperature before they are placed on the anvils.', 'The specimen must be centred on the anvils before the pendulum is latched for the strike.', 'The pendulum is latched last, with everyone clear of the swing.'],
    fatigue: ['Stress depends on d³ at the neck, so measure before mounting.', 'The specimen must run true in the collets before any load is hung.', 'The load must be hung before the motor is started.', 'The counter must be zeroed before the motor starts.'],
    creep: ['Stress is calculated from the wire diameter, so measure it before mounting.', 'The wires must be mounted in the stations before the bath is brought to temperature.', 'The wires must soak at temperature before any load is applied.', 'Loads are applied only after the soak, smoothly and without shock.', 'Logging starts at the moment of loading, so the LVDTs go on last.'],
    brinell: ['A rough or scaled surface gives an unreadable impression; prepare it first.', 'The ball and force must be set before the specimen is raised to the indenter.', 'The specimen is raised to the ball only after the correct force is selected.'],
    rockwell: ['The machine must be verified on a standard block before testing parts.', 'The specimen must be seated on the anvil before any load is applied.', 'The minor load sets the reference; it comes before the major load.'],
    vickers: ['The polished specimen must be on the stage before focusing.', 'The image must be in focus before an indentation is made at that spot.', 'Load and dwell are selected before indenting.'],
    wear: ['The initial mass m₁ must be recorded before the pin is used.', 'The pin diameter is needed to convert height loss to volume.', 'The pin must be clamped square before load is applied.', 'The normal load must be on before sliding starts.', 'Speed and zero are set last, immediately before starting.'],
    ultrasonic: ['Scale and dirt block the sound; clean the surface first.', 'The probe must be connected and the pulser set before placing it.', 'Couplant must be on the surface before the probe is placed.', 'The probe is placed only after couplant is applied.'],
    mpi: ['Oil and scale hide indications; the shaft must be clean first.', 'A weak or contaminated bath gives false results; check it before magnetising.', 'The shaft must be clamped for current to flow.', 'The field strength and direction are verified before inspection.'],
    dpt: ['Penetrant behaviour depends on surface temperature; check it first.', 'Indications cannot be judged without adequate light.', 'Mixed product families may not work together; check the kit before applying anything.'],
    specprep: ['The plane of interest must be marked before cutting.', 'Coolant must be flowing before the cut to avoid heat damage.', 'Grinding starts with the coarsest paper and running water.'],
    microstructure: ['A dirty lens gives a hazy image; clean it first.', 'The specimen must be on the stage before an objective is chosen.', 'Start with the low-power objective to find a representative field.'],
    grainsize: ['All lengths depend on the magnification, so calibrate first.', 'The specimen must be annealed before it is examined.'],
    jominy: ['The jet must be set before the hot bar arrives, because transfer must take under five seconds.', 'Water temperature affects the quench and must be checked before austenitising.', 'The bar is austenitised only when the fixture is ready.'],
    heattreat: ['Specimens must be identified before they go into the furnace together.', 'The furnace must be at temperature before loading.', 'Specimens go in only once the furnace is at temperature.', 'Quench tanks must be ready before the soak ends.'],
    xrd: ['The powder must be packed flat before mounting.', 'The holder must be mounted before the enclosure is closed.', 'The tube is ramped only after the enclosure and interlock are closed.'],
    sem: ['The specimen must be mounted on a stub before loading.', 'The chamber is closed and pumped only after the stub is loaded.']
  };
  Object.keys(WHY).forEach(id => (S[id] || []).forEach((st, i) => { if (WHY[id][i]) st.why = WHY[id][i]; }));
})();
