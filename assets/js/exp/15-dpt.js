(function () {
  const U = LAB.U, G = LAB.G;
  const PW = 200, PH = 120; // plate mm
  const DWELL = { 2: '2 min', 5: '5 min', 10: '10 min', 20: '20 min' };
  const REM = { wipe: 'Wipe with lint-free cloth, then cloth dampened with remover (correct)', spray: 'Spray remover directly on surface (over-removal)', dry: 'Dry wipe only (insufficient removal)' };
  const DEV = { thin: 'Thin, even non-aqueous developer', heavy: 'Heavy, thick developer coat' };
  function defects(r) {
    const pool = [
      { name: 'Transverse crack in weld', type: 'crack', w: 1.2, depth: 3, len: 7, ang: 90 },
      { name: 'Longitudinal crack at toe', type: 'crack', w: 2.5, depth: 2, len: 16, ang: 0 },
      { name: 'Crater crack', type: 'star', w: 1.5, depth: 1.5, len: 5, ang: 0 },
      { name: 'Surface porosity (single pore)', type: 'pore', w: 400, depth: 0.4, len: 2.6, ang: 0 },
      { name: 'Linear porosity (aligned pores)', type: 'linpore', w: 250, depth: 0.5, len: 1.6, ang: 0 },
      { name: 'Lack of fusion at toe', type: 'crack', w: 30, depth: 0.25, len: 10, ang: 0 },
      { name: 'Large pore', type: 'pore', w: 800, depth: 1.2, len: 5.5, ang: 0 }
    ];
    const k = 4 + Math.floor(r() * 2); const pick = pool.slice().sort(() => r() - .5).slice(0, k);
    return pick.map((d, i) => ({ ...d, x: 20 + (i + 0.5) * (160 / k) + (r() - .5) * 12, y: d.name.includes('toe') ? (r() < .5 ? 48 : 72) : 52 + r() * 16, len: U.q(d.len * (0.85 + 0.3 * r()), 0.1), ang: d.ang + (r() - .5) * 10 }));
  }
  LAB.register({
    id: 'dpt', no: 15, cat: 'ndt', title: 'Dye Penetrant Testing', std: 'IS 3658:1999 / ASTM E165/E165M / ISO 3452-1; acceptance ASME VIII Div. 1 App. 8', short: 'Solvent-removable visible-dye inspection of a weld: effect of dwell time, excess-penetrant removal and developer on what you find; linear vs rounded classification and acceptance.', tags: 'PT liquid penetrant dye developer dwell capillary weld',
    aim: 'To detect surface-breaking discontinuities in a welded plate by the solvent-removable visible dye penetrant method, to study the effect of process variables on detectability, and to evaluate indications against ASME acceptance criteria.',
    objectives: ['Carry out the six steps of penetrant testing in the correct order.', 'Observe how dwell time, removal method and developer thickness affect indications.', 'Measure and classify indications as linear or rounded.', 'Apply ASME Section VIII Appendix 8 acceptance criteria.'],
    apparatus: ['Solvent-removable visible red dye penetrant kit (cleaner/remover, penetrant, non-aqueous developer) — Type II, Method C', 'Lint-free cloths, wire brush', 'Steel rule / magnifier 5×', 'Stopwatch; light meter (≥ 1000 lux)', 'Welded test plate with known discontinuities'],
    stdNote: 'ASME V T-672: minimum dwell 5 min at 10–52 °C; development time 10–60 min. Linear indication: length ≥ 3 × width.',
    params: [
      { id: 'dw', label: 'Penetrant dwell time', type: 'select', options: Object.entries(DWELL), def: '10' },
      { id: 'rem', label: 'Excess penetrant removal', type: 'select', options: Object.entries(REM), def: 'wipe' },
      { id: 'dev', label: 'Developer application', type: 'select', options: Object.entries(DEV), def: 'thin' }
    ],
    opSteps: ['Pre-clean and dry the weld area', 'Apply penetrant; allow dwell time', 'Remove excess penetrant', 'Apply developer', 'Development time (10 min); bleed-out', 'Inspect under white light; measure indications', 'Post-clean'],
    svg(p) {
      return G.svg('0 0 520 200', `${G.r(0, 0, 520, 200, 'bg')}${G.r(60, 40, 400, 120, 'steel', 'rx="2"')}${G.r(60, 90, 400, 20, 'steelD')}
        <g id="can" transform="translate(470,20)">${G.r(0, 10, 26, 60, 'bad', 'rx="4"')}${G.r(6, 0, 14, 12, 'mach')}${G.t(-2, 86, '', 'm', 'id="canl"')}</g>
        <rect id="coat" x="60" y="40" width="400" height="120" fill="var(--bad)" opacity="0"/>
        <g transform="translate(16,8)">${G.t(0, 12, '', 'm', 'id="lab"')}</g>`, 'Weld plate under penetrant inspection');
    },
    anim(svg, f, sim) {
      const st = sim ? sim.stage(f) : { k: 'ready' }; const coat = svg.querySelector('#coat'); if (!coat) return;
      const map = { clean: ['var(--steel)', 0], pen: ['var(--bad)', 0.55], rem: ['var(--bad)', 0.12], dev: ['var(--surface)', 0.9], bleed: ['var(--surface)', 0.9], insp: ['var(--surface)', 0.9], ready: ['var(--steel)', 0] };
      const m = map[st.k] || map.ready; coat.setAttribute('fill', m[0]); coat.setAttribute('opacity', m[1]); G.txt(svg, 'lab', st.label || 'Ready'); G.txt(svg, 'canl', st.can || '');
    },
    liveView(el, f, sim, p, api) {
      api.title('Weld plate surface'); api.sub('200 × 120 mm, white light');
      let c = el.querySelector('canvas'); if (!c || c._sim !== sim) { el.innerHTML = ''; c = G.canvas(800, 480); c._sim = sim; el.appendChild(c); c._steel = steel(sim, false); c._dev = steel(sim, true); }
      const g = c.getContext('2d'); const st = sim.stage(f); const sx = 800 / PW, sy = 480 / PH;
      g.drawImage(st.k === 'dev' || st.k === 'bleed' || st.k === 'insp' ? c._dev : c._steel, 0, 0);
      if (st.k === 'pen' || st.k === 'rem') { g.fillStyle = `rgba(200,20,30,${st.k === 'pen' ? 0.75 : sim.bg})`; g.fillRect(0, 0, 800, 480); }
      if (st.k === 'dev' && sim.bg > 0.05) { g.fillStyle = `rgba(230,120,130,${sim.bg * 0.8})`; g.fillRect(0, 0, 800, 480); }
      if (st.k === 'bleed' || st.k === 'insp') {
        if (sim.bg > 0.05) { g.fillStyle = `rgba(230,120,130,${sim.bg * 0.8})`; g.fillRect(0, 0, 800, 480); }
        const grow = st.k === 'insp' ? 1 : st.t;
        sim.ind.forEach(d => { const bl = (1.5 + 3 * grow) * Math.min(1.4, 0.6 + d.vol); g.save(); g.globalAlpha = U.clamp(d.S, 0.25, 1) * Math.min(1, 0.3 + grow); g.fillStyle = 'rgb(205,25,35)'; g.strokeStyle = 'rgb(205,25,35)'; g.filter = `blur(${bl}px)`;
          const X = d.x * sx, Y = d.y * sy;
          if (d.type === 'pore') { g.beginPath(); g.arc(X, Y, d.len / 2 * sx * 0.75 + bl, 0, 7); g.fill(); }
          else if (d.type === 'linpore') { for (let q = 0; q < 5; q++) { g.beginPath(); g.arc(X + (q - 2) * (d.len + 1.0) * sx, Y, d.len / 2 * sx * 0.7 + bl * .5, 0, 7); g.fill(); } }
          else if (d.type === 'star') { g.lineWidth = 3 + bl; for (let q = 0; q < 4; q++) { const a = q * Math.PI / 4 + 0.3; g.beginPath(); g.moveTo(X - Math.cos(a) * d.len * sx / 2, Y - Math.sin(a) * d.len * sx / 2); g.lineTo(X + Math.cos(a) * d.len * sx / 2, Y + Math.sin(a) * d.len * sx / 2); g.stroke(); } }
          else { const a = d.ang * Math.PI / 180; g.lineWidth = 2.5 + bl; g.lineCap = 'round'; g.beginPath(); const n = 10; for (let q = 0; q <= n; q++) { const t = q / n - .5; const xx = X + Math.cos(a) * d.len * sx * t + Math.sin(q * 1.9 + d.x) * 2, yy = Y + Math.sin(a) * d.len * sx * t + Math.cos(q * 2.3) * 2; q ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); }
          g.restore(); });
        if (st.k === 'insp') { g.font = '13px "IBM Plex Mono",monospace'; g.fillStyle = 'rgba(20,20,20,.8)'; sim.ind.forEach(d => g.fillText(d.id, d.x * sx + 10, d.y * sy - 14)); }
      }
      g.strokeStyle = 'rgba(0,0,0,.35)'; g.font = '11px "IBM Plex Mono",monospace'; g.fillStyle = 'rgba(0,0,0,.5)'; for (let x = 0; x <= PW; x += 20) { g.beginPath(); g.moveTo(x * sx, 480); g.lineTo(x * sx, 470); g.stroke(); if (x % 40 === 0) g.fillText(x, x * sx + 2, 466); }
    },
    simulate(p, r) {
      const defs = defects(r); const dw = p.dw;
      const ind = [];
      defs.forEach(d => {
        let S = 1; const fillTime = d.w < 2 ? 8 : d.w < 5 ? 4 : 1.5; S *= U.clamp(dw / fillTime, 0, 1);
        if (p.rem === 'spray') { if (d.w > 20 && d.depth < 0.6) S *= 0.1; else S *= d.w > 20 ? 0.6 : 0.55; }
        if (p.dev === 'heavy' && d.w < 2) S *= 0.35;
        const vol = U.clamp(d.depth * Math.min(d.w, 200) / 120, 0.2, 1);
        if (S >= 0.35) ind.push({ ...d, S, vol });
      });
      const bg = p.rem === 'dry' ? 0.22 : 0;
      if (p.rem === 'dry') { ind.push({ name: 'Background bleed in weld ripple', type: 'crack', w: 50, depth: 0.1, len: 22, ang: 0, x: 100 + 40 * (r() - .5), y: 58, S: 0.4, vol: 0.3, fake: true }); }
      ind.sort((a, b) => a.x - b.x); ind.forEach((d, i) => d.id = 'P' + (i + 1));
      const meas = ind.map(d => { const grow = 1 + 0.6 * d.vol; let Lm, Wm; if (d.type === 'pore') { Lm = d.len * grow; Wm = Lm * (0.85 + 0.1 * r()); } else if (d.type === 'linpore') { Lm = d.len * grow * (0.9 + 0.2 * r()); Wm = Lm * 0.9; } else if (d.type === 'star') { Lm = d.len * 1.1; Wm = Lm * 0.55; } else { Lm = d.len + 1.0 * grow; Wm = 0.8 + 0.9 * d.vol; } return { ...d, L: U.q(Lm, 0.5), W: U.q(Wm, 0.5) }; });
      meas.forEach(m => { m.cls = m.L >= 3 * m.W ? 'Linear' : 'Rounded'; m.rel = m.L > 1.6; });
      // aligned pores count as one group (four or more in a line) => reject criterion
      const linpore = meas.find(m => m.type === 'linpore');
      const relLin = meas.filter(m => m.rel && m.cls === 'Linear' && !m.fake).length; const relRnd = meas.filter(m => m.rel && m.cls === 'Rounded' && !m.fake);
      const bigRnd = relRnd.filter(m => m.L > 4.8).length;
      const reject = relLin > 0 || bigRnd > 0 || !!linpore;
      const missed = defs.length - meas.filter(m => !m.fake).length;
      const T = { nLin: meas.filter(m => m.cls === 'Linear' && !m.fake).length, nRnd: meas.filter(m => m.cls === 'Rounded' && !m.fake).length, relLin, bigRnd, accept: reject ? 'Reject' : 'Accept', missed, nTot: defs.length, dwOk: dw >= 5 ? 'Adequate (≥ 5 min)' : 'Inadequate (< 5 min)' };
      const stages = [['clean', 0.1, 'Pre-cleaning', 'CLEANER'], ['pen', 0.3, `Penetrant dwell ${dw} min`, 'PENETRANT'], ['rem', 0.42, 'Removing excess penetrant', 'REMOVER'], ['dev', 0.55, 'Applying developer', 'DEVELOPER'], ['bleed', 0.85, 'Development (bleed-out)', ''], ['insp', 1.01, 'Inspection', '']];
      return {
        defs, ind: meas, bg, dur: 10, M: { name: 'Weld plate' },
        stage(f) { let s0 = 0; for (const s of stages) { if (f < s[1] || s[0] === 'insp') return { k: s[0], t: (f - s0) / (s[1] - s0), label: s[2], can: s[3] }; s0 = s[1]; } },
        readout(f) { const st = this.stage(f); return [['Step', st.label, ''], ['Dwell set', dw, 'min'], ['Indications', st.k === 'insp' ? meas.length : '—', ''], ['Light', '1200', 'lux']]; },
        specimen: [['Part', 'Butt-welded plate, IS 2062 E250, 200 × 120 × 12 mm, weld as-deposited', ''], ['Penetrant system', 'Type II (visible), Method C (solvent removable), sensitivity level 2', ''], ['Dwell time', DWELL[dw], ''], ['Removal', REM[p.rem], ''], ['Developer', DEV[p.dev], ''], ['Development time', 10, 'min'], ['Surface temperature', 28, '°C'], ['Reference record', `Plate contains ${defs.length} known surface discontinuities (radiography/fabrication record)`, ''], ['Acceptance', 'ASME VIII Div. 1 App. 8', '']],
        obs: [{ title: 'Table 1. Indications recorded after 10 min development', cols: ['ID', 'x (mm)', 'y (mm)', 'Length L (mm)', 'Width W (mm)', 'Remarks'], textCols: [0, 5], rows: meas.length ? meas.map(m => [m.id, U.f(m.x, 0), U.f(m.y, 0), U.f(m.L, 1), U.f(m.W, 1), m.fake ? 'Diffuse pink, follows weld ripple' : m.type === 'linpore' ? 'Group of 5 round spots in a line, ~1 mm apart' : m.type === 'star' ? 'Star-shaped at crater' : '']) : [['—', '—', '—', '—', '—', 'No indications']] }],
        truth: T
      };
    },
    calcs(sim) { const T = sim.truth; return [{ key: 'nlin', label: 'Number of relevant linear indications (L ≥ 3W)', unit: '—', truth: T.nLin, abs: 0, hint: 'classify each row; exclude false indications' }, { key: 'nrnd', label: 'Number of rounded indications (L < 3W)', unit: '—', truth: T.nRnd, abs: 0, hint: 'classify each row; exclude false indications' }, { key: 'big', label: 'Relevant rounded indications larger than 4.8 mm', unit: '—', truth: T.bigRnd, abs: 0, hint: 'ASME App. 8' }, { key: 'acc', label: 'Disposition of the weld', type: 'select', options: ['Accept', 'Reject'], truth: T.accept }, { key: 'miss', label: 'Known discontinuities NOT detected', unit: '—', truth: T.missed, abs: 0, hint: 'known total − real indications' }, { key: 'dw', label: 'Was the dwell time adequate (ASME V T-672)?', type: 'select', options: ['Adequate (≥ 5 min)', 'Inadequate (< 5 min)'], truth: T.dwOk }]; },
    reference(sim) { const T = sim.truth; return [{ label: 'Detection ratio', unit: '', value: (T.nTot - T.missed) / T.nTot, lo: 0.95, hi: 1, src: 'Procedure should find all known defects' }]; },
    sample(sim) { const T = sim.truth; return `<div class="eq">Classification: ${sim.ind.map(m => `${m.id}: L/W = ${U.f(m.L, 1)}/${U.f(m.W, 1)} = ${U.f(m.L / m.W, 2)} → ${m.cls}${m.fake ? ' (false — background)' : ''}`).join('<br>') || 'No indications'}</div><div class="eq">Linear = <b>${T.nLin}</b>; rounded = <b>${T.nRnd}</b>; relevant rounded &gt; 4.8 mm = <b>${T.bigRnd}</b>${sim.ind.some(m => m.type === 'linpore') ? '; four or more rounded indications in a line (≤ 1.6 mm apart) present' : ''}<br>Disposition: <b>${T.accept}</b>; known defects missed: <b>${T.missed}</b> of ${T.nTot}</div>`; },
    uncert() { return []; },
    conclude(sim) { const T = sim.truth; return `The weld was inspected with visible solvent-removable penetrant (dwell ${sim.defs.length ? '' : ''}${T.dwOk.startsWith('Adequate') ? 'adequate' : 'too short'}). ${T.nTot - T.missed} of ${T.nTot} known discontinuities were found (${T.nLin} linear, ${T.nRnd} rounded) and the weld is ${T.accept === 'Reject' ? 'rejected' : 'accepted'} under ASME VIII App. 8. ${T.missed ? 'Missed discontinuities show that short dwell, over-removal or heavy developer reduce sensitivity, particularly for tight cracks and shallow, wide flaws.' : 'With correct dwell, removal and developer, all surface-breaking discontinuities produced indications.'}`; },
    summary: 'Penetrant testing finds discontinuities open to the surface of non-porous materials. A low-viscosity, low-surface-tension liquid containing red or fluorescent dye is drawn into surface openings by capillary action during the dwell time. The excess on the surface is removed without pulling penetrant out of the flaws. A thin developer layer acts as a blotter, drawing the trapped penetrant back to the surface and spreading it into a visible indication much wider than the flaw. Sensitivity depends on dwell time (tight cracks need longer), careful removal (over-washing empties shallow, wide flaws) and an even, thin developer coat.',
    formulas: [['Capillary pressure (Laplace)', 'Δp = 2γ cos θ / w'], ['Linear indication', 'L ≥ 3 W'], ['Relevant indication (ASME App. 8)', 'major dimension > 1.6 mm'], ['Rejectable', 'relevant linear; rounded > 4.8 mm; ≥ 4 rounded in line ≤ 1.6 mm apart'], ['Dwell (ASME V)', '≥ 5 min at 10–52 °C; development 10–60 min']],
    theory: `<h3>Principle</h3><p>Liquid penetrant testing relies on capillary action. A penetrant with low surface tension and good wetting (small contact angle θ) is drawn into a narrow surface opening by the pressure difference Δp = 2γ cos θ / w, which increases as the opening width w decreases. Fine cracks therefore fill readily, but they take time to fill completely.</p>
    <h3>The six steps</h3><ol><li><b>Pre-cleaning</b>: remove oil, paint, scale and water so that openings are not blocked.</li><li><b>Penetrant application and dwell</b>: 5–30 minutes depending on material and expected flaws.</li><li><b>Removal of excess</b>: for solvent-removable penetrant, wipe off with a dry lint-free cloth, then with a cloth slightly dampened with remover. Never spray remover directly onto the surface: it dissolves penetrant out of shallow flaws.</li><li><b>Developer</b>: a thin, even coat of non-aqueous developer. A heavy coat masks fine indications.</li><li><b>Development and inspection</b>: penetrant bleeds out into the white developer; inspect under ≥ 1000 lux white light (or UV-A for fluorescent) after 10–60 min.</li><li><b>Post-cleaning</b>.</li></ol>
    <h3>Penetrant systems</h3><p>Type I (fluorescent) is more sensitive than Type II (visible red). Removal methods: A water-washable, B post-emulsifiable lipophilic, C solvent-removable, D post-emulsifiable hydrophilic. Sensitivity levels range from ½ (ultra-low) to 4 (ultra-high).</p>
    <h3>Interpretation</h3><p>An indication is <b>linear</b> if its length is at least three times its width (cracks, lack of fusion, laps), and <b>rounded</b> otherwise (porosity). Indications are larger than the flaws because penetrant spreads in the developer; the bleed-out size relates to the volume of trapped penetrant. ASME VIII Appendix 8 considers indications with major dimension above 1.6 mm relevant and rejects any relevant linear indication, rounded indications above 4.8 mm and four or more rounded indications in a line separated by 1.6 mm or less.</p>
    <h3>Limitations</h3><p>PT finds only surface-breaking discontinuities; it cannot detect subsurface flaws and does not work on porous materials. Smeared metal from grinding or shot blasting can close crack openings, so such surfaces need etching before testing.</p>`,
    procedure: ['Clean the weld and 25 mm on each side with cleaner/remover; allow to dry.', 'Apply penetrant by spray or brush to cover the area; keep the surface wet during the dwell time.', 'Wipe off excess penetrant with a dry lint-free cloth; then wipe with a cloth lightly moistened with remover until no red remains on the surface.', 'Shake the developer can and apply a thin, even coat from about 300 mm.', 'Allow 10 minutes development; observe bleed-out as it forms.', 'Inspect under white light; measure the length and width of each indication and record its position.', 'Classify indications, evaluate against acceptance criteria and post-clean the part.'],
    precautions: ['Penetrant and developer aerosols are flammable; work away from flames with ventilation.', 'Wear gloves and eye protection.', 'Keep surface temperature within 10–52 °C.', 'Do not spray remover directly onto the part.', 'Observe indications as they develop; bleeding over time can merge separate indications.'],
    applications: ['Weld inspection on all metals including austenitic stainless steel and aluminium.', 'Castings and forgings of non-magnetic materials.', 'In-service inspection of aircraft components and turbine blades (fluorescent).', 'Leak detection in tanks and vessels.'],
    errors: ['Inadequate pre-cleaning blocking openings.', 'Insufficient dwell time for tight cracks.', 'Over-removal of penetrant from shallow flaws.', 'Heavy or uneven developer.', 'Poor lighting or viewing too early/late.'],
    discussion: ['Which known defects were missed, and which process variable explains it?', 'Why is spraying remover directly onto the surface not allowed?', 'Explain why the indications are wider than the actual discontinuities.', 'Would MPI be a better choice for this weld? Discuss for ferritic and austenitic steels.'],
    refs: ['IS 3658:1999, Code of Practice for Liquid Penetrant Flaw Detection, BIS.', 'ASTM E165/E165M-18, Standard Practice for Liquid Penetrant Testing for General Industry.', 'ISO 3452-1:2021, Non-destructive Testing — Penetrant Testing — General Principles.', 'ASME Boiler and Pressure Vessel Code, Section V Article 6 and Section VIII Div. 1 Appendix 8.', 'ASNT, Nondestructive Testing Handbook, Vol. 2: Liquid Penetrant Testing, 3rd ed.'],
    pre: [
      { q: 'Penetrant enters a crack mainly by', o: ['Gravity', 'Capillary action', 'Magnetism', 'Pressure from the spray can'], a: 1, why: 'Surface tension and wetting drive the liquid in.' },
      { q: 'PT can detect', o: ['Subsurface inclusions', 'Surface-breaking discontinuities only', 'Internal porosity', 'Grain size'], a: 1, why: 'The flaw must be open to the surface.' },
      { q: 'The developer', o: ['Removes penetrant', 'Draws penetrant out and provides contrast', 'Cleans the part', 'Magnetises the part'], a: 1, why: 'Acts as a blotter and white background.' },
      { q: 'Minimum dwell time under ASME V for most materials at 10–52 °C is', o: ['30 s', '5 min', '60 min', '24 h'], a: 1, why: 'T-672.' },
      { q: 'A linear indication is one with', o: ['L ≥ 3W', 'L = W', 'L < 3W', 'Any length above 1 mm'], a: 0, why: 'Definition used in ASME and most codes.' }
    ],
    post: [
      { q: 'Spraying remover directly on the surface may cause', o: ['False indications', 'Removal of penetrant from shallow wide flaws (missed defects)', 'Better sensitivity', 'Corrosion only'], a: 1, why: 'Over-removal empties the flaws.' },
      { q: 'A 2-minute dwell time most affects detection of', o: ['Large pores', 'Tight cracks', 'Wide lack of fusion', 'All equally'], a: 1, why: 'Narrow openings take longer to fill.' },
      { q: 'An indication 6 mm long and 1.5 mm wide is', o: ['Rounded', 'Linear', 'Non-relevant', 'False'], a: 1, why: '6 ≥ 3 × 1.5.' },
      { q: 'A heavy developer coat', o: ['Improves sensitivity', 'Can mask fine indications', 'Is required', 'Removes background'], a: 1, why: 'Thick layers absorb small amounts of penetrant without showing.' },
      { q: 'Diffuse pink colour over the weld ripple after dry-wipe-only removal is', o: ['A relevant crack', 'Background from incomplete removal (false indication)', 'Porosity', 'Lack of fusion'], a: 1, why: 'Residual penetrant on the surface.' }
    ]
  });
  function steel(sim, dev) {
    const c = G.canvas(800, 480); const nz = G.noise(sim.defs.length * 31 + 7);
    G.fill(c, (i, x, y) => { const yy = y / 4; const weld = Math.abs(yy - 60) < 12; if (dev) { const v = 238 + 10 * nz(x * .05, y * .05); return [v, v - 2, v - 6]; } const rip = weld ? 18 * Math.sin((x / 9) + Math.pow((yy - 60) / 12, 2) * 4) : 0; const v = (weld ? 120 : 150) + 30 * nz(x * .01, y * .03, 3) + rip; return [v, v * .99, v * .97]; });
    return c;
  }
})();
