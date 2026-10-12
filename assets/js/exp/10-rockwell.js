(function () {
  const U = LAB.U, G = LAB.G;
  // ASTM E140 (abridged) conversions from Vickers
  const HVc = [240, 250, 260, 270, 280, 290, 300, 320, 340, 360, 380, 400, 420, 440, 460, 480, 500, 550, 600, 650, 700, 750, 800, 850, 900, 940];
  const HRCc = [20.3, 22.2, 24.0, 25.6, 27.1, 28.5, 29.8, 32.2, 34.4, 36.6, 38.8, 40.8, 42.7, 44.5, 46.1, 47.7, 49.1, 52.3, 55.2, 57.8, 60.1, 62.2, 64.0, 65.7, 67.2, 68.0];
  const HRAc = [60.7, 61.6, 62.4, 63.1, 63.8, 64.5, 65.2, 66.4, 67.6, 68.7, 69.8, 70.8, 71.8, 72.8, 73.6, 74.5, 75.3, 77.0, 78.6, 80.0, 81.3, 82.5, 83.4, 84.4, 85.0, 85.6];
  const HVb = [85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200, 210, 220, 230, 240];
  const HRBc = [41, 48, 52, 56.2, 59.5, 62.3, 65, 66.7, 69, 71.2, 73, 75, 76.6, 78.7, 79.9, 81.7, 83.0, 85, 86.1, 87.1, 88.8, 89.5, 90.5, 91.5, 93.5, 95, 96.7, 98.1];
  const lin = (xs, ys, x) => { if (x <= xs[0]) return ys[0] + (x - xs[0]) * (ys[1] - ys[0]) / (xs[1] - xs[0]); if (x >= xs[xs.length - 1]) { const n = xs.length; return ys[n - 1] + (x - xs[n - 1]) * (ys[n - 1] - ys[n - 2]) / (xs[n - 1] - xs[n - 2]); } return U.interp(xs, ys, x); };
  const SC = {
    C: { name: 'HRC — diamond cone, 150 kgf', N: 100, ind: 'Diamond cone 120°', F: 150, lo: 20, hi: 70, conv: hv => lin(HVc, HRCc, hv), inv: hr => lin(HRCc, HVc, hr) },
    B: { name: 'HRB — 1/16″ ball, 100 kgf', N: 130, ind: 'Steel ball 1.5875 mm', F: 100, lo: 20, hi: 100, conv: hv => lin(HVb, HRBc, hv), inv: hr => lin(HRBc, HVb, hr) },
    A: { name: 'HRA — diamond cone, 60 kgf', N: 100, ind: 'Diamond cone 120°', F: 60, lo: 20, hi: 88, conv: hv => lin(HVc, HRAc, hv), inv: hr => lin(HRAc, HVc, hr) }
  };
  const MAT = {
    hard: { name: 'Hardened bearing steel EN31 (Q 840 °C, T 180 °C)', HV: 720 },
    qt: { name: 'Quenched & tempered steel EN19 (T 550 °C)', HV: 340 },
    ms: { name: 'Mild steel (IS 2062 E250)', HV: 140 },
    br: { name: 'Brass CuZn37, half hard', HV: 125 },
    al: { name: 'Aluminium alloy 6061-T6', HV: 107 },
    cu: { name: 'Copper, annealed', HV: 52 }
  };
  LAB.register({
    id: 'rockwell', no: 10, cat: 'hard', title: 'Rockwell Hardness Test', std: 'IS 1586 (Part 1):2018 / ASTM E18 / ISO 6508-1', short: 'Differential-depth hardness on B, C and A scales: scale selection, depth-to-number conversion, repeatability and conversion to HV.', tags: 'HRC HRB HRA depth dial cone ball',
    aim: 'To determine the Rockwell hardness of metals on the appropriate scale (B, C or A), to relate the hardness number to the permanent depth of penetration, and to check whether the chosen scale is valid for the material.',
    objectives: ['Select the Rockwell scale and indenter for a given material.', 'Record five readings and evaluate mean and repeatability.', 'Calculate the hardness number from the permanent depth increment.', 'Convert the result to an equivalent Vickers hardness (ASTM E140).'],
    apparatus: ['Rockwell hardness tester (minor load 10 kgf; major loads 60, 100, 150 kgf)', 'Diamond cone indenter (120°, tip radius 0.2 mm) and 1/16″ steel ball indenter', 'Standard test blocks for verification', 'Flat and V-anvils'],
    stdNote: 'One Rockwell unit = 0.002 mm of permanent depth. HRC valid 20–70; HRB valid 20–100; HRA valid 20–88.',
    params: [
      { id: 'mat', label: 'Material', type: 'select', options: Object.entries(MAT).map(([k, v]) => [k, v.name]), def: 'hard' },
      { id: 'sc', label: 'Rockwell scale', type: 'select', options: Object.entries(SC).map(([k, v]) => [k, v.name]), def: 'C' }
    ],
    opSteps: ['Fit indenter and set major load for the scale', 'Place specimen on anvil', 'Apply minor load (10 kgf); set dial to zero (set)', 'Apply major load; wait for needle to settle', 'Remove major load (minor still on)', 'Read hardness number on the dial', 'Repeat at five positions'],
    svg(p) {
      let ticks = ''; for (let i = 0; i < 100; i += 5) { const a = (i / 100) * 2 * Math.PI - Math.PI / 2; const r1 = i % 10 ? 40 : 36; ticks += G.l(390 + 44 * Math.cos(a), 110 + 44 * Math.sin(a), 390 + r1 * Math.cos(a), 110 + r1 * Math.sin(a), 'ln', i % 10 ? 1 : 1.6); }
      return G.svg('0 0 520 300', `${G.r(0, 0, 520, 300, 'bg')}${G.r(90, 20, 220, 60, 'mach', 'rx="8"')}${G.r(110, 80, 30, 180, 'mach')}${G.r(70, 255, 280, 25, 'mach', 'rx="3"')}
        <g id="ind">${G.r(190, 80, 20, 50, 'steelD')}<path d="M192 130 L208 130 L200 ${p.sc === 'B' ? 140 : 146} Z" class="${p.sc === 'B' ? 'steel' : 'acc'}"/></g>
        ${G.r(160, 160, 80, 20, 'spec', 'id="spR"')}${G.r(180, 180, 40, 30, 'mach2')}${G.r(192, 210, 16, 45, 'steel')}
        <circle cx="390" cy="110" r="50" class="surf" stroke="var(--ink)" stroke-width="2"/>${ticks}<line id="ndl" x1="390" y1="110" x2="390" y2="72" class="lnb" stroke-width="2.5"/><circle cx="390" cy="110" r="4" class="ink"/>
        ${G.t(372, 140, 'HR' + p.sc, 'm')}
        <g transform="translate(320,190)">${G.r(0, 0, 180, 70, 'disp', 'rx="4"')}${G.t(10, 16, 'LOAD kgf', 'm', 'style="fill:var(--panel-ink);font-size:8px"')}${G.t(10, 38, '0', 'big', 'id="dL"')}${G.t(96, 16, 'READING', 'm', 'style="fill:var(--panel-ink);font-size:8px"')}${G.t(96, 38, '—', 'big', 'id="dR"')}${G.t(10, 58, '', 'm', 'id="lab" style="fill:var(--panel-ink)"')}</g>`, 'Rockwell hardness tester');
    },
    anim(svg, f, sim) {
      if (!sim) return; const n = sim.list.length; const k = Math.min(n - 1, Math.floor(f * n)); const t = f * n - k; const s = sim.list[k];
      let load = 0, depthU = 0, txt = 'Approach'; if (t > .15) { load = 10; txt = 'Minor load, set zero'; } if (t > .3) { load = sim.F; depthU = U.clamp((t - .3) / .15, 0, 1) * (s.e + s.el) / 0.002; txt = 'Major load'; } if (t > .6) { load = 10; depthU = s.e / 0.002; txt = 'Major removed — read'; }
      const reading = sim.N - depthU; const ang = ((100 - reading) % 100) / 100 * 360; // dial counts down
      G.set(svg, 'ndl', 'transform', `rotate(${-(depthU % 100) / 100 * 360} 390 110)`); G.set(svg, 'ind', 'transform', `translate(0,${t > .15 ? 8 + depthU * 0.05 : t * 50})`); void ang;
      G.txt(svg, 'dL', load); G.txt(svg, 'dR', t > .6 ? U.f(s.HR, 1) : '—'); G.txt(svg, 'lab', `Reading ${k + 1}/5 · ${txt}`);
    },
    simulate(p, r) {
      const M = MAT[p.mat], S = SC[p.sc]; const HV = M.HV * (1 + 0.02 * U.gauss(r)); const HRt = U.clamp(S.conv(HV), -15, S.N - 8);
      const list = [0, 1, 2, 3, 4].map(() => { const hr = HRt + (p.sc === 'B' ? 0.6 : 0.4) * U.gauss(r); const e = U.q((S.N - hr) * 0.002, 0.0005); const HR = S.N - e / 0.002; return { e, HR, el: 0.006 + 0.004 * r() }; });
      const HRs = list.map(s => s.HR); const mean = U.mean(HRs); const valid = mean >= S.lo && mean <= S.hi ? 'Valid' : 'Not valid';
      const T = { HR1: list[0].HR, mean, sd: U.sd(HRs), range: Math.max(...HRs) - Math.min(...HRs), valid, HV: S.inv(mean), tmin: 10 * Math.max(...list.map(s => s.e)) * (p.sc === 'B' ? 1.5 : 1), e1: list[0].e, N: S.N };
      const cRows = (p.sc === 'B' ? HRBc.map((v, i) => [HVb[i], v]) : (p.sc === 'C' ? HRCc : HRAc).map((v, i) => [HVc[i], v])).filter(rw => Math.abs(rw[1] - mean) < 6);
      return {
        list, F: S.F, N: S.N, M, S, dur: 9,
        warn: valid === 'Valid' ? null : `Mean reading ${U.f(mean, 1)} HR${p.sc} is outside the valid range ${S.lo}–${S.hi} for this scale. ${mean > S.hi ? 'Use a harder scale (C or A) — the ball may flatten.' : 'Use a softer scale (B, or F/E for very soft metals).'}`,
        readout(f) { const k = Math.min(4, Math.floor(f * 5)); const t = f * 5 - k; return [['Scale', 'HR' + p.sc, ''], ['Indenter', S.ind, ''], ['Total load', S.F, 'kgf'], ['Reading', t > .6 || f >= 1 ? U.f(list[k].HR, 1) : '—', 'HR' + p.sc]]; },
        plot: { title: 'Readings', xlabel: 'Reading number', ylabel: 'Hardness (HR' + p.sc + ')', series: [{ name: 'HR' + p.sc, x: [1, 2, 3, 4, 5], y: HRs, type: 'linepts', color: 's1' }], hlines: [{ y: mean, label: 'mean', color: 's2' }], xmin: 0, xmax: 6, yzero: false, ymin: Math.floor(mean - 5), ymax: Math.ceil(mean + 5), caption: 'Repeatability of five Rockwell readings' },
        specimen: [['Material', M.name, ''], ['Scale', S.name, ''], ['Minor load', 10, 'kgf'], ['Total test load', S.F, 'kgf'], ['Constant N', S.N, ''], ['Depth per unit s', 0.002, 'mm']],
        obs: [{ title: 'Table 1. Rockwell readings', cols: ['Reading', 'Permanent depth increment e (mm)', 'Dial reading (HR' + p.sc + ')'], rows: list.map((s, i) => [i + 1, U.f(s.e, 4), U.f(s.HR, 1)]) },
        { title: 'Table 2. ASTM E140 conversion excerpt', cols: ['HV', 'HR' + p.sc], rows: cRows.map(rw => [rw[0], rw[1]]), note: 'Interpolate linearly between rows.' }],
        truth: T
      };
    },
    calcs(sim) { const T = sim.truth; return ([{ key: 'hr1', label: 'Hardness from depth, reading 1', unit: 'HR', truth: T.HR1, abs: 0.3, hint: `HR = ${T.N} − e/0.002` }, { key: 'mean', label: 'Mean hardness (5 readings)', unit: 'HR', truth: T.mean, abs: 0.3, hint: 'mean' }, { key: 'sd', label: 'Standard deviation', unit: 'HR', truth: T.sd, abs: 0.15, hint: 'sample s' }, { key: 'valid', label: 'Is the chosen scale valid for this material?', type: 'select', options: ['Valid', 'Not valid'], truth: T.valid }, { key: 'hv', label: 'Equivalent Vickers hardness', unit: 'HV', truth: T.HV, tol: 0.03, hint: 'interpolate Table 2' }, { key: 'tmin', label: 'Minimum specimen thickness (10 × e_max' + (sim.S.N === 130 ? ' × 1.5 for ball' : '') + ')', unit: 'mm', truth: T.tmin, tol: 0.03, hint: 'ISO 6508 rule of thumb' }]).filter(c => c.key !== 'hv' || T.valid === 'Valid'); },
    reference(sim) { const T = sim.truth; return [{ label: 'Equivalent HV', unit: 'HV', value: T.HV, lo: sim.M.HV * 0.92, hi: sim.M.HV * 1.08, src: 'Handbook hardness for the condition' }, { label: 'Reading within scale range', unit: 'HR', value: T.mean, lo: sim.S.lo, hi: sim.S.hi, src: 'IS 1586 / ASTM E18' }, { label: 'Range of 5 readings', unit: 'HR', value: T.range, lo: 0, hi: 2.5, src: 'Repeatability check' }]; },
    sample(sim) { const T = sim.truth, s = sim.list[0]; return `<div class="eq">Reading 1: e = ${U.f(s.e, 4)} mm → HR = N − e/s = ${T.N} − ${U.f(s.e, 4)}/0.002 = <b>${U.f(s.HR, 1)}</b></div><div class="eq">Mean = (${sim.list.map(x => U.f(x.HR, 1)).join(' + ')})/5 = <b>${U.f(T.mean, 2)}</b>; s = <b>${U.f(T.sd, 2)}</b>; range = ${U.f(T.range, 1)}</div><div class="eq">Validity: ${T.valid} (scale range ${sim.S.lo}–${sim.S.hi}). Equivalent hardness by interpolation in ASTM E140 ≈ <b>${U.f(T.HV, 0)} HV</b></div>`; },
    uncert(sim) { const T = sim.truth; return [{ q: 'Single reading', expr: 'dial resolution 0.5 HR → 0.5/√12', val: T.HR1, u: 0.5 / Math.sqrt(12), unit: 'HR' }, { q: 'Mean (type A)', expr: 's/√5', val: T.mean, u: T.sd / Math.sqrt(5), unit: 'HR' }]; },
    conclude(sim) { const T = sim.truth; return `${sim.M.name} gave a mean hardness of ${U.f(T.mean, 1)} HR${sim.S.name[2]} (s = ${U.f(T.sd, 2)}, n = 5), equivalent to about ${U.f(T.HV, 0)} HV. The reading is ${T.valid === 'Valid' ? 'within' : 'outside'} the valid range for the scale${T.valid === 'Valid' ? ', so the result can be reported.' : '; the test must be repeated on a more suitable scale.'}`; },
    summary: 'The Rockwell test measures the permanent increase in depth of penetration under a major load, relative to the depth under a minor (preliminary) load. Using the minor load as a reference eliminates the effect of surface roughness and machine deflection. Each Rockwell unit is 0.002 mm of depth, and the number is N − e/0.002 with N = 100 for diamond scales and 130 for ball scales, so a harder material gives a larger number. The scale (indenter and load) must suit the material: C for hardened steels, B for soft steels and non-ferrous alloys, A for very hard or thin materials.',
    formulas: [['Rockwell number, diamond scales (A, C)', 'HR = 100 − e/0.002'], ['Rockwell number, ball scales (B)', 'HR = 130 − e/0.002'], ['Loads', 'Minor 10 kgf; major total 60 (A), 100 (B), 150 (C) kgf'], ['Valid ranges', 'HRC 20–70; HRB 20–100; HRA 20–88'], ['Minimum thickness (cone)', 't ≥ 10 e']],
    theory: `<h3>Principle</h3><p>S. P. Rockwell (1919) wanted a hardness test that gave an immediate reading without measuring an impression under a microscope. The test measures depth instead of area. The sequence is:</p><ol><li>Apply a <b>minor load</b> F₀ = 10 kgf. The indenter penetrates slightly; this depth is the reference (the dial is set to zero).</li><li>Apply the <b>additional load</b> F₁ so that the total equals the major load (60, 100 or 150 kgf). The indenter goes deeper.</li><li>Remove F₁ while keeping F₀. Elastic recovery lifts the indenter partly; the remaining <b>permanent increase in depth</b> e is measured.</li></ol><div class="eq">HR = N − e / s      s = 0.002 mm;  N = 100 (diamond), 130 (ball)</div>
    <p>The minor load seats the indenter through surface roughness and takes up machine compliance, which is why the test can be done on machined surfaces.</p>
    <h3>Scales</h3><p>There are 30 Rockwell scales. The common ones are HRC (diamond cone, 150 kgf) for hardened and tempered steels, HRB (1/16″ ball, 100 kgf) for soft steels, brass and aluminium alloys, and HRA (diamond, 60 kgf) for very hard materials such as cemented carbides and thin case-hardened layers. Superficial scales (15N, 30T etc.) use 3 kgf minor load for thin sheet and coatings.</p>
    <h3>Choosing the scale</h3><p>Below about 20 the diamond cone sinks too deep and the conical shape no longer gives a consistent number; above 100 on a ball scale the ball may flatten and sensitivity is lost. A copper specimen that reads below 20 HRB should be tested on HRF (1/16″ ball, 60 kgf) or HRE (1/8″ ball, 100 kgf).</p>
    <h3>Conversion</h3><p>Rockwell numbers are not proportional to Vickers or Brinell numbers, because they are based on depth rather than area and on different indenter geometries. Approximate conversions use empirical tables (ASTM E140) that are specific to material class; conversions for non-ferrous alloys are less reliable.</p>`,
    procedure: ['Choose the scale for the expected hardness and fit the correct indenter and weights.', 'Verify the machine on a standard test block of similar hardness.', 'Place the specimen on the anvil; raise it until the minor load is applied (small pointer on the mark).', 'Set the large dial to the set point.', 'Release the major load and wait until the needle stops (dwell 2–6 s).', 'Return the handle to remove the major load and read the hardness from the dial (black figures for C/A, red for B).', 'Take five readings at least 3 indentation diameters apart; report the mean and the scale.'],
    precautions: ['Specimen must be flat, clean, seated firmly; curved specimens need a correction or V-anvil.', 'Never test on a surface thinner than 10× the depth.', 'Keep at least 3 diameters between indentations and from the edge.', 'Discard the first reading after changing the indenter or anvil.', 'Do not use the diamond cone on soft materials or the ball above 100 HRB.'],
    applications: ['Production checks on heat-treated parts (gears, shafts, tools).', 'Incoming inspection of bar stock and fasteners (IS 1367).', 'Verifying case hardening (with HRA or superficial scales).', 'Grading of hardened tool steels and bearing races.'],
    errors: ['Dirt or scale between specimen and anvil.', 'Indenter tip damage (diamond chipping).', 'Specimen curvature and thickness.', 'Vibration during loading.', 'Dial reading parallax.'],
    discussion: ['Why does the Rockwell test use a minor load?', 'Your specimen read outside the valid range. Which scale would you choose instead and why?', 'Why are Rockwell numbers not proportional to Vickers numbers?', 'Compute the depth difference between 60 HRC and 62 HRC. What does this imply about precision?'],
    refs: ['IS 1586 (Part 1):2018, Metallic Materials — Rockwell Hardness Test, Part 1: Test Method, BIS.', 'ASTM E18-22, Standard Test Methods for Rockwell Hardness of Metallic Materials.', 'ISO 6508-1:2023, Metallic Materials — Rockwell Hardness Test.', 'ASTM E140-12b(2019), Standard Hardness Conversion Tables for Metals.', 'K. Herrmann, Hardness Testing: Principles and Applications, ASM International, 2011.'],
    pre: [
      { q: 'The Rockwell number is based on', o: ['Area of impression', 'Permanent increase in depth', 'Rebound height', 'Scratch width'], a: 1, why: 'Depth under minor load after removing the major load.' },
      { q: 'The minor load in standard Rockwell testing is', o: ['3 kgf', '10 kgf', '60 kgf', '150 kgf'], a: 1, why: '10 kgf for regular scales; 3 kgf for superficial.' },
      { q: 'Which scale is used for hardened tool steel?', o: ['HRB', 'HRC', 'HRF', 'HRE'], a: 1, why: 'Diamond cone, 150 kgf.' },
      { q: 'One Rockwell unit corresponds to a depth of', o: ['0.2 mm', '0.02 mm', '0.002 mm', '0.0002 mm'], a: 2, why: 's = 0.002 mm.' },
      { q: 'The indenter for HRB is', o: ['Diamond cone', '1/16″ steel ball', '10 mm ball', 'Diamond pyramid'], a: 1, why: '1.5875 mm ball.' }
    ],
    post: [
      { q: 'A permanent depth increment of 0.080 mm on the C scale gives', o: ['80 HRC', '60 HRC', '40 HRC', '20 HRC'], a: 1, why: '100 − 0.080/0.002 = 60.' },
      { q: 'Annealed copper reads 8 on the B scale. You should', o: ['Report 8 HRB', 'Use a softer scale such as HRF', 'Use HRC', 'Increase the minor load'], a: 1, why: 'Below 20 HRB is outside the valid range.' },
      { q: 'Why is the Rockwell test fast compared with Brinell?', o: ['Smaller load', 'Hardness is read directly from depth; no optical measurement', 'No specimen preparation', 'Uses electricity'], a: 1, why: 'Depth is measured by the machine.' },
      { q: 'Two indentations placed too close together will read', o: ['Too low', 'Too high (work-hardened zone)', 'Unchanged', 'Negative'], a: 1, why: 'The deformed zone around the first indentation is harder.' },
      { q: 'A specimen 1 mm thick is tested on HRC and reads 45. The total depth is about 0.11 mm. The test is', o: ['Valid', 'Invalid: thickness < 10 × depth', 'Valid only on HRB', 'Not affected'], a: 1, why: 'Requires ≥ 1.1 mm; anvil effect will raise the reading.' }
    ]
  });
})();
