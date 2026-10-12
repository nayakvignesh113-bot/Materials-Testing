(function () {
  const U = LAB.U, G = LAB.G;
  const MAT = {
    ms: { name: 'Mild steel (IS 2062 E250)', su: 432, se: 0.5, steel: 1, ref: [180, 240] },
    c45: { name: 'Medium-carbon steel C45, normalised', su: 650, se: 0.5, steel: 1, ref: [270, 350] },
    al: { name: 'Aluminium alloy 2024-T3', su: 480, se: 0, steel: 0, s1e8: 0.29, ref: [120, 160] },
    br: { name: 'Brass CuZn37', su: 380, se: 0, steel: 0, s1e8: 0.36, ref: [110, 160] }
  };
  const SURF = { pol: ['Mirror polished', 1.0], gr: ['Ground', 0.89], mach: ['Machined / turned', 0.77] };
  LAB.register({
    id: 'fatigue', no: 7, cat: 'mech', title: 'Fatigue Test (Rotating Beam)', std: 'IS 5075:1985 / ASTM E466 / ISO 1143', short: 'Rotating-bending fatigue at several stress amplitudes: S–N curve, Basquin constants, endurance limit and Goodman correction.', tags: 'S-N curve endurance limit Basquin Wohler RR Moore cyclic',
    aim: 'To determine the S–N (Wöhler) curve of a material under fully reversed rotating-bending, estimate its endurance limit or fatigue strength at 10⁷ cycles, and evaluate the Basquin constants.',
    objectives: ['Test eight specimens at decreasing stress amplitudes until failure or run-out at 10⁷ cycles.', 'Compute bending stress from applied load and specimen geometry.', 'Fit the Basquin relation σ_a = σ′_f (2N)^b to finite-life data.', 'Estimate the endurance limit and apply the Goodman mean-stress correction.'],
    apparatus: ['Rotating-beam fatigue machine (R. R. Moore type), 4500 rpm, dead-weight loading', 'Hourglass specimens, minimum diameter 7.5 mm, polished', 'Revolution counter with automatic cut-off at fracture', 'Micrometer (LC 0.001 mm)'],
    stdNote: 'Fully reversed bending, stress ratio R = −1. Run-out defined at 10⁷ cycles for steels.',
    params: [
      { id: 'mat', label: 'Material', type: 'select', options: Object.entries(MAT).map(([k, v]) => [k, v.name]), def: 'ms' },
      { id: 'surf', label: 'Surface finish', type: 'select', options: Object.entries(SURF).map(([k, v]) => [k, v[0]]), def: 'pol', hint: 'Surface factor k_a from Shigley (Marin factors).' }
    ],
    opSteps: ['Measure minimum diameter of each specimen', 'Mount specimen in collets; check run-out', 'Hang load; start motor; zero counter', 'Run to fracture or 10⁷ cycles (run-out)', 'Record cycles to failure', 'Repeat at lower stress levels', 'Plot S–N curve on log scale'],
    svg(p) {
      return G.svg('0 0 520 300', `${G.r(0, 0, 520, 300, 'bg')}${G.r(20, 240, 480, 20, 'mach', 'rx="3"')}${G.r(30, 120, 60, 120, 'mach', 'rx="3"')}${G.r(44, 140, 34, 30, 'mach2')}
        ${G.r(90, 140, 90, 22, 'steelD')}${G.r(340, 140, 90, 22, 'steelD')}${G.r(430, 120, 60, 120, 'mach2', 'rx="3"')}
        <g id="specg"><path d="M180 141 L230 141 Q260 146 290 141 L340 141 L340 161 L290 161 Q260 156 230 161 L180 161 Z" class="spec"/><rect id="stripe" x="200" y="141" width="6" height="20" class="steelD"/></g>
        <path id="brk" class="lnb" stroke-width="3" d=""/>
        ${G.l(135, 162, 135, 205, 'ln', 2)}${G.l(385, 162, 385, 205, 'ln', 2)}${G.l(135, 205, 385, 205, 'ln', 3)}${G.l(260, 205, 260, 225, 'ln', 2)}
        <g id="wt">${G.r(236, 225, 48, 12, 'straw')}</g>
        <g transform="translate(150,24)">${G.r(0, 0, 230, 70, 'disp', 'rx="4"')}${G.t(10, 16, 'CYCLES', 'm', 'style="fill:var(--panel-ink);font-size:8px"')}${G.t(10, 40, '0', 'big', 'id="dN"')}${G.t(130, 16, 'σ_a MPa', 'm', 'style="fill:var(--panel-ink);font-size:8px"')}${G.t(130, 40, '—', 'big', 'id="dS"')}${G.t(10, 60, '', 'm', 'id="lab" style="fill:var(--panel-ink)"')}</g>`, 'Rotating beam fatigue machine');
    },
    anim(svg, f, sim) {
      if (!sim) return; const n = sim.list.length; const k = Math.min(n - 1, Math.floor(f * n)); const t = f * n - k; const s = sim.list[k];
      const prog = U.clamp(t / 0.85, 0, 1); const N = Math.pow(10, 3 + (Math.log10(s.N) - 3) * prog);
      G.set(svg, 'stripe', 'x', 200 + ((f * 4000) % 130)); G.set(svg, 'brk', 'd', prog >= 1 && !s.runout ? 'M258 139 L262 163' : '');
      G.txt(svg, 'dN', U.sci(Math.min(N, s.N), 3)); G.txt(svg, 'dS', U.f(s.sa, 0)); G.txt(svg, 'lab', `Specimen ${k + 1}/${n} · W = ${U.f(s.W, 1)} N · ${prog >= 1 ? (s.runout ? 'RUN-OUT' : 'FRACTURED') : 'running'}`);
      G.set(svg, 'wt', 'transform', `translate(0,${prog >= 1 && !s.runout ? 8 : 0})`);
    },
    simulate(p, r) {
      const M = MAT[p.mat]; const ka = SURF[p.surf][1]; const su = M.su * (1 + 0.02 * U.gauss(r));
      const a = 100; // moment arm, mm  (M = W·a)
      const levels = M.steel ? [0.85, 0.75, 0.65, 0.57, 0.51, 0.46, 0.42, 0.37] : [0.85, 0.75, 0.65, 0.55, 0.47, 0.41, 0.36, 0.32];
      let Se, A, b; if (M.steel) { Se = M.se * su * ka; const S3 = 0.9 * su; b = -Math.log10(S3 / Se) / 3; A = S3 / Math.pow(1e3, b); }
      else { const S3 = 0.9 * su, S8 = M.s1e8 * su * ka; b = Math.log10(S8 / S3) / 5; A = S3 / Math.pow(1e3, b); Se = 0; }
      const list = levels.map(lv => {
        const d = U.q(7.5 + 0.004 * U.gauss(r), 0.001); const Ztar = lv * su; const W = U.q(Ztar * Math.PI * d * d * d / (32 * a), 0.5); const sa = 32 * W * a / (Math.PI * d * d * d);
        let N = Math.pow(sa / A, 1 / b) * Math.pow(10, 0.18 * U.gauss(r)); let runout = false;
        if (M.steel && sa < Se * (1 + 0.04 * U.gauss(r))) { runout = true; N = 1e7; } if (N >= 1e7) { runout = true; N = 1e7; }
        N = Math.round(N / 100) * 100; return { d, W, sa, N, runout, hrs: N / 4500 / 60 };
      });
      const fail = list.filter(s => !s.runout); const fit = U.linfit(fail.map(s => Math.log10(2 * s.N)), fail.map(s => Math.log10(s.sa)));
      const bB = fit.m, sfp = Math.pow(10, fit.c);
      const minFail = Math.min(...fail.map(s => s.sa)); const runs = list.filter(s => s.runout); const maxRun = runs.length ? Math.max(...runs.map(s => s.sa)) : null;
      const T = { a, list, b: bB, sfp, su, ka, Se: M.steel && maxRun ? (minFail + maxRun) / 2 : null, S1e7: sfp * Math.pow(2e7, bB) };
      T.ratio = (T.Se || T.S1e7) / su; T.sm = 0.2 * su; T.goodman = (T.Se || T.S1e7) * (1 - T.sm / su); T.sa1 = list[0].sa;
      const failX = fail.map(s => s.N), failY = fail.map(s => s.sa);
      const fitX = [1e3, 2e7].map(x => x), fitY = fitX.map(N => sfp * Math.pow(2 * N, bB));
      return {
        list, dur: 10, M,
        readout(f) { const n = list.length; const k = Math.min(n - 1, Math.floor(f * n)); const s = list[k]; const prog = U.clamp((f * n - k) / 0.85, 0, 1); return [['Specimen', `${k + 1} / ${n}`, ''], ['Load W', U.f(s.W, 1), 'N'], ['Stress amplitude', U.f(s.sa, 1), 'MPa'], ['Cycles', U.sci(Math.pow(10, 3 + (Math.log10(s.N) - 3) * prog), 3), ''], ['Result', prog >= 1 ? (s.runout ? 'Run-out' : 'Failed') : 'Running', '']]; },
        plot: { title: 'S–N diagram', xlabel: 'Cycles to failure N', ylabel: 'Stress amplitude σ_a (MPa)', xlog: true, xmin: 1e3, xmax: 1e8, series: [{ name: 'Failed', x: list.map(s => s.N), y: list.map(s => s.sa), type: 'scatter', color: 's1', open: list.map(s => s.runout) }], caption: 'S–N data; open circles are run-outs at 10⁷ cycles' },
        plots: [{ xlabel: 'Cycles to failure N', ylabel: 'Stress amplitude (MPa)', xlog: true, xmin: 1e3, xmax: 1e8, series: [{ name: 'Test data', x: list.map(s => s.N), y: list.map(s => s.sa), type: 'scatter', open: list.map(s => s.runout) }, { name: `Basquin fit σ′f = ${U.f(sfp, 0)} MPa, b = ${U.f(bB, 3)}`, x: fitX, y: fitY, color: 's2', dash: true }], hlines: T.Se ? [{ y: T.Se, label: `Se ≈ ${U.f(T.Se, 0)} MPa`, color: 's3' }] : [], caption: 'Basquin fit to finite-life data' },
        { xlabel: 'Mean stress σ_m (MPa)', ylabel: 'Alternating stress σ_a (MPa)', series: [{ name: 'Goodman line', x: [0, su], y: [T.Se || T.S1e7, 0], color: 's1' }, { name: 'Design point', x: [T.sm], y: [T.goodman], type: 'scatter', color: 's5' }], caption: 'Modified Goodman diagram' }],
        specimen: [['Material', M.name, ''], ['Tensile strength (same lot)', U.f(su, 0), 'MPa'], ['Surface finish', SURF[p.surf][0] + ` (k_a = ${ka})`, ''], ['Moment arm a (M = W·a)', a, 'mm'], ['Speed', 4500, 'rpm'], ['Stress ratio R', '−1 (fully reversed)', ''], ['Run-out', '10⁷', 'cycles']],
        obs: [{ title: 'Table 1. Rotating-beam fatigue results', cols: ['Specimen', 'd_min (mm)', 'Load W (N)', 'Cycles N', 'Test time (h)', 'Result'], textCols: [5], rows: list.map((s, i) => [i + 1, U.f(s.d, 3), U.f(s.W, 1), s.runout ? '≥ 10⁷' : s.N.toLocaleString('en-IN'), U.f(s.hrs, 2), s.runout ? 'Run-out' : 'Fractured']) }],
        truth: T
      };
    },
    calcs(sim) {
      const T = sim.truth; const a = [{ key: 'sa1', label: 'Bending stress amplitude, specimen 1', unit: 'MPa', truth: T.sa1, tol: 0.01, hint: 'σ = 32 W a / (π d³)' }, { key: 'b', label: 'Basquin exponent b', unit: '—', truth: T.b, abs: Math.max(0.006, Math.abs(T.b) * 0.08), hint: 'slope of log σ_a vs log 2N (failed only)' }, { key: 'sfp', label: 'Fatigue strength coefficient σ′_f', unit: 'MPa', truth: T.sfp, tol: 0.1, hint: '10^(intercept)' }];
      if (T.Se) a.push({ key: 'Se', label: 'Endurance limit S_e (estimate)', unit: 'MPa', truth: T.Se, tol: 0.02, hint: '(lowest failure stress + highest run-out stress)/2' });
      else a.push({ key: 'S7', label: 'Fatigue strength at 10⁷ cycles', unit: 'MPa', truth: T.S1e7, tol: 0.05, hint: 'σ′_f (2 × 10⁷)^b' });
      a.push({ key: 'ratio', label: 'Fatigue ratio S_e/σ_u', unit: '—', truth: T.ratio, tol: 0.05, hint: 'S_e / σ_u' }, { key: 'good', label: `Allowable σ_a at σ_m = ${U.f(T.sm, 0)} MPa (Goodman)`, unit: 'MPa', truth: T.goodman, tol: 0.05, hint: 'S_e (1 − σ_m/σ_u)' });
      return a;
    },
    reference(sim) { const T = sim.truth, M = sim.M; return [{ label: M.steel ? 'Endurance limit (polished)' : 'Fatigue strength at 10⁷', unit: 'MPa', value: (T.Se || T.S1e7) / T.ka, lo: M.ref[0], hi: M.ref[1], src: 'ASM Vol. 19 / Shigley' }, { label: 'Fatigue ratio (polished)', unit: '', value: T.ratio / T.ka, lo: M.steel ? 0.4 : 0.25, hi: M.steel ? 0.6 : 0.45, src: M.steel ? 'Steels ≈ 0.5' : 'Non-ferrous 0.3–0.4' }, { label: 'Basquin exponent b', unit: '', value: T.b, lo: -0.15, hi: -0.05, src: 'Typical metals' }]; },
    sample(sim) { const T = sim.truth, s = T.list[0]; return `<div class="eq">Specimen 1: σ_a = 32 W a/(π d³) = 32 × ${U.f(s.W, 1)} × ${T.a} / (π × ${U.f(s.d, 3)}³) = <b>${U.f(s.sa, 1)} MPa</b></div><div class="eq">Least-squares fit of log σ_a on log 2N for fractured specimens:<br>log σ_a = ${U.f(Math.log10(T.sfp), 4)} + (${U.f(T.b, 4)}) log 2N  →  σ′_f = <b>${U.f(T.sfp, 0)} MPa</b>, b = <b>${U.f(T.b, 4)}</b></div>
      <div class="eq">${T.Se ? `S_e ≈ (lowest failure + highest run-out)/2 = <b>${U.f(T.Se, 1)} MPa</b>` : `S(10⁷) = ${U.f(T.sfp, 0)} × (2×10⁷)^${U.f(T.b, 4)} = <b>${U.f(T.S1e7, 1)} MPa</b>`};  ratio = ${U.f(T.Se || T.S1e7, 1)}/${U.f(T.su, 0)} = <b>${U.f(T.ratio, 3)}</b></div><div class="eq">Goodman: σ_a = S_e(1 − σ_m/σ_u) = ${U.f(T.Se || T.S1e7, 1)}(1 − ${U.f(T.sm, 0)}/${U.f(T.su, 0)}) = <b>${U.f(T.goodman, 1)} MPa</b></div>`; },
    uncert(sim) { const T = sim.truth, s = T.list[0]; const ud = 0.001 / Math.sqrt(12); return [{ q: 'Stress amplitude', expr: '√[(u_W/W)² + (3u_d/d)²]', val: s.sa, u: s.sa * Math.hypot(0.5 / Math.sqrt(12) / s.W, 3 * ud / s.d), unit: 'MPa' }, { q: 'Life at a given stress', expr: 'log-normal scatter, s(log N) ≈ 0.18', val: s.N, u: s.N * (Math.pow(10, 0.18) - 1), unit: 'cycles' }]; },
    conclude(sim) { const T = sim.truth; return `The S–N curve of ${sim.M.name} (${sim.M.steel ? 'ferrous' : 'non-ferrous'}) follows the Basquin relation with σ′_f = ${U.f(T.sfp, 0)} MPa and b = ${U.f(T.b, 3)}. ${T.Se ? `Run-outs below about ${U.f(T.Se, 0)} MPa indicate an endurance limit, giving a fatigue ratio of ${U.f(T.ratio, 2)}.` : `No endurance limit was observed; the fatigue strength at 10⁷ cycles is ${U.f(T.S1e7, 0)} MPa, so a finite design life must be specified.`} With a mean stress of ${U.f(T.sm, 0)} MPa the Goodman allowable alternating stress falls to ${U.f(T.goodman, 0)} MPa.`; },
    summary: 'Fatigue is progressive failure under cyclic stress well below the static strength. In the rotating-beam test a specimen rotates under a constant bending moment, so each surface point sees fully reversed stress (R = −1) once per revolution. The number of cycles to failure N increases as the stress amplitude decreases; the finite-life region follows the Basquin relation σ_a = σ′_f (2N)^b. Ferrous metals show an endurance limit near 10⁶–10⁷ cycles, roughly half the tensile strength for polished specimens; most non-ferrous alloys do not, so their fatigue strength is quoted at a stated life. Surface finish, size, mean stress and notches reduce fatigue strength.',
    formulas: [['Bending stress, round section', 'σ_a = 32 M / (π d³),  M = W·a'], ['Basquin relation', 'σ_a = σ′_f (2N_f)^b'], ['Endurance estimate, steels', 'S′_e ≈ 0.5 σ_u (σ_u ≤ 1400 MPa)'], ['Marin equation', 'S_e = k_a k_b k_c k_d S′_e'], ['Modified Goodman', 'σ_a/S_e + σ_m/σ_u = 1'], ['Life fraction (Miner)', 'Σ n_i/N_i = 1 at failure']],
    theory: `<h3>Fatigue failure</h3><p>About 80–90% of mechanical failures in service are fatigue failures: axles, crankshafts, springs, aircraft skins and welded joints that fail after many cycles of a stress that would be safe if applied once. Fatigue proceeds in three stages: crack <b>initiation</b> at the surface (slip bands, inclusions, machining marks), <b>propagation</b> by a small advance each cycle (leaving striations and beach marks), and final <b>fast fracture</b> when the remaining section can no longer carry the load.</p>
    <h3>Rotating-bending test</h3><p>In the R. R. Moore machine the specimen is loaded as a beam with a constant bending moment M = W·a over its test section, and rotated by a motor. A point on the surface passes from tension to compression and back each revolution:</p><div class="eq">σ_a = 32 M / (π d³)     σ_m = 0     R = σ_min/σ_max = −1</div>
    <h3>The S–N curve</h3><p>Plotting stress amplitude against log N gives the S–N or Wöhler curve. In the high-cycle region (10³–10⁶) it is close to a straight line on log–log axes, the Basquin relation σ<sub>a</sub> = σ′<sub>f</sub>(2N)<sup>b</sup>, with b typically −0.05 to −0.15. Steels and titanium show a horizontal portion, the <b>endurance limit</b>, below which no failure occurs in 10⁷ cycles; interstitial carbon and nitrogen pin dislocations and arrest microcracks. Aluminium and copper alloys show a continuously falling curve, so their fatigue strength is quoted at 10⁷ or 5 × 10⁸ cycles. Specimens that survive are called <b>run-outs</b> and are plotted with an arrow or open symbol.</p>
    <h3>Factors affecting fatigue strength</h3><ul><li><b>Surface finish:</b> machining marks are crack starters; Marin factor k<sub>a</sub> ≈ 0.7–0.9 for turned surfaces.</li><li><b>Size:</b> larger sections have more highly stressed volume and lower endurance (k<sub>b</sub>).</li><li><b>Mean stress:</b> tensile mean stress reduces the allowable amplitude, described by Goodman, Gerber or Soderberg lines.</li><li><b>Stress concentrations:</b> notches reduce fatigue strength by the fatigue notch factor K<sub>f</sub>.</li><li><b>Surface treatment:</b> shot peening, nitriding and case hardening introduce compressive residual stress and improve life.</li></ul>
    <h3>Scatter</h3><p>Fatigue life is inherently scattered; at a given stress, lives commonly vary by a factor of 3–10. Log N is approximately normally distributed, which is why many specimens are needed and why design curves are set below the mean.</p>`,
    procedure: ['Measure the minimum diameter of each specimen with a micrometer; inspect the surface for scratches.', 'Calculate the load W required for the target stress from σ = 32Wa/(πd³).', 'Mount the specimen in the collets and check that run-out is within 0.013 mm.', 'Apply the load, start the motor and reset the counter.', 'Allow the test to run until fracture (automatic cut-off) or 10⁷ cycles (run-out).', 'Record the cycles; examine the fracture surface for initiation site and beach marks.', 'Repeat at lower stress levels; plot σ_a against log N.'],
    precautions: ['Handle specimens by the ends only; fingerprints and scratches initiate cracks.', 'Ensure correct alignment to avoid additional bending.', 'Apply the load gently after the motor reaches speed, or as recommended by the machine maker.', 'Keep guards closed; broken specimens are flung out.', 'Do not overheat the specimen at high stress levels; frequency effects can arise.'],
    applications: ['Design of shafts, axles, connecting rods and springs.', 'Aircraft structural life (safe-life and damage-tolerant design).', 'Welded structures and bridges (fatigue detail categories).', 'Selection of surface treatments to extend life.'],
    errors: ['Specimen misalignment and vibration.', 'Surface finish variations between specimens.', 'Natural scatter of fatigue life.', 'Error in minimum diameter, which enters stress cubed.', 'Counter and cut-off delays.'],
    discussion: ['Why does the S–N curve of steel flatten while that of aluminium does not?', 'Locate the crack initiation site on a fractured specimen. Why is it on the surface?', 'How would a turned surface instead of a polished one change your S–N curve?', 'Use your Goodman result to discuss why a tensile mean stress is harmful.'],
    refs: ['IS 5075:1985, Method for Fatigue Testing of Metals, BIS.', 'ISO 1143:2021, Metallic Materials — Rotating Bar Bending Fatigue Testing.', 'ASTM E466-21, Standard Practice for Conducting Force Controlled Constant Amplitude Axial Fatigue Tests.', 'R. G. Budynas, J. K. Nisbett, Shigley’s Mechanical Engineering Design, 11th ed., McGraw-Hill, Ch. 6.', 'S. Suresh, Fatigue of Materials, 2nd ed., Cambridge University Press.'],
    pre: [
      { q: 'In a rotating-beam fatigue test the stress ratio R is', o: ['0', '−1', '1', '0.5'], a: 1, why: 'Fully reversed bending: σ_min = −σ_max.' },
      { q: 'The S–N curve is usually plotted with N on a', o: ['Linear scale', 'Logarithmic scale', 'Square-root scale', 'Reciprocal scale'], a: 1, why: 'Lives span 10³–10⁷ cycles.' },
      { q: 'Which material typically shows a distinct endurance limit?', o: ['Aluminium alloy', 'Copper', 'Steel', 'Brass'], a: 2, why: 'Ferrous metals and titanium.' },
      { q: 'Fatigue cracks usually start at', o: ['The specimen centre', 'The surface', 'The grips', 'Random interior points'], a: 1, why: 'Bending stress is maximum at the surface, and surface defects concentrate stress.' },
      { q: 'A rough endurance limit estimate for steels is', o: ['0.1σ_u', '0.5σ_u', '0.9σ_u', 'σ_y'], a: 1, why: 'S′e ≈ 0.5σ_u for σ_u up to ~1400 MPa.' }
    ],
    post: [
      { q: 'A specimen that survives 10⁷ cycles is called', o: ['A failure', 'A run-out', 'An outlier', 'A null test'], a: 1, why: 'Plotted with an open symbol or arrow.' },
      { q: 'If the minimum diameter is 1% smaller than measured, the actual stress is', o: ['1% lower', '1% higher', '3% higher', '3% lower'], a: 2, why: 'σ ∝ 1/d³.' },
      { q: 'A Basquin exponent b = −0.09 means that halving the stress amplitude increases life by about', o: ['2 times', '10 times', '2200 times', '90 times'], a: 2, why: 'N ∝ σ^(1/b) = 2^(11.1) ≈ 2200.' },
      { q: 'Beach marks on a fatigue fracture surface indicate', o: ['Cleavage', 'Changes in load or crack-arrest positions during propagation', 'Corrosion only', 'Final overload'], a: 1, why: 'Visible macroscopic arrest lines.' },
      { q: 'Shot peening improves fatigue life mainly by', o: ['Increasing hardness only', 'Introducing compressive residual stress at the surface', 'Removing material', 'Increasing ductility'], a: 1, why: 'Compressive surface stress retards crack initiation and growth.' }
    ]
  });
})();
