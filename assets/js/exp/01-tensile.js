(function () {
  const U = LAB.U, G = LAB.G;
  const MAT = {
    ms: { name: 'Mild steel (IS 2062 E250)', E: 205000, uy: 290, ly: 262, su: 432, el: 28, eu: 0.2, ra: 62, fr: 0.74, m: 0.012, luders: 0.021, ref: { E: [195, 215], y: [240, 310], u: [410, 520], el: [23, 35] } },
    al: { name: 'Aluminium alloy 6061-T6', E: 69000, sy: 276, rp: 0.9, su: 310, el: 13, ra: 38, fr: 0.86, m: 0.002, ref: { E: [66, 72], y: [240, 290], u: [290, 330], el: [8, 17] } },
    cu: { name: 'Copper, annealed (C11000)', E: 117000, sy: 70, rp: 0.6, su: 222, el: 46, ra: 76, fr: 0.66, m: 0.005, ref: { E: [110, 130], y: [55, 90], u: [200, 250], el: [40, 55] } },
    br: { name: 'Brass CuZn30, annealed', E: 110000, sy: 125, rp: 0.65, su: 335, el: 55, ra: 70, fr: 0.78, m: 0.006, ref: { E: [100, 120], y: [95, 150], u: [300, 370], el: [45, 65] } },
    ss: { name: 'Stainless steel 304, annealed', E: 193000, sy: 240, rp: 0.6, su: 590, el: 55, ra: 68, fr: 0.82, m: 0.01, ref: { E: [190, 200], y: [205, 310], u: [515, 720], el: [40, 60] } },
    ci: { name: 'Grey cast iron FG 200', E: 105000, su: 205, el: 0.6, brittle: true, m: 0, ref: { E: [80, 125], u: [200, 260], el: [0.3, 1] } }
  };
  function curve(M, sc) {
    const E = M.E * sc.E, su = M.su * sc.u, el = M.el * sc.el / 100;
    const e = [], s = [];
    if (M.brittle) {
      const ef = el + 0.0015; const A = U.bisect(A => A * (1 - Math.exp(-E * ef / A)) - su, su * 0.9, su * 20);
      for (let i = 0; i <= 260; i++) { const x = ef * i / 260; e.push(x); s.push(A * (1 - Math.exp(-E * x / A))); }
      return { e, s, E, su, ef, eu: ef, sf: su, brittle: true };
    }
    const sf = su * M.fr;
    let eu, f;
    if (M.ly) {
      const uy = M.uy * sc.y, ly = M.ly * sc.y, eL = M.luders * (0.9 + 0.2 * sc.r), tL = Math.log(1 + eL);
      const eu0 = M.eu * (0.92 + 0.16 * sc.r); eu = eu0; let ef = el + sf / E; if (eu > 0.8 * ef) ef = eu / 0.8;
      const ey = uy / E;
      f = x => { if (x <= ey) return E * x; if (x <= ey + 0.0012) return uy - (uy - ly) * (x - ey) / 0.0012; if (x <= eL) return ly * (1 + 0.006 * Math.sin(x * 2600)); if (x <= eu) return ly + (su - ly) * (1 - Math.pow(1 - (x - eL) / (eu - eL), 2.6)); return su - (su - sf) * Math.pow((x - eu) / (ef - eu), 1.75); };
      const npts = 420; for (let i = 0; i <= npts; i++) { let x = ef * Math.pow(i / npts, 1.0); if (i < 60) x = (eL * 1.05) * i / 60; else x = eL * 1.05 + (ef - eL * 1.05) * (i - 60) / (npts - 60); e.push(x); s.push(f(x)); }
      return { e, s, E, su, ef, eu, sf, uy, ly };
    }
    // Swift-type hardening: linear to proportional limit σp, then σt = K(ε0 + εp)^n, calibrated so that the
    // 0.2% proof stress equals σy and the maximum engineering stress equals su (Considère).
    const sy = M.sy * sc.y, rp = M.rp, sp = sy * rp;
    const e0 = n => 0.002 / (Math.pow(1 / rp, 1 / n) - 1); const Kn = n => sy / Math.pow(e0(n) + 0.002, n);
    const n = U.bisect(n => Kn(n) * Math.pow(n, n) * Math.exp(-n) - su, 0.03, 0.75); const K = Kn(n), eps0 = e0(n);
    for (let i = 0; i <= 50; i++) { const sv = sp * i / 50; e.push(sv / E); s.push(sv); }
    const stEnd = K * Math.pow(n + 0.15, n); let last = -1, suA = sp; eu = sp / E;
    for (let i = 1; i <= 320; i++) { const st = sp + (stEnd - sp) * Math.pow(i / 320, 1.5); const et = st / E + Math.max(0, Math.pow(st / K, 1 / n) - eps0); const ee = Math.exp(et) - 1, se = st / (1 + ee); if (se < last) break; e.push(ee); s.push(se); last = se; eu = ee; suA = se; }
    const sfA = suA * M.fr; let ef = el + sfA / E; if (eu > 0.85 * ef) ef = eu / 0.85;
    for (let i = 1; i <= 90; i++) { const x = eu + (ef - eu) * i / 90; e.push(x); s.push(suA - (suA - sfA) * Math.pow(i / 90, 1.75)); }
    return { e, s, E, su: suA, ef, eu, sf: sfA, n, K, sp };
  }
  function offsetYield(c) { for (let i = 1; i < c.e.length; i++) { const g0 = c.s[i - 1] - c.E * (c.e[i - 1] - 0.002), g1 = c.s[i] - c.E * (c.e[i] - 0.002); if (g0 > 0 && g1 <= 0) { const t = g0 / (g0 - g1); return c.s[i - 1] + t * (c.s[i] - c.s[i - 1]); } } return NaN; }

  LAB.register({
    id: 'tensile', no: 1, cat: 'mech', title: 'Tensile Test', std: 'IS 1608 (Part 1):2022 / ASTM E8/E8M', short: 'Load–extension to fracture on a round specimen: E, yield, UTS, elongation, reduction of area, strain-hardening exponent.', tags: 'UTM yield UTS ductility stress strain mild steel aluminium copper',
    aim: 'To conduct a tensile test on a standard round specimen using a universal testing machine and determine its elastic modulus, yield strength, ultimate tensile strength, percentage elongation, percentage reduction in area, true fracture stress and strain-hardening exponent.',
    objectives: ['Record the load–extension response of a proportional round test piece up to fracture.', 'Convert load–extension data to engineering and true stress–strain curves.', 'Determine elastic, strength and ductility properties as defined in IS 1608 / ASTM E8.', 'Compare results with handbook data and quantify measurement uncertainty.'],
    apparatus: ['Universal testing machine (servo-hydraulic, 400 kN, Class 1 load cell per IS 1828-1)', 'Clip-on extensometer, gauge 50 mm, resolution 0.001 mm (Class 0.5, ISO 9513)', 'Wedge grips for round specimens', 'Outside micrometer (0–25 mm, LC 0.01 mm) and vernier calliper (LC 0.02 mm)', 'Punch / gauge marker and steel rule'],
    stdNote: 'Proportional gauge length L₀ = 5.65√S₀ (IS 1608); ASTM E8 uses L₀ = 4D for round specimens.',
    params: [
      { id: 'mat', label: 'Material', type: 'select', options: Object.entries(MAT).map(([k, v]) => [k, v.name]), def: 'ms' },
      { id: 'd0', label: 'Gauge diameter d₀', type: 'select', options: [['8', '8 mm'], ['10', '10 mm'], ['12.5', '12.5 mm']], def: '10' },
      { id: 'gl', label: 'Gauge length rule', type: 'select', options: [['prop', 'Proportional, 5.65√S₀ (IS 1608)'], ['4d', '4d (ASTM E8)'], ['50', 'Fixed 50 mm']], def: 'prop' },
      { id: 'v', label: 'Crosshead speed', type: 'select', options: [['1', '1 mm/min'], ['2', '2 mm/min'], ['5', '5 mm/min'], ['10', '10 mm/min']], def: '2', hint: 'IS 1608 limits stress rate in the elastic range; higher speeds slightly raise flow stress.' }
    ],
    opSteps: ['Measure d₀ at three places with the micrometer; mark gauge length', 'Grip specimen, check alignment, zero load cell', 'Attach extensometer; load in elastic range', 'Pass yield; record yield load', 'Remove extensometer; continue to maximum load', 'Necking develops; load falls', 'Fracture; fit pieces and measure L_u and d_u'],
    svg(p) {
      return G.utm(`
        ${G.r(238, 70, 44, 40, 'mach2', 'rx="3"')}${G.r(244, 74, 32, 32, 'steelD')}
        <path id="sp" class="spec" d=""/>
        <g id="lg">${G.r(238, 222, 44, 40, 'mach2', 'rx="3"')}${G.r(244, 226, 32, 32, 'steelD')}</g>
        <g id="extm">${G.r(286, 128, 8, 64, 'acc')}${G.l(282, 130, 268, 130, 'lna', 2)}${G.l(282, 190, 268, 190, 'lna', 2)}</g>
        ${G.xh(262)}
        ${G.t(300, 160, '', 'm', 'id="lab"')}`);
    },
    anim(svg, f, sim, p) {
      const st = sim ? sim.at(f) : { ext: 0, P: 0, s: 0, e: 0, phase: 'Ready', neck: 0, broken: false };
      const L0 = sim ? sim.L0 : 50; const ext = st.ext; const sPx = Math.min(34, ext / L0 * 60);
      const w0 = 16, neckW = w0 * (1 - 0.55 * st.neck), top = 110, g0 = 120, gLen = 80 + sPx, gap = st.broken ? 8 : 0;
      const mid = g0 + gLen / 2; const xl = 260 - w0 / 2, xr = 260 + w0 / 2;
      const upper = `M245 ${top} H275 V${g0 - 4} Q268 ${g0} ${xr} ${g0 + 2} V${mid - 14} Q${260 + neckW / 2} ${mid} ${260 + neckW / 2} ${mid - gap / 2} H${260 - neckW / 2} Q${260 - neckW / 2} ${mid} ${xl} ${mid - 14} V${g0 + 2} Q252 ${g0} 245 ${g0 - 4} Z`;
      const lower = `M${260 - neckW / 2} ${mid + gap / 2} Q${260 - neckW / 2} ${mid} ${xl} ${mid + 14} V${g0 + gLen - 2} Q252 ${g0 + gLen} 245 ${g0 + gLen + 4} V${g0 + gLen + 20} H275 V${g0 + gLen + 4} Q268 ${g0 + gLen} ${xr} ${g0 + gLen - 2} V${mid + 14} Q${260 + neckW / 2} ${mid} ${260 + neckW / 2} ${mid + gap / 2} Z`;
      G.set(svg, 'sp', 'd', upper + ' ' + lower);
      G.set(svg, 'lg', 'transform', `translate(0,${sPx + gap})`); G.set(svg, 'xh', 'transform', `translate(0,${262 + sPx + gap})`);
      G.show(svg, 'extm', !sim || st.extOn);
      G.txt(svg, 'dL', U.f(st.P, 2)); G.txt(svg, 'dD', U.f(ext, 2)); G.txt(svg, 'lab', st.phase); G.txt(svg, 'cap', sim ? 'Specimen: ' + sim.mat : '');
    },
    simulate(p, r) {
      const M = MAT[p.mat]; const sc = { E: 1 + 0.015 * U.gauss(r), y: 1 + 0.025 * U.gauss(r), u: 1 + 0.015 * U.gauss(r), el: 1 + 0.05 * U.gauss(r), r: r() };
      const rate = Math.pow(p.v / 2, M.m); sc.y *= rate; sc.u *= rate;
      const d0 = p.d0; const dm = [d0 + 0.012 * U.gauss(r), d0 + 0.012 * U.gauss(r), d0 + 0.012 * U.gauss(r)].map(x => U.q(x, 0.01));
      const dbar = U.mean(dm); const A0 = Math.PI * dbar * dbar / 4;
      const L0 = p.gl === 'prop' ? U.q(5.65 * Math.sqrt(Math.PI * d0 * d0 / 4), 0.5) : p.gl === '4d' ? 4 * d0 : 50;
      const c = curve(M, sc);
      const P = c.s.map(s => s * A0 / 1000), X = c.e.map(e => e * L0);
      // observations — elastic stage with extensometer
      const sy = c.ly || offsetYield(c) || c.su * 0.6; const Pel = (M.brittle ? c.su * 0.45 : c.sp ? c.sp * 0.95 : sy * 0.8) * A0 / 1000;
      const step = U.q(Pel / 6, M.brittle ? 0.5 : 1) || 0.5; const el = [];
      for (let k = 0; k <= 6; k++) { const Pk = k * step; if (Pk > Pel * 1.02) break; const ek = U.inv(c.e, c.s, Pk * 1000 / A0); const dx = k === 0 ? 0 : U.q(ek * L0 + 0.0006 * U.gauss(r), 0.001); el.push([Pk, Math.max(0, dx)]); }
      const strainEl = el.map(x => x[1] / L0), stressEl = el.map(x => x[0] * 1000 / A0);
      const fit = U.linfit(strainEl, stressEl);
      const iMax = c.s.indexOf(Math.max(...c.s)); const Pmax = U.q(P[iMax], 0.01); const dU = U.q(X[iMax], 0.01);
      const Pf = U.q(P[P.length - 1], 0.01);
      const elong = M.brittle ? c.ef - c.sf / c.E : c.ef - c.sf / c.E; const Lu = U.q(L0 * (1 + elong) + 0.05 * U.gauss(r), 0.02);
      const ra = M.brittle ? 0.3 : M.ra * (1 + 0.03 * U.gauss(r)); const du = U.q(dbar * Math.sqrt(1 - ra / 100), 0.01);
      const Py = M.brittle ? null : c.ly ? U.q(c.ly * A0 / 1000, 0.01) : U.q(offsetYield(c) * A0 / 1000, 0.01); const Pu = c.uy ? U.q(c.uy * A0 / 1000, 0.01) : null;
      // truths computed from recorded values
      const T = { A0, E: fit.m / 1000, Py, Pu, Pmax, Pf, Lu, du, L0, dU, dbar };
      T.sy = Py ? Py * 1000 / A0 : null; T.su = Pmax * 1000 / A0; T.el = (Lu - L0) / L0 * 100; T.Au = Math.PI * du * du / 4; T.ra = (A0 - T.Au) / A0 * 100; T.tf = Pf * 1000 / T.Au; T.n = Math.log(1 + dU / L0); T.yr = T.sy ? T.sy / T.su : null; T.tough = T.sy ? ((T.sy + T.su) / 2) * (T.el / 100) : null;
      // true stress-strain for report
      const te = [], ts = []; for (let i = 0; i <= iMax; i += 2) { te.push(Math.log(1 + c.e[i]) * 100); ts.push(c.s[i] * (1 + c.e[i])); }
      const curveRows = []; for (let i = 0; i < P.length; i += 21) curveRows.push([U.f(X[i], 3), U.f(P[i], 2), U.f(c.s[i], 1), U.f(c.e[i] * 100, 3)]);
      const phases = f => { const i = Math.min(c.e.length - 1, Math.floor(f * (c.e.length - 1))); const e = c.e[i]; if (f >= 1) return 'Fractured'; if (M.brittle) return e < c.ef * 0.4 ? 'Elastic' : 'Microcracking'; const ey = (c.ly ? c.uy : offsetYield(c)) / c.E; if (e < ey) return 'Elastic'; if (c.ly && e < M.luders) return 'Yielding (Lüders)'; if (e < c.eu) return 'Strain hardening'; return 'Necking'; };
      return {
        mat: M.name, L0, A0, dur: 9,
        at(f) { const i = Math.min(c.e.length - 1, Math.floor(f * (c.e.length - 1))); const neck = !M.brittle && c.e[i] > c.eu ? (c.e[i] - c.eu) / (c.ef - c.eu) : 0; return { ext: X[i], P: P[i], s: c.s[i], e: c.e[i], phase: phases(f), neck, broken: f >= 1, extOn: c.s[i] < sy * 1.05 && c.e[i] < 0.02 }; },
        readout(f) { const s = this.at(f); return [['Load', U.f(s.P, 2), 'kN'], ['Extension', U.f(s.ext, 3), 'mm'], ['Eng. stress', U.f(s.s, 1), 'MPa'], ['Eng. strain', U.f(s.e * 100, 2), '%'], ['Stage', s.phase, '']]; },
        plot: { title: 'Load–extension diagram', xlabel: 'Extension (mm)', ylabel: 'Load (kN)', series: [{ name: 'Load–extension', x: X, y: P, color: 's1' }], caption: 'Load–extension diagram recorded by the UTM' },
        plots: [{ xlabel: 'Strain (%)', ylabel: 'Stress (MPa)', series: [{ name: 'Engineering', x: c.e.map(e => e * 100), y: c.s, color: 's1' }, { name: 'True (to max load)', x: te, y: ts, color: 's2', dash: true }], caption: 'Engineering and true stress–strain curves (true curve valid up to onset of necking)' },
        { xlabel: 'Strain (%)', ylabel: 'Stress (MPa)', series: [{ name: 'Extensometer data', x: strainEl.map(x => x * 100), y: stressEl, type: 'scatter', color: 's1' }, { name: 'Least-squares fit', x: [0, strainEl[strainEl.length - 1] * 100], y: [fit.c, fit.c + fit.m * strainEl[strainEl.length - 1]], color: 's2', dash: true }], ymin: 0, xmin: 0, caption: `Elastic region: least-squares fit gives E = ${U.f(fit.m / 1000, 1)} GPa (R² = ${U.f(fit.r2, 4)})` }],
        specimen: [['Material', M.name, ''], ['Diameter readings d₁, d₂, d₃', dm.map(x => U.f(x, 2)).join(', '), 'mm'], ['Gauge length L₀', U.f(L0, 1), 'mm'], ['Crosshead speed', p.v, 'mm/min'], ['Load cell / extensometer', '400 kN Class 1 / 50 mm Class 0.5', ''], ['Test temperature', '27 ± 2', '°C']],
        obs: [
          { title: 'Table 1. Elastic region (extensometer readings)', cols: ['Sl. no.', 'Load P (kN)', 'Extension δ (mm)'], rows: el.map((x, i) => [i + 1, U.f(x[0], 2), U.f(x[1], 3)]), note: 'Extensometer gauge length = L₀. Use these readings for the modulus of elasticity.' },
          { title: 'Table 2. Key readings', cols: ['Reading', 'Value', 'Unit'], textCols: [0, 2], rows: [...(Pu ? [['Upper yield load P_eH', U.f(Pu, 2), 'kN'], ['Lower yield load P_eL', U.f(Py, 2), 'kN']] : Py ? [['Load at 0.2% proof (from graph) P_p0.2', U.f(Py, 2), 'kN']] : []), ['Maximum load P_max', U.f(Pmax, 2), 'kN'], ['Extension at maximum load δ_u', U.f(dU, 2), 'mm'], ['Load at fracture P_f', U.f(Pf, 2), 'kN'], ['Final gauge length L_u', U.f(Lu, 2), 'mm'], ['Diameter at fracture d_u (mean)', U.f(du, 2), 'mm']] },
          { title: 'Table 3. Load–extension record (every 21st sample)', cols: ['Extension (mm)', 'Load (kN)', 'Eng. stress (MPa)', 'Eng. strain (%)'], rows: curveRows }
        ],
        truth: T, fit, M, c
      };
    },
    calcs(sim, p) {
      const T = sim.truth, M = sim.M; const a = [
        { key: 'A0', label: 'Original cross-sectional area S₀', unit: 'mm²', truth: T.A0, tol: 0.005, hint: 'S₀ = π d̄₀² / 4' },
        { key: 'E', label: 'Modulus of elasticity E', unit: 'GPa', truth: T.E, tol: 0.05, hint: 'slope of σ–ε from Table 1 (least squares)' }];
      if (T.sy) a.push({ key: 'sy', label: M.ly ? 'Lower yield strength R_eL' : '0.2% proof strength R_p0.2', unit: 'MPa', truth: T.sy, tol: 0.01, hint: 'P_y / S₀' });
      a.push({ key: 'su', label: 'Ultimate tensile strength R_m', unit: 'MPa', truth: T.su, tol: 0.01, hint: 'P_max / S₀' });
      a.push({ key: 'el', label: 'Percentage elongation A', unit: '%', truth: T.el, abs: Math.max(0.15, T.el * 0.02), hint: '(L_u − L₀)/L₀ × 100' });
      if (!M.brittle) {
        a.push({ key: 'ra', label: 'Percentage reduction of area Z', unit: '%', truth: T.ra, abs: 1, hint: '(S₀ − S_u)/S₀ × 100' });
        a.push({ key: 'tf', label: 'True fracture stress', unit: 'MPa', truth: T.tf, tol: 0.02, hint: 'P_f / S_u' });
        a.push({ key: 'n', label: 'Strain-hardening exponent n', unit: '—', truth: T.n, tol: 0.04, hint: 'n ≈ ε_u(true) = ln(1 + δ_u/L₀)' });
        a.push({ key: 'yr', label: 'Yield ratio', unit: '—', truth: T.yr, tol: 0.015, hint: 'R_e / R_m' });
        a.push({ key: 'tough', label: 'Toughness (approximate)', unit: 'MJ/m³', truth: T.tough, tol: 0.03, hint: '((R_e + R_m)/2) × A/100' });
      }
      return a;
    },
    reference(sim) {
      const T = sim.truth, R = sim.M.ref; const out = [{ label: 'Modulus of elasticity', unit: 'GPa', value: T.E, lo: R.E[0], hi: R.E[1], src: 'ASM Handbook Vol. 2/1' }];
      if (T.sy) out.push({ label: 'Yield strength', unit: 'MPa', value: T.sy, lo: R.y[0], hi: R.y[1], src: 'IS 2062 / ASM' });
      out.push({ label: 'Tensile strength', unit: 'MPa', value: T.su, lo: R.u[0], hi: R.u[1], src: 'IS 2062 / ASM' }, { label: 'Elongation', unit: '%', value: T.el, lo: R.el[0], hi: R.el[1], src: 'Material standard' });
      return out;
    },
    sample(sim) {
      const T = sim.truth, f = sim.fit;
      return `<p>Mean diameter d̄₀ = ${U.f(T.dbar, 3)} mm; S₀ = π(${U.f(T.dbar, 3)})²/4 = <b>${U.f(T.A0, 2)} mm²</b>.</p>
      <div class="eq">Modulus of elasticity (least-squares slope of Table 1):<br>E = Σ(σ−σ̄)(ε−ε̄) / Σ(ε−ε̄)² = ${U.f(f.m, 0)} MPa = <b>${U.f(T.E, 1)} GPa</b>, R² = ${U.f(f.r2, 4)}</div>
      ${T.sy ? `<div class="eq">Yield strength = P_y / S₀ = ${U.f(T.Py * 1000, 0)} N / ${U.f(T.A0, 2)} mm² = <b>${U.f(T.sy, 1)} MPa</b></div>` : ''}
      <div class="eq">UTS = P_max / S₀ = ${U.f(T.Pmax * 1000, 0)} / ${U.f(T.A0, 2)} = <b>${U.f(T.su, 1)} MPa</b></div>
      <div class="eq">% Elongation = (${U.f(T.Lu, 2)} − ${U.f(T.L0, 2)}) / ${U.f(T.L0, 2)} × 100 = <b>${U.f(T.el, 2)} %</b></div>
      ${T.sy ? `<div class="eq">S_u = π(${U.f(T.du, 2)})²/4 = ${U.f(T.Au, 2)} mm²;  % RA = (${U.f(T.A0, 2)} − ${U.f(T.Au, 2)}) / ${U.f(T.A0, 2)} × 100 = <b>${U.f(T.ra, 2)} %</b></div>
      <div class="eq">True fracture stress = P_f / S_u = ${U.f(T.Pf * 1000, 0)} / ${U.f(T.Au, 2)} = <b>${U.f(T.tf, 1)} MPa</b></div>
      <div class="eq">n ≈ ln(1 + δ_u/L₀) = ln(1 + ${U.f(T.dU, 2)}/${U.f(T.L0, 1)}) = <b>${U.f(T.n, 3)}</b> (Considère criterion: necking begins when ε_true = n)</div>
      <div class="eq">Yield ratio = ${U.f(T.sy, 1)}/${U.f(T.su, 1)} = <b>${U.f(T.yr, 3)}</b>;  Toughness ≈ ((${U.f(T.sy, 0)} + ${U.f(T.su, 0)})/2)(${U.f(T.el / 100, 4)}) = <b>${U.f(T.tough, 1)} MJ/m³</b></div>` : ''}`;
    },
    uncert(sim) {
      const T = sim.truth; const ud = 0.01 / Math.sqrt(12), uP = 0.01 / Math.sqrt(3); const uA = 2 * ud / T.dbar; const uL = 0.02 / Math.sqrt(12);
      const rows = [{ q: 'Area S₀', expr: 'u(S)/S = 2u(d)/d', val: T.A0, u: T.A0 * uA, unit: 'mm²' }, { q: 'UTS R_m', expr: '√[(u_P/P)² + (2u_d/d)²]', val: T.su, u: T.su * Math.hypot(uP, uA), unit: 'MPa' }];
      if (T.sy) rows.push({ q: 'Yield strength', expr: '√[(u_P/P)² + (2u_d/d)²]', val: T.sy, u: T.sy * Math.hypot(uP, uA), unit: 'MPa' });
      rows.push({ q: 'Elongation A', expr: '100·√2·u(L)/L₀', val: T.el, u: 100 * Math.SQRT2 * uL / T.L0, unit: '%' });
      const ext = sim.obs[0].rows.length; rows.push({ q: 'Modulus E', expr: 'regression std. error of slope', val: T.E, u: T.E * Math.sqrt((1 - sim.fit.r2) / Math.max(1, ext - 2)) / Math.sqrt(Math.max(sim.fit.r2, 1e-9)) + T.E * uA, unit: 'GPa' });
      return rows;
    },
    conclude(sim) { const T = sim.truth; return `The ${sim.mat} specimen showed ${sim.M.brittle ? 'brittle fracture with negligible plastic deformation' : sim.M.ly ? 'a distinct upper and lower yield point followed by strain hardening and necking' : 'continuous yielding without a yield point, followed by strain hardening and necking'}. Measured properties: E = ${U.f(T.E, 1)} GPa${T.sy ? `, yield strength = ${U.f(T.sy, 0)} MPa` : ''}, UTS = ${U.f(T.su, 0)} MPa, elongation = ${U.f(T.el, 1)}%${T.sy ? `, reduction of area = ${U.f(T.ra, 1)}%, n ≈ ${U.f(T.n, 2)}` : ''}. These values are within the typical range for the material, so the specimen meets the expected grade.`; },
    summary: 'In a tensile test a specimen is pulled uniaxially at a controlled rate while load and extension are recorded. Engineering stress σ = P/S₀ and strain ε = δ/L₀ are based on original dimensions. Up to the proportional limit stress is linear with strain (Hooke’s law), giving the modulus E. Plastic flow begins at yield; mild steel shows a yield point and Lüders band propagation due to carbon and nitrogen atoms pinning dislocations (Cottrell atmospheres), while FCC metals yield continuously and are characterised by the 0.2% proof stress. Strain hardening raises the flow stress until the Considère condition dσ_t/dε_t = σ_t is reached at maximum load, where necking begins; for a Hollomon material σ_t = Kε_tⁿ this occurs at ε_t = n. Ductility is quantified by percentage elongation and reduction of area.',
    formulas: [['Engineering stress and strain', 'σ = P/S₀,  ε = δ/L₀'], ['Hooke’s law', 'E = σ/ε (elastic region)'], ['Proportional gauge length', 'L₀ = 5.65 √S₀'], ['Percentage elongation', 'A = (L_u − L₀)/L₀ × 100'], ['Reduction of area', 'Z = (S₀ − S_u)/S₀ × 100'], ['True stress and strain', 'σ_t = σ(1+ε),  ε_t = ln(1+ε)'], ['Hollomon equation', 'σ_t = K ε_tⁿ ;  necking at ε_t = n']],
    theory: `<h3>Purpose</h3><p>The tension test is the primary acceptance test for metallic materials. It gives the design properties (yield and tensile strength), the stiffness (E) and the ductility (elongation and reduction of area) from a single specimen, under conditions defined precisely by IS 1608 (Part 1) and ASTM E8/E8M.</p>
    <h3>Engineering stress–strain curve</h3><p>The machine records load P against extension δ. Dividing by the original area and gauge length gives the engineering curve:</p><div class="eq">σ = P / S₀        ε = δ / L₀</div>
    <p>In the <b>elastic region</b> deformation is recoverable and stress is proportional to strain, σ = Eε. The slope is the modulus of elasticity, a property set by interatomic bonding and hardly affected by heat treatment.</p>
    <p><b>Yielding.</b> Annealed low-carbon steel shows an <i>upper yield point</i> followed by a sudden drop to a <i>lower yield point</i>. Interstitial carbon and nitrogen pin dislocations; once they break free a band of plastic deformation (Lüders band) runs along the gauge at almost constant load. FCC metals such as aluminium and copper have no yield point, so the <i>0.2% proof stress</i> R<sub>p0.2</sub> is used: draw a line parallel to the elastic slope from ε = 0.002 and read its intersection with the curve.</p>
    <p><b>Strain hardening.</b> Beyond yield, dislocation multiplication and interaction raise the flow stress. In true terms many metals follow the Hollomon equation σ<sub>t</sub> = Kε<sub>t</sub><sup>n</sup>, where n is the strain-hardening exponent (≈0.2 for mild steel, 0.4–0.5 for annealed copper and austenitic stainless steel).</p>
    <p><b>Necking.</b> The load reaches a maximum when the increase in strength from hardening is exactly balanced by the loss of area. Considère’s criterion, dσ<sub>t</sub>/dε<sub>t</sub> = σ<sub>t</sub>, gives ε<sub>t</sub> = n at maximum load, so the true uniform strain is a direct estimate of n. Deformation then localises in a neck and the engineering stress falls until fracture.</p>
    <div class="eq">σ_t = σ(1 + ε)     ε_t = ln(1 + ε)     (valid up to maximum load)<span class="w">After necking the stress state in the neck is triaxial; Bridgman’s correction is needed for true stress.</span></div>
    <h3>Ductility measures</h3><p>Percentage elongation depends on gauge length because the neck contributes a fixed extension. This is why IS 1608 uses a <i>proportional</i> gauge length L₀ = 5.65√S₀ (equivalent to 5d for round bars): results from specimens of different size are then comparable. Reduction of area, measured at the neck, is independent of gauge length and is the better measure of a material’s capacity for local deformation.</p>
    <h3>Fracture appearance</h3><p>Ductile metals give a <b>cup-and-cone</b> fracture: microvoids nucleate at inclusions in the neck centre, coalesce into a flat fibrous region, and the outer ring fails by shear at about 45°. Grey cast iron breaks on a flat, granular plane perpendicular to the load with almost no elongation, because graphite flakes act as internal notches.</p>
    <h3>Effect of test speed</h3><p>Flow stress rises slightly with strain rate (σ ∝ ε̇<sup>m</sup>, with m ≈ 0.01 for steel at room temperature). IS 1608 therefore limits the stress rate in the elastic range (typically 6–60 MPa/s for steel) so that results are reproducible.</p>`,
    procedure: ['Measure the specimen diameter at three positions along the gauge length with a micrometer and take the mean; calculate S₀.', 'Mark the gauge length L₀ (5.65√S₀) with light punch marks.', 'Fix the specimen in the wedge grips so that it is axially aligned; zero the load and displacement channels.', 'Attach the extensometer across the gauge length.', 'Apply load at the specified crosshead speed and record load–extension readings in the elastic range.', 'Note the upper and lower yield loads (or record the curve for proof stress); remove the extensometer before necking.', 'Continue loading to fracture; note the maximum load and the load at fracture.', 'Fit the broken pieces together and measure the final gauge length L_u and minimum diameter d_u; sketch the fracture.'],
    precautions: ['Ensure the specimen is coaxial with the loading axis; bending from misalignment lowers the measured yield and UTS.', 'Remove the extensometer before necking to avoid damage at fracture.', 'Use the protective shield; fracture releases stored elastic energy and fragments can fly.', 'Do not exceed the load cell capacity; select a load range so that the expected maximum load is above 20% of range.', 'Record the fracture position; if fracture is outside the middle half of the gauge length, elongation may be invalid (IS 1608 Annex).'],
    applications: ['Material acceptance and grade certification of structural steels (IS 2062, IS 1786 rebars).', 'Design allowable stresses from yield strength with factors of safety.', 'Formability assessment of sheet metals using n and r-values.', 'Quality control after heat treatment and welding procedure qualification.'],
    errors: ['Misalignment of grips causing bending stresses.', 'Extensometer knife-edge slip in the elastic range, which affects E most strongly.', 'Diameter measurement error, which enters area calculations squared.', 'Reading the yield load from a recorder chart with finite line width.', 'Fracture outside the middle third of the gauge, making elongation non-representative.', 'Temperature variation and test speed differing from the standard.'],
    discussion: ['Explain why your material did or did not show a distinct yield point.', 'Why does the engineering stress fall after maximum load while the true stress keeps rising?', 'Compare your value of n with the handbook value. What does n tell a sheet-metal designer?', 'Why is percentage elongation reported along with the gauge length used?'],
    refs: ['IS 1608 (Part 1):2022, Metallic Materials — Tensile Testing, Method of Test at Room Temperature, BIS, New Delhi.', 'ASTM E8/E8M-22, Standard Test Methods for Tension Testing of Metallic Materials, ASTM International.', 'G. E. Dieter, Mechanical Metallurgy, SI Metric ed., McGraw-Hill, 1988, Ch. 8.', 'W. D. Callister, D. G. Rethwisch, Materials Science and Engineering: An Introduction, 10th ed., Wiley, 2018, Ch. 6.', 'JCGM 100:2008, Evaluation of Measurement Data — Guide to the Expression of Uncertainty in Measurement.'],
    pre: [
      { q: 'Which property is obtained from the slope of the initial linear part of the stress–strain curve?', o: ['Yield strength', 'Modulus of elasticity', 'Resilience', 'Ultimate strength'], a: 1, why: 'Within the proportional limit σ = Eε, so the slope is E.' },
      { q: 'The proportional gauge length specified by IS 1608 for a round specimen is', o: ['L₀ = 2√S₀', 'L₀ = 5.65√S₀', 'L₀ = 11.3 S₀', 'L₀ = 50 mm always'], a: 1, why: '5.65√S₀ makes elongation comparable between specimens of different sizes; it equals 5d for round bars.' },
      { q: 'For aluminium alloys, which have no distinct yield point, yield strength is reported as', o: ['Upper yield point', 'Lower yield point', '0.2% proof stress', 'Breaking stress'], a: 2, why: 'A line parallel to the elastic slope at 0.2% offset defines the proof stress.' },
      { q: 'Necking in a tensile specimen begins at', o: ['The proportional limit', 'The lower yield point', 'Maximum load', 'Fracture'], a: 2, why: 'Considère’s criterion: instability starts when the load is maximum.' },
      { q: 'Engineering stress is calculated using', o: ['Instantaneous area', 'Original area', 'Area at fracture', 'Mean of original and final area'], a: 1, why: 'Engineering stress is P/S₀; true stress uses the instantaneous area.' }
    ],
    post: [
      { q: 'Your load–extension curve shows a sudden load drop just after the elastic region, then a nearly flat region. This is evidence of', o: ['Machine slip', 'Yield-point phenomenon with Lüders bands', 'Necking', 'Strain-rate softening'], a: 1, why: 'Interstitial atoms pin dislocations; breakaway gives the upper/lower yield and Lüders band propagation.' },
      { q: 'A Hollomon material has n = 0.22. The true strain at maximum load is', o: ['0.022', '0.22', '0.5', 'Cannot be determined'], a: 1, why: 'Considère: ε_t = n at maximum load.' },
      { q: 'Two specimens of the same steel, 10 mm and 20 mm diameter, both with 50 mm gauge length, will show', o: ['Same elongation', 'Higher elongation for the 20 mm specimen', 'Higher elongation for the 10 mm specimen', 'Same reduction of area but no elongation'], a: 1, why: 'Neck extension scales with diameter; on a fixed gauge length the thicker bar shows a larger percentage elongation. Hence proportional gauge lengths.' },
      { q: 'The cup-and-cone fracture of mild steel begins with', o: ['Shear at 45° at the surface', 'Microvoid nucleation at the centre of the neck', 'Cleavage of ferrite grains', 'Fatigue cracks'], a: 1, why: 'Triaxial stress at the neck centre nucleates voids at inclusions; the outer shear lip forms last.' },
      { q: 'An error of 1% in measuring diameter produces an error in stress of about', o: ['0.5%', '1%', '2%', '4%'], a: 2, why: 'Area ∝ d², so relative error doubles.' }
    ]
  });
})();
