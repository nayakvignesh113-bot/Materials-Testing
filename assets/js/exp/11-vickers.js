(function () {
  const U = LAB.U, G = LAB.G;
  const MAT = {
    ms: { name: 'Mild steel (IS 2062 E250)', HV: 140, ise: 6, ref: [125, 160] },
    hard: { name: 'Hardened steel EN31', HV: 720, ise: 30, ref: [680, 780] },
    br: { name: 'Brass CuZn37, half hard', HV: 125, ise: 5, ref: [110, 145] },
    al: { name: 'Aluminium alloy 6061-T6', HV: 107, ise: 5, ref: [95, 120] },
    cu: { name: 'Copper, annealed', HV: 52, ise: 3, ref: [42, 62] }
  };
  const LOADS = [0.5, 1, 5, 10, 30];
  LAB.register({
    id: 'vickers', no: 11, cat: 'hard', title: 'Vickers and Microhardness Test', std: 'IS 1501 (Part 1):2020 / ASTM E384 / ISO 6507-1; ISO 2639 (case depth)', short: 'Diamond-pyramid hardness over a load series (indentation size effect) or a microhardness traverse to find effective case depth of a carburised part.', tags: 'HV microhardness case depth ISE pyramid diagonal',
    aim: 'To determine the Vickers hardness of metals, examine whether hardness is independent of test load (indentation size effect), and determine the effective case depth of a case-carburised steel by a microhardness traverse.',
    objectives: ['Measure indentation diagonals and calculate HV for several loads.', 'Determine Meyer’s index and assess load independence.', 'Construct a hardness–depth profile across a hardened case.', 'Determine the effective case depth at 550 HV (ISO 2639).'],
    apparatus: ['Vickers hardness tester (1–30 kgf) and microhardness tester (0.01–1 kgf)', 'Square-based diamond pyramid indenter, face angle 136°', 'Measuring microscope with filar eyepiece, resolution 0.5 µm', 'Polished and etched specimens; cross-sectioned carburised specimen'],
    stdNote: 'HV = 1.8544 F/d² (F in kgf, d in mm). Indentation spacing ≥ 3d; specimen thickness ≥ 1.5d.',
    params: [
      { id: 'mode', label: 'Test', type: 'select', options: [['loads', 'Load series on one material'], ['trav', 'Microhardness traverse (carburised 16MnCr5)']], def: 'loads' },
      { id: 'mat', label: 'Material (load series)', type: 'select', options: Object.entries(MAT).map(([k, v]) => [k, v.name]), def: 'ms' },
      { id: 'cd', label: 'Carburised case (traverse)', type: 'select', options: [['0.6', 'Shallow case'], ['0.9', 'Medium case'], ['1.3', 'Deep case']], def: '0.9', hint: 'The actual case depth is what you will measure.' }
    ],
    opSteps: ['Polish specimen (and etch for traverse)', 'Select load; focus on area to test', 'Apply load (dwell 10–15 s)', 'Measure both diagonals with filar eyepiece', 'Move to next position / next load', 'Repeat for all positions', 'Compute HV and plot'],
    svg(p) {
      return G.svg('0 0 520 280', `${G.r(0, 0, 520, 280, 'bg')}${G.r(110, 20, 260, 50, 'mach', 'rx="6"')}${G.r(130, 70, 30, 170, 'mach')}${G.r(90, 235, 300, 25, 'mach', 'rx="3"')}
        <g id="tur">${G.r(240, 70, 50, 26, 'mach2', 'rx="4"')}${G.r(250, 96, 10, 34, 'steelD')}${G.r(272, 96, 12, 24, 'steel')}<path d="M251 130 L259 130 L255 138 Z" class="acc"/></g>
        ${G.r(205, 150, 120, 16, 'spec', 'id="spV"')}${G.r(230, 166, 70, 30, 'mach2')}${G.r(258, 196, 14, 40, 'steel')}
        <g transform="translate(340,80)">${G.r(0, 0, 160, 84, 'disp', 'rx="4"')}${G.t(10, 18, 'LOAD kgf', 'm', 'style="fill:var(--panel-ink);font-size:8px"')}${G.t(10, 40, '—', 'big', 'id="dL"')}${G.t(90, 18, 'HV', 'm', 'style="fill:var(--panel-ink);font-size:8px"')}${G.t(90, 40, '—', 'big', 'id="dH"')}${G.t(10, 68, '', 'm', 'id="lab" style="fill:var(--panel-ink)"')}</g>`, 'Vickers hardness tester');
    },
    anim(svg, f, sim) {
      if (!sim) return; const n = sim.list.length; const k = Math.min(n - 1, Math.floor(f * n)); const t = f * n - k; const s = sim.list[k];
      G.set(svg, 'tur', 'transform', `translate(0,${t > .2 && t < .7 ? 10 : 0})`); G.txt(svg, 'dL', s.F); G.txt(svg, 'dH', t > .75 ? U.f(s.HV, 0) : '—'); G.txt(svg, 'lab', `${sim.trav ? 'Position' : 'Load'} ${k + 1}/${n} · ${t < .2 ? 'focus' : t < .7 ? 'dwell' : 'measure d₁, d₂'}`);
    },
    liveView(el, f, sim, p, api) {
      const n = sim.list.length; const k = Math.min(n - 1, Math.floor(f * n)); const t = f * n - k; const show = f >= 1 ? n - 1 : (t > .72 ? k : k - 1);
      const key = (sim.trav ? 'T' + Math.max(show, 0) : show) + '|' + sim.seed; if (el.dataset.key === key) return; el.dataset.key = key;
      if (sim.trav) {
        api.title('Cross-section with indentation row'); api.sub('etched, 200×');
        const c = G.canvas(600, 300); const fov = 2.2; const px = 600 / fov; const nzz = G.noise(sim.seed);
        G.fill(c, (i, x, y) => { const dmm = (y - 20) / px; if (y < 20) return 30; const hv = sim.prof(dmm); const fr = U.clamp((hv - 380) / 380, 0, 1); return U.clamp(200 - 120 * fr + 30 * (nzz(x * .06, y * .06, 3) - .5), 40, 235); }, 'optical');
        const g = c.getContext('2d'); sim.list.slice(0, Math.max(0, show + 1)).forEach((s, i) => { const x = 40 + i * 26, y = 20 + s.x * px; const a = s.d * px / 2 * 3; g.fillStyle = 'rgb(40,38,34)'; g.beginPath(); g.moveTo(x - a, y); g.lineTo(x, y - a); g.lineTo(x + a, y); g.lineTo(x, y + a); g.fill(); });
        g.fillStyle = '#fff'; g.font = '11px "IBM Plex Mono",monospace'; g.fillText('surface', 8, 14); g.fillText('indentations drawn ×3 for visibility', 330, 290); el.innerHTML = ''; el.appendChild(c); return;
      }
      api.title('Microscope view'); api.sub('filar eyepiece');
      if (show < 0) { el.innerHTML = '<p class="muted" style="padding:20px;text-align:center">The impression appears after the load is removed.</p>'; return; }
      const s = sim.list[show]; const c = G.canvas(560, 380); G.indentView(c, { kind: 'pyramid', d1: s.d1 / 1000, d2: s.d2 / 1000, fov: s.d * 2.4, seed: sim.seed + show, label: `HV ${s.F} · d₁ ${U.f(s.d1, 1)} µm` }); el.innerHTML = ''; el.appendChild(c);
    },
    simulate(p, r) {
      const seed = Math.floor(r() * 1e6);
      if (p.mode === 'trav') {
        const cd = p.cd * (1 + 0.05 * U.gauss(r)); const surf = 760 + 20 * U.gauss(r), core = 390 + 15 * U.gauss(r); const w = cd * 0.32;
        const erfc = x => { const t = 1 / (1 + 0.5 * Math.abs(x)); const y = t * Math.exp(-x * x - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))))); return x >= 0 ? y : 2 - y; };
        const x50 = cd + w * 0.0; const prof = x => core + (surf - core) * 0.5 * erfc((x - x50) / w) - (x < 0.06 ? 25 * (1 - x / 0.06) : 0);
        // solve case depth position where profile = 550 is ≈ cd by construction; adjust x50 so that prof(cd)=550
        const ratio = (550 - core) / (surf - core); const z = U.bisect(z => 0.5 * erfc(z) - ratio, -3, 3); const x50b = cd - z * w; const prof2 = x => core + (surf - core) * 0.5 * erfc((x - x50b) / w) - (x < 0.06 ? 25 * (1 - x / 0.06) : 0);
        const xs = []; for (let x = 0.1; x <= Math.min(2.0, cd * 2.2) + 1e-9; x += 0.1) xs.push(+x.toFixed(2));
        const F = 0.5; const list = xs.map(x => { const hv = prof2(x) * (1 + 0.012 * U.gauss(r)); const d = Math.sqrt(1.8544 * F / hv) * 1000; const d1 = U.q(d * (1 + 0.005 * U.gauss(r)), 0.5), d2 = U.q(d * (1 + 0.005 * U.gauss(r)), 0.5); const dm = (d1 + d2) / 2; return { x, F, d1, d2, d: dm / 1000, HV: 1.8544 * F / Math.pow(dm / 1000, 2) }; });
        const HVs = list.map(s => s.HV); const ecd = U.inv(xs, HVs, 550);
        const T = { trav: true, list, ecd, surf: list[0].HV, core: U.mean(HVs.slice(-3)), HV1: list[0].HV, gradient: (list[1].HV - list[Math.min(list.length - 1, Math.round(ecd / 0.1))].HV) / (ecd - 0.2) };
        return {
          trav: true, list, seed, prof: prof2, dur: 10, M: { name: 'Case-carburised 16MnCr5 (cross-section)' },
          readout(f) { const k = Math.min(list.length - 1, Math.floor(f * list.length)); return [['Position', `${U.f(list[k].x, 2)} mm`, ''], ['Load', 'HV 0.5', ''], ['d₁ / d₂', `${U.f(list[k].d1, 1)} / ${U.f(list[k].d2, 1)}`, 'µm'], ['HV', U.f(list[k].HV, 0), '']]; },
          plot: { title: 'Hardness–depth profile', xlabel: 'Distance from surface (mm)', ylabel: 'Hardness (HV 0.5)', yzero: false, series: [{ name: 'HV 0.5 traverse', x: xs, y: HVs, type: 'linepts', color: 's1' }], hlines: [{ y: 550, label: '550 HV limit (ISO 2639)', color: 's5' }], caption: 'Microhardness traverse across the carburised case' },
          specimen: [['Material', 'Case-carburised 16MnCr5, quenched and tempered at 180 °C', ''], ['Test', 'Microhardness HV 0.5 (4.903 N)', ''], ['Traverse step', 0.1, 'mm'], ['Dwell', 15, 's'], ['Limit hardness for ECD', 550, 'HV']],
          obs: [{ title: 'Table 1. Microhardness traverse', cols: ['Distance x (mm)', 'd₁ (µm)', 'd₂ (µm)'], rows: list.map(s => [U.f(s.x, 2), U.f(s.d1, 1), U.f(s.d2, 1)]) }],
          truth: T
        };
      }
      const M = MAT[p.mat]; const HV0 = M.HV * (1 + 0.02 * U.gauss(r));
      const list = LOADS.map(F => { const hvL = HV0 * (1 + M.ise / HV0 * 3 / Math.sqrt(F)); const d = Math.sqrt(1.8544 * F / hvL) * 1000; const res = d < 100 ? 0.5 : 1; const d1 = U.q(d * (1 + 0.004 * U.gauss(r)), res), d2 = U.q(d * (1 + 0.004 * U.gauss(r)), res); const dm = (d1 + d2) / 2; return { F, d1, d2, d: dm / 1000, HV: 1.8544 * F / Math.pow(dm / 1000, 2) }; });
      const fit = U.linfit(list.map(s => Math.log10(s.d)), list.map(s => Math.log10(s.F)));
      const T = { list, HV10: list[3].HV, HV30: list[4].HV, HV05: list[0].HV, bulk: (list[3].HV + list[4].HV) / 2, n: fit.m, ise: (list[0].HV - (list[3].HV + list[4].HV) / 2) / ((list[3].HV + list[4].HV) / 2) * 100 };
      return {
        trav: false, list, seed, M, dur: 9,
        readout(f) { const k = Math.min(list.length - 1, Math.floor(f * list.length)); return [['Load', 'HV ' + list[k].F, ''], ['d₁ / d₂', `${U.f(list[k].d1, 1)} / ${U.f(list[k].d2, 1)}`, 'µm'], ['HV', U.f(list[k].HV, 0), '']]; },
        plot: { title: 'Hardness against load', xlabel: 'Test force F (kgf)', ylabel: 'Vickers hardness HV', xlog: true, xmin: 0.1, xmax: 100, yzero: false, series: [{ name: 'HV', x: LOADS, y: list.map(s => s.HV), type: 'linepts', color: 's1' }], caption: 'Vickers hardness against test force showing the indentation size effect' },
        plots: [{ xlabel: 'Mean diagonal d (mm)', ylabel: 'Test force F (kgf)', xlog: true, ylog: true, series: [{ name: `Meyer plot, n = ${U.f(fit.m, 3)}`, x: list.map(s => s.d), y: LOADS, type: 'linepts', color: 's2' }], caption: 'Meyer plot (log F against log d)' }],
        specimen: [['Material', M.name, ''], ['Indenter', 'Diamond pyramid, 136°', ''], ['Loads', LOADS.join(', '), 'kgf'], ['Dwell', 15, 's'], ['Surface', 'Polished 1 µm', '']],
        obs: [{ title: 'Table 1. Diagonal measurements', cols: ['Load F (kgf)', 'd₁ (µm)', 'd₂ (µm)'], rows: list.map(s => [s.F, U.f(s.d1, 1), U.f(s.d2, 1)]) }],
        truth: T
      };
    },
    calcs(sim) {
      const T = sim.truth;
      if (T.trav) return [{ key: 'hv1', label: 'Hardness at 0.1 mm (surface)', unit: 'HV', truth: T.HV1, tol: 0.012, hint: '1.8544 F/d², d = mean diagonal in mm' }, { key: 'core', label: 'Core hardness (mean of last three)', unit: 'HV', truth: T.core, tol: 0.015, hint: 'mean' }, { key: 'ecd', label: 'Effective case depth at 550 HV', unit: 'mm', truth: T.ecd, abs: 0.03, hint: 'interpolate distance where HV = 550' }];
      return [{ key: 'hv10', label: 'HV 10', unit: 'HV', truth: T.HV10, tol: 0.012, hint: '1.8544 × 10 / d²' }, { key: 'hv30', label: 'HV 30', unit: 'HV', truth: T.HV30, tol: 0.012, hint: '1.8544 × 30 / d²' }, { key: 'hv05', label: 'HV 0.5', unit: 'HV', truth: T.HV05, tol: 0.015, hint: '1.8544 × 0.5 / d²' }, { key: 'bulk', label: 'Macro (bulk) hardness, mean of HV10 and HV30', unit: 'HV', truth: T.bulk, tol: 0.012, hint: 'mean' }, { key: 'ise', label: 'Indentation size effect at 0.5 kgf', unit: '%', truth: T.ise, abs: 1.2, hint: '(HV0.5 − bulk)/bulk × 100' }, { key: 'n', label: 'Meyer index n', unit: '—', truth: T.n, abs: 0.02, hint: 'slope of log F vs log d' }];
    },
    reference(sim) { const T = sim.truth; if (T.trav) return [{ label: 'Surface hardness', unit: 'HV', value: T.HV1, lo: 680, hi: 820, src: 'Carburised + tempered 180 °C (58–63 HRC)' }, { label: 'Core hardness', unit: 'HV', value: T.core, lo: 330, hi: 450, src: '16MnCr5 core' }]; return [{ label: 'Bulk hardness', unit: 'HV', value: T.bulk, lo: sim.M.ref[0], hi: sim.M.ref[1], src: 'ASM / material standard' }, { label: 'Meyer index', unit: '', value: T.n, lo: 1.9, hi: 2.05, src: 'n ≈ 2 if load independent' }]; },
    sample(sim) { const T = sim.truth; if (T.trav) { const s = T.list[0]; return `<div class="eq">x = 0.1 mm: d = (${U.f(s.d1, 1)} + ${U.f(s.d2, 1)})/2 = ${U.f(s.d * 1000, 2)} µm = ${U.f(s.d, 5)} mm<br>HV = 1.8544 × 0.5 / ${U.f(s.d, 5)}² = <b>${U.f(s.HV, 0)}</b></div><div class="eq">Effective case depth: HV falls through 550 between the bracketing readings; linear interpolation gives <b>ECD = ${U.f(T.ecd, 2)} mm</b> (ISO 2639: CHD 550 HV 1 = ${U.f(T.ecd, 2)} mm)</div>`; }
      const s = T.list[3]; return `<div class="eq">HV 10: d = (${U.f(s.d1, 1)} + ${U.f(s.d2, 1)})/2 = ${U.f(s.d * 1000, 1)} µm<br>HV = 1.8544 F/d² = 1.8544 × 10 / (${U.f(s.d, 4)})² = <b>${U.f(s.HV, 1)}</b></div><div class="eq">HV values: ${T.list.map(x => `HV${x.F} = ${U.f(x.HV, 0)}`).join('; ')}<br>Bulk = <b>${U.f(T.bulk, 1)} HV</b>; ISE at 0.5 kgf = <b>${U.f(T.ise, 1)}%</b>; Meyer index n = <b>${U.f(T.n, 3)}</b></div>`; },
    uncert(sim) { const T = sim.truth; const s = T.trav ? T.list[0] : T.list[3]; const ud = (s.d < 0.1 ? 0.5 : 1) / 1000 / Math.sqrt(12) / Math.SQRT2; return [{ q: T.trav ? 'HV 0.5 at surface' : 'HV 10', expr: 'u(HV)/HV = 2u(d)/d', val: s.HV, u: s.HV * 2 * ud / s.d, unit: 'HV' }, ...(T.trav ? [] : [{ q: 'HV 0.5', expr: '2u(d)/d (small d → larger error)', val: T.list[0].HV, u: T.list[0].HV * 2 * (0.5e-3 / Math.sqrt(12) / Math.SQRT2) / T.list[0].d, unit: 'HV' }])]; },
    conclude(sim) { const T = sim.truth; if (T.trav) return `The carburised specimen has a surface hardness of ${U.f(T.HV1, 0)} HV falling to a core hardness of ${U.f(T.core, 0)} HV. The effective case depth to 550 HV is ${U.f(T.ecd, 2)} mm.`; return `${sim.M.name} has a macro-hardness of ${U.f(T.bulk, 0)} HV. At 0.5 kgf the measured hardness is ${U.f(T.ise, 1)}% higher, showing the indentation size effect; Meyer’s index n = ${U.f(T.n, 2)} (${T.n < 1.97 ? 'less than 2, so hardness rises at low load' : 'close to 2, so hardness is nearly independent of load'}).`; },
    summary: 'In the Vickers test a square-based diamond pyramid with 136° between opposite faces is pressed into the surface and the two diagonals of the impression are measured. HV = 1.8544F/d² (F in kgf, d in mm). Because the pyramid gives geometrically similar impressions at all loads, HV should be independent of load and one scale covers soft to very hard materials. At very low loads hardness often increases (indentation size effect) due to strain gradients and surface effects. Microhardness traverses on polished cross-sections measure hardness gradients such as carburised cases; the effective case depth is the depth at which hardness falls to 550 HV.',
    formulas: [['Vickers hardness', 'HV = 2F sin(136°/2) / d² = 1.8544 F/d²'], ['Mean diagonal', 'd = (d₁ + d₂)/2'], ['Depth of impression', 'h ≈ d / 7'], ['Meyer law', 'F = a dⁿ (n = 2 → load-independent)'], ['Effective case depth', 'ECD: distance where HV = 550 (ISO 2639)']],
    theory: `<h3>Principle</h3><p>The Vickers test (Smith and Sandland, 1921) uses a square-based diamond pyramid. The 136° angle between opposite faces was chosen so that the impression matches a Brinell impression with d = 0.375D, the middle of the Brinell validity range. Because the pyramid is self-similar, impressions at all loads are geometrically similar and hardness should not depend on load.</p><div class="eq">HV = 2F sin(68°)/d² = 1.8544 F/d²       F in kgf, d in mm</div>
    <p>The diamond does not deform, so one continuous scale covers everything from lead (≈ 5 HV) to cemented carbide (≈ 1800 HV). This makes Vickers the reference method for hardness conversion and research.</p>
    <h3>Load ranges</h3><p>Macro-Vickers uses 5–100 kgf, low-load Vickers 0.2–5 kgf, and microhardness 0.01–0.2 kgf. Microhardness indentations are small enough (a few micrometres) to test individual phases, thin coatings and hardness gradients.</p>
    <h3>Indentation size effect</h3><p>At low loads many materials appear harder. Causes include geometrically necessary dislocations required to accommodate the strain gradient beneath a small indentation, work-hardened surface layers from polishing, and the difficulty of resolving small diagonals. Meyer’s law F = adⁿ describes this: n = 2 means load independence, n &lt; 2 indicates hardness increasing at low loads.</p>
    <h3>Case depth measurement</h3><p>Carburising, nitriding and induction hardening produce a hard surface over a tough core. Hardness falls with depth. A microhardness traverse on a polished cross-section with indentations every 0.1 mm gives the hardness profile. ISO 2639 defines the <b>effective case depth</b> (CHD) as the depth at which hardness has fallen to 550 HV 1; nitrided cases use core hardness + 50 HV.</p>`,
    procedure: ['Grind and polish the specimen to a mirror finish (and etch lightly for a traverse).', 'Select the test force and dwell time (10–15 s).', 'Focus the microscope on the area to be tested and switch to the indenter.', 'Apply the force; after the dwell the indenter retracts automatically.', 'Swing the objective back and measure both diagonals with the filar eyepiece.', 'For a load series, repeat at each force in fresh areas; for a traverse, step 0.1 mm from the surface keeping spacing ≥ 3d.', 'Calculate HV and plot against load or depth.'],
    precautions: ['The surface must be flat and well polished; scratches distort small diagonals.', 'Keep the specimen perpendicular to the indenter; tilt gives unequal diagonals.', 'Reject impressions whose diagonals differ by more than 5%.', 'Keep spacing ≥ 3d and edge distance ≥ 2.5d.', 'Avoid vibration, especially for microhardness.'],
    applications: ['Hardness of thin sections, coatings and individual phases.', 'Case depth measurement in carburised, nitrided and induction-hardened parts.', 'Weld cross-section hardness surveys (HAZ hardness limits).', 'Research and conversion reference for other scales.'],
    errors: ['Diagonal measurement resolution, which dominates at low loads.', 'Surface preparation artefacts (deformed layer).', 'Specimen tilt.', 'Indentations too close to each other or to edges.', 'Elastic recovery of the impression in some materials.'],
    discussion: ['Why does the Vickers test give load-independent hardness in principle?', 'Discuss the indentation size effect you observed and its likely causes.', 'Why is the effective case depth defined at a fixed hardness (550 HV) rather than at the visible etch boundary?', 'Compare Vickers with Brinell and Rockwell for testing a 0.5 mm thick hardened strip.'],
    refs: ['IS 1501 (Part 1):2020, Metallic Materials — Vickers Hardness Test, Part 1: Test Method, BIS.', 'ASTM E384-22, Standard Test Method for Microindentation Hardness of Materials.', 'ISO 6507-1:2023, Metallic Materials — Vickers Hardness Test.', 'ISO 2639:2002, Steels — Determination and Verification of the Depth of Carburized and Hardened Cases.', 'W. D. Nix, H. Gao, J. Mech. Phys. Solids 46 (1998) 411–425 (indentation size effect).'],
    pre: [
      { q: 'The Vickers indenter is a', o: ['Steel ball', 'Diamond cone', 'Square-based diamond pyramid', 'Rhombic diamond'], a: 2, why: '136° between opposite faces.' },
      { q: 'Vickers hardness formula is', o: ['HV = 1.8544F/d²', 'HV = 2F/πD²', 'HV = 100 − e/0.002', 'HV = F/d'], a: 0, why: 'F in kgf, d in mm.' },
      { q: 'In principle, Vickers hardness is', o: ['Strongly load dependent', 'Independent of load', 'Valid only above 30 kgf', 'Only for soft metals'], a: 1, why: 'Geometrically similar impressions.' },
      { q: 'Microhardness testing is used for', o: ['Large castings', 'Individual phases and thin layers', 'Rubber', 'Liquids'], a: 1, why: 'Loads of grams give micrometre-size impressions.' },
      { q: 'Effective case depth of a carburised part is defined at', o: ['300 HV', '550 HV', 'Core hardness', 'The etch line'], a: 1, why: 'ISO 2639.' }
    ],
    post: [
      { q: 'A 10 kgf indentation has d = 0.364 mm. HV is about', o: ['50', '140', '280', '510'], a: 1, why: '1.8544 × 10/0.1325 = 140.' },
      { q: 'Your HV 0.5 was higher than HV 30. This is called', o: ['Work softening', 'Indentation size effect', 'Bauschinger effect', 'Creep'], a: 1, why: 'Hardness increases at low loads.' },
      { q: 'A Meyer index n < 2 means', o: ['Hardness decreases with load', 'Hardness increases at low load', 'No effect', 'The test is invalid'], a: 1, why: 'F = adⁿ; n < 2 gives higher HV at smaller d.' },
      { q: 'If the two diagonals differ by 8%, you should', o: ['Average them anyway', 'Check specimen tilt or anisotropy and repeat', 'Use only the larger', 'Use only the smaller'], a: 1, why: 'ASTM E384 limits asymmetry.' },
      { q: 'A 1% error in diagonal gives an error in HV of', o: ['0.5%', '1%', '2%', '4%'], a: 2, why: 'HV ∝ 1/d².' }
    ]
  });
})();
