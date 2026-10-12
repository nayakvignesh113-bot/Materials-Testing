(function () {
  const U = LAB.U, G = LAB.G;
  const MAT = {
    ci: { name: 'Grey cast iron FG 200', kind: 'brittle', E: 100000, sc: 760, ef: 0.022, st: 205, ref: { sc: [570, 900], E: [80, 125] } },
    ms: { name: 'Mild steel (IS 2062 E250)', kind: 'ductile', E: 205000, sy: 270, H: 760, ref: { sy: [240, 320], E: [195, 215] } },
    al: { name: 'Aluminium alloy 6061-T6', kind: 'ductile', E: 69000, sy: 268, H: 150, ref: { sy: [250, 310], E: [66, 72] } },
    cu: { name: 'Copper, annealed', kind: 'ductile', E: 117000, sy: 72, H: 520, ref: { sy: [55, 95], E: [105, 130] } },
    wpar: { name: 'Teak wood, parallel to grain', kind: 'wood', E: 12500, sc: 58, ref: { sc: [45, 70], E: [9, 15] } },
    wper: { name: 'Teak wood, perpendicular to grain', kind: 'woodp', E: 1100, spl: 8.5, ref: { sc: [5, 12], E: [0.6, 1.8] } }
  };
  LAB.register({
    id: 'compression', no: 2, cat: 'mech', title: 'Compression Test', std: 'IS 14858:2000 / ASTM E9; IS 1708 (Part 8) for timber', short: 'Brittle, ductile and anisotropic response in compression: crushing strength, barrelling, wood parallel vs perpendicular to grain.', tags: 'compressive strength cast iron wood barrel UTM',
    aim: 'To determine the compressive strength, modulus of elasticity and deformation behaviour of brittle (cast iron), ductile (steel, aluminium, copper) and anisotropic (timber) materials under uniaxial compression.',
    objectives: ['Record load–deformation response of short cylindrical or prismatic specimens in compression.', 'Determine compressive strength (brittle), compressive yield strength (ductile) and stress at limit of proportionality (timber).', 'Observe and explain barrelling, shear fracture and crushing modes.', 'Compare compressive and tensile strengths of cast iron.'],
    apparatus: ['Universal testing machine, 400 kN, with spherically seated compression platens', 'Compressometer, resolution 0.001 mm', 'Vernier calliper (LC 0.02 mm)', 'Safety cage for brittle specimens', 'Lubricant (MoS₂ grease) for platen faces when friction is to be reduced'],
    stdNote: 'ASTM E9 short specimens use h/d ≈ 0.8–2 to avoid buckling. IS 1708 (Part 8) timber: 20 × 20 × 80 mm parallel to grain, 50 × 50 × 150 mm perpendicular to grain.',
    params: [
      { id: 'mat', label: 'Material', type: 'select', options: Object.entries(MAT).map(([k, v]) => [k, v.name]), def: 'ci' },
      { id: 'hd', label: 'Height/diameter ratio (metals)', type: 'select', options: [['1', '1.0'], ['1.5', '1.5'], ['2', '2.0']], def: '1.5', hint: 'Lower h/d increases the effect of platen friction.' },
      { id: 'lub', label: 'Platen condition (metals)', type: 'select', options: [['dry', 'Dry'], ['lub', 'Lubricated (MoS₂)']], def: 'dry' }
    ],
    opSteps: ['Measure specimen dimensions; clean platens', 'Centre specimen on lower platen; fit guard', 'Attach compressometer; apply seating load', 'Load at constant rate; record load–deformation', 'Observe yield, barrelling or cracking', 'Stop at fracture or at the deformation limit', 'Measure final height and maximum diameter'],
    svg(p) {
      return G.utm(`${G.r(220, 72, 80, 26, 'steelD', 'rx="2"')}${G.r(256, 56, 8, 18, 'mach2')}
        <path id="sp" class="spec" d=""/><path id="crack" class="lnb" stroke-width="2.5" d="" />
        <g id="lp">${G.r(220, 240, 80, 22, 'steelD', 'rx="2"')}</g>${G.xh(262)}${G.t(320, 170, '', 'm', 'id="lab"')}`);
    },
    anim(svg, f, sim) {
      const st = sim ? sim.at(f) : { def: 0, P: 0, phase: 'Ready', broken: false };
      const k = sim ? sim.k : {}; const H0 = 120, W0 = sim && sim.k.wood ? 60 : 64 / (sim ? sim.hd : 1.5) * 1.5 * 0.85; const red = sim ? Math.min(0.55, st.def / sim.h0) : 0;
      const Hc = H0 * (1 - red), top = 98, bot = top + Hc; const wMid = W0 * (sim && k.ductile ? Math.sqrt(1 / (1 - red)) * (1 + (sim.mu * 0.9) * red) : sim && k.woodp ? 1 + red * 0.4 : 1); const wEnd = W0 * (sim && k.ductile ? Math.sqrt(1 / (1 - red)) * (1 - sim.mu * 0.6 * red) : 1);
      const cx = 260; const path = `M${cx - wEnd / 2} ${top} H${cx + wEnd / 2} Q${cx + wMid / 2 + (wMid - wEnd) * 0.6} ${top + Hc / 2} ${cx + wEnd / 2} ${bot} H${cx - wEnd / 2} Q${cx - wMid / 2 - (wMid - wEnd) * 0.6} ${top + Hc / 2} ${cx - wEnd / 2} ${top} Z`;
      G.set(svg, 'sp', 'd', path); const dy = bot - (top + H0);
      G.set(svg, 'lp', 'transform', `translate(0,${bot - 240})`); G.set(svg, 'xh', 'transform', `translate(0,${262 + (bot - 240)})`);
      G.set(svg, 'crack', 'd', st.broken && sim && (k.brittle) ? `M${cx - wEnd / 2} ${top + Hc * 0.18} L${cx + wEnd / 2} ${top + Hc * 0.82}` : st.broken && sim && k.wood ? `M${cx - 30} ${top + Hc * 0.4} L${cx - 8} ${top + Hc * 0.5} L${cx + 30} ${top + Hc * 0.45}` : '');
      G.txt(svg, 'dL', U.f(st.P, 2)); G.txt(svg, 'dD', U.f(st.def, 2)); G.txt(svg, 'lab', st.phase); G.txt(svg, 'cap', sim ? 'Specimen: ' + sim.name : ''); void dy;
    },
    simulate(p, r) {
      const M = MAT[p.mat]; const k = { brittle: M.kind === 'brittle', ductile: M.kind === 'ductile', wood: M.kind === 'wood', woodp: M.kind === 'woodp' };
      const fE = 1 + 0.02 * U.gauss(r), fs = 1 + 0.03 * U.gauss(r);
      let d0, b0, h0, A0, shape;
      if (k.wood) { b0 = 20; h0 = 80; shape = 'prism'; } else if (k.woodp) { b0 = 50; h0 = 150; shape = 'prism'; } else { d0 = 20; h0 = 20 * p.hd; shape = 'cyl'; }
      const meas = (x, res) => U.q(x + (res * 0.8) * U.gauss(r), res);
      let dims; if (shape === 'cyl') { const dm = [meas(d0, 0.02), meas(d0, 0.02)]; d0 = U.mean(dm); A0 = Math.PI * d0 * d0 / 4; dims = [['Diameter d₀ (two readings)', dm.map(x => U.f(x, 2)).join(', '), 'mm']]; }
      else { const bm = [meas(b0, 0.02), meas(b0, 0.02)]; A0 = bm[0] * bm[1]; dims = [['Cross-section b × t', bm.map(x => U.f(x, 2)).join(' × '), 'mm']]; }
      h0 = meas(h0, 0.02); const mu = k.ductile ? (p.lub === 'lub' ? 0.05 : 0.22) : 0;
      const E = M.E * fE; const e = [], s = []; let stopReason = '';
      if (k.brittle) { const sc = M.sc * fs, ef = M.ef * (0.9 + 0.2 * r()); const A = U.bisect(A => A * (1 - Math.exp(-E * ef / A)) - sc, sc * 0.9, sc * 30); for (let i = 0; i <= 260; i++) { const x = ef * i / 260; e.push(x); s.push(A * (1 - Math.exp(-E * x / A))); } e.push(ef * 1.002); s.push(sc * 0.08); stopReason = 'Shear fracture'; }
      else if (k.ductile) { const sy = M.sy * fs; const ey = sy / E; const em = 0.5; for (let i = 0; i <= 320; i++) { const x = i < 40 ? ey * 1.6 * i / 40 : ey * 1.6 + (em - ey * 1.6) * (i - 40) / 280; const et = -Math.log(1 - x); const ep = Math.max(0, et - ey); const st = Math.min(E * et, sy + M.H * Math.pow(ep, 0.55) * (ep > 0 ? 1 : 0)); const hr = 1 - x; const dr = Math.sqrt(1 / hr) * d0; const fric = 1 + mu * dr / (3 * h0 * hr); const sEng = st * fric / hr; e.push(x); s.push(sEng); } stopReason = '50% height reduction reached (no fracture)'; }
      else if (k.wood) { const sc = M.sc * fs, epk = 0.0085; for (let i = 0; i <= 260; i++) { const x = 0.03 * i / 260; let v; if (x < epk) { const t = x / epk; v = sc * Math.min(t * epk * E / sc, 1 - Math.pow(1 - t, 2.2) * 0.999); v = Math.min(v, E * x); } else v = sc * (1 - 0.32 * Math.pow((x - epk) / (0.03 - epk), 0.8)); e.push(x); s.push(v); } stopReason = 'Crushing failure of fibres'; }
      else { const spl = M.spl * fs; const epl = spl / E; for (let i = 0; i <= 260; i++) { const x = 0.12 * i / 260; const v = x < epl ? E * x : spl + 18 * (x - epl) + (x > 0.08 ? 900 * Math.pow(x - 0.08, 2) : 0); e.push(x); s.push(Math.min(v, E * x)); } stopReason = 'Deformation limit reached (no failure)'; }
      const P = s.map(v => v * A0 / 1000), D = e.map(x => x * h0);
      // compressometer readings in the linear region
      const lim = k.brittle ? 0.35 * M.sc * fs : k.ductile ? 0.75 * M.sy * fs : k.wood ? 0.45 * M.sc * fs : 0.8 * M.spl * fs; const Plim = lim * A0 / 1000; const st0 = U.q(Plim / 6, Plim > 20 ? 1 : 0.1) || 0.1;
      const el = []; for (let i = 0; i <= 6; i++) { const Pk = i * st0; if (Pk > Plim * 1.02) break; const x = U.inv(e, s, Pk * 1000 / A0); el.push([Pk, i === 0 ? 0 : U.q(x * h0 + 0.0006 * U.gauss(r), 0.001)]); }
      const fit = U.linfit(el.map(v => v[1] / h0), el.map(v => v[0] * 1000 / A0));
      const iMax = k.ductile || k.woodp ? s.length - 1 : s.indexOf(Math.max(...s.slice(0, -1)));
      const Pmax = U.q(P[iMax], 0.01);
      let Py = null; if (k.ductile) { for (let i = 1; i < e.length; i++) { const g0 = s[i - 1] - E * (e[i - 1] - 0.002), g1 = s[i] - E * (e[i] - 0.002); if (g0 > 0 && g1 <= 0) { Py = U.q((s[i - 1] + (s[i] - s[i - 1]) * g0 / (g0 - g1)) * A0 / 1000, 0.01); break; } } }
      const Ppl = k.woodp ? U.q(M.spl * fs * A0 / 1000, 0.01) : null;
      const hf = U.q(h0 * (1 - (k.ductile ? e[e.length - 1] - s[s.length - 1] / E : k.woodp ? 0.12 * 0.85 : k.wood ? 0.02 : 0.004)), 0.02);
      const dfm = k.ductile ? U.q(d0 * Math.sqrt(h0 / hf) * (1 + mu * 0.9 * (1 - hf / h0) * 1.2), 0.02) : null;
      const ang = k.brittle ? U.q(48 + 6 * r(), 1) : null;
      const T = { A0, h0, d0, E: fit.m / 1000, Pmax, Py, Ppl, hf, dfm, ang };
      T.sc = Pmax * 1000 / A0; T.sy = Py ? Py * 1000 / A0 : null; T.spl = Ppl ? Ppl * 1000 / A0 : null; T.red = (h0 - hf) / h0 * 100;
      if (k.ductile) { T.sTrueEnd = Pmax * 1000 / (Math.PI * dfm * dfm / 4); T.dMean = d0 * Math.sqrt(h0 / hf); T.barrel = (dfm - T.dMean) / T.dMean * 100; }
      if (k.brittle) T.ratio = T.sc / M.st;
      const rows = []; for (let i = 0; i < P.length; i += 13) rows.push([U.f(D[i], 3), U.f(P[i], 2), U.f(s[i], 1), U.f(e[i] * 100, 3)]);
      const keyRows = [];
      if (k.brittle) keyRows.push(['Maximum load P_max (fracture)', U.f(Pmax, 2), 'kN'], ['Angle of fracture plane to load axis', ang, 'degree'], ['Final height h_f (fitted pieces)', U.f(hf, 2), 'mm']);
      if (k.ductile) keyRows.push(['Load at 0.2% offset (from graph) P_y', U.f(Py, 2), 'kN'], ['Load at end of test', U.f(Pmax, 2), 'kN'], ['Final height h_f', U.f(hf, 2), 'mm'], ['Maximum (bulge) diameter d_f', U.f(dfm, 2), 'mm']);
      if (k.wood) keyRows.push(['Maximum load P_max', U.f(Pmax, 2), 'kN'], ['Failure mode', 'Crushing / shearing of fibres', '']);
      if (k.woodp) keyRows.push(['Load at limit of proportionality P_pl (from graph)', U.f(Ppl, 2), 'kN'], ['Load at 12% deformation', U.f(Pmax, 2), 'kN']);
      const phase = f => { const i = Math.min(e.length - 1, Math.floor(f * (e.length - 1))); if (f >= 1) return k.brittle ? 'Fractured (shear)' : k.wood ? 'Crushed' : 'Test stopped'; const x = e[i]; if (k.ductile) return x < (T.sy / E) * 1.3 ? 'Elastic' : 'Plastic flow, barrelling'; if (k.brittle) return x < 0.004 ? 'Elastic' : 'Microcracking'; if (k.wood) return i < iMax ? 'Loading' : 'Fibre buckling'; return x < 0.008 ? 'Elastic' : 'Cell wall collapse'; };
      return {
        name: M.name, k, hd: p.hd, mu, h0, M, dur: 8,
        at(f) { const i = Math.min(e.length - 1, Math.floor(f * (e.length - 1))); return { def: D[i], P: P[i], phase: phase(f), broken: f >= 1 }; },
        readout(f) { const a = this.at(f); const i = Math.min(e.length - 1, Math.floor(f * (e.length - 1))); return [['Load', U.f(a.P, 2), 'kN'], ['Deformation', U.f(a.def, 3), 'mm'], ['Eng. stress', U.f(s[i], 1), 'MPa'], ['Strain', U.f(e[i] * 100, 2), '%'], ['Stage', a.phase, '']]; },
        plot: { title: 'Load–deformation diagram', xlabel: 'Deformation (mm)', ylabel: 'Compressive load (kN)', series: [{ name: 'Load–deformation', x: D, y: P, color: 's1' }], caption: 'Compressive load–deformation curve' },
        plots: [{ xlabel: 'Strain (%)', ylabel: 'Stress (MPa)', series: [{ name: 'Compressometer data', x: el.map(v => v[1] / h0 * 100), y: el.map(v => v[0] * 1000 / A0), type: 'scatter', color: 's1' }, { name: 'Fit', x: [0, el[el.length - 1][1] / h0 * 100], y: [fit.c, fit.c + fit.m * el[el.length - 1][1] / h0], color: 's2', dash: true }], caption: `Linear region: E = ${U.f(fit.m / 1000, 2)} GPa (R² = ${U.f(fit.r2, 4)})` }],
        specimen: [['Material', M.name, ''], ...dims, ['Initial height h₀', U.f(h0, 2), 'mm'], ['h₀/d₀ (or h₀/b)', U.f(h0 / (d0 || b0), 2), ''], ['Platen condition', k.ductile ? (p.lub === 'lub' ? 'Lubricated, μ ≈ 0.05' : 'Dry, μ ≈ 0.2') : 'Dry', ''], ['Test end condition', stopReason, '']],
        obs: [{ title: 'Table 1. Linear region (compressometer, gauge = h₀)', cols: ['Sl. no.', 'Load P (kN)', 'Compression δ (mm)'], rows: el.map((v, i) => [i + 1, U.f(v[0], k.woodp || k.wood ? 2 : 2), U.f(v[1], 3)]) },
        { title: 'Table 2. Key readings', cols: ['Reading', 'Value', 'Unit'], textCols: [0, 2], rows: keyRows },
        { title: 'Table 3. Load–deformation record', cols: ['Deformation (mm)', 'Load (kN)', 'Stress (MPa)', 'Strain (%)'], rows }],
        truth: T, fit
      };
    },
    calcs(sim) {
      const T = sim.truth, k = sim.k; const a = [{ key: 'A0', label: 'Original cross-sectional area A₀', unit: 'mm²', truth: T.A0, tol: 0.006, hint: 'πd₀²/4 or b × t' }, { key: 'E', label: 'Modulus of elasticity in compression', unit: 'GPa', truth: T.E, tol: 0.05, hint: 'slope of σ–ε from Table 1' }];
      if (k.brittle) a.push({ key: 'sc', label: 'Ultimate compressive strength', unit: 'MPa', truth: T.sc, tol: 0.01, hint: 'P_max / A₀' }, { key: 'ratio', label: 'Ratio σ_c/σ_t (σ_t = 205 MPa from Exp. 1)', unit: '—', truth: T.ratio, tol: 0.015, hint: 'σ_c / σ_t' }, { key: 'red', label: 'Percentage reduction in height', unit: '%', truth: T.red, abs: 0.15, hint: '(h₀ − h_f)/h₀ × 100' });
      if (k.ductile) a.push({ key: 'sy', label: 'Compressive yield strength (0.2% offset)', unit: 'MPa', truth: T.sy, tol: 0.01, hint: 'P_y / A₀' }, { key: 'red', label: 'Percentage reduction in height', unit: '%', truth: T.red, abs: 0.3, hint: '(h₀ − h_f)/h₀ × 100' }, { key: 'dmean', label: 'Ideal diameter from volume constancy', unit: 'mm', truth: T.dMean, tol: 0.005, hint: 'd₀ √(h₀/h_f)' }, { key: 'barrel', label: 'Barrelling (bulge over ideal diameter)', unit: '%', truth: T.barrel, abs: 0.6, hint: '(d_f − d_ideal)/d_ideal × 100' }, { key: 'strue', label: 'True stress at end of test (on d_f)', unit: 'MPa', truth: T.sTrueEnd, tol: 0.015, hint: 'P_end / (π d_f²/4)' });
      if (k.wood) a.push({ key: 'sc', label: 'Compressive strength parallel to grain', unit: 'MPa', truth: T.sc, tol: 0.01, hint: 'P_max / A₀' });
      if (k.woodp) a.push({ key: 'spl', label: 'Compressive stress at limit of proportionality ⊥ grain', unit: 'MPa', truth: T.spl, tol: 0.015, hint: 'P_pl / A₀' }, { key: 'red', label: 'Percentage reduction in height', unit: '%', truth: T.red, abs: 0.3, hint: '(h₀ − h_f)/h₀ × 100' });
      return a;
    },
    reference(sim) { const T = sim.truth, R = sim.M.ref, k = sim.k; const o = [{ label: 'Modulus of elasticity', unit: 'GPa', value: T.E, lo: R.E[0], hi: R.E[1], src: k.wood || k.woodp ? 'IS 399 / Wood Handbook' : 'ASM Handbook' }];
      if (k.brittle) o.push({ label: 'Compressive strength', unit: 'MPa', value: T.sc, lo: R.sc[0], hi: R.sc[1], src: 'IS 210 / ASM Vol. 1' }, { label: 'σ_c/σ_t ratio', unit: '', value: T.ratio, lo: 3, hi: 4.5, src: 'Typical for grey iron' });
      if (k.ductile) o.push({ label: 'Compressive yield strength', unit: 'MPa', value: T.sy, lo: R.sy[0], hi: R.sy[1], src: 'ASM Handbook (≈ tensile yield)' });
      if (k.wood) o.push({ label: 'Compressive strength ∥ grain', unit: 'MPa', value: T.sc, lo: R.sc[0], hi: R.sc[1], src: 'IS 399, teak' });
      if (k.woodp) o.push({ label: 'Stress at limit of proportionality ⊥ grain', unit: 'MPa', value: T.spl, lo: R.sc[0], hi: R.sc[1], src: 'IS 399, teak' });
      return o; },
    sample(sim) {
      const T = sim.truth, k = sim.k, f = sim.fit;
      return `<p>A₀ = <b>${U.f(T.A0, 2)} mm²</b>, h₀ = ${U.f(T.h0, 2)} mm.</p><div class="eq">E = slope of σ–ε (least squares, Table 1) = ${U.f(f.m, 0)} MPa = <b>${U.f(T.E, 2)} GPa</b></div>
      ${k.brittle ? `<div class="eq">σ_c = ${U.f(T.Pmax * 1000, 0)} N / ${U.f(T.A0, 2)} mm² = <b>${U.f(T.sc, 1)} MPa</b><br>σ_c/σ_t = ${U.f(T.sc, 1)}/205 = <b>${U.f(T.ratio, 2)}</b></div>` : ''}
      ${k.ductile ? `<div class="eq">σ_y = ${U.f(T.Py * 1000, 0)} / ${U.f(T.A0, 2)} = <b>${U.f(T.sy, 1)} MPa</b><br>Reduction in height = (${U.f(T.h0, 2)} − ${U.f(T.hf, 2)})/${U.f(T.h0, 2)} × 100 = <b>${U.f(T.red, 2)}%</b><br>d_ideal = ${U.f(T.d0, 2)}√(${U.f(T.h0, 2)}/${U.f(T.hf, 2)}) = <b>${U.f(T.dMean, 2)} mm</b>; barrelling = (${U.f(T.dfm, 2)} − ${U.f(T.dMean, 2)})/${U.f(T.dMean, 2)} × 100 = <b>${U.f(T.barrel, 2)}%</b><br>True stress at end = ${U.f(T.Pmax * 1000, 0)} / (π × ${U.f(T.dfm, 2)}²/4) = <b>${U.f(T.sTrueEnd, 1)} MPa</b></div>` : ''}
      ${k.wood ? `<div class="eq">σ_c∥ = ${U.f(T.Pmax * 1000, 0)} / ${U.f(T.A0, 1)} = <b>${U.f(T.sc, 2)} MPa</b></div>` : ''}
      ${k.woodp ? `<div class="eq">σ_pl⊥ = ${U.f(T.Ppl * 1000, 0)} / ${U.f(T.A0, 1)} = <b>${U.f(T.spl, 2)} MPa</b></div>` : ''}${k.brittle || k.woodp ? `<div class="eq">Reduction in height = (${U.f(T.h0, 2)} − ${U.f(T.hf, 2)})/${U.f(T.h0, 2)} × 100 = <b>${U.f(T.red, 2)}%</b></div>` : ''}`;
    },
    uncert(sim) { const T = sim.truth; const uP = 0.01 / Math.sqrt(3); const uA = (T.d0 ? 2 * 0.02 / Math.sqrt(12) / T.d0 : Math.SQRT2 * 0.02 / Math.sqrt(12) / Math.sqrt(T.A0)); const main = T.sc && !sim.k.ductile && !sim.k.woodp ? ['Compressive strength', T.sc] : T.sy ? ['Yield strength', T.sy] : ['Stress at prop. limit', T.spl];
      return [{ q: 'Area A₀', expr: 'u(A)/A from dimension readings', val: T.A0, u: T.A0 * uA, unit: 'mm²' }, { q: main[0], expr: '√[(u_P/P)² + (u_A/A)²]', val: main[1], u: main[1] * Math.hypot(uP, uA), unit: 'MPa' }, { q: 'Reduction in height', expr: '100√2 u(h)/h₀', val: T.red, u: 100 * Math.SQRT2 * 0.02 / Math.sqrt(12) / T.h0, unit: '%' }]; },
    conclude(sim) { const T = sim.truth, k = sim.k; if (k.brittle) return `Grey cast iron failed by shear on a plane inclined at about ${T.ang}° to the load axis at a compressive strength of ${U.f(T.sc, 0)} MPa, which is ${U.f(T.ratio, 1)} times its tensile strength. Graphite flakes that act as cracks in tension are closed in compression, which is why cast iron is used for compression-loaded machine bases and columns.`;
      if (k.ductile) return `${sim.name} yielded at ${U.f(T.sy, 0)} MPa in compression and did not fracture; the specimen barrelled by ${U.f(T.barrel, 1)}% over the ideal diameter at ${U.f(T.red, 1)}% height reduction because platen friction restrains the end faces. Compressive yield strength is close to the tensile yield strength for this ductile metal.`;
      if (k.wood) return `Teak loaded parallel to the grain failed by crushing at ${U.f(T.sc, 1)} MPa with E = ${U.f(T.E, 1)} GPa. Failure began with local buckling of fibres followed by a shear band across the specimen.`;
      return `Teak loaded perpendicular to the grain showed a limit of proportionality at ${U.f(T.spl, 2)} MPa and did not fail; the cell walls collapsed progressively and the specimen densified. Strength perpendicular to grain is roughly one-seventh of that parallel to grain, so bearing areas in timber construction must be sized for it.`; },
    summary: 'In a compression test a short specimen is squeezed between flat platens. Brittle materials such as grey cast iron fail by shear on a plane inclined at 45–55° to the load axis because the maximum shear stress, aided by internal friction, governs failure; their compressive strength is three to four times the tensile strength. Ductile metals yield at about the same stress as in tension but do not fracture; friction at the platen faces restrains radial expansion and the specimen barrels. Timber is anisotropic: parallel to the grain it fails by fibre buckling (crushing), while perpendicular to the grain the cells collapse progressively and a limit of proportionality is reported instead of strength.',
    formulas: [['Compressive stress', 'σ_c = P / A₀'], ['Strain', 'ε = δ / h₀'], ['Reduction in height', '(h₀ − h_f)/h₀ × 100'], ['Volume constancy (no friction)', 'd = d₀ √(h₀/h)'], ['Average pressure with friction (Siebel)', 'p̄ = σ_f (1 + μd/(3h))'], ['Shear fracture angle (Coulomb–Mohr)', 'θ = 45° + φ/2']],
    theory: `<h3>Why test in compression</h3><p>Many components carry compressive loads: machine beds, columns, bearings, bolted joints and timber posts. Brittle materials are much stronger in compression than in tension, and ductile materials show forming behaviour (forging, rolling) that a tensile test cannot reach because necking intervenes. The compression test covers these cases.</p>
    <h3>Brittle materials</h3><p>In grey cast iron, graphite flakes act as sharp internal cracks. Under tension they open and fracture follows at low stress. Under compression they close, so failure requires shearing of the matrix. Fracture occurs on a plane inclined at roughly 45–55° to the load axis: the plane of maximum shear stress, rotated by internal friction according to the Coulomb–Mohr criterion θ = 45° + φ/2. Compressive strength of grey iron is typically 3–4.5 times its tensile strength.</p>
    <h3>Ductile materials and barrelling</h3><p>Ductile metals yield at nearly the same stress in compression as in tension, then continue to deform without fracture. If the platen faces were frictionless the cylinder would stay cylindrical and its diameter would follow volume constancy, d = d₀√(h₀/h). Friction restrains the end faces, the centre bulges and the specimen <b>barrels</b>. The average pressure needed rises with the aspect ratio d/h (Siebel’s equation), so short or dry specimens appear stronger. Lubrication and h/d of 1.5–2 reduce the effect; h/d much above 2 risks buckling.</p>
    <h3>Timber</h3><p>Wood consists of long cellulose fibres aligned with the grain. Parallel to the grain the fibres act as columns: they carry load efficiently until local buckling (kinking) forms a crushing plane. Perpendicular to the grain the hollow cells collapse one row after another, giving a long plateau with no clear maximum, so IS 1708 reports the <i>compressive stress at the limit of proportionality</i>. The ratio of the two is about 6–10.</p>
    <div class="eq">σ_c = P_max / A₀        ε = δ / h₀        E = Δσ / Δε (linear region)</div>`,
    procedure: ['Measure diameter (or sides) and height of the specimen with a vernier calliper.', 'Clean the platens; lubricate them if a frictionless condition is required.', 'Place the specimen centrally on the lower platen; for brittle specimens close the safety guard.', 'Attach the compressometer and apply a small seating load.', 'Load at a constant crosshead rate and record load against compression.', 'For ductile metals note the load at yield and stop at the specified height reduction; for brittle materials load to fracture.', 'Remove the specimen; measure final height and maximum bulge diameter; sketch the failure mode.'],
    precautions: ['Ensure the specimen ends are flat and parallel; uneven contact causes premature edge failure.', 'Centre the specimen; eccentric loading induces bending.', 'Use the safety cage for cast iron, which can shatter violently.', 'Keep h/d within 1–2 to avoid buckling.', 'Do not exceed the machine capacity when compressing ductile specimens to large strains.'],
    applications: ['Design of cast-iron machine beds, columns and bearing housings.', 'Timber column and bearing design (IS 883).', 'Determining flow curves for forging and cold heading.', 'Quality control of castings and sintered parts.'],
    errors: ['Non-parallel end faces causing local yielding.', 'Platen friction raising the apparent strength of ductile specimens.', 'Seating errors in the compressometer at low loads.', 'Moisture content variation in timber specimens (strength falls as moisture rises).', 'Misreading the limit of proportionality on a gradual curve.'],
    discussion: ['Why does cast iron fail on an inclined plane in compression but on a transverse plane in tension?', 'Explain barrelling and how your measured bulge depends on lubrication and h/d.', 'Why is the compressive strength of wood so different parallel and perpendicular to the grain?', 'Would you expect the compressive yield of mild steel to equal its tensile yield? Discuss the Bauschinger effect.'],
    refs: ['IS 14858:2000, Compression Testing Machine Used for Testing of Concrete and Mortar — and ASTM E9-19, Standard Test Methods of Compression Testing of Metallic Materials at Room Temperature.', 'IS 1708 (Part 8):1986, Methods of Testing Small Clear Specimens of Timber — Compression Parallel and Perpendicular to Grain.', 'IS 399:1963, Classification of Commercial Timbers and their Zonal Distribution.', 'G. E. Dieter, Mechanical Metallurgy, McGraw-Hill, Ch. 15 (Siebel analysis).', 'R. C. Hibbeler, Mechanics of Materials, 10th ed., Pearson.'],
    pre: [
      { q: 'Compared with its tensile strength, the compressive strength of grey cast iron is', o: ['About the same', 'Lower', 'Three to four times higher', 'Unpredictable'], a: 2, why: 'Graphite flakes close under compression.' },
      { q: 'A ductile cylinder compressed between dry platens takes the shape of a', o: ['Cone', 'Barrel', 'Hourglass', 'Perfect cylinder'], a: 1, why: 'Friction restrains the ends; the centre bulges.' },
      { q: 'Why are compression specimens kept short (h/d ≈ 1–2)?', o: ['To save material', 'To prevent buckling', 'To increase friction', 'To reduce load'], a: 1, why: 'Slender specimens buckle before the material fails.' },
      { q: 'For timber loaded perpendicular to the grain, IS 1708 reports', o: ['Ultimate strength', 'Stress at limit of proportionality', 'Fracture energy', 'Hardness'], a: 1, why: 'There is no distinct maximum; cells collapse progressively.' },
      { q: 'Grey cast iron in compression fails along a plane that is', o: ['Perpendicular to the load', 'Parallel to the load', 'Inclined at about 45–55° to the load', 'Random'], a: 2, why: 'Shear failure with internal friction (Coulomb–Mohr).' }
    ],
    post: [
      { q: 'Lubricating the platens of a ductile specimen will', o: ['Increase barrelling', 'Reduce barrelling and the apparent flow stress', 'Cause fracture', 'Have no effect'], a: 1, why: 'Lower friction means less end restraint.' },
      { q: 'A copper cylinder is compressed from h₀ = 30 mm to 20 mm. Without friction, its diameter (d₀ = 20 mm) becomes', o: ['22.2 mm', '24.5 mm', '30 mm', '26.7 mm'], a: 1, why: 'd = 20√(30/20) = 24.5 mm.' },
      { q: 'Which statement about your cast-iron result is correct?', o: ['It showed large plastic deformation', 'Its compressive strength exceeded the tensile value by a factor near 3–4', 'It barrelled heavily', 'It had no linear region'], a: 1, why: 'Typical σ_c/σ_t for grey iron is 3–4.5.' },
      { q: 'The reason wood is strong parallel to grain is', o: ['Lignin crystallinity', 'Fibres act as aligned columns', 'Moisture', 'Density only'], a: 1, why: 'Load is carried along the cellulose fibre axis.' },
      { q: 'If the compression specimen ends are not parallel, the measured strength is usually', o: ['Higher', 'Lower', 'Unchanged', 'Doubled'], a: 1, why: 'Contact begins on a small area, causing early local failure.' }
    ]
  });
})();
