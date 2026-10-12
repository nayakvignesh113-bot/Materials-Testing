(function () {
  const U = LAB.U, G = LAB.G;
  const GRIT = { P220: 68, P320: 46.2, P400: 35, P600: 25.8, P800: 21.8, P1200: 15.3, P2500: 8.4 };
  const SEQ = { full: ['P220', 'P400', 'P600', 'P800', 'P1200'], skip: ['P220', 'P600', 'P1200'], coarse: ['P220', 'P400'] };
  const POL = { dia: [['6 µm diamond on napless cloth', 6, 4], ['1 µm diamond on napped cloth', 1, 3]], alu: [['1 µm alumina on napped cloth', 1, 4], ['0.05 µm colloidal alumina', 0.05, 3]], none: [] };
  const MAT = {
    ms: { name: 'Low-carbon steel (0.2% C), normalised', micro: 'ferrite-pearlite', fP: 0.26, etch: 'nital', win: [5, 15], mount: 'any' },
    c45: { name: 'Medium-carbon steel C45, normalised', micro: 'ferrite-pearlite', fP: 0.57, etch: 'nital', win: [5, 15], mount: 'any' },
    al: { name: 'Al–Si casting alloy LM6', micro: 'al-si', etch: 'keller', win: [8, 20], mount: 'cold' },
    br: { name: 'α-Brass CuZn30, annealed', micro: 'alpha-brass', etch: 'fecl3', win: [3, 10], mount: 'any' },
    ci: { name: 'Grey cast iron FG 200', micro: 'grey-ci', etch: 'nital', win: [3, 10], mount: 'any' }
  };
  const ETCH = { nital: '2% Nital (2 mL HNO₃ in 98 mL ethanol)', keller: 'Keller’s reagent (HF–HCl–HNO₃ in water)', fecl3: 'Alcoholic ferric chloride (5 g FeCl₃, 15 mL HCl, 100 mL ethanol)', picral: '4% Picral' };
  const ETCHN = { nital: '2% Nital', keller: 'Keller’s reagent', fecl3: 'Alcoholic ferric chloride', picral: '4% Picral' };
  const COND = ['Scratch-free and properly etched', 'Residual scratches visible', 'Under-etched (faint structure)', 'Over-etched (dark, stained)', 'Not etched / attacked (wrong etchant)'];
  LAB.register({
    id: 'specprep', no: 16, cat: 'meta', title: 'Metallographic Specimen Preparation', std: 'ASTM E3-11(2017) / ASTM E407-23 (etchants) / IS 7739', short: 'Sectioning, mounting, graded grinding, polishing and etching: see how skipped grits, missing polish and wrong etchant or time ruin a specimen.', tags: 'grinding polishing etching nital keller mounting metallography',
    aim: 'To prepare a metallographic specimen by sectioning, mounting, grinding, polishing and etching, and to evaluate how each preparation variable affects the quality of the surface for microscopic examination.',
    objectives: ['Follow the standard sequence of metallographic preparation for a given material.', 'Select abrasives, polishing media and etchant correctly.', 'Recognise preparation artefacts: scratches, deformed layers, under- and over-etching.', 'Record a complete preparation log.'],
    apparatus: ['Abrasive cut-off machine with coolant', 'Hot mounting press (bakelite, 150–180 °C) and cold-mount epoxy kit', 'Belt grinder; SiC papers P220–P2500 on rotating wheels with water', 'Polishing wheels with napless and napped cloths; diamond suspensions 6 and 1 µm; alumina 1 and 0.05 µm', 'Etchants (Nital, Keller’s, ferric chloride), tongs, alcohol, hot-air dryer', 'Inverted metallurgical microscope'],
    stdNote: 'ASTM E3 covers preparation; ASTM E407 lists etchants for each alloy system.',
    params: [
      { id: 'mat', label: 'Material', type: 'select', options: Object.entries(MAT).map(([k, v]) => [k, v.name]), def: 'ms' },
      { id: 'mount', label: 'Mounting', type: 'select', options: [['hot', 'Hot compression mount (bakelite, 170 °C)'], ['cold', 'Cold mount (epoxy, room temperature)'], ['none', 'Unmounted']], def: 'hot' },
      { id: 'seq', label: 'Grinding sequence (SiC, water)', type: 'select', options: [['full', 'P220 → P400 → P600 → P800 → P1200'], ['skip', 'P220 → P600 → P1200 (skipped grits)'], ['coarse', 'P220 → P400 only']], def: 'full' },
      { id: 'pol', label: 'Polishing', type: 'select', options: [['dia', '6 µm then 1 µm diamond'], ['alu', '1 µm then 0.05 µm alumina'], ['none', 'No polishing']], def: 'dia' },
      { id: 'etch', label: 'Etchant', type: 'select', options: Object.entries(ETCHN), def: 'nital' },
      { id: 'et', label: 'Etching time', type: 'select', options: [['2', '2 s'], ['5', '5 s'], ['10', '10 s'], ['20', '20 s'], ['60', '60 s']], def: '10' }
    ],
    opSteps: ['Section with abrasive cut-off (coolant on)', 'Mount the specimen', 'Grind on successive SiC papers, rotating 90° each step', 'Polish (rough then final)', 'Clean with alcohol, dry', 'Etch by immersion/swabbing; rinse; dry', 'Examine under the microscope'],
    svg(p) {
      return G.svg('0 0 520 240', `${G.r(0, 0, 520, 240, 'bg')}${G.r(40, 150, 440, 60, 'mach', 'rx="6"')}<ellipse cx="260" cy="150" rx="150" ry="28" class="mach2"/><ellipse id="wheel" cx="260" cy="146" rx="140" ry="24" class="surf"/>
        <g id="spec">${G.r(236, 80, 48, 60, p.mount === 'none' ? 'spec' : 'ink', 'rx="6"')}${p.mount !== 'none' ? G.r(248, 128, 24, 12, 'spec') : ''}</g>
        <g id="hand">${G.r(220, 56, 80, 26, 'mach', 'rx="10"')}</g>
        ${G.t(20, 24, '', 'big', 'id="lab"')}${G.t(20, 42, '', 'm', 'id="sub"')}`, 'Grinding and polishing wheel');
    },
    anim(svg, f, sim) {
      if (!sim) return; const st = sim.stageAt(f); const w = svg.querySelector('#wheel'); if (w) w.setAttribute('class', st.kind === 'pol' ? 'acc' : st.kind === 'grind' ? 'mut' : st.kind === 'etch' ? 'straw' : 'surf');
      G.set(svg, 'spec', 'transform', `translate(${Math.sin(f * 60) * (st.kind === 'grind' || st.kind === 'pol' ? 30 : 0)},${st.kind === 'etch' ? -30 : 0})`); G.set(svg, 'hand', 'transform', `translate(${Math.sin(f * 60) * (st.kind === 'grind' || st.kind === 'pol' ? 30 : 0)},0)`);
      G.txt(svg, 'lab', st.name); G.txt(svg, 'sub', st.detail);
    },
    liveView(el, f, sim, p, api) {
      const i = sim.stageIdx(f); const key = i + '|' + sim.seed; if (el.dataset.key === key) return; el.dataset.key = key;
      const st = sim.stages[i]; api.title('Surface under the microscope'); api.sub(`after: ${st.name}`);
      const c = G.canvas(560, 400); const g = c.getContext('2d');
      if (st.kind === 'cut' || st.kind === 'mount') { G.fill(c, (k, x, y) => 120 + 50 * Math.sin(x * 0.08 + Math.sin(y * 0.05) * 3) * Math.sin(y * .02) + 25 * Math.random(), 'optical'); }
      else {
        const etched = st.kind === 'etch' ? sim.etchLevel : 0;
        const micro = sim.microCanvas(); const md = micro.getContext('2d').getImageData(0, 0, 560, 400).data;
        G.fill(c, (k, x, y) => { const base = 225; const m = md[k * 4]; let v = base + (m - base) * Math.min(1, etched); if (etched > 1) v = v - (etched - 1) * 60 - (m < 120 ? (etched - 1) * 40 : 0); if (st.deformed) v -= 8; return U.clamp(v, 15, 245); }, 'optical');
        const sc = st.scratch; if (sc) { const r = U.rng(sim.seed + i * 13); g.lineCap = 'round'; const ang = st.angle; for (let q = 0; q < sc.n; q++) { const x = r() * 700 - 70, y = r() * 540 - 70; const L = 200 + r() * 400; g.strokeStyle = `rgba(${r() < .5 ? '40,38,34' : '255,255,250'},${sc.a * (0.4 + r() * 0.6)})`; g.lineWidth = sc.w * (0.5 + r()); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ang) * L, y + Math.sin(ang) * L); g.stroke(); } }
        if (st.kind === 'etch' && sim.wrong) { const r = U.rng(sim.seed + 77); for (let q = 0; q < 900; q++) { g.fillStyle = `rgba(60,45,30,${0.25 + 0.4 * r()})`; g.beginPath(); g.arc(r() * 560, r() * 400, 1 + r() * 3, 0, 7); g.fill(); } }
      }
      G.scaleBar(c, sim.umpx, '200×'); el.innerHTML = ''; el.appendChild(c);
    },
    simulate(p, r) {
      const M = MAT[p.mat]; const seed = Math.floor(r() * 1e6); const et = p.et;
      const stages = [{ kind: 'cut', name: 'Sectioned', medium: 'Al₂O₃ cut-off wheel, coolant', time: 3, lube: 'Coolant', load: '—', detail: 'abrasive cut-off', obs: 'Burr-free cut, no burning (heat tint absent)' }];
      if (p.mount !== 'none') stages.push({ kind: 'mount', name: p.mount === 'hot' ? 'Hot mounted' : 'Cold mounted', medium: p.mount === 'hot' ? 'Phenolic (bakelite), 170 °C, 29 MPa' : 'Epoxy resin, 25 °C', time: p.mount === 'hot' ? 8 : 480, lube: '—', load: '—', detail: p.mount === 'hot' ? 'bakelite 170 °C' : 'epoxy, 8 h cure', obs: M.mount === 'cold' && p.mount === 'hot' ? 'Mount OK, but heat may age Al alloy; cold mounting preferred' : 'Mount sound, specimen flush with surface' });
      const seq = SEQ[p.seq]; seq.forEach((gName, k) => { const prev = k ? GRIT[seq[k - 1]] : 200; const jump = prev / GRIT[gName]; stages.push({ kind: 'grind', name: `Ground ${gName}`, medium: `SiC paper ${gName} (${GRIT[gName]} µm)`, time: 1, lube: 'Water', load: 25, detail: `${GRIT[gName]} µm SiC, turned 90°`, scratch: { n: Math.round(GRIT[gName] * 6), w: GRIT[gName] / 18, a: 0.75 }, angle: (k % 2) * Math.PI / 2 + 0.2, jump, deformed: true, obs: jump > 1.8 && k ? 'Coarse scratches from the previous step still visible' : 'Uniform scratches in one direction; previous scratches removed' }); });
      const lastG = GRIT[seq[seq.length - 1]];
      POL[p.pol].forEach(([nm, size, t], k) => stages.push({ kind: 'pol', name: `Polished ${size} µm`, medium: nm, time: t, lube: size < 1 ? 'Water' : 'Diamond extender', load: 15, detail: nm, scratch: { n: Math.round(size * 25 + (p.seq === 'full' ? 0 : 40)), w: Math.max(0.4, size / 4), a: 0.35 }, angle: 0.8, deformed: false, obs: k === POL[p.pol].length - 1 ? 'Mirror-like surface' : 'Grinding scratches removed' }));
      // residual deep scratches if grits skipped or coarse finish or no polish
      const residual = p.seq !== 'full' || p.pol === 'none';
      if (residual) { const L = stages[stages.length - 1]; L.scratch = { n: p.pol === 'none' ? Math.round(lastG * 5) : 30, w: p.pol === 'none' ? lastG / 20 : 2.2, a: 0.7 }; L.obs = p.pol === 'none' ? 'Surface still shows grinding scratches' : 'Deep isolated scratches from skipped grits remain after polishing'; }
      const wrong = p.etch !== M.etch && !(p.etch === 'picral' && (M.etch === 'nital'));
      const effT = p.etch === 'picral' && M.etch === 'nital' ? et * 0.5 : et; // picral slower
      let etchLevel = wrong ? 0.25 : U.clamp(effT / ((M.win[0] + M.win[1]) / 2), 0.15, 3);
      stages.push({ kind: 'etch', name: `Etched ${ETCHN[p.etch]} ${et} s`, medium: ETCH[p.etch], time: et / 60, lube: 'Rinse: water, alcohol; hot-air dry', load: '—', detail: `${et} s immersion`, scratch: stages[stages.length - 1].scratch && residual ? stages[stages.length - 1].scratch : null, angle: stages[stages.length - 1].angle || 0, deformed: false, obs: '' });
      let cond; if (residual) cond = COND[1]; else if (wrong) cond = COND[4]; else if (effT < M.win[0]) cond = COND[2]; else if (effT > M.win[1]) cond = COND[3]; else cond = COND[0];
      stages[stages.length - 1].obs = cond;
      const umpx = (1150 * 100 / 200) / 560; let microC = null;
      const microCanvas = () => { if (!microC) microC = G.micro(M.micro, { W: 560, H: 400, seed, mag: 200, fP: M.fP, dg: M.micro === 'al-si' ? 40 : 28 }).canvas; return microC; };
      const totalT = stages.reduce((a, s) => a + (s.kind === 'mount' && p.mount === 'cold' ? 0 : s.time), 0);
      const nG = seq.length; const bounds = stages.map((s, i) => (i + 1) / stages.length);
      const T = { etch: ETCHN[M.etch], cond, lastG, nG, totalT };
      return {
        stages, seed, umpx, etchLevel, wrong, microCanvas, dur: Math.max(8, stages.length * 1.3), M,
        stageIdx(f) { return Math.min(stages.length - 1, Math.floor(f * stages.length)); },
        stageAt(f) { return stages[this.stageIdx(f)]; },
        readout(f) { const s = this.stageAt(f); return [['Stage', `${this.stageIdx(f) + 1}/${stages.length}`, ''], ['Operation', s.name, ''], ['Medium', s.medium.split('(')[0], ''], ['Load', s.load, s.load === '—' ? '' : 'N']]; },
        specimen: [['Material', M.name, ''], ['Mounting', p.mount, ''], ['Grinding', seq.join(' → '), ''], ['Polishing', p.pol === 'none' ? 'None' : POL[p.pol].map(x => x[0]).join(' → '), ''], ['Etchant', ETCH[p.etch], ''], ['Etching time', et, 's'], ['Wheel speed', '300 rpm grinding / 150 rpm polishing', '']],
        obs: [{ title: 'Table 1. Preparation log', cols: ['Step', 'Operation', 'Abrasive / medium', 'Time (min)', 'Lubricant', 'Load (N)', 'Observation'], textCols: [1, 2, 4, 6], rows: stages.map((s, i) => [i + 1, s.name, s.medium, s.kind === 'mount' && p.mount === 'cold' ? '480 (cure, not counted)' : U.f(s.time, s.time < 1 ? 2 : 0), s.lube, s.load, s.obs]) }],
        truth: T, bounds
      };
    },
    calcs(sim) { const T = sim.truth; return [{ key: 'etch', label: 'Recommended etchant for this material (ASTM E407)', type: 'select', options: Object.values(ETCHN), truth: T.etch }, { key: 'cond', label: 'Surface condition achieved', type: 'select', options: COND, truth: T.cond }, { key: 'lastg', label: 'Abrasive particle size of the final grinding paper', unit: 'µm', truth: T.lastG, tol: 0.02, hint: 'FEPA P-grade table' }, { key: 'ng', label: 'Number of grinding steps used', unit: '—', truth: T.nG, abs: 0 }, { key: 'tt', label: 'Total machine time (excluding cold-mount cure)', unit: 'min', truth: T.totalT, tol: 0.03, hint: 'sum of Table 1' }]; },
    reference(sim) { const T = sim.truth; return [{ label: 'Final abrasive before polishing', unit: 'µm', value: T.lastG, lo: 8, hi: 16, src: 'ASTM E3: finish at P1200 or finer' }]; },
    sample(sim) { const T = sim.truth; return `<div class="eq">Final grinding grit: ${sim.stages.filter(s => s.kind === 'grind').slice(-1)[0].medium} → <b>${T.lastG} µm</b>; grinding steps = <b>${T.nG}</b>; total machine time = <b>${U.f(T.totalT, 2)} min</b></div><div class="eq">Recommended etchant: <b>${T.etch}</b>. Condition achieved: <b>${T.cond}</b></div>`; },
    uncert() { return []; },
    conclude(sim) { const T = sim.truth; return `The ${sim.M.name.toLowerCase()} specimen was prepared through ${sim.stages.length} steps. The surface condition achieved was: ${T.cond.toLowerCase()}. ${T.cond === COND[0] ? 'Each grinding step removed the damage of the previous one, polishing produced a deformation-free mirror surface, and the correct etchant and time revealed the microstructure clearly.' : 'The defect can be traced to the preparation choice recorded in the log; repeat from the step where it was introduced.'}`; },
    summary: 'Metallographic preparation produces a flat, scratch-free, deformation-free surface that represents the true microstructure. Each grinding step with finer SiC abrasive must remove the scratches and the deformed layer from the previous step; skipping grades leaves deep scratches that polishing cannot remove in reasonable time. Polishing with diamond or alumina gives a mirror finish. Etching then attacks the surface selectively—grain boundaries, phases and orientations dissolve at different rates—so the microstructure becomes visible under reflected light. The etchant must suit the alloy, and the time must be controlled: too short leaves faint contrast, too long darkens and stains the surface.',
    formulas: [['FEPA P-grade median sizes', 'P220 68 µm · P400 35 · P600 25.8 · P800 21.8 · P1200 15.3 · P2500 8.4'], ['Rule of thumb', 'Each step: abrasive size ≈ ½–⅔ of previous; grind until previous scratches vanish'], ['Deformed layer depth', '≈ 2–3 × abrasive particle size'], ['Nital etching (steel)', '2% HNO₃ in ethanol, 5–15 s'], ['Keller’s (Al)', '2.5 mL HNO₃, 1.5 mL HCl, 1 mL HF, 95 mL H₂O, 10–20 s']],
    theory: `<h3>Why preparation matters</h3><p>A microscope sees only the top few micrometres of a specimen. Every cutting or abrasive step deforms the surface and leaves scratches; if the damage is not removed, it hides or imitates microstructural features. Preparation is therefore a controlled sequence where each step removes the damage of the previous one.</p>
    <h3>Sectioning and mounting</h3><p>Specimens are cut with an abrasive wheel under flooding coolant to avoid heating, which could temper martensite or recrystallise cold-worked metal. Small or irregular specimens are mounted in resin: hot compression mounting (phenolic, 150–180 °C, about 30 MPa) is fast and gives good edge retention; cold mounting in epoxy avoids heat for heat-sensitive alloys such as age-hardened aluminium.</p>
    <h3>Grinding</h3><p>Silicon carbide papers from P220 to P1200 (or P2500) are used wet. At each step the specimen is rotated 90°, so it is easy to see when the scratches of the previous step have gone. Skipping grades means that the next paper must remove a much deeper damaged layer and isolated deep scratches usually survive into the polished surface.</p>
    <h3>Polishing</h3><p>Diamond suspensions (6 µm, 1 µm) on cloths, or alumina (1 µm, 0.05 µm colloidal), remove the remaining fine scratches and the thin deformed layer. A properly polished specimen shows no scratches at 100× and only inclusions, pores and graphite are visible before etching.</p>
    <h3>Etching</h3><p>Etchants are dilute acids or salts that dissolve the surface at rates that depend on phase, composition and crystal orientation. Grain boundaries, being high-energy regions, are attacked faster and appear as dark lines. In steels, 2% Nital attacks ferrite grain boundaries and the ferrite–cementite interfaces in pearlite; Keller’s reagent outlines Al grains and colours intermetallics; alcoholic ferric chloride reveals copper alloy grains and twins. ASTM E407 lists hundreds of etchants by alloy.</p>
    <h3>Common artefacts</h3><ul><li><b>Scratches</b>: from skipped grades or contaminated cloths.</li><li><b>Smearing and deformed layer</b>: soft metals (Al, Cu) need light loads and longer final polishing.</li><li><b>Pull-out</b>: graphite or inclusions torn out, leaving holes.</li><li><b>Under-etching</b>: faint boundaries. <b>Over-etching</b>: dark, stained surface, widened boundaries, pitting.</li><li><b>Staining</b>: water or etchant left on the surface; rinse in alcohol and dry quickly with hot air.</li></ul>`,
    procedure: ['Cut a specimen about 15 mm square with the abrasive cut-off machine using coolant.', 'Mount it in bakelite (hot) or epoxy (cold) so that the surface to be examined is flush.', 'Grind on SiC papers P220 → P400 → P600 → P800 → P1200 under running water, about 1 minute each, rotating 90° between papers.', 'Wash; polish with 6 µm and then 1 µm diamond (or alumina) on cloths until scratch-free.', 'Wash with water, then alcohol; dry with hot air.', 'Etch by immersion or swabbing for the prescribed time; rinse immediately in water, then alcohol; dry.', 'Examine under the microscope at 100× and higher magnification.'],
    precautions: ['Wear gloves, goggles and use the fume hood for etchants; Keller’s reagent contains HF — use plastic containers and calcium gluconate must be available.', 'Never mix used papers or cloths between grades; one coarse particle ruins the next step.', 'Use light, even pressure; heavy pressure deepens the deformed layer.', 'Do not touch the polished face.', 'Neutralise and dispose of etchants as per lab rules.'],
    applications: ['Quality control of heat treatment, welding and casting.', 'Failure analysis.', 'Grain size and inclusion rating (ASTM E112, E45).', 'Preparation for hardness traverses, SEM and EBSD.'],
    errors: ['Insufficient time on a grade, leaving previous scratches.', 'Contamination carried between steps.', 'Heat during cutting altering the structure.', 'Wrong etchant or time.', 'Water stains and drying marks.'],
    discussion: ['Why must each grinding grade remove all the scratches of the previous one?', 'Explain the appearance of your specimen and trace any defect to its cause.', 'Why is cold mounting preferred for age-hardened aluminium?', 'Why do grain boundaries appear dark after etching?'],
    refs: ['ASTM E3-11(2017), Standard Guide for Preparation of Metallographic Specimens.', 'ASTM E407-23, Standard Practice for Microetching Metals and Alloys.', 'G. F. Vander Voort, Metallography: Principles and Practice, ASM International, 1999.', 'Struers, Metalog Guide, 2020.', 'IS 7739 (Parts 1–5), Code of Practice for Preparation of Metallographic Specimens, BIS.'],
    pre: [
      { q: 'Grinding papers are used in the order', o: ['Fine to coarse', 'Coarse to fine', 'Any order', 'Only the finest'], a: 1, why: 'Each step removes damage of the previous one.' },
      { q: 'The specimen is rotated 90° between grinding papers to', o: ['Save paper', 'See when previous scratches are removed', 'Cool it', 'Balance the wheel'], a: 1, why: 'New scratches are perpendicular to old ones.' },
      { q: 'The usual etchant for carbon steel is', o: ['Keller’s reagent', '2% Nital', 'Ferric chloride', 'Water'], a: 1, why: 'Nitric acid in ethanol.' },
      { q: 'Why is coolant used during sectioning?', o: ['To clean', 'To avoid heating that alters the microstructure', 'To lubricate the motor', 'To etch'], a: 1, why: 'Heat can temper or recrystallise the surface.' },
      { q: 'Grain boundaries appear dark after etching because', o: ['They contain carbon', 'They are attacked faster and scatter light', 'They are magnetic', 'They are raised'], a: 1, why: 'Higher energy sites dissolve faster, forming grooves.' }
    ],
    post: [
      { q: 'Isolated deep scratches remain after polishing. The most likely cause is', o: ['Over-etching', 'Skipped grinding grades', 'Wrong etchant', 'Hot mounting'], a: 1, why: 'Polishing cannot remove deep damage efficiently.' },
      { q: 'A steel specimen etched for 60 s in 2% Nital appears dark and stained. It is', o: ['Under-etched', 'Over-etched', 'Unetched', 'Perfect'], a: 1, why: 'Excessive attack.' },
      { q: 'P1200 SiC paper has an average particle size of about', o: ['68 µm', '35 µm', '15 µm', '1 µm'], a: 2, why: 'FEPA P1200 ≈ 15.3 µm.' },
      { q: 'An aluminium alloy etched in Nital shows no structure. The fix is to', o: ['Etch longer in Nital', 'Use Keller’s reagent', 'Re-grind with P220', 'Hot-mount it'], a: 1, why: 'Each alloy system needs its own etchant.' },
      { q: 'Holes left where graphite flakes were in cast iron are called', o: ['Porosity', 'Pull-out', 'Comet tails', 'Relief'], a: 1, why: 'Soft or brittle phases are torn out during grinding.' }
    ]
  });
})();
