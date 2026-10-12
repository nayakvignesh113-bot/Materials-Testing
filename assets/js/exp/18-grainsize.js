(function () {
  const U = LAB.U, G = LAB.G;
  const W = 640, H = 480;
  const LINES = [[40, 120, 600, 120], [40, 240, 600, 240], [40, 360, 600, 360], [320, 30, 320, 450]];
  const CIRC = { x: 320, y: 240, r: 150 };
  const ANNEAL = { 800: 8.6, 900: 7.6, 1000: 6.2, 1100: 4.8 };
  const Gfromlbar = lmm => -6.6457 * Math.log10(lmm) - 3.298;
  const GfromNA = NA => 3.321928 * Math.log10(NA) - 2.954;
  function build(sim) {
    if (sim._v) return sim._v;
    const r = U.rng(sim.seed); const lpx = 28; const rho = Math.pow(Math.PI / (4 * lpx), 2); const n = Math.round(W * H * rho * 1.05);
    const v = G.voronoi(W, H, n, r, { reg: 0.62 }); const c = G.canvas(W, H); const sh = []; for (let k = 0; k < v.n; k++) sh.push(r());
    const nz = G.noise(sim.seed + 5); G.fill(c, (i, x, y) => { const e = v.ed[i]; if (e < 1.1) return 70; return 196 + 32 * sh[v.lab[i]] + 8 * nz(x * .05, y * .05); }, 'optical');
    G.scaleBar(c, sim.umpx, '100×');
    sim._v = { v, c }; return sim._v;
  }
  function counts(sim) {
    const { v } = build(sim); const N = LINES.map(l => G.intercepts(v, ...l).n);
    // Jeffries: grains fully inside circle and grains intersected by circle
    const inside = new Set(), cut = new Set();
    for (let y = CIRC.y - CIRC.r - 1; y <= CIRC.y + CIRC.r + 1; y++) for (let x = CIRC.x - CIRC.r - 1; x <= CIRC.x + CIRC.r + 1; x++) { const d = Math.hypot(x - CIRC.x, y - CIRC.y); const l = v.lab[y * W + x]; if (d <= CIRC.r - 0.5) inside.add(l); else if (d <= CIRC.r + 0.5) cut.add(l); }
    const full = [...inside].filter(l => !cut.has(l)).length; return { N, full, cut: cut.size };
  }
  LAB.register({
    id: 'grainsize', no: 18, cat: 'meta', title: 'Grain Size Measurement', std: 'ASTM E112-13(2021) / IS 4748:2009 / ISO 643', short: 'Heyn lineal intercept and Jeffries planimetric methods on an annealed ferritic steel: ASTM grain size number and Hall–Petch strength.', tags: 'ASTM G grain size intercept planimetric Jeffries Heyn Hall-Petch annealing grain growth',
    aim: 'To determine the ASTM grain size number of an annealed ferritic steel by the lineal intercept (Heyn) and planimetric (Jeffries) methods, and to estimate the effect of grain size on yield strength using the Hall–Petch relation.',
    objectives: ['Count grain-boundary intercepts on test lines of known length.', 'Count whole and intersected grains within a test circle of known area.', 'Calculate mean lineal intercept, grains per mm² and the ASTM grain size number by both methods.', 'Relate annealing temperature, grain size and yield strength.'],
    apparatus: ['Metallurgical microscope with calibrated eyepiece reticle (100×)', 'Etched ferritic steel specimens annealed at different temperatures', 'Test line and circle overlay (or image analysis software)', 'Stage micrometer for magnification calibration'],
    stdNote: 'G = −6.6457 log₁₀ ℓ̄ − 3.298 (ℓ̄ in mm); G = 3.321928 log₁₀ N_A − 2.954 (N_A per mm² at 1×). Annealing twins are not counted as grain boundaries.',
    params: [
      { id: 'T', label: 'Annealing temperature (1 h, furnace cooled)', type: 'select', options: Object.keys(ANNEAL).map(k => [k, k + ' °C']), def: '900' }
    ],
    opSteps: ['Calibrate magnification with stage micrometer', 'Select a representative field at 100×', 'Superimpose test lines of known length', 'Count intercepts with grain boundaries on each line', 'Superimpose test circle of known area', 'Count grains inside and intersected', 'Calculate ℓ̄, N_A and G'],
    svg() { return G.svg('0 0 520 220', `${G.r(0, 0, 520, 220, 'bg')}${G.r(40, 60, 160, 90, 'mach', 'rx="6"')}<rect id="fur" x="60" y="80" width="120" height="50" class="bad" opacity=".2"/>${G.t(52, 52, 'Annealing furnace', 'm')}${G.t(250, 52, 'Microscope', 'm')}${G.r(260, 70, 30, 100, 'mach')}${G.r(250, 60, 120, 24, 'mach', 'rx="4"')}${G.r(300, 110, 80, 10, 'steelD')}${G.t(20, 200, '', 'big', 'id="lab"')}`); },
    anim(svg, f, sim) { if (!sim) return; G.set(svg, 'fur', 'opacity', f < .4 ? 0.3 + 0.6 * Math.sin(f * 30) ** 2 : 0.15); G.txt(svg, 'lab', f < .4 ? `Annealing at ${sim.T} °C…` : f < .6 ? 'Prepare + etch (2% Nital)' : 'Counting at 100×'); },
    liveView(el, f, sim, p, api) {
      api.title('Field at 100×'); api.sub(f < .6 ? 'grains growing during anneal' : 'test lines and circle');
      const { c } = build(sim); let cv = el.querySelector('canvas'); if (!cv || cv._sim !== sim) { el.innerHTML = ''; cv = G.canvas(W, H); cv._sim = sim; el.appendChild(cv); }
      const g = cv.getContext('2d'); g.drawImage(c, 0, 0); if (f < .6) { cv.style.filter = `blur(${(0.6 - f) * 6}px)`; return; } cv.style.filter = 'none';
      overlay(g, Math.min(1, (f - .6) / .3));
    },
    expExtra(el, sim) {
      const { c } = build(sim); const cv = G.canvas(W, H); const g = cv.getContext('2d'); const marks = [];
      const draw = () => { g.drawImage(c, 0, 0); overlay(g, 1); g.fillStyle = '#ffd400'; g.strokeStyle = '#000'; marks.forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); g.stroke(); }); el.querySelector('#gsn').textContent = marks.length; };
      el.innerHTML = `<div class="panel"><div class="panel-h"><h4>Counting field (100×)</h4><span class="eyebrow">click to mark · <b id="gsn">0</b> marks</span></div><div class="figure" id="gsfig"></div><div class="controls" style="margin-top:8px"><button class="btn quiet small" id="gsundo">Undo mark</button><button class="btn quiet small" id="gsclr">Clear marks</button><span class="muted" style="font-size:.82rem">Lines L1–L3 horizontal, L4 vertical (blue). Test circle (orange). Mark each intercept or grain as you count; the tally helps you keep track.</span></div></div>`;
      el.querySelector('#gsfig').appendChild(cv); cv.style.maxWidth = '100%'; cv.style.height = 'auto'; cv.style.cursor = 'crosshair';
      cv.addEventListener('click', ev => { const b = cv.getBoundingClientRect(); marks.push([(ev.clientX - b.left) * W / b.width, (ev.clientY - b.top) * H / b.height]); draw(); });
      el.querySelector('#gsundo').onclick = () => { marks.pop(); draw(); }; el.querySelector('#gsclr').onclick = () => { marks.length = 0; draw(); }; draw();
    },
    reportFigs(sim) { const { c } = build(sim); const cv = G.canvas(W, H); const g = cv.getContext('2d'); g.drawImage(c, 0, 0); overlay(g, 1); return [{ src: cv.toDataURL('image/jpeg', .85), cap: `Ferrite grains after annealing at ${sim.T} °C, 100×, with test lines L1–L4 and test circle` }]; },
    simulate(p, r) {
      const Gt = ANNEAL[p.T] + 0.25 * U.gauss(r); const lmm = Math.pow(10, (-Gt - 3.298) / 6.6457); const umpx = lmm * 1000 / 28;
      const sim = { seed: Math.floor(r() * 1e6), umpx, T: p.T, dur: 7, M: { name: 'Ferritic steel 0.05% C' } };
      const ct = counts(sim); const Lum = LINES.map(l => Math.hypot(l[2] - l[0], l[3] - l[1]) * umpx); const LT = Lum.reduce((a, b) => a + b, 0); const Ntot = ct.N.reduce((a, b) => a + b, 0);
      const lbar = LT / Ntot; const Gl = Gfromlbar(lbar / 1000); const Aum2 = Math.PI * Math.pow(CIRC.r * umpx, 2); const NA = (ct.full + 0.5 * ct.cut) / (Aum2 / 1e6); const Gp = GfromNA(NA);
      const d = lbar * 1e-6; const sy = 70 + 0.74 / Math.sqrt(d);
      sim.truth = { N: ct.N, full: ct.full, cut: ct.cut, LT, lbar, Gl, NA, Gp, sy, Aum2, Lum };
      sim.readout = f => [['Anneal', p.T + ' °C, 1 h', ''], ['Magnification', '100×', ''], ['Scale', U.f(umpx, 3) + ' µm/px', ''], ['Stage', f < .4 ? 'Annealing' : f < .6 ? 'Preparing' : 'Counting', '']];
      sim.specimen = [['Material', 'Ferritic low-carbon steel (0.05% C), cold-rolled 70%', ''], ['Annealing', `${p.T} °C, 1 h, furnace cooled`, ''], ['Etchant', '2% Nital, 10 s', ''], ['Image magnification', '100× (calibrated with stage micrometer)', ''], ['Hall–Petch constants (ferrite)', 'σ₀ = 70 MPa, k = 0.74 MPa·m½', '']];
      sim.obs = [{ title: 'Table 1. Test lines (true length at specimen)', cols: ['Line', 'Length (µm)', 'Length (mm)'], rows: Lum.map((L, i) => ['L' + (i + 1), U.f(L, 1), U.f(L / 1000, 4)]), textCols: [0] }, { title: 'Table 2. Test circle', cols: ['Item', 'Value'], textCols: [0], rows: [['Radius (µm, true)', U.f(CIRC.r * umpx, 1)], ['Area (mm², true)', U.f(Aum2 / 1e6, 5)]] }];
      return sim;
    },
    calcs(sim) { const T = sim.truth; const a = T.N.map((n, i) => ({ key: 'n' + i, label: `Intercepts on line L${i + 1}`, unit: 'count', truth: n, abs: Math.max(1, Math.round(n * 0.07)) }));
      a.push({ key: 'lbar', label: 'Mean lineal intercept ℓ̄', unit: 'µm', truth: T.lbar, tol: 0.06, hint: 'L_T / ΣN' }, { key: 'gl', label: 'ASTM G (intercept method)', unit: '—', truth: T.Gl, abs: 0.2, hint: 'G = −6.6457 log ℓ̄(mm) − 3.298' }, { key: 'full', label: 'Grains completely inside circle', unit: 'count', truth: T.full, abs: Math.max(2, Math.round(T.full * 0.07)) }, { key: 'cut', label: 'Grains intersected by circle', unit: 'count', truth: T.cut, abs: Math.max(2, Math.round(T.cut * 0.08)) }, { key: 'na', label: 'Grains per mm² N_A', unit: 'mm⁻²', truth: T.NA, tol: 0.08, hint: '(N_in + ½N_int)/A' }, { key: 'gp', label: 'ASTM G (planimetric method)', unit: '—', truth: T.Gp, abs: 0.2, hint: 'G = 3.3219 log N_A − 2.954' }, { key: 'sy', label: 'Hall–Petch yield strength', unit: 'MPa', truth: T.sy, tol: 0.03, hint: 'σ₀ + k ℓ̄^(−½), ℓ̄ in m' });
      return a; },
    reference(sim) { const T = sim.truth; return [{ label: 'G intercept vs planimetric', unit: '', value: T.Gl - T.Gp, lo: -0.5, hi: 0.5, src: 'ASTM E112: methods agree within ±0.5 G' }, { label: 'Yield strength estimate', unit: 'MPa', value: T.sy, lo: 150, hi: 330, src: 'Annealed low-carbon steels' }]; },
    sample(sim) { const T = sim.truth; return `<div class="eq">ΣN = ${T.N.join(' + ')} = ${T.N.reduce((a, b) => a + b, 0)};  L_T = ${U.f(T.LT, 1)} µm<br>ℓ̄ = L_T/ΣN = <b>${U.f(T.lbar, 2)} µm</b> = ${U.f(T.lbar / 1000, 5)} mm<br>G = −6.6457 log(${U.f(T.lbar / 1000, 5)}) − 3.298 = <b>${U.f(T.Gl, 2)}</b></div><div class="eq">N_A = (${T.full} + ½ × ${T.cut}) / ${U.f(T.Aum2 / 1e6, 5)} = <b>${U.f(T.NA, 0)} mm⁻²</b>;  G = 3.3219 log(${U.f(T.NA, 0)}) − 2.954 = <b>${U.f(T.Gp, 2)}</b></div><div class="eq">σ_y = 70 + 0.74/√(${U.sci(T.lbar * 1e-6, 3)}) = <b>${U.f(T.sy, 0)} MPa</b></div>`; },
    uncert(sim) { const T = sim.truth; const n = T.N.reduce((a, b) => a + b, 0); const s = U.sd(T.N.map((x, i) => T.Lum[i] / x)); return [{ q: 'Mean intercept ℓ̄', expr: 'Poisson counting: ℓ̄/√ΣN; line-to-line s/√4', val: T.lbar, u: Math.hypot(T.lbar / Math.sqrt(n), s / 2), unit: 'µm' }, { q: 'G (intercept)', expr: '6.6457 × u(ℓ̄)/(ℓ̄ ln 10)', val: T.Gl, u: 6.6457 / Math.LN10 * Math.hypot(1 / Math.sqrt(n), s / 2 / T.lbar), unit: '' }]; },
    conclude(sim) { const T = sim.truth; return `After annealing at ${sim.T} °C the ferrite grain size is ASTM G ${U.f(T.Gl, 1)} by the intercept method (ℓ̄ = ${U.f(T.lbar, 1)} µm) and G ${U.f(T.Gp, 1)} by the planimetric method; the two agree within ${U.f(Math.abs(T.Gl - T.Gp), 2)}. Higher annealing temperatures give coarser grains (lower G) and, through the Hall–Petch relation, lower yield strength; the estimated yield strength here is ${U.f(T.sy, 0)} MPa.`; },
    summary: 'Most engineering metals are polycrystalline, and grain size strongly affects strength, toughness, formability and creep. ASTM E112 defines the grain size number G so that the number of grains per square inch at 100× equals 2^(G−1). In the Heyn lineal intercept method, test lines of known length are laid on the image and the grain-boundary intercepts counted; the mean intercept length ℓ̄ gives G. In the Jeffries planimetric method, grains inside a known area are counted (whole grains plus half of those cut by the boundary) to give N_A. Smaller grains give higher yield strength according to Hall–Petch, σ_y = σ₀ + k d^(−½). Grain size grows with annealing temperature and time.',
    formulas: [['ASTM definition', 'n (grains/in² at 100×) = 2^(G−1)'], ['From mean intercept', 'G = −6.6457 log₁₀ ℓ̄ − 3.298  (ℓ̄ in mm)'], ['Mean intercept', 'ℓ̄ = L_T / (M · ΣN)'], ['Jeffries count', 'N_A = (N_inside + ½ N_intercepted)/A'], ['From N_A', 'G = 3.321928 log₁₀ N_A − 2.954'], ['Hall–Petch', 'σ_y = σ₀ + k d^(−½)']],
    theory: `<h3>Grains and grain boundaries</h3><p>A grain is a region of a crystal with one lattice orientation. Neighbouring grains are separated by grain boundaries, where atoms are disordered. Boundaries block dislocation motion, store energy, provide fast diffusion paths and are preferred sites for precipitation and corrosion. Grain size therefore influences almost every property.</p>
    <h3>ASTM grain size number</h3><p>ASTM E112 defines G through the number of grains per square inch at 100×: n = 2^(G−1). Larger G means finer grains: G = 1 is very coarse (ℓ̄ ≈ 254 µm), G = 8 is fine (ℓ̄ ≈ 22 µm). Two standard measurement methods are used:</p>
    <ul><li><b>Heyn lineal intercept method</b>: count intercepts N of grain boundaries with test lines of total true length L<sub>T</sub>. Mean intercept ℓ̄ = L<sub>T</sub>/ΣN; G = −6.6457 log ℓ̄ − 3.298 (mm). Fast and less tedious; at least 50 intercepts per field and several fields are recommended.</li><li><b>Jeffries planimetric method</b>: inside a circle of known area A count the grains fully inside (N<sub>in</sub>) and those cut by the circle (N<sub>int</sub>, counted as half). N<sub>A</sub> = (N<sub>in</sub> + 0.5 N<sub>int</sub>)/A; G = 3.3219 log N<sub>A</sub> − 2.954.</li></ul>
    <p>Twin boundaries in FCC metals are not counted. A triple point where the line meets a junction counts as 1.5 intercepts; a line ending inside a grain counts as ½.</p>
    <h3>Grain growth on annealing</h3><p>Recrystallised grains coarsen at high temperature because boundary energy decreases as total boundary area decreases. Growth follows d² − d₀² = K t, with K rising exponentially with temperature. Pinning particles (AlN, Nb(C,N)) restrict growth, which is the basis of fine-grained steels.</p>
    <h3>Hall–Petch relation</h3><div class="eq">σ_y = σ₀ + k d^(−½)</div><p>Dislocations pile up against boundaries; finer grains mean shorter pile-ups and higher stress to activate slip in the next grain. For ferrite, σ₀ ≈ 70 MPa and k ≈ 0.74 MPa·m½. Grain refinement is the only strengthening mechanism that also improves toughness and lowers the ductile-to-brittle transition temperature.</p>`,
    procedure: ['Prepare and etch the specimen (Nital) so that all ferrite grain boundaries are visible.', 'Calibrate the magnification with a stage micrometer.', 'Select a field at random; superimpose the test lines and count intercepts on each.', 'Superimpose the test circle; count grains fully inside and grains cut by the circle.', 'Repeat on at least five fields (here one field is used for practice).', 'Calculate ℓ̄, N_A and G by both methods; report the mean and confidence interval.'],
    precautions: ['Etch enough to show all boundaries but not so deep that boundaries become thick.', 'Choose fields without bias; avoid edges and decarburised surfaces.', 'Count consistently at triple points and line ends.', 'Do not count twin boundaries in FCC metals.'],
    applications: ['Specification of steel grades (e.g., fine-grained structural steels, G ≥ 7).', 'Controlling annealing and normalising processes.', 'Predicting strength, toughness and formability.', 'Creep-resistant alloys deliberately use coarse grains.'],
    errors: ['Miscounting at triple points or faint boundaries.', 'Magnification calibration error (enters ℓ̄ directly).', 'Non-representative fields; too few fields.', 'Non-equiaxed grains need counts in two directions.'],
    discussion: ['Compare G from the two methods. Which is faster and which more precise?', 'How did annealing temperature affect grain size? Explain the mechanism.', 'Use Hall–Petch to compare yield strength at G = 5 and G = 9.', 'Why does grain refinement improve both strength and toughness?'],
    refs: ['ASTM E112-13(2021), Standard Test Methods for Determining Average Grain Size.', 'IS 4748:2009, Steels — Micrographic Determination of the Apparent Grain Size, BIS.', 'ISO 643:2019, Steels — Micrographic Determination of the Apparent Grain Size.', 'E. O. Hall, Proc. Phys. Soc. B 64 (1951) 747; N. J. Petch, J. Iron Steel Inst. 174 (1953) 25.', 'G. F. Vander Voort, Metallography: Principles and Practice, ASM, 1999.'],
    pre: [
      { q: 'A higher ASTM grain size number G means', o: ['Coarser grains', 'Finer grains', 'More twins', 'Larger specimen'], a: 1, why: 'n = 2^(G−1) grains/in² at 100×.' },
      { q: 'In the Heyn method you count', o: ['Grains in a circle', 'Intercepts of grain boundaries with test lines', 'Twins', 'Inclusions'], a: 1, why: 'Lineal intercept method.' },
      { q: 'In the Jeffries method, grains cut by the circle are counted as', o: ['0', '½', '1', '2'], a: 1, why: 'On average half of each lies inside.' },
      { q: 'The Hall–Petch equation relates yield strength to', o: ['d', 'd²', 'd^(−½)', 'log d'], a: 2, why: 'σ_y = σ₀ + k d^(−½).' },
      { q: 'Annealing at higher temperature usually', o: ['Refines grains', 'Coarsens grains', 'Has no effect', 'Produces martensite'], a: 1, why: 'Grain growth is thermally activated.' }
    ],
    post: [
      { q: 'A mean intercept of 0.0226 mm corresponds to G ≈', o: ['5', '6', '7.6', '10'], a: 2, why: '−6.6457 × log(0.0226) − 3.298 ≈ 7.64.' },
      { q: 'If the magnification is really 110× but you assumed 100×, your ℓ̄ will be', o: ['10% too large', '10% too small', 'Unchanged', 'Doubled'], a: 0, why: 'True length per pixel is smaller than assumed.' },
      { q: 'Intercept and planimetric G values should agree within about', o: ['±0.1', '±0.5', '±2', '±5'], a: 1, why: 'ASTM E112 notes typical agreement.' },
      { q: 'Using σ₀ = 70 MPa, k = 0.74 MPa√m, a grain size of 25 µm gives σ_y ≈', o: ['118 MPa', '218 MPa', '318 MPa', '418 MPa'], a: 1, why: '70 + 0.74/√(25×10⁻⁶) = 70 + 148 = 218.' },
      { q: 'Why are twin boundaries excluded from grain counts?', o: ['They are not boundaries', 'They are coherent and are not considered grain boundaries by the standard', 'They are invisible', 'They move'], a: 1, why: 'ASTM E112 counts only grain boundaries.' }
    ]
  });
  function overlay(g, a) {
    g.save(); g.globalAlpha = a; g.lineWidth = 2; g.strokeStyle = '#1e8cff'; g.font = '600 13px "IBM Plex Mono",monospace'; g.fillStyle = '#1e8cff';
    LINES.forEach((l, i) => { g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(l[2], l[3]); g.stroke(); g.fillText('L' + (i + 1), i < 3 ? l[0] - 34 : l[0] + 6, i < 3 ? l[1] + 5 : l[1] + 14); });
    g.strokeStyle = '#ff8a00'; g.setLineDash([7, 5]); g.beginPath(); g.arc(CIRC.x, CIRC.y, CIRC.r, 0, 7); g.stroke(); g.setLineDash([]); g.restore();
  }
})();
