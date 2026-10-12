(function () {
  const U = LAB.U, G = LAB.G;
  const L = 300, D = 50, NT = 5;
  const TECH = { coil: 'Longitudinal (coil shot, 5 turns)', head: 'Circular (head shot)', both: 'Both, in sequence' };
  const PART = { wet: 'Wet fluorescent (UV-A)', dry: 'Dry visible red powder' };
  const CUR = { low: 'Low (60% of required)', ok: 'As calculated', high: 'High (200% of required)' };
  function defects(r) {
    const base = [
      { name: 'Transverse fatigue crack near fillet', ang: 90, len: 14, depth: 0, w: 2 },
      { name: 'Longitudinal seam', ang: 0, len: 26, depth: 0, w: 4 },
      { name: 'Grinding crack', ang: 45, len: 9, depth: 0, w: 1.5 },
      { name: 'Subsurface inclusion stringer', ang: 2, len: 18, depth: 1.4, w: 0 },
      { name: 'Quench crack', ang: 72, len: 11, depth: 0, w: 3 }
    ];
    const pick = base.slice().sort(() => r() - .5).slice(0, 4 + Math.round(r()));
    return pick.map((d, i) => ({ ...d, ang: d.ang + (r() - .5) * 12, len: U.q(d.len * (0.8 + 0.4 * r()), 0.5), x: 25 + (i + 0.5) * (250 / pick.length) + (r() - .5) * 20, y: 8 + r() * 34 }));
  }
  LAB.register({
    id: 'mpi', no: 14, cat: 'ndt', title: 'Magnetic Particle Inspection', std: 'IS 3703:2004 / ASTM E1444/E1444M / ISO 9934-1', short: 'Longitudinal and circular magnetisation of a steel shaft: field direction vs crack orientation, current calculation, particle type and acceptance.', tags: 'MPI MT magnetic particle coil head shot fluorescent leakage field',
    aim: 'To detect surface and near-surface discontinuities in a ferromagnetic shaft by magnetic particle inspection using longitudinal (coil) and circular (head-shot) magnetisation, and to show the effect of field direction, current and particle type on detectability.',
    objectives: ['Calculate the magnetising current for coil and head-shot techniques.', 'Inspect a shaft with each technique and record indications.', 'Relate detectability to the angle between discontinuity and field.', 'Distinguish relevant from non-relevant indications and evaluate acceptance.'],
    apparatus: ['Wet horizontal MPI bench with head-stocks and 5-turn coil (AC/HWDC, up to 3000 A)', 'Wet fluorescent particle bath with UV-A lamp (≥ 1000 µW/cm² at surface)', 'Dry red magnetic powder and powder bulb', 'Hall-effect gaussmeter; pie gauge; ASTM centrifuge tube for bath concentration', 'Demagnetising coil'],
    stdNote: 'Coil shot (ASTM E1444, part on the coil floor): NI = 35 000/(L/D + 2) for 2 ≤ L/D < 15. Head shot: 12–36 A per mm of diameter; 24 A/mm used here.',
    params: [
      { id: 'tech', label: 'Magnetising technique', type: 'select', options: Object.entries(TECH), def: 'coil' },
      { id: 'part', label: 'Particles', type: 'select', options: Object.entries(PART), def: 'wet' },
      { id: 'cur', label: 'Current level', type: 'select', options: Object.entries(CUR), def: 'ok' }
    ],
    opSteps: ['Pre-clean shaft; check bath concentration', 'Calculate current; set bench', 'Magnetise (shot 0.5 s) while applying particles', 'Second shot; allow bath to drain', 'Inspect under UV-A / white light', 'Record and size indications', 'Demagnetise and post-clean'],
    svg(p) {
      return G.svg('0 0 520 220', `${G.r(0, 0, 520, 220, 'bg')}${G.r(20, 170, 480, 24, 'mach', 'rx="3"')}${G.r(30, 70, 40, 100, 'mach', 'id="hs1"')}${G.r(450, 70, 40, 100, 'mach', 'id="hs2"')}
        <g id="shaftR">${G.r(70, 100, 380, 40, 'steel', 'rx="3"')}${G.r(300, 100, 40, 8, 'steelD')}</g>
        <g id="coil" style="display:${p.tech === 'head' ? 'none' : ''}">${[0, 1, 2, 3, 4].map(i => `<ellipse cx="${160 + i * 8}" cy="120" rx="5" ry="34" fill="none" stroke="var(--straw)" stroke-width="4"/>`).join('')}</g>
        <g id="fld" opacity="0"></g>
        <g transform="translate(330,14)">${G.r(0, 0, 170, 64, 'disp', 'rx="4"')}${G.t(10, 16, 'CURRENT A', 'm', 'style="fill:var(--panel-ink);font-size:8px"')}${G.t(10, 40, '0', 'big', 'id="dI"')}${G.t(100, 16, 'SHOT', 'm', 'style="fill:var(--panel-ink);font-size:8px"')}${G.t(100, 40, '—', 'big', 'id="dS"')}${G.t(10, 56, '', 'm', 'id="lab" style="fill:var(--panel-ink)"')}</g>`, 'MPI bench with shaft');
    },
    anim(svg, f, sim, p) {
      if (!sim) return; const shots = sim.shots; const k = Math.min(shots.length - 1, Math.floor(f * shots.length)); const t = f * shots.length - k; const s = shots[k];
      const on = t > .2 && t < .45; G.txt(svg, 'dI', on ? U.f(s.I, 0) : '0'); G.txt(svg, 'dS', s.kind === 'coil' ? 'COIL' : 'HEAD'); G.txt(svg, 'lab', on ? 'Magnetising + bath' : t < .2 ? 'Set-up' : 'Inspect');
      G.show(svg, 'coil', s.kind === 'coil');
      const fl = svg.querySelector('#fld'); if (fl) { fl.setAttribute('opacity', on ? .9 : .15); fl.innerHTML = s.kind === 'coil' ? [0, 1, 2].map(i => `<line x1="80" y1="${110 + i * 10}" x2="440" y2="${110 + i * 10}" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="6 5" marker-end=""/>`).join('') : [0, 1, 2, 3, 4, 5, 6].map(i => `<ellipse cx="${100 + i * 50}" cy="120" rx="6" ry="26" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="4 4"/>`).join(''); }
    },
    liveView(el, f, sim, p, api) {
      api.title(sim.part === 'wet' ? 'Inspection under UV-A' : 'Inspection under white light'); api.sub('top surface of shaft, 300 × 50 mm');
      let c = el.querySelector('canvas'); if (!c || c._sim !== sim) { el.innerHTML = ''; c = G.canvas(900, 150); c._sim = sim; el.appendChild(c); c._base = base(sim); }
      const g = c.getContext('2d'); g.drawImage(c._base, 0, 0);
      const shots = sim.shots; const k = Math.min(shots.length - 1, Math.floor(f * shots.length)); const t = f * shots.length - k; const sx = 900 / L, sy = 150 / D;
      const vis = []; shots.forEach((s, j) => { const a = j < k ? 1 : j === k ? U.clamp((t - .2) / .3, 0, 1) : 0; if (a > 0) s.ind.forEach(i => vis.push([i, a])); });
      vis.forEach(([d, a]) => {
        const ang = d.ang * Math.PI / 180; const hl = d.len / 2; const x0 = d.x - Math.cos(ang) * hl, y0 = d.y - Math.sin(ang) * hl, x1 = d.x + Math.cos(ang) * hl, y1 = d.y + Math.sin(ang) * hl;
        g.save(); g.globalAlpha = a * U.clamp(d.S, 0.3, 1); g.lineCap = 'round';
        if (sim.part === 'wet') { g.shadowColor = 'rgba(140,255,90,.9)'; g.shadowBlur = 10; g.strokeStyle = 'rgb(170,255,110)'; } else { g.strokeStyle = 'rgb(170,30,25)'; }
        g.lineWidth = d.depth > 0 ? 6 : 3.2; if (d.depth > 0) g.filter = 'blur(2px)';
        g.beginPath(); g.moveTo(x0 * sx, y0 * sy); const n = 8; for (let q = 1; q <= n; q++) { const tt = q / n; g.lineTo((x0 + (x1 - x0) * tt) * sx + Math.sin(q * 2.3 + d.x) * 2, (y0 + (y1 - y0) * tt) * sy + Math.cos(q * 1.7 + d.y) * 2); } g.stroke(); g.restore();
      });
      // labels
      g.font = '11px "IBM Plex Mono",monospace'; g.fillStyle = sim.part === 'wet' ? 'rgba(255,255,255,.7)' : 'rgba(0,0,0,.65)'; vis.forEach(([d, a], idx) => { if (a > .8 && d.id) g.fillText(d.id, d.x * sx + 8, d.y * sy - 6); });
    },
    simulate(p, r) {
      const defs = defects(r); const LD = L / D; const NI = 35000 / (LD + 2); const Icoil = NI / NT, Ihead = 24 * D;
      const cf = p.cur === 'low' ? 0.6 : p.cur === 'high' ? 2 : 1;
      const shotKinds = p.tech === 'both' ? ['coil', 'head'] : [p.tech];
      const detect = (d, kind) => { const fieldAng = kind === 'coil' ? 0 : 90; const sinA = Math.abs(Math.sin((d.ang - fieldAng) * Math.PI / 180)); const depthF = d.depth > 0 ? Math.exp(-d.depth / (p.part === 'dry' ? 1.6 : 0.7)) : (p.part === 'dry' && d.w < 2 ? 0.7 : 1); const S = sinA * depthF * Math.min(cf, 1.2); return S; };
      const seen = new Map();
      const shots = shotKinds.map(kind => { const ind = []; defs.forEach(d => { const S = detect(d, kind); if (S > 0.38) { const prev = seen.get(d); if (!prev || prev.S < S) seen.set(d, { ...d, S }); ind.push(Object.assign(seen.get(d), {})); } }); return { kind, I: (kind === 'coil' ? Icoil : Ihead) * cf, ind }; });
      // non-relevant geometry indication at keyway when current too high
      const nonrel = cf > 1.5 ? [{ name: 'Particle build-up at keyway edge', ang: 0, len: 40, depth: 0, x: 130 + 20, y: 3, S: 0.7, nonrel: true }] : [];
      if (nonrel.length) shots[0].ind.push(nonrel[0]);
      const found = [...seen.values(), ...nonrel]; found.sort((a, b) => a.x - b.x); found.forEach((d, i) => d.id = 'I' + (i + 1));
      const relevant = found.filter(d => !d.nonrel && d.len > 1.6); const missed = defs.length - [...seen.keys()].length;
      const rows = found.map(d => [d.id, U.f(d.x, 0), U.f(d.y, 0), U.f(d.len + (r() - .5), 1), U.f(((d.ang % 180) + 180) % 180, 0), d.nonrel ? 'At keyway edge (geometry)' : d.depth > 0 ? 'Broad, fuzzy' : 'Sharp, well defined']);
      const T = { LD, Icoil, Ihead, nRel: relevant.length, accept: relevant.length ? 'Reject' : 'Accept', missed, nTot: defs.length, orient: 'Perpendicular' };
      return {
        shots, part: p.part, defs, dur: shotKinds.length * 5, M: { name: 'Steel shaft' },
        readout(f) { const k = Math.min(shots.length - 1, Math.floor(f * shots.length)); const t = f * shots.length - k; const s = shots[k]; return [['Shot', `${k + 1}/${shots.length} (${s.kind === 'coil' ? 'coil' : 'head'})`, ''], ['Current', t > .2 && t < .45 ? U.f(s.I, 0) : 0, 'A'], ['Field direction', s.kind === 'coil' ? 'Along axis' : 'Circumferential', ''], ['Indications', t > .45 ? s.ind.length : '—', '']]; },
        specimen: [['Part', 'Shaft, AISI 4140 Q&T, with keyway', ''], ['Length L / diameter D', `${L} / ${D}`, 'mm'], ['Coil turns N', NT, ''], ['Technique', TECH[p.tech], ''], ['Particles', PART[p.part], ''], ['Current setting', CUR[p.cur], ''], ['Reference record', `Shaft contains ${defs.length} known discontinuities (from fabrication/ECT record)`, ''], ['Acceptance criterion', 'No relevant linear indication > 1.6 mm (critical rotating part)', '']],
        obs: [{ title: 'Table 1. Indications recorded', cols: ['ID', 'x from left end (mm)', 'y across (mm)', 'Length (mm)', 'Angle to shaft axis (°)', 'Appearance / location'], textCols: [0, 5], rows: rows.length ? rows : [['—', '—', '—', '—', '—', 'No indications observed']] }],
        truth: T, missedList: defs.filter(d => !seen.has(d))
      };
    },
    calcs(sim) { const T = sim.truth; return [{ key: 'LD', label: 'L/D ratio of shaft', unit: '—', truth: T.LD, tol: 0.01, hint: 'L/D' }, { key: 'Ic', label: 'Coil current (5 turns)', unit: 'A', truth: T.Icoil, tol: 0.02, hint: 'I = 35 000/[N(L/D + 2)]' }, { key: 'Ih', label: 'Head-shot current', unit: 'A', truth: T.Ihead, tol: 0.02, hint: '24 A/mm × D' }, { key: 'nrel', label: 'Number of relevant linear indications', unit: '—', truth: T.nRel, abs: 0, hint: 'exclude non-relevant (geometry) indications' }, { key: 'acc', label: 'Disposition of the shaft', type: 'select', options: ['Accept', 'Reject'], truth: T.accept }, { key: 'miss', label: 'Known discontinuities NOT detected by this procedure', unit: '—', truth: T.missed, abs: 0, hint: 'known total − detected' }, { key: 'or', label: 'Detected cracks are mostly oriented ___ to the field', type: 'select', options: ['Perpendicular', 'Parallel', 'At random'], truth: 'Perpendicular' }]; },
    reference(sim) { const T = sim.truth; return [{ label: 'Coil current', unit: 'A', value: sim.shots.find(s => s.kind === 'coil') ? sim.shots.find(s => s.kind === 'coil').I : T.Icoil, lo: T.Icoil * 0.9, hi: T.Icoil * 1.1, src: 'ASTM E1444 coil formula ±10%' }, { label: 'Detection ratio', unit: '', value: (T.nTot - T.missed) / T.nTot, lo: 0.95, hi: 1, src: 'Procedure should find all known defects' }]; },
    sample(sim) { const T = sim.truth; return `<div class="eq">L/D = ${L}/${D} = <b>${U.f(T.LD, 2)}</b>;  NI = 35 000/(L/D + 2) = 35 000/${U.f(T.LD + 2, 2)} = ${U.f(T.Icoil * NT, 0)} ampere-turns;  I = NI/N = <b>${U.f(T.Icoil, 0)} A</b></div><div class="eq">Head shot: I = 24 A/mm × ${D} mm = <b>${U.f(T.Ihead, 0)} A</b> (range 12–36 A/mm → ${12 * D}–${36 * D} A)</div><div class="eq">Relevant linear indications = <b>${T.nRel}</b> → <b>${T.accept}</b>; known defects missed = <b>${T.missed}</b> of ${T.nTot}${sim.missedList.length ? ' (' + sim.missedList.map(d => d.name + ' at ' + U.f(d.ang, 0) + '°').join('; ') + ')' : ''}</div>`; },
    uncert() { return []; },
    conclude(sim) { const T = sim.truth; return `Using ${sim.shots.map(s => s.kind === 'coil' ? 'longitudinal (coil, ' + U.f(s.I, 0) + ' A)' : 'circular (head shot, ' + U.f(s.I, 0) + ' A)').join(' and ')} magnetisation, ${T.nTot - T.missed} of ${T.nTot} known discontinuities were detected and the shaft is to be ${T.accept === 'Reject' ? 'rejected' : 'accepted'}. ${T.missed ? `${T.missed} defect(s) were missed because they lay nearly parallel to the field or too deep below the surface; a second magnetisation at 90° is required by ASTM E1444.` : 'All known defects were detected, confirming that two perpendicular field directions are needed for full coverage.'}`; },
    summary: 'When a ferromagnetic part is magnetised, a surface or near-surface discontinuity that cuts across the flux lines forces flux out into the air, creating a leakage field. Fine magnetic particles applied to the surface are attracted to the leakage field and form a visible indication. Detection is best when the discontinuity is perpendicular to the field and becomes impossible when it is parallel, so each area must be inspected with two fields at roughly 90°. A coil produces a longitudinal field (detects transverse cracks); passing current through the part (head shot) produces a circular field (detects longitudinal cracks). Wet fluorescent particles give the highest sensitivity to fine surface cracks; dry powder with half-wave DC penetrates better to subsurface flaws.',
    formulas: [['Coil shot (low fill, part on coil floor)', 'NI = 35 000 / (L/D + 2)'], ['Head shot / central conductor', 'I = 12–36 A per mm of diameter'], ['Leakage detectability', '∝ |sin θ|, θ = angle between flaw and field'], ['Surface field strength (tangential)', 'H ≥ 2.4 kA/m (30 Oe) at the surface']],
    theory: `<h3>Principle</h3><p>Ferromagnetic materials (ferritic steels, cast irons, nickel, cobalt) carry magnetic flux far more easily than air. In a magnetised part with no defects the flux stays inside. A crack or inclusion that cuts across the flux path has low permeability, so flux bulges out of the surface around it, forming a <b>leakage field</b> with local north and south poles. Finely divided iron oxide particles, applied dry or suspended in a liquid, collect at these poles and outline the discontinuity, often many times wider than the crack itself.</p>
    <h3>Field direction matters</h3><p>Leakage is strongest when the discontinuity is perpendicular to the flux and vanishes when it is parallel. In practice discontinuities within about 45° of perpendicular are reliably detected. Every area must therefore be magnetised in two directions roughly at right angles:</p><ul><li><b>Longitudinal field</b> (coil or yoke): flux runs along the part axis; detects transverse cracks such as fatigue cracks at fillets.</li><li><b>Circular field</b> (head shot or central conductor): current flows along the part, flux circles around it; detects longitudinal seams, laps and quench cracks.</li></ul>
    <h3>Current calculation</h3><p>For a coil shot with the part lying on the coil floor (low fill factor), ASTM E1444 gives NI = 35 000/(L/D + 2) ampere-turns for 2 ≤ L/D &lt; 15. For direct contact (head shot), 12–36 A per mm of diameter is used. Too little current gives weak indications; too much causes particles to collect at changes in section, edges and keyways (non-relevant indications) and "furring" along the grain flow.</p>
    <h3>Particles and current type</h3><p>Wet fluorescent particles viewed under UV-A in a darkened booth give the highest contrast and detect very tight surface cracks. Dry powder is used on rough surfaces and hot parts. AC concentrates flux at the surface (skin effect) and is best for surface cracks; half-wave rectified DC penetrates deeper and is better for subsurface inclusions a few millimetres down.</p>
    <h3>Interpreting indications</h3><p><b>Relevant</b> indications come from discontinuities. <b>Non-relevant</b> indications come from real magnetic leakage at geometry (keyways, threads, abrupt section changes) or permeability changes (weld boundaries). <b>False</b> indications are particles held mechanically by roughness or scale. Only relevant indications are evaluated against acceptance criteria. After inspection the part is demagnetised.</p>`,
    procedure: ['Clean the shaft of oil, scale and paint; check bath concentration in the centrifuge tube (fluorescent 0.1–0.4 mL per 100 mL).', 'Calculate the required currents for coil and head shot; verify field with a pie gauge or gaussmeter.', 'Place the shaft in the coil (or between the heads for a circular shot).', 'Flow the bath over the part and apply two shots of about 0.5 s while the bath is draining.', 'Inspect under UV-A (or white light for visible particles); record each indication with location, length and orientation.', 'Repeat with the second magnetising direction.', 'Classify indications, apply acceptance criteria, demagnetise and post-clean.'],
    precautions: ['Use UV-A with a filter; do not look directly into the lamp. Ambient light below 20 lux for fluorescent inspection.', 'Ensure good electrical contact at head-stocks to avoid arc burns.', 'Do not magnetise before applying particles with continuous method; apply bath while current flows.', 'Demagnetise parts that will be machined or used near instruments.', 'Keep the bath agitated so particles stay in suspension.'],
    applications: ['Inspection of crankshafts, axles, gears and landing-gear components.', 'Weld inspection on ferritic steel structures.', 'In-service inspection of lifting equipment and rail components.', 'Forging and casting quality control.'],
    errors: ['Wrong field direction for the defect orientation.', 'Insufficient or excessive current.', 'Bath concentration out of range.', 'Poor lighting or UV intensity.', 'Surface coatings thicker than about 50 µm reducing sensitivity.'],
    discussion: ['Which known defects did your procedure miss and why?', 'Why must every area be magnetised in two directions?', 'What caused the indication at the keyway when the current was high, and is it relevant?', 'Compare wet fluorescent and dry powder methods for the subsurface inclusion stringer.'],
    refs: ['IS 3703:2004, Code of Practice for Magnetic Particle Flaw Detection, BIS.', 'ASTM E1444/E1444M-22, Standard Practice for Magnetic Particle Testing.', 'ISO 9934-1:2016, Non-destructive Testing — Magnetic Particle Testing — General Principles.', 'ASME Boiler and Pressure Vessel Code, Section V, Article 7.', 'ASNT, Nondestructive Testing Handbook, Vol. 8: Magnetic Testing, 3rd ed.'],
    pre: [
      { q: 'MPI can be applied to', o: ['Aluminium', 'Austenitic stainless steel', 'Ferritic steel', 'Copper'], a: 2, why: 'The material must be ferromagnetic.' },
      { q: 'A crack is best detected when it is', o: ['Parallel to the field', 'Perpendicular to the field', 'Deep below surface', 'Filled with oil'], a: 1, why: 'Maximum flux leakage.' },
      { q: 'A coil produces a field that is', o: ['Circular', 'Longitudinal', 'Random', 'Zero inside'], a: 1, why: 'Along the coil axis.' },
      { q: 'A head shot (current through the part) produces a', o: ['Longitudinal field', 'Circular field', 'No field', 'Alternating axial field'], a: 1, why: 'Right-hand rule: flux circles the current.' },
      { q: 'Wet fluorescent particles are viewed under', o: ['Sodium light', 'UV-A light', 'X-rays', 'Infrared'], a: 1, why: 'They fluoresce yellow-green under 365 nm UV-A.' }
    ],
    post: [
      { q: 'For L = 300 mm, D = 50 mm and a 5-turn coil, the coil current is about', o: ['438 A', '875 A', '1200 A', '4375 A'], a: 1, why: '35000/(6 + 2) = 4375 A-turns; /5 = 875 A.' },
      { q: 'With only a coil shot, a longitudinal seam is usually', o: ['Detected strongly', 'Missed', 'Shown as a non-relevant indication', 'Magnified'], a: 1, why: 'It lies parallel to the longitudinal field.' },
      { q: 'An indication at the keyway that appears only at high current is', o: ['A relevant crack', 'Non-relevant (geometry)', 'False (dirt)', 'Always rejectable'], a: 1, why: 'Leakage at a section change.' },
      { q: 'For subsurface inclusions, the better choice is', o: ['AC with wet fluorescent', 'HWDC with dry powder', 'No magnetisation', 'Dye penetrant'], a: 1, why: 'DC penetrates deeper; dry powder is mobile.' },
      { q: 'Why is the part demagnetised after inspection?', o: ['Required for painting only', 'Residual magnetism attracts chips and affects instruments and welding', 'It increases strength', 'To remove particles'], a: 1, why: 'Residual fields cause practical problems in service and machining.' }
    ]
  });
  function base(sim) {
    const c = G.canvas(900, 150); const r = U.rng(sim.defs.length * 977 + Math.round(sim.defs[0].x * 100)); const nz = G.noise(Math.round(sim.defs[0].y * 100));
    if (sim.part === 'wet') G.fill(c, (i, x, y) => [16 + 10 * nz(x * .02, y * .05), 14 + 14 * nz(x * .03, y * .04), 34 + 18 * nz(x * .02, y * .03)]);
    else G.fill(c, (i, x, y) => { const v = 150 + 40 * nz(x * .02, y * .05, 3); return [v, v * .98, v * .96]; });
    const g = c.getContext('2d'); for (let k = 0; k < 2200; k++) { g.fillStyle = sim.part === 'wet' ? 'rgba(120,255,100,.12)' : 'rgba(150,40,30,.25)'; g.fillRect(r() * 900, r() * 150, 1.5, 1.5); }
    g.fillStyle = sim.part === 'wet' ? 'rgba(0,0,0,.5)' : 'rgba(60,60,60,.6)'; g.fillRect(130 * 3, 0, 40 * 3, 12); // keyway
    g.strokeStyle = sim.part === 'wet' ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.4)'; g.font = '10px "IBM Plex Mono",monospace'; g.fillStyle = g.strokeStyle; for (let x = 0; x <= 300; x += 50) { g.beginPath(); g.moveTo(x * 3, 150); g.lineTo(x * 3, 142); g.stroke(); g.fillText(x, x * 3 + 2, 140); }
    return c;
  }
})();
