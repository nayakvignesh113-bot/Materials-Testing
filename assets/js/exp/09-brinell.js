(function () {
  const U = LAB.U, G = LAB.G;
  const MAT = {
    ms: { name: 'Mild steel (IS 2062 E250)', HB: 128, k: 30, uts: 3.45, ref: [115, 150] },
    en31: { name: 'Bearing steel EN31, annealed', HB: 207, k: 30, uts: 3.45, ref: [190, 230] },
    ci: { name: 'Grey cast iron FG 200', HB: 195, k: 30, ref: [170, 230] },
    br: { name: 'Brass CuZn37, half hard', HB: 118, k: 10, ref: [100, 140] },
    al: { name: 'Aluminium alloy 6061-T6', HB: 95, k: 10, ref: [85, 105] },
    cu: { name: 'Copper, annealed', HB: 45, k: 5, ref: [35, 55] }
  };
  const HB = (P, D, d) => 2 * P / (Math.PI * D * (D - Math.sqrt(D * D - d * d)));
  LAB.register({
    id: 'brinell', no: 9, cat: 'hard', title: 'Brinell Hardness Test', std: 'IS 1500 (Part 1):2019 / ASTM E10 / ISO 6506-1', short: 'Ball indentation with load ratio selection, two-diameter measurement under the microscope, validity check d/D and strength estimate.', tags: 'HBW hardness ball indentation microscope',
    aim: 'To determine the Brinell hardness number of metals using a hardened steel or tungsten carbide ball, selecting the correct ball diameter and force–diameter ratio, and to verify the validity of the test.',
    objectives: ['Select ball diameter and load from the force–diameter ratio for the material.', 'Measure indentation diameters with a Brinell microscope.', 'Calculate HBW, check the 0.24D–0.6D validity window, and calculate Meyer hardness.', 'Estimate tensile strength from hardness for steels.'],
    apparatus: ['Brinell hardness tester, 187.5–3000 kgf', 'Tungsten carbide balls of 10, 5 and 2.5 mm diameter', 'Brinell microscope with graticule, 20×, least count 0.01 mm', 'Polished flat specimens'],
    stdNote: 'Valid indentation diameter 0.24D ≤ d ≤ 0.6D. Specimen thickness ≥ 8 × indentation depth. Centre spacing ≥ 3d.',
    params: [
      { id: 'mat', label: 'Material', type: 'select', options: Object.entries(MAT).map(([k, v]) => [k, v.name]), def: 'ms' },
      { id: 'D', label: 'Ball diameter D', type: 'select', options: [['10', '10 mm'], ['5', '5 mm'], ['2.5', '2.5 mm']], def: '10' },
      { id: 'k', label: 'Force–diameter ratio 0.102F/D²', type: 'select', options: [['30', '30 (steels, cast iron)'], ['10', '10 (Cu alloys, Al alloys)'], ['5', '5 (soft Cu, Al)'], ['2.5', '2.5'], ['1', '1 (lead, tin)']], def: '30', hint: 'Load in kgf = ratio × D². Choose it so that d falls in 0.24D–0.6D.' },
      { id: 'dwell', label: 'Dwell time', type: 'select', options: [['15', '15 s (steels)'], ['30', '30 s (non-ferrous)']], def: '15' }
    ],
    opSteps: ['Prepare a flat, clean surface', 'Fit ball; set load from ratio × D²', 'Raise specimen to contact the ball', 'Apply load; hold for dwell time', 'Release; move to next position (≥ 3d)', 'Measure two perpendicular diameters', 'Repeat for three indentations'],
    svg(p) {
      return G.svg('0 0 520 300', `${G.r(0, 0, 520, 300, 'bg')}${G.r(120, 20, 280, 50, 'mach', 'rx="6"')}${G.r(150, 70, 30, 190, 'mach')}${G.r(110, 250, 300, 30, 'mach', 'rx="3"')}
        <g id="ram">${G.r(250, 70, 20, 60, 'steelD')}<circle cx="260" cy="138" r="10" class="steel"/></g>
        <g id="tbl">${G.r(210, 175, 100, 22, 'spec')}${G.r(230, 197, 60, 20, 'mach2')}${G.r(252, 217, 16, 33, 'steel')}</g>
        <path id="dents" d="" class="ink"/>
        <g transform="translate(330,90)">${G.r(0, 0, 160, 84, 'disp', 'rx="4"')}${G.t(10, 18, 'LOAD kgf', 'm', 'style="fill:var(--panel-ink);font-size:8px"')}${G.t(10, 40, '0', 'big', 'id="dL"')}${G.t(90, 18, 'DWELL s', 'm', 'style="fill:var(--panel-ink);font-size:8px"')}${G.t(90, 40, '0', 'big', 'id="dT"')}${G.t(10, 68, '', 'm', 'id="lab" style="fill:var(--panel-ink)"')}</g>`, 'Brinell hardness tester');
    },
    anim(svg, f, sim) {
      if (!sim) return; const n = 3; const k = Math.min(n - 1, Math.floor(f * n)); const t = f * n - k;
      const down = t < .2 ? 0 : t < .35 ? (t - .2) / .15 : t < .75 ? 1 : t < .85 ? 1 - (t - .75) / .1 : 0; const load = t < .35 ? 0 : t < .45 ? (t - .35) / .1 : t < .75 ? 1 : 0;
      G.set(svg, 'ram', 'transform', `translate(0,${down * 27})`); G.txt(svg, 'dL', U.f(load * sim.P, 0)); G.txt(svg, 'dT', t > .45 && t < .75 ? U.f((t - .45) / .3 * sim.dwell, 0) : '0');
      G.txt(svg, 'lab', `Indentation ${k + 1}/3 · ${t < .35 ? 'approach' : t < .75 ? 'load held' : 'measure'}`);
    },
    liveView(el, f, sim) {
      const n = 3; const k = Math.min(n - 1, Math.floor(f * n)); const t = f * n - k; const show = f >= 1 ? 2 : (t > .8 ? k : k - 1);
      const key = show + '|' + sim.seed; if (el.dataset.key === key) return; el.dataset.key = key;
      if (show < 0) { el.innerHTML = '<p class="muted" style="padding:20px;text-align:center">Indentation will appear under the microscope after the load is removed.</p>'; return; }
      const it = sim.ind[show]; const c = G.canvas(560, 380); G.indentView(c, { kind: 'ball', d1: it.d1, d2: it.d2, fov: sim.D * 0.95, seed: sim.seed + show, label: `Indentation ${show + 1} · ${sim.D} mm ball · ${sim.P} kgf` }); el.innerHTML = ''; el.appendChild(c);
    },
    simulate(p, r) {
      const M = MAT[p.mat]; const D = p.D, P = U.q(p.k * D * D, 0.5); const HBt = M.HB * (1 + 0.03 * U.gauss(r)) * (p.k < M.k ? 0.97 : p.k > M.k ? 1.03 : 1);
      const dTrue = Math.sqrt(D * D - Math.pow(D - 2 * P / (Math.PI * D * HBt), 2));
      const ind = [0, 1, 2].map(() => { const dd = dTrue * (1 + 0.012 * U.gauss(r)); return { d1: U.q(dd * (1 + 0.006 * U.gauss(r)), 0.01), d2: U.q(dd * (1 + 0.006 * U.gauss(r)), 0.01) }; });
      ind.forEach(i => { i.d = (i.d1 + i.d2) / 2; i.HB = HB(P, D, i.d); i.depth = (D - Math.sqrt(D * D - i.d * i.d)) / 2; });
      const dbar = U.mean(ind.map(i => i.d)); const ratio = dbar / D; const valid = ratio >= 0.24 && ratio <= 0.6;
      const T = { P, D, ind, HB1: ind[0].HB, mean: U.mean(ind.map(i => i.HB)), sd: U.sd(ind.map(i => i.HB)), ratio, valid: valid ? 'Valid' : 'Not valid', HM: 4 * P / (Math.PI * ind[0].d * ind[0].d), depth: ind[0].depth };
      T.tmin = 8 * Math.max(...ind.map(i => i.depth)); if (M.uts) T.uts = M.uts * T.mean;
      return {
        D, P, dwell: p.dwell, ind, seed: Math.floor(r() * 1e6), M, dur: 9,
        warn: valid ? null : `Mean d/D = ${U.f(ratio, 3)} is outside 0.24–0.60. Under IS 1500 this result is not valid; choose a different force–diameter ratio or ball and repeat.`,
        readout(f) { const k = Math.min(2, Math.floor(f * 3)); const t = f * 3 - k; return [['Load', U.f(t > .35 && t < .75 ? P : 0, 0), 'kgf'], ['Ball', D, 'mm'], ['Indentation', `${k + 1} / 3`, ''], ['Status', t < .35 ? 'Approach' : t < .75 ? 'Dwell' : 'Measure', '']]; },
        specimen: [['Material', M.name, ''], ['Ball', `Tungsten carbide, D = ${D} mm`, ''], ['Force–diameter ratio', p.k, ''], ['Test force F', `${P} kgf (${U.f(P * 9.80665, 0)} N)`, ''], ['Dwell time', p.dwell, 's'], ['Designation', `HBW ${D}/${P}/${p.dwell}`, '']],
        obs: [{ title: 'Table 1. Indentation diameters (Brinell microscope, LC 0.01 mm)', cols: ['Indentation', 'd₁ (mm)', 'd₂ (mm)'], rows: ind.map((i, k) => [k + 1, U.f(i.d1, 2), U.f(i.d2, 2)]) }],
        truth: T
      };
    },
    calcs(sim) {
      const T = sim.truth; const a = [{ key: 'd1', label: 'Mean diameter, indentation 1', unit: 'mm', truth: T.ind[0].d, abs: 0.006, hint: '(d₁ + d₂)/2' }, { key: 'hb1', label: 'Brinell hardness, indentation 1', unit: 'HBW', truth: T.HB1, tol: 0.012, hint: '2F/(πD(D − √(D² − d²))), F in kgf' }, { key: 'mean', label: 'Mean Brinell hardness', unit: 'HBW', truth: T.mean, tol: 0.012, hint: 'mean of three' }, { key: 'valid', label: 'Is the test valid (0.24 ≤ d/D ≤ 0.6)?', type: 'select', options: ['Valid', 'Not valid'], truth: T.valid }, { key: 'hm', label: 'Meyer hardness, indentation 1', unit: 'kgf/mm²', truth: T.HM, tol: 0.012, hint: '4F/(πd²)' }, { key: 'tmin', label: 'Minimum specimen thickness (8 × depth)', unit: 'mm', truth: T.tmin, tol: 0.04, hint: 'h = (D − √(D² − d²))/2' }];
      if (T.uts) a.push({ key: 'uts', label: 'Estimated tensile strength', unit: 'MPa', truth: T.uts, tol: 0.015, hint: 'σ_u ≈ 3.45 × HB' });
      return a;
    },
    reference(sim) { const T = sim.truth, M = sim.M; const o = [{ label: 'Brinell hardness', unit: 'HBW', value: T.mean, lo: M.ref[0], hi: M.ref[1], src: 'ASM Vol. 1/2, IS 2062' }, { label: 'd/D ratio', unit: '', value: T.ratio, lo: 0.24, hi: 0.6, src: 'IS 1500 validity' }]; if (T.uts) o.push({ label: 'Estimated UTS', unit: 'MPa', value: T.uts, lo: M.ref[0] * 3.2, hi: M.ref[1] * 3.6, src: 'σ_u ≈ 3.45 HB (steels)' }); return o; },
    sample(sim) { const T = sim.truth, i = T.ind[0]; return `<div class="eq">d = (${U.f(i.d1, 2)} + ${U.f(i.d2, 2)})/2 = ${U.f(i.d, 3)} mm<br>HBW = 2F/[πD(D − √(D² − d²))] = 2 × ${T.P} / [π × ${T.D}(${T.D} − √(${T.D}² − ${U.f(i.d, 3)}²))] = <b>${U.f(i.HB, 1)}</b></div><div class="eq">Mean of three = (${T.ind.map(x => U.f(x.HB, 1)).join(' + ')})/3 = <b>${U.f(T.mean, 1)} HBW</b> (s = ${U.f(T.sd, 2)})<br>d/D = ${U.f(T.ratio, 3)} → ${T.valid}</div><div class="eq">Meyer hardness = 4F/(πd²) = <b>${U.f(T.HM, 1)} kgf/mm²</b>; depth h = ${U.f(i.depth, 3)} mm; min. thickness = 8 h_max = <b>${U.f(T.tmin, 2)} mm</b>${T.uts ? `<br>σ_u ≈ 3.45 × ${U.f(T.mean, 1)} = <b>${U.f(T.uts, 0)} MPa</b>` : ''}</div>`; },
    uncert(sim) { const T = sim.truth, i = T.ind[0]; const ud = 0.01 / Math.sqrt(12) / Math.SQRT2; const D = T.D, d = i.d; const dHB = Math.abs(HB(T.P, D, d + 1e-4) - HB(T.P, D, d)) / 1e-4; return [{ q: 'HBW from one indentation', expr: '|∂HB/∂d| u(d)', val: i.HB, u: dHB * ud, unit: 'HBW' }, { q: 'Mean HBW (type A)', expr: 's/√3', val: T.mean, u: T.sd / Math.sqrt(3), unit: 'HBW' }]; },
    conclude(sim) { const T = sim.truth; return `The Brinell hardness of ${sim.M.name} is ${U.f(T.mean, 0)} HBW ${T.D}/${T.P} (mean of three, s = ${U.f(T.sd, 1)}). The mean d/D of ${U.f(T.ratio, 2)} is ${T.valid === 'Valid' ? 'within' : 'outside'} the 0.24–0.6 range, so the test is ${T.valid === 'Valid' ? 'valid' : 'not valid and must be repeated with a different force–diameter ratio'}.${T.uts ? ` The hardness corresponds to an estimated tensile strength of ${U.f(T.uts, 0)} MPa.` : ''}`; },
    summary: 'In the Brinell test a hard ball of diameter D is pressed into the surface under force F for a set dwell time, and the diameter d of the permanent impression is measured. Brinell hardness is the force divided by the curved surface area of the impression, HBW = 2F/[πD(D − √(D² − d²))] with F in kgf. Because the large ball averages over many grains, the test suits coarse or heterogeneous materials such as castings and forgings. Results are comparable only when the force–diameter ratio F/D² is the same, and only when 0.24D ≤ d ≤ 0.6D.',
    formulas: [['Brinell hardness', 'HBW = 2F / [πD(D − √(D² − d²))]  (F in kgf)'], ['Force selection', 'F = k D²,  k = 30, 10, 5, 2.5, 1'], ['Depth of impression', 'h = (D − √(D² − d²)) / 2'], ['Meyer hardness', 'HM = 4F / (π d²)'], ['Validity window', '0.24 D ≤ d ≤ 0.6 D'], ['Strength estimate (steels)', 'σ_u (MPa) ≈ 3.45 HB']],
    theory: `<h3>Hardness</h3><p>Hardness is the resistance of a material to permanent indentation. It is not a fundamental property, but it correlates well with strength and wear resistance, is fast and almost non-destructive, and is therefore the most widely used test in quality control.</p>
    <h3>The Brinell test</h3><p>J. A. Brinell (1900) pressed a hardened steel ball into the surface and divided the load by the area of the spherical cap left behind. Today tungsten carbide balls are used (symbol HBW) so that the ball does not flatten on hard steels.</p><div class="eq">HBW = 2F / [πD(D − √(D² − d²))]       F in kgf, D and d in mm</div>
    <h3>Geometric similarity and the F/D² rule</h3><p>Indentations made with different balls are geometrically similar only if d/D is the same. Meyer showed that this requires the same value of F/D². IS 1500 therefore specifies force–diameter ratios: 30 for steel and cast iron, 10 for copper alloys and hard aluminium alloys, 5 for soft copper and aluminium, and 2.5 or 1 for bearing metals and lead. The resulting d must lie between 0.24D and 0.6D; a smaller impression is too shallow to measure accurately, while a larger one is affected by the ball’s geometry and by material piled up at the rim.</p>
    <h3>Meyer hardness</h3><p>Meyer proposed dividing the load by the <i>projected</i> area of the impression, HM = 4F/(πd²). This is the mean contact pressure, which is closer to a physical quantity and is roughly 2.8–3 times the flow stress of the material at a representative strain of about 8%.</p>
    <h3>Hardness and strength</h3><p>For steels the empirical relation σ<sub>u</sub> (MPa) ≈ 3.45 HB holds well because both depend on the flow stress after moderate strain. It does not hold for cast irons or for strongly work-hardening alloys. Conversions between scales (ASTM E140) are approximate.</p>
    <h3>Practical requirements</h3><ul><li>Specimen thickness at least 8 times the indentation depth, so no mark shows on the underside.</li><li>Centre of indentation at least 2.5d from the edge and 3d from adjacent indentations.</li><li>Dwell 10–15 s for steels; longer for soft metals that creep under the ball.</li></ul>`,
    procedure: ['Grind or polish a flat area on the specimen and clean it.', 'Select the ball and force from the force–diameter ratio appropriate to the material.', 'Place the specimen on the anvil and raise it until it touches the ball.', 'Apply the full test force smoothly in 2–8 s and hold for the dwell time.', 'Remove the force and lower the specimen.', 'Measure two perpendicular diameters of the impression with the Brinell microscope.', 'Make at least three indentations, spaced at least 3d apart, and calculate HBW for each.'],
    precautions: ['The surface must be flat and free of scale, oil and decarburisation.', 'Apply the load without shock and perpendicular to the surface.', 'Keep minimum spacing and edge distance.', 'Check that the underside of thin specimens shows no bulge.', 'Use the correct dwell time; soft metals continue to creep under load.'],
    applications: ['Acceptance testing of castings, forgings and rolled sections.', 'Checking heat treatment results (annealing, normalising).', 'Estimating tensile strength of steel components in situ.', 'Testing of bearing metals and soft alloys with low force ratios.'],
    errors: ['Reading error of the impression edge, especially with pile-up or sink-in.', 'Ball deformation on hard materials (HBW above 650 is outside the method).', 'Surface preparation and curvature.', 'Incorrect dwell time.', 'Non-uniform material (cast iron) giving scatter between indentations.'],
    discussion: ['Why must the force–diameter ratio be kept constant when comparing Brinell numbers?', 'Explain why an indentation outside 0.24D–0.6D is not valid.', 'Compare HBW and Meyer hardness for your specimen. Which is more physical?', 'Why is Brinell preferred for castings over Rockwell or Vickers?'],
    refs: ['IS 1500 (Part 1):2019, Metallic Materials — Brinell Hardness Test, Part 1: Test Method, BIS.', 'ASTM E10-18, Standard Test Method for Brinell Hardness of Metallic Materials.', 'ISO 6506-1:2014, Metallic Materials — Brinell Hardness Test.', 'ASTM E140-12b(2019), Standard Hardness Conversion Tables for Metals.', 'D. Tabor, The Hardness of Metals, Oxford, 1951.'],
    pre: [
      { q: 'Brinell hardness is the load divided by', o: ['Projected area of impression', 'Curved surface area of impression', 'Depth', 'Ball area'], a: 1, why: 'HB uses the spherical cap area; Meyer uses the projected area.' },
      { q: 'Standard force–diameter ratio for steel is', o: ['1', '5', '10', '30'], a: 3, why: 'F = 30D² kgf, i.e. 3000 kgf with a 10 mm ball.' },
      { q: 'A valid Brinell impression diameter lies between', o: ['0.1D–0.3D', '0.24D–0.6D', '0.5D–0.9D', 'Any value'], a: 1, why: 'IS 1500 / ISO 6506 validity window.' },
      { q: 'Brinell is preferred for grey cast iron because', o: ['It is fastest', 'The large impression averages over the coarse microstructure', 'It needs no load', 'It gives a direct reading'], a: 1, why: 'Graphite flakes would cause scatter in small indentations.' },
      { q: 'Why are tungsten carbide balls used instead of steel balls?', o: ['Cheaper', 'They do not flatten on hard materials', 'Lighter', 'Electrically conductive'], a: 1, why: 'Ball deformation causes error on hard steels.' }
    ],
    post: [
      { q: 'With D = 10 mm, F = 3000 kgf and d = 4.0 mm, HBW is about', o: ['229', '187', '311', '120'], a: 0, why: '2×3000/[π×10×(10 − √84)] = 6000/(π×10×0.835) ≈ 229.' },
      { q: 'If you test copper (HB ≈ 45) with 3000 kgf on a 10 mm ball, the likely result is', o: ['A valid test', 'd > 0.6D, invalid test', 'd < 0.24D', 'Ball fracture'], a: 1, why: 'Soft metal gives a very large impression; use k = 5.' },
      { q: 'A steel shows 200 HB. Its approximate UTS is', o: ['200 MPa', '690 MPa', '400 MPa', '1200 MPa'], a: 1, why: '3.45 × 200 = 690 MPa.' },
      { q: 'The minimum distance between centres of adjacent Brinell indentations is', o: ['1d', '3d', '10d', '0.5D'], a: 1, why: 'Avoids the work-hardened zone of the previous indentation.' },
      { q: 'Meyer hardness is always _____ than HBW for the same impression.', o: ['Lower', 'Higher', 'Equal', 'Unrelated'], a: 1, why: 'Projected area is smaller than the curved area, so the quotient is larger.' }
    ]
  });
})();
