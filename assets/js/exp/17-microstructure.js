(function () {
  const U = LAB.U, G = LAB.G;
  const SP = {
    s02: { name: 'Low-carbon steel, 0.2% C, annealed', type: 'ferrite-pearlite', C: 0.20, cons: 'Ferrite (light) + pearlite (dark)', etch: '2% Nital', fp: 1 },
    s45: { name: 'Medium-carbon steel, 0.45% C, normalised', type: 'ferrite-pearlite', C: 0.45, cons: 'Ferrite (light) + pearlite (dark)', etch: '2% Nital', fp: 1 },
    s80: { name: 'Eutectoid steel, 0.8% C, annealed', type: 'pearlite', C: 0.8, cons: 'Pearlite (lamellar ferrite + cementite)', etch: '2% Nital' },
    s12: { name: 'Hypereutectoid steel, 1.2% C, annealed', type: 'pearlite-cementite', C: 1.2, cons: 'Pearlite + proeutectoid cementite network', etch: '2% Nital' },
    mar: { name: 'Medium-carbon steel, water quenched', type: 'martensite', cons: 'Martensite (acicular/lath)', etch: '2% Nital' },
    gci: { name: 'Grey cast iron', type: 'grey-ci', cons: 'Graphite flakes in pearlitic matrix', etch: '2% Nital' },
    sgi: { name: 'Spheroidal graphite (ductile) iron', type: 'sg-iron', cons: 'Graphite nodules with ferrite rims in pearlite (bull’s-eye)', etch: '2% Nital' },
    wci: { name: 'White cast iron', type: 'white-ci', cons: 'Pearlite (dark) in cementite/ledeburite (white)', etch: '2% Nital' },
    mci: { name: 'Malleable cast iron (ferritic)', type: 'malleable', cons: 'Temper-carbon rosettes in ferrite', etch: '2% Nital' },
    alsi: { name: 'Al–12% Si casting alloy (LM6)', type: 'al-si', cons: 'Primary α-Al dendrites + Al–Si eutectic (needle Si)', etch: '0.5% HF' },
    ab: { name: 'α-Brass (70/30), annealed', type: 'alpha-brass', cons: 'Single-phase α grains with annealing twins', etch: 'Alcoholic FeCl₃' },
    abb: { name: 'α–β Brass (60/40, Muntz metal)', type: 'alpha-beta-brass', cons: 'α (light) + β′ (dark) two-phase', etch: 'Alcoholic FeCl₃' },
    cu: { name: 'Pure copper, annealed', type: 'copper', cons: 'Single-phase α grains with annealing twins', etch: 'Alcoholic FeCl₃' }
  };
  const CONS = [...new Set(Object.values(SP).map(s => s.cons))];
  const NAMES = Object.values(SP).map(s => s.name);
  const NX = 8, NY = 6; // point grid
  function micro(sim) { if (!sim._m) { const sp = sim.sp; const fP = sp.fp ? (sp.C - 0.022) / (0.77 - 0.022) : 0.5; sim._m = G.micro(sp.type, { W: 640, H: 480, seed: sim.seed, mag: sim.mag, fP, dg: sp.type === 'ferrite-pearlite' ? 32 : sp.type === 'copper' || sp.type === 'alpha-brass' ? 60 : 30, ferrite: sp.type === 'malleable' ? 1.7 : undefined, halo: sp.type === 'malleable' ? 0 : undefined }); G.scaleBar(sim._m.canvas, sim._m.info.umpx, sim.mag + '×'); } return sim._m; }
  LAB.register({
    id: 'microstructure', no: 17, cat: 'meta', title: 'Microstructure Identification', std: 'ASTM E3 / E407 / E562 (point count) / ISO 945-1 (graphite)', short: 'Identify phases in steels, cast irons, Al–Si and brasses under the optical microscope; manual point count to estimate pearlite fraction and carbon content.', tags: 'microscope ferrite pearlite martensite graphite brass phases point count lever rule',
    aim: 'To examine prepared specimens of ferrous and non-ferrous alloys under the metallurgical microscope, identify the phases and constituents, and estimate the volume fraction of pearlite and the carbon content of a plain carbon steel by systematic manual point counting.',
    objectives: ['Operate a reflected-light metallurgical microscope at 100–500×.', 'Identify phases and constituents and relate them to the equilibrium diagram.', 'Estimate pearlite fraction by ASTM E562 point counting and compare with the lever rule.', 'Recognise graphite morphologies in cast irons (ISO 945-1).'],
    apparatus: ['Inverted metallurgical microscope, objectives 10×, 20×, 50×; eyepiece 10× with reticle', 'Digital camera and image software', 'Set of prepared and etched specimens', '64-point grid overlay (ASTM E562)'],
    stdNote: 'ASTM E562: volume fraction from systematic point count, V_V = P_P.',
    params: [
      { id: 'sp', label: 'Specimen', type: 'select', options: Object.entries(SP).map(([k, v]) => [k, 'Specimen ' + k.toUpperCase()]), def: 's45', hint: 'Specimens are coded so that you identify them yourself.' },
      { id: 'mag', label: 'Magnification', type: 'select', options: [['100', '100×'], ['200', '200×'], ['500', '500×']], def: '200' }
    ],
    opSteps: ['Place specimen on stage, polished face down', 'Select 10× objective; switch on illumination', 'Coarse then fine focus', 'Adjust aperture and field diaphragms (Köhler)', 'Scan the specimen; choose representative field', 'Change magnification for detail', 'Capture image with scale bar'],
    svg(p) {
      return G.svg('0 0 520 280', `${G.r(0, 0, 520, 280, 'bg')}${G.r(110, 220, 300, 30, 'mach', 'rx="4"')}${G.r(140, 60, 40, 160, 'mach')}${G.r(140, 50, 240, 40, 'mach', 'rx="6"')}
        ${G.r(330, 20, 22, 40, 'mach2', 'rx="3"')}${G.r(300, 120, 140, 14, 'steelD')}<g id="obj">${G.r(355, 136, 20, 24, 'ink', 'rx="2"')}</g>${G.r(330, 92, 70, 26, 'mach2')}
        <circle cx="160" cy="160" r="14" class="mach2"/><circle id="knob" cx="160" cy="160" r="6" class="straw"/>
        <rect id="lamp" x="420" y="130" width="40" height="30" rx="4" class="straw" opacity=".2"/>
        ${G.t(20, 24, '', 'big', 'id="lab"')}`, 'Inverted metallurgical microscope');
    },
    anim(svg, f, sim) { if (!sim) return; G.set(svg, 'lamp', 'opacity', f > .15 ? .9 : .2); G.set(svg, 'knob', 'transform', `rotate(${f * 720} 160 160)`); G.txt(svg, 'lab', f < .15 ? 'Illumination on' : f < .6 ? 'Focusing…' : f < .85 ? 'Köhler adjustment' : `In focus · ${sim.mag}×`); },
    liveView(el, f, sim, p, api) {
      api.title('Field of view'); api.sub(`${sim.mag}× · ${sim.sp.etch} etch`); const m = micro(sim);
      let c = el.querySelector('canvas'); if (!c || c._sim !== sim) { el.innerHTML = ''; c = G.canvas(640, 480); c._sim = sim; el.appendChild(c); c.getContext('2d').drawImage(m.canvas, 0, 0); }
      const blur = f < 0.6 ? 8 * (1 - f / 0.6) : 0; c.style.filter = blur > 0.2 ? `blur(${blur}px) brightness(${0.4 + 0.6 * Math.min(1, f / 0.15)})` : 'none';
    },
    expExtra(el, sim, p, S) {
      const m = micro(sim); const c = G.canvas(640, 480); c.getContext('2d').drawImage(m.canvas, 0, 0);
      const pts = G.pointGrid(640, 480, NX, NY); if (sim.sp.fp) G.drawGrid(c, pts, '#ff2d2d');
      el.innerHTML = `<div class="panel"><div class="panel-h"><h4>Micrograph${sim.sp.fp ? ' with 48-point test grid' : ''}</h4><span class="eyebrow">${sim.mag}× · etched</span></div><div class="figure"></div><p class="muted" style="font-size:.84rem;margin-top:8px">${sim.sp.fp ? 'Count the grid points (red crosses) that fall on pearlite (dark, lamellar). A point exactly on a boundary counts ½. Then P_P = count / 48.' : 'Identify the constituents. Compare with reference micrographs in the Theory stage.'}</p></div>`;
      el.querySelector('.figure').appendChild(c); c.style.maxWidth = '100%'; c.style.height = 'auto';
    },
    reportFigs(sim) { const m = micro(sim); const c = G.canvas(640, 480); c.getContext('2d').drawImage(m.canvas, 0, 0); if (sim.sp.fp) G.drawGrid(c, G.pointGrid(640, 480, NX, NY), '#ff2d2d'); return [{ src: c.toDataURL('image/jpeg', 0.85), cap: `Micrograph of specimen ${sim.code}, ${sim.mag}×, ${sim.sp.etch}` }]; },
    simulate(p, r) {
      const sp = SP[p.sp]; const seed = Math.floor(r() * 1e6); const sim = { sp, seed, mag: p.mag, code: p.sp.toUpperCase(), dur: 6, M: { name: sp.name } };
      const T = { name: sp.name, cons: sp.cons };
      if (sp.fp) {
        // point count truth from generated phase map (computed lazily but deterministically)
        const m = (typeof document !== 'undefined' && document.createElement) ? micro(sim) : null;
        if (m && m.phase && m.phase.length === 640 * 480) { const pts = G.pointGrid(640, 480, NX, NY); let n = 0; pts.forEach(([x, y]) => { const k = y * 640 + x; const ph = m.phase[k]; const nb = [m.phase[k + 1], m.phase[k - 1], m.phase[k + 640], m.phase[k - 640]]; const onB = nb.some(v => v !== ph); n += ph === 1 ? (onB ? 0.5 : 1) : (onB && nb.includes(1) ? 0.5 : 0); }); T.count = n; } else T.count = Math.round(48 * (sp.C - 0.022) / 0.748);
        T.Pp = T.count / 48 * 100; T.Cest = 0.022 + 0.748 * T.Pp / 100; T.lever = (sp.C - 0.022) / (0.77 - 0.022) * 100;
      }
      sim.truth = T;
      sim.readout = f => [['Objective', sim.mag / 10 + '×', ''], ['Total magnification', sim.mag + '×', ''], ['Focus', f < .6 ? 'adjusting' : 'sharp', ''], ['Specimen', sim.code, '']];
      sim.specimen = [['Specimen code', sim.code, ''], ['Magnification', sim.mag + '×', ''], ['Etchant', sp.etch, ''], ['Illumination', 'Bright field, Köhler', ''], ...(sp.fp ? [['Nominal composition (from mill certificate)', `${sp.C}% C (verify by point count)`, '']] : [])];
      sim.obs = [{ title: 'Table 1. Microscope record', cols: ['Item', 'Record'], textCols: [0, 1], rows: [['Specimen code', sim.code], ['Etchant', sp.etch], ['Magnification', sim.mag + '×'], ['Field width', U.f(1150 * 100 / sim.mag, 0) + ' µm'], ['Grid', sp.fp ? `${NX} × ${NY} = 48 points` : 'not used']] }];
      return sim;
    },
    calcs(sim) { const T = sim.truth; const a = [{ key: 'name', label: 'Identify the material', type: 'select', options: NAMES, truth: T.name }, { key: 'cons', label: 'Constituents observed', type: 'select', options: CONS, truth: T.cons }];
      if (sim.sp.fp) a.push({ key: 'count', label: 'Points on pearlite (out of 48)', unit: 'points', truth: T.count, abs: 3, hint: 'boundary points count ½' }, { key: 'pp', label: 'Pearlite volume fraction P_P', unit: '%', truth: T.Pp, abs: 6.5, hint: 'count/48 × 100' }, { key: 'c', label: 'Estimated carbon content', unit: 'wt% C', truth: T.Cest, abs: 0.05, hint: 'C ≈ 0.022 + 0.748 × P_P' }, { key: 'lev', label: 'Pearlite fraction by lever rule (nominal C)', unit: '%', truth: T.lever, tol: 0.02, hint: '(C − 0.022)/(0.77 − 0.022) × 100' });
      return a; },
    reference(sim) { const T = sim.truth; return sim.sp.fp ? [{ label: 'Pearlite fraction (point count)', unit: '%', value: T.Pp, lo: T.lever - 10, hi: T.lever + 10, src: 'Lever rule, nominal C' }, { label: 'Carbon estimate', unit: 'wt%', value: T.Cest, lo: sim.sp.C - 0.07, hi: sim.sp.C + 0.07, src: 'Mill certificate' }] : []; },
    sample(sim) { const T = sim.truth; return sim.sp.fp ? `<div class="eq">P_P = ${U.f(T.count, 1)}/48 = <b>${U.f(T.Pp, 1)}%</b> pearlite<br>C ≈ 0.022 + 0.748 × ${U.f(T.Pp / 100, 3)} = <b>${U.f(T.Cest, 3)} wt%</b></div><div class="eq">Lever rule at ${sim.sp.C}% C: f_P = (${sim.sp.C} − 0.022)/(0.77 − 0.022) = <b>${U.f(T.lever, 1)}%</b></div>` : `<p>Identification: <b>${T.name}</b> — ${T.cons}.</p>`; },
    uncert(sim) { const T = sim.truth; if (!sim.sp.fp) return []; const P = T.Pp / 100; return [{ q: 'Pearlite fraction (one field)', expr: 'binomial: √[P(1−P)/n], n = 48', val: T.Pp, u: Math.sqrt(P * (1 - P) / 48) * 100, unit: '%' }, { q: 'Carbon estimate', expr: '0.748 × u(P_P)', val: T.Cest, u: 0.748 * Math.sqrt(P * (1 - P) / 48), unit: 'wt%' }]; },
    conclude(sim) { const T = sim.truth; return `Specimen ${sim.code} is ${T.name.toLowerCase()}. Its microstructure consists of ${T.cons.toLowerCase()}.${sim.sp.fp ? ` Point counting on one field gave ${U.f(T.Pp, 0)}% pearlite, corresponding to about ${U.f(T.Cest, 2)}% C, compared with ${U.f(T.lever, 0)}% pearlite expected from the lever rule for ${sim.sp.C}% C. More fields (ASTM E562 recommends at least 10) would reduce the statistical uncertainty.` : ''}`; },
    summary: 'The microstructure of an alloy, revealed by etching and viewed under reflected light, shows the phases present, their amounts, sizes, shapes and distribution. In plain carbon steels slowly cooled from austenite, the Fe–Fe₃C diagram predicts ferrite plus pearlite below 0.77% C, pearlite at 0.77% C, and pearlite with a cementite network above it; the amount of pearlite follows the lever rule, so a point count estimates carbon content. Rapid quenching produces martensite. In cast irons the form of carbon (graphite flakes, nodules, temper-carbon rosettes or cementite) controls properties. Non-ferrous examples include Al–Si eutectic, single-phase α-brass with annealing twins and two-phase α–β brass.',
    formulas: [['Lever rule (pearlite, hypoeutectoid)', 'f_P = (C − 0.022)/(0.77 − 0.022)'], ['Carbon from point count', 'C ≈ 0.022 + 0.748 P_P'], ['Point fraction = volume fraction', 'V_V = P_P = P_α / P_T  (ASTM E562)'], ['Lever rule (pro-eutectoid Fe₃C)', 'f_Fe₃C = (C − 0.77)/(6.67 − 0.77)'], ['Total magnification', 'M = M_objective × M_eyepiece']],
    theory: `<h3>The metallurgical microscope</h3><p>Metals are opaque, so they are examined by reflected light. Light passes through the objective onto the polished and etched surface; flat areas reflect it back into the objective and appear bright, while etched grain boundaries and rough phases scatter it and appear dark. Köhler illumination gives an even field; the aperture diaphragm controls contrast and depth of field. Useful magnification is limited by resolution (about 0.2 µm), so optical metallography works from 50× to about 1000×.</p>
    <h3>Steels</h3><ul><li><b>Ferrite (α)</b>: BCC iron with ≤ 0.022% C; appears as light grains with dark boundaries after Nital.</li><li><b>Pearlite</b>: eutectoid mixture of ferrite and cementite (Fe₃C) lamellae formed from austenite at 727 °C; dark at low magnification, resolved as lamellae at high magnification.</li><li><b>Hypoeutectoid</b> steels (&lt; 0.77% C): pro-eutectoid ferrite + pearlite. The pearlite fraction rises linearly with carbon (lever rule).</li><li><b>Hypereutectoid</b> steels (&gt; 0.77% C): pearlite surrounded by a white pro-eutectoid cementite network along prior austenite grain boundaries.</li><li><b>Martensite</b>: supersaturated BCT phase from rapid quenching; needle- or lath-like.</li></ul>
    <h3>Cast irons</h3><p>Grey iron contains graphite flakes (ISO 945 form I), which act as notches and give low ductility but excellent damping and machinability. Ductile (SG) iron has graphite nodules (form VI) from Mg treatment, often with a ferrite rim (bull’s-eye) in pearlite, and is strong and ductile. White iron contains no graphite; carbon is in cementite and ledeburite, so it is hard and brittle. Malleable iron is white iron annealed so that carbon forms irregular temper-carbon rosettes (form IV) in a ferrite matrix.</p>
    <h3>Non-ferrous alloys</h3><p>Al–12% Si (LM6) is near-eutectic: α-Al dendrites with an Al–Si eutectic in which Si forms dark needles (modification with Na or Sr makes them fibrous). 70/30 brass is single-phase α (FCC) and shows straight-sided annealing twins; 60/40 brass contains α and the harder, hot-workable β′ phase.</p>
    <h3>Quantitative metallography</h3><p>The volume fraction of a phase equals its area fraction, line fraction and point fraction (Delesse, Rosiwal and Glagolev principles). ASTM E562 places a grid of points over the image and counts points falling on the phase: V<sub>V</sub> = P<sub>P</sub>. The statistical uncertainty of one field is √[P(1−P)/n], so many fields are counted in practice.</p>`,
    procedure: ['Place the specimen on the stage with the polished face towards the objective.', 'Select the lowest-power objective and focus with the coarse, then fine, control.', 'Adjust the field diaphragm and aperture diaphragm for even, contrasty illumination.', 'Scan the specimen to find representative areas; avoid edges and scratches.', 'Change to higher magnification to resolve detail (pearlite lamellae, twins).', 'Sketch or capture the microstructure with a scale bar; label phases.', 'For steels, superimpose the 48-point grid and count points on pearlite.'],
    precautions: ['Never let the objective touch the specimen; focus away from the specimen when using high-power objectives.', 'Handle specimens by edges; fingerprints spoil the etched surface.', 'Turn down lamp intensity before switching off.', 'Choose grid placement without looking at the structure (systematic, not selective).'],
    applications: ['Quality control of heat treatment and castings.', 'Failure analysis.', 'Estimating composition (carbon) and checking material grade.', 'Research on processing–structure–property relations.'],
    errors: ['Choosing non-representative fields.', 'Under- or over-etching altering apparent phase fractions.', 'Counting bias at boundaries.', 'Too few points or fields (statistical error).', 'Decarburised surface layers.'],
    discussion: ['Relate the constituents you observed to the Fe–Fe₃C or relevant phase diagram.', 'Compare your point-count pearlite fraction with the lever rule; explain the difference.', 'Why is SG iron more ductile than grey iron of similar matrix?', 'How would the microstructure of your steel change after water quenching?'],
    refs: ['ASTM E562-19, Standard Test Method for Determining Volume Fraction by Systematic Manual Point Count.', 'ISO 945-1:2019, Microstructure of Cast Irons — Graphite Classification by Visual Analysis.', 'ASM Handbook Vol. 9, Metallography and Microstructures, ASM International, 2004.', 'W. D. Callister, D. G. Rethwisch, Materials Science and Engineering, Wiley, Ch. 9.', 'S. H. Avner, Introduction to Physical Metallurgy, 2nd ed., McGraw-Hill.'],
    pre: [
      { q: 'Pearlite is a mixture of', o: ['Ferrite and austenite', 'Ferrite and cementite', 'Martensite and ferrite', 'Graphite and ferrite'], a: 1, why: 'Lamellar eutectoid product.' },
      { q: 'A steel with 0.8% C slowly cooled is', o: ['Fully ferritic', 'Fully pearlitic', 'Ferrite + pearlite', 'Martensitic'], a: 1, why: 'Eutectoid composition (≈ 0.77% C).' },
      { q: 'Metals are examined under the microscope using', o: ['Transmitted light', 'Reflected light', 'X-rays', 'Polarised transmitted light only'], a: 1, why: 'They are opaque.' },
      { q: 'Graphite in SG iron is', o: ['Flakes', 'Nodules (spheroids)', 'Rosettes', 'Absent'], a: 1, why: 'Mg or Ce treatment spheroidises graphite.' },
      { q: 'Annealing twins with straight boundaries are typical of', o: ['BCC ferrite', 'FCC copper and α-brass', 'Graphite', 'Cementite'], a: 1, why: 'Low stacking fault energy FCC metals.' }
    ],
    post: [
      { q: 'A hypoeutectoid steel shows 50% pearlite. Its carbon content is about', o: ['0.2%', '0.4%', '0.6%', '0.8%'], a: 1, why: '0.022 + 0.748 × 0.5 ≈ 0.40%.' },
      { q: 'The white network around pearlite colonies in a 1.2% C steel is', o: ['Ferrite', 'Proeutectoid cementite', 'Graphite', 'Martensite'], a: 1, why: 'Hypereutectoid steels reject Fe₃C to grain boundaries.' },
      { q: 'With 48 points and P_P = 0.4, the standard error of one field is about', o: ['1%', '7%', '20%', '40%'], a: 1, why: '√(0.4 × 0.6/48) = 0.071.' },
      { q: 'Why is white cast iron hard and brittle?', o: ['Graphite flakes', 'Large amount of cementite', 'Ferrite matrix', 'Twins'], a: 1, why: 'Carbon is present as Fe₃C.' },
      { q: 'Dark needles in Al–Si alloy are', o: ['α-Al', 'Eutectic silicon', 'Copper', 'Oxide'], a: 1, why: 'Unmodified eutectic Si plates appear acicular.' }
    ]
  });
})();
