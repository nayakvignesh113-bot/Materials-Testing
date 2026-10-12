(function () {
  const U = LAB.U, G = LAB.G;
  const STEEL = {
    c45: { name: 'C45 (0.45% C) medium-carbon steel', C: 0.45, Ac3: 770, hv: { ann: 170, nor: 215, oq: 470, wq: 640 }, fP: 0.57 },
    c80: { name: 'C80 (0.80% C) eutectoid steel', C: 0.80, Ac3: 740, hv: { ann: 205, nor: 285, oq: 640, wq: 780 }, fP: 1 },
    c20: { name: 'C20 (0.20% C) low-carbon steel', C: 0.20, Ac3: 850, hv: { ann: 125, nor: 150, oq: 230, wq: 410 }, fP: 0.24 }
  };
  const TR = [
    { k: 'ann', name: 'Annealed', proc: 'Full anneal: Ac₃ + 40 °C, 1 h, furnace cool', cool: 'furnace', micro: 'Coarse pearlite (± proeutectoid ferrite)' },
    { k: 'nor', name: 'Normalised', proc: 'Ac₃ + 40 °C, 1 h, still air', cool: 'air', micro: 'Fine pearlite (± proeutectoid ferrite)' },
    { k: 'oq', name: 'Oil quenched', proc: 'Ac₃ + 40 °C, 1 h, oil quench', cool: 'oil', micro: 'Martensite + bainite/fine pearlite' },
    { k: 'wq', name: 'Water quenched', proc: 'Ac₃ + 40 °C, 1 h, water quench', cool: 'water', micro: 'Martensite' },
    { k: 't2', name: 'WQ + tempered 200 °C', proc: 'Water quenched, tempered 200 °C, 1 h', cool: 'temper', Tt: 200, micro: 'Tempered martensite (low)' },
    { k: 't4', name: 'WQ + tempered 400 °C', proc: 'Water quenched, tempered 400 °C, 1 h', cool: 'temper', Tt: 400, micro: 'Tempered martensite (troostite)' },
    { k: 't6', name: 'WQ + tempered 600 °C', proc: 'Water quenched, tempered 600 °C, 1 h', cool: 'temper', Tt: 600, micro: 'Tempered martensite (sorbite)' }
  ];
  const MICROS = [...new Set(TR.map(t => t.micro))];
  const HJ = (TC, th) => (TC + 273.15) * (20 + Math.log10(th)); // Hollomon–Jaffe
  function hvTemper(S, TC) { const wq = S.hv.wq, P0 = HJ(100, 1), P1 = HJ(700, 1); const end = Math.max(S.hv.nor, wq * 0.36); return wq - (wq - end) * (HJ(TC, 1) - P0) / (P1 - P0); }
  function microType(t, S) { if (t.k === 'ann' || t.k === 'nor') return S.fP >= 1 ? 'pearlite' : 'ferrite-pearlite'; if (t.k === 'oq') return 'bainite'; if (t.k === 'wq') return 'martensite'; return 'tempered-martensite'; }
  LAB.register({
    id: 'heattreat', no: 20, cat: 'meta', title: 'Effect of Heat Treatment on Steel', std: 'IS 7360 / ASTM A1033 / Hollomon–Jaffe tempering parameter', short: 'Anneal, normalise, oil and water quench, and temper a carbon steel at three temperatures: hardness, microstructure and the tempering parameter.', tags: 'annealing normalising quenching tempering martensite hardness heat treatment',
    aim: 'To study the effect of annealing, normalising, hardening and tempering on the microstructure and hardness of a plain carbon steel, and to correlate tempered hardness with the Hollomon–Jaffe tempering parameter.',
    objectives: ['Carry out annealing, normalising, oil and water quenching, and tempering at 200, 400 and 600 °C.', 'Measure hardness of each specimen and examine its microstructure.', 'Relate microstructures to cooling rate using the CCT diagram.', 'Calculate the tempering parameter and the slope of hardness against it.'],
    apparatus: ['Muffle furnaces (to 1000 °C) with thermocouples', 'Quench tanks: water (25 °C) and quenching oil (60 °C)', 'Tempering furnace', 'Vickers hardness tester (HV 10)', 'Metallurgical microscope; preparation equipment', 'Seven specimens Ø 20 × 15 mm of the same steel'],
    stdNote: 'Hardening temperature for hypoeutectoid steel = Ac₃ + 30–50 °C; for hypereutectoid = Ac₁ + 30–50 °C.',
    params: [{ id: 'st', label: 'Steel', type: 'select', options: Object.entries(STEEL).map(([k, v]) => [k, v.name]), def: 'c45' }],
    opSteps: ['Heat seven specimens to hardening temperature; soak 1 h', 'Cool one in furnace, one in air', 'Quench one in oil and four in water', 'Temper three quenched specimens at 200, 400, 600 °C', 'Prepare and etch all specimens', 'Measure HV 10 (three readings each)', 'Examine microstructures'],
    svg() {
      return G.svg('0 0 520 240', `${G.r(0, 0, 520, 240, 'bg')}${G.r(20, 40, 130, 120, 'mach', 'rx="6"')}<rect id="glow" x="34" y="54" width="102" height="92" class="bad" opacity=".3"/>${G.t(30, 176, 'Furnace', 'm')}
        ${G.r(190, 110, 70, 60, 'fluid', 'rx="4" opacity=".55"')}${G.t(196, 186, 'Water', 'm')}${G.r(280, 110, 70, 60, 'straw', 'rx="4" opacity=".55"')}${G.t(290, 186, 'Oil', 'm')}${G.r(380, 60, 110, 90, 'mach2', 'rx="6"')}${G.t(386, 176, 'Tempering', 'm')}
        <circle id="sp" cx="85" cy="100" r="9" class="spec"/>${G.t(20, 24, '', 'big', 'id="lab"')}`, 'Heat treatment furnaces and quench tanks');
    },
    anim(svg, f, sim) {
      if (!sim) return; const n = TR.length; const k = Math.min(n - 1, Math.floor(f * n)); const t = f * n - k; const tr = TR[k];
      const dest = { furnace: [85, 100], air: [170, 70], oil: [315, 130], water: [225, 130], temper: [435, 105] }[tr.cool];
      const x = t < .4 ? 85 : 85 + (dest[0] - 85) * U.clamp((t - .4) / .3, 0, 1), y = t < .4 ? 100 : 100 + (dest[1] - 100) * U.clamp((t - .4) / .3, 0, 1);
      G.set(svg, 'sp', 'cx', x); G.set(svg, 'sp', 'cy', y); G.set(svg, 'sp', 'class', t < .5 ? 'bad' : 'spec'); G.set(svg, 'glow', 'opacity', t < .5 ? .9 : .3);
      G.txt(svg, 'lab', `${k + 1}/7 · ${tr.name}`);
    },
    liveView(el, f, sim, p, api) {
      const n = TR.length; const k = Math.min(n - 1, Math.floor(f * n)); const t = f * n - k; const show = f >= 1 ? n - 1 : (t > .75 ? k : k - 1);
      const key = show + '|' + sim.seed; if (el.dataset.key === key) return; el.dataset.key = key;
      if (show < 0) { el.innerHTML = '<p class="muted" style="padding:20px;text-align:center">Microstructures appear as each specimen is completed.</p>'; return; }
      api.title('Microstructure, 500×'); api.sub(TR[show].name);
      const c = sim.microOf(show); el.innerHTML = ''; const cv = G.canvas(560, 400); cv.getContext('2d').drawImage(c, 0, 0); el.appendChild(cv);
    },
    reportFigs(sim) { return [0, 1, 3, 6].map(i => { const c = sim.microOf(i); return { src: c.toDataURL('image/jpeg', .8), cap: `${TR[i].name}: ${TR[i].micro} (500×, 2% Nital)` }; }); },
    simulate(p, r) {
      const S = STEEL[p.st]; const seed = Math.floor(r() * 1e6); const Th = S.Ac3 + 40;
      const hv = TR.map(t => t.Tt ? hvTemper(S, t.Tt) : S.hv[t.k]).map(v => v * (1 + 0.02 * U.gauss(r)));
      const rd = hv.map(v => [0, 1, 2].map(() => U.q(v * (1 + 0.012 * U.gauss(r)), 1)));
      const mean = rd.map(a => U.mean(a)); const tps = TR.filter(t => t.Tt).map(t => HJ(t.Tt, 1)); const tm = mean.slice(4);
      const fit = U.linfit(tps, tm);
      const T = { mean, Th, HJ4: HJ(400, 1), slope: fit.m, drop: (mean[3] - mean[6]) / mean[3] * 100, ratioNA: mean[1] / mean[0] };
      const cache = {};
      // cooling curves for plot
      const tt = U.lin(0, 600, 200); const curves = [['Furnace', 0.006], ['Air', 0.06], ['Oil', 0.5], ['Water', 2.2]].map(([nm, k], i) => ({ name: nm, x: tt, y: tt.map(s => 25 + (Th - 25) * Math.exp(-k * s / (1 + 0.002 * s * (i < 2 ? 0 : 1)))), color: 's' + (i + 1) }));
      return {
        seed, M: { name: S.name }, S, dur: 12,
        microOf(i) { if (!cache[i]) { const t = TR[i]; const ty = microType(t, S); cache[i] = G.micro(ty, { W: 560, H: 400, seed: seed + i, mag: 500, fP: t.k === 'ann' || t.k === 'nor' ? S.fP : 0.5, dg: t.k === 'ann' ? 34 : 18, sp: t.k === 'ann' ? 1.8 : 0.9 }).canvas; G.scaleBar(cache[i], (1150 * 100 / 500) / 560, '500×'); } return cache[i]; },
        readout(f) { const k = Math.min(TR.length - 1, Math.floor(f * TR.length)); return [['Specimen', `${k + 1}/7`, ''], ['Treatment', TR[k].name, ''], ['Hardening temp.', Th, '°C'], ['HV 10 (mean)', f * TR.length - k > .75 || f >= 1 ? U.f(mean[k], 0) : '—', '']]; },
        plot: { title: 'Cooling curves from hardening temperature', xlabel: 'Time (s)', ylabel: 'Centre temperature (°C)', series: curves, hlines: [{ y: 727, label: 'A₁ 727 °C', color: 'muted' }, { y: 300, label: 'approx. Ms', color: 's5' }], reveal: 'all', caption: 'Approximate centre cooling curves of Ø20 mm specimens in each medium' },
        plots: [{ xlabel: 'Treatment', ylabel: 'Hardness (HV 10)', xmin: 0, xmax: 8, series: [{ name: 'HV 10', x: [1, 2, 3, 4, 5, 6, 7], y: mean, type: 'bar', bw: 46, color: 's1' }], caption: '1 Annealed · 2 Normalised · 3 Oil Q · 4 Water Q · 5 T200 · 6 T400 · 7 T600' }, { xlabel: 'Hollomon–Jaffe parameter T(20 + log t)', ylabel: 'Hardness (HV 10)', yzero: false, series: [{ name: 'Tempered', x: tps, y: tm, type: 'linepts', color: 's2' }], caption: 'Tempered hardness against tempering parameter' }],
        specimen: [['Steel', S.name, ''], ['Ac₃ (approx.)', S.Ac3, '°C'], ['Hardening / annealing temperature', Th, '°C'], ['Soak', '1 h', ''], ['Specimen size', 'Ø 20 × 15 mm', ''], ['Tempering time', '1 h', '']],
        obs: [{ title: 'Table 1. Hardness after heat treatment (HV 10)', cols: ['No.', 'Treatment', 'Reading 1', 'Reading 2', 'Reading 3'], textCols: [1], rows: TR.map((t, i) => [i + 1, t.name, ...rd[i]]) }, { title: 'Table 2. Process record', cols: ['No.', 'Process'], textCols: [1], rows: TR.map((t, i) => [i + 1, t.proc.replace('Ac₃ + 40 °C', Th + ' °C')]) }],
        truth: T
      };
    },
    calcs(sim) { const T = sim.truth; return [{ key: 'ha', label: 'Mean hardness, annealed', unit: 'HV', truth: T.mean[0], abs: 2 }, { key: 'hn', label: 'Mean hardness, normalised', unit: 'HV', truth: T.mean[1], abs: 2 }, { key: 'hw', label: 'Mean hardness, water quenched', unit: 'HV', truth: T.mean[3], abs: 2 }, { key: 'hj', label: 'Hollomon–Jaffe parameter for 400 °C, 1 h', unit: '—', truth: T.HJ4, tol: 0.005, hint: 'T(K) × (20 + log t(h))' }, { key: 'sl', label: 'Slope of HV vs tempering parameter', unit: 'HV per unit', truth: T.slope, tol: 0.06, hint: 'least squares through the 3 tempered points' }, { key: 'dr', label: 'Hardness loss on tempering at 600 °C', unit: '%', truth: T.drop, abs: 1, hint: '(HV_WQ − HV_T600)/HV_WQ × 100' }, { key: 'mn', label: 'Microstructure of normalised specimen', type: 'select', options: MICROS, truth: TR[1].micro }, { key: 'mw', label: 'Microstructure of water-quenched specimen', type: 'select', options: MICROS, truth: TR[3].micro }, { key: 'm6', label: 'Microstructure after tempering at 600 °C', type: 'select', options: MICROS, truth: TR[6].micro }]; },
    reference(sim) { const T = sim.truth, S = sim.S; return [{ label: 'As-quenched hardness', unit: 'HV', value: T.mean[3], lo: S.hv.wq * 0.92, hi: S.hv.wq * 1.08, src: 'Martensite at ' + S.C + '% C (Hodge–Orehoski)' }, { label: 'Normalised/annealed ratio', unit: '', value: T.ratioNA, lo: 1.05, hi: 1.5, src: 'Finer pearlite is harder' }]; },
    sample(sim) { const T = sim.truth; return `<div class="eq">Means: ${TR.map((t, i) => `${t.name} = ${U.f(T.mean[i], 1)}`).join('; ')} HV</div><div class="eq">Hollomon–Jaffe: P = T(20 + log t) = (400 + 273.15)(20 + log 1) = <b>${U.f(T.HJ4, 0)}</b><br>Slope of HV vs P (200, 400, 600 °C) = <b>${U.f(T.slope, 4)}</b> HV per unit P</div><div class="eq">Loss on tempering at 600 °C = (${U.f(T.mean[3], 0)} − ${U.f(T.mean[6], 0)})/${U.f(T.mean[3], 0)} × 100 = <b>${U.f(T.drop, 1)}%</b></div>`; },
    uncert(sim) { const T = sim.truth; return [{ q: 'HV (water quenched)', expr: 'type A: s/√3 of three readings', val: T.mean[3], u: T.mean[3] * 0.012 / Math.sqrt(3) * Math.sqrt(3), unit: 'HV' }]; },
    conclude(sim) { const T = sim.truth; return `For ${sim.S.name}, hardness rose from ${U.f(T.mean[0], 0)} HV (annealed, coarse pearlite) and ${U.f(T.mean[1], 0)} HV (normalised, fine pearlite) to ${U.f(T.mean[3], 0)} HV after water quenching (martensite). Oil quenching gave ${U.f(T.mean[2], 0)} HV because the slower cooling allowed some bainite or fine pearlite. Tempering progressively restored toughness at the cost of hardness, which fell linearly with the Hollomon–Jaffe parameter (slope ${U.f(T.slope, 3)} HV per unit) and by ${U.f(T.drop, 0)}% at 600 °C.`; },
    summary: 'Heat treatment changes the microstructure, and therefore the properties, of steel without changing its composition. Steel is austenitised above Ac₃ and then cooled at different rates. Furnace cooling (annealing) gives coarse pearlite and ferrite with low hardness and high ductility; air cooling (normalising) gives finer pearlite and higher strength; quenching in oil or water suppresses diffusional transformations and produces hard, brittle martensite. Tempering the martensite at 150–650 °C precipitates carbides and relieves stress, trading hardness for toughness. The combined effect of tempering temperature and time is described by the Hollomon–Jaffe parameter P = T(C + log t).',
    formulas: [['Hardening temperature (hypoeutectoid)', 'Ac₃ + 30–50 °C'], ['Hollomon–Jaffe parameter', 'P = T(K) [C + log t(h)],  C ≈ 20'], ['Martensite hardness', 'HRC_max = f(C) (Hodge–Orehoski)'], ['Approx. conversion', 'σ_u (MPa) ≈ 3.2 HV (steels)']],
    theory: `<h3>Austenitising</h3><p>Plain carbon steel is heated into the austenite field (above Ac₃ for hypoeutectoid steels) so that all carbon dissolves in FCC iron. Too low a temperature leaves ferrite undissolved; too high coarsens the austenite grains and increases distortion and cracking risk.</p>
    <h3>Cooling rate decides the product</h3><ul><li><b>Annealing</b> (furnace cooling, ~0.01–0.05 °C/s): austenite transforms close to A₁ to coarse lamellar pearlite plus pro-eutectoid ferrite; softest condition, best machinability and ductility.</li><li><b>Normalising</b> (still air, ~1 °C/s): transformation at lower temperature gives finer pearlite and finer ferrite grains; higher strength and toughness than annealed.</li><li><b>Hardening</b> (oil ~20–60 °C/s, water ~100+ °C/s at the centre of small sections): if the cooling curve misses the nose of the CCT diagram, austenite transforms by shear below M<sub>s</sub> to martensite, a supersaturated BCT phase. Oil quenching of plain carbon steel often crosses the pearlite/bainite nose, so the structure is mixed.</li></ul>
    <h3>Tempering</h3><p>As-quenched martensite is hard but brittle and contains residual stresses. Reheating below A₁ allows carbon to precipitate: ε-carbide at 100–250 °C (small hardness loss, stress relief), decomposition of retained austenite at 200–300 °C, and cementite at 250–650 °C with recovery of the ferrite matrix (troostite, then sorbite). Hardness falls continuously and toughness rises. Temperature and time act together:</p><div class="eq">P = T (20 + log t)      T in K, t in hours</div><p>so 1 h at 600 °C is roughly equivalent to 10 h at 560 °C. Some alloy steels show temper embrittlement around 250–400 °C or 450–550 °C.</p>`,
    procedure: ['Mark seven specimens; heat all to the hardening temperature and soak 1 hour.', 'Leave specimen 1 in the switched-off furnace (anneal); remove specimen 2 to cool in still air (normalise).', 'Quench specimen 3 in oil and specimens 4–7 in water with vigorous agitation.', 'Temper specimens 5, 6 and 7 at 200, 400 and 600 °C for 1 hour; cool in air.', 'Grind off 0.5 mm to remove decarburised scale; take three HV 10 readings on each.', 'Prepare, etch in 2% Nital and examine microstructures.', 'Tabulate hardness and microstructure against treatment.'],
    precautions: ['Use tongs, face shield and heat-resistant gloves; keep the oil tank lid ready in case of fire.', 'Agitate specimens during quenching to break the vapour blanket.', 'Remove the decarburised surface before hardness testing.', 'Temper quenched specimens promptly to avoid delayed cracking.'],
    applications: ['Annealing before machining or cold forming.', 'Normalising forgings and weldments to refine grain.', 'Hardening and tempering of shafts, gears, springs and tools.', 'Designing tempering schedules using the Hollomon–Jaffe parameter.'],
    errors: ['Decarburisation reducing surface hardness.', 'Transfer delays before quenching.', 'Specimen size effects on actual cooling rate.', 'Furnace temperature non-uniformity.', 'Measurement scatter on mixed microstructures.'],
    discussion: ['Explain why the normalised specimen is harder than the annealed one.', 'Why did oil quenching give lower hardness than water quenching for this steel?', 'What changes in the microstructure during tempering at 200, 400 and 600 °C?', 'Using the Hollomon–Jaffe parameter, what tempering time at 550 °C gives the same hardness as 1 h at 600 °C?'],
    refs: ['IS 7360:1974, Code of Practice for Heat Treatment of Steel, BIS.', 'ASTM A1033-18, Standard Practice for Quantitative Measurement and Reporting of Hypoeutectoid Carbon and Low-Alloy Steel Phase Transformations.', 'J. H. Hollomon, L. D. Jaffe, Trans. AIME 162 (1945) 223–249.', 'G. Krauss, Steels: Processing, Structure, and Performance, 2nd ed., ASM International, 2015.', 'ASM Handbook Vol. 4, Heat Treating, ASM International, 1991.'],
    pre: [
      { q: 'Normalising involves cooling from the austenite region in', o: ['Furnace', 'Still air', 'Water', 'Oil'], a: 1, why: 'Air cooling.' },
      { q: 'The hardest constituent in quenched steel is', o: ['Ferrite', 'Pearlite', 'Martensite', 'Austenite'], a: 2, why: 'Supersaturated BCT structure.' },
      { q: 'Tempering is done to', o: ['Increase hardness', 'Reduce brittleness and relieve stress', 'Increase carbon', 'Refine grains above Ac₃'], a: 1, why: 'Trades hardness for toughness.' },
      { q: 'Hardening temperature for a hypoeutectoid steel is', o: ['Below A₁', 'Ac₃ + 30–50 °C', 'Melting point', '200 °C'], a: 1, why: 'Fully austenitic with fine grain.' },
      { q: 'Annealing generally gives', o: ['Maximum hardness', 'Maximum softness and ductility', 'Martensite', 'Bainite'], a: 1, why: 'Coarse pearlite + ferrite.' }
    ],
    post: [
      { q: 'The Hollomon–Jaffe parameter for 1 h at 500 °C is about', o: ['10 000', '15 460', '20 000', '773'], a: 1, why: '773 × (20 + 0) = 15 460.' },
      { q: 'Your oil-quenched C45 was softer than the water-quenched one because', o: ['Oil adds carbon', 'Cooling was slow enough to cross the pearlite/bainite nose', 'Oil tempers martensite', 'Grain size increased'], a: 1, why: 'Plain carbon steel has low hardenability.' },
      { q: 'Tempering at 600 °C produces', o: ['Fresh martensite', 'Tempered martensite with spheroidised cementite (sorbite)', 'Austenite', 'Coarse pearlite'], a: 1, why: 'Cementite precipitates and coarsens in recovered ferrite.' },
      { q: 'Water quenching high-carbon steel risks', o: ['Decarburisation', 'Quench cracking', 'Grain refinement', 'Softening'], a: 1, why: 'Severe thermal and transformation stresses.' },
      { q: 'Equivalent tempering: 1 h at 600 °C (873 K) equals what time at 550 °C (823 K)? (C = 20)', o: ['About 1 h', 'About 15 h', 'About 0.1 h', 'Never'], a: 1, why: '873 × 20 = 823(20 + log t) → log t = 1.21 → t ≈ 16 h.' }
    ]
  });
})();
