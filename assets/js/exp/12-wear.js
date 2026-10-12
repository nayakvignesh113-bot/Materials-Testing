(function () {
  const U = LAB.U, G = LAB.G;
  const MAT = {
    al: { name: 'Al 6061-T6 pin', rho: 2.70, HV: 107, k: 2.2e-4, mu: 0.48, ref: [5e-5, 1e-3] },
    mmc: { name: 'Al 6061 + 10 wt% SiC (stir cast)', rho: 2.75, HV: 128, k: 6.5e-5, mu: 0.40, ref: [1e-5, 3e-4] },
    br: { name: 'Brass CuZn37 pin', rho: 8.44, HV: 125, k: 6.0e-5, mu: 0.36, ref: [1e-5, 3e-4] },
    cu: { name: 'Copper pin, annealed', rho: 8.96, HV: 52, k: 2.0e-4, mu: 0.55, ref: [5e-5, 1e-3] },
    ms: { name: 'Mild steel pin', rho: 7.85, HV: 140, k: 1.8e-5, mu: 0.58, ref: [3e-6, 1e-4] }
  };
  LAB.register({
    id: 'wear', no: 12, cat: 'wear', title: 'Pin-on-Disc Wear Test', std: 'ASTM G99-23 / ASTM G40 (terminology)', short: 'Dry sliding of a pin against a hardened EN31 disc: mass loss, volume loss, specific wear rate, Archard coefficient and friction coefficient history.', tags: 'tribology archard specific wear rate coefficient of friction MMC sliding distance',
    aim: 'To determine the sliding wear rate, specific wear rate and coefficient of friction of a pin material sliding dry against a hardened steel disc on a pin-on-disc tribometer, and to evaluate the Archard wear coefficient.',
    objectives: ['Run a dry sliding test at set load, speed and sliding distance.', 'Determine mass and volume loss, wear rate and specific wear rate.', 'Analyse the coefficient of friction history (running-in and steady state).', 'Calculate the dimensionless Archard coefficient and classify the wear regime.'],
    apparatus: ['Pin-on-disc tribometer (ASTM G99), disc EN31 hardened to 60–62 HRC, Ra 0.2–0.4 µm', 'Pins Ø 8 mm × 30 mm, flat ends ground to Ra < 0.4 µm', 'Dead-weight loading lever; load cell for friction force (resolution 0.01 N)', 'LVDT for linear wear (resolution 1 µm)', 'Electronic balance, readability 0.1 mg', 'Acetone and ultrasonic cleaner'],
    stdNote: 'ASTM G99 recommends reporting wear as volume loss in mm³ together with load, speed, distance, environment and counterface.',
    params: [
      { id: 'mat', label: 'Pin material', type: 'select', options: Object.entries(MAT).map(([k, v]) => [k, v.name]), def: 'al' },
      { id: 'F', label: 'Normal load', type: 'select', options: [['10', '10 N'], ['20', '20 N'], ['30', '30 N'], ['40', '40 N']], def: '20' },
      { id: 'v', label: 'Sliding velocity', type: 'select', options: [['1', '1.0 m/s'], ['2', '2.0 m/s'], ['3', '3.0 m/s']], def: '2' },
      { id: 'D', label: 'Wear track diameter', type: 'select', options: [['60', '60 mm'], ['80', '80 mm'], ['100', '100 mm']], def: '80' },
      { id: 't', label: 'Test duration', type: 'select', options: [['10', '10 min'], ['20', '20 min'], ['30', '30 min']], def: '20' }
    ],
    opSteps: ['Clean and weigh pin (and disc); measure pin diameter', 'Set track radius and disc speed (rpm)', 'Mount pin; apply dead-weight load', 'Start rotation; log friction force and LVDT', 'Running-in: friction rises and settles', 'Steady-state sliding to set duration', 'Clean and re-weigh pin'],
    svg(p) {
      let marks = ''; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; marks += `<line x1="${260 + 120 * Math.cos(a)}" y1="${200 + 26 * Math.sin(a)}" x2="${260 + 132 * Math.cos(a)}" y2="${200 + 28.6 * Math.sin(a)}" class="lnm" stroke-width="2"/>`; }
      return G.svg('0 0 520 300', `${G.r(0, 0, 520, 300, 'bg')}${G.r(80, 240, 360, 30, 'mach', 'rx="3"')}${G.r(240, 210, 40, 30, 'mach2')}
        <ellipse cx="260" cy="206" rx="150" ry="34" class="steelD"/><ellipse cx="260" cy="200" rx="150" ry="34" class="steel"/><ellipse cx="260" cy="200" rx="${p.D / 100 * 110}" ry="${p.D / 100 * 24}" fill="none" stroke="var(--machine)" stroke-width="5" opacity=".6"/>
        <g id="disc">${marks}</g>
        ${G.r(40, 40, 18, 200, 'mach')}${G.r(40, 40, 330, 14, 'mach')}
        <g id="pin">${G.r(253, 54, 14, 120, 'spec')}${G.r(244, 120, 32, 18, 'mach2')}</g>
        ${G.l(300, 54, 300, 90, 'ln', 2)}${G.r(285, 90, 30, 26, 'straw', 'rx="2" id="wtW"')}${G.t(285, 130, p.F + ' N', 'm')}
        ${G.r(330, 60, 10, 36, 'acc')}${G.t(344, 80, 'LVDT', 'm')}
        <g transform="translate(372,24)">${G.r(0, 0, 136, 96, 'disp', 'rx="4"')}${G.t(10, 16, 'FRICTION N', 'm', 'style="fill:var(--panel-ink);font-size:8px"')}${G.t(10, 36, '0.00', 'big', 'id="dF"')}${G.t(10, 54, 'COF', 'm', 'style="fill:var(--panel-ink);font-size:8px"')}${G.t(10, 74, '0.000', 'big', 'id="dM"')}${G.t(76, 54, 'WEAR µm', 'm', 'style="fill:var(--panel-ink);font-size:8px"')}${G.t(76, 74, '0', 'big', 'id="dW"')}${G.t(10, 90, '', 'm', 'id="lab" style="fill:var(--panel-ink);font-size:9px"')}</g>`, 'Pin-on-disc tribometer');
    },
    anim(svg, f, sim) {
      if (!sim) return; const i = Math.min(sim.n - 1, Math.floor(f * (sim.n - 1)));
      const g = svg.querySelector('#disc'); if (g) g.setAttribute('transform', `translate(${(f * 900) % 12 - 6},0)`);
      G.txt(svg, 'dF', U.f(sim.mu[i] * sim.F, 2)); G.txt(svg, 'dM', U.f(sim.mu[i], 3)); G.txt(svg, 'dW', U.f(sim.h[i], 0)); G.txt(svg, 'lab', `t = ${U.f(sim.t[i] / 60, 1)} min · ${sim.rpm} rpm`);
      G.set(svg, 'pin', 'transform', `translate(0,${sim.h[i] / 1000 * 40})`);
    },
    simulate(p, r) {
      const M = MAT[p.mat]; const F = p.F, v = p.v, D = p.D, tmin = p.t; const rpm = Math.round(v * 60 / (Math.PI * D / 1000)); const vAct = Math.PI * D / 1000 * rpm / 60; const tS = tmin * 60; const s = vAct * tS;
      const dp = U.q(8 + 0.01 * U.gauss(r), 0.01); const Ap = Math.PI * dp * dp / 4;
      const kss = M.k * (1 + 0.12 * U.gauss(r)) * Math.pow(v / 2, 0.15) * (F > 30 ? 1.2 : 1); // mm³/N·m
      const Vrun = kss * F * 60 * 1.6 + 0.02; // extra running-in volume (mm³)
      const n = 241; const t = [], mu = [], h = [], V = [];
      const muss = M.mu * (1 + 0.04 * U.gauss(r)) * (1 - 0.02 * (F - 20) / 10); const mupk = muss * 1.28; const tau = 40 + 30 * r();
      for (let i = 0; i < n; i++) { const ti = tS * i / (n - 1); const si = vAct * ti; const run = Vrun * (1 - Math.exp(-ti / 90)); const Vi = run + kss * F * si; t.push(ti); V.push(Vi); h.push(Vi / Ap * 1000 + 0.6 * U.gauss(r)); const m0 = muss + (mupk - muss) * (ti / tau) * Math.exp(1 - ti / tau); mu.push(Math.max(0.05, (i === 0 ? 0.12 : m0) + 0.018 * U.gauss(r) + 0.01 * Math.sin(ti / 7))); }
      const Vtot = V[n - 1]; const dm = Vtot * M.rho / 1000; // g
      const m1 = U.q(14.0 + (M.rho - 2.7) * 1.6 + 0.4 * r(), 0.0001) * (M.rho > 5 ? 1.0 : 1); const m2 = U.q(m1 - dm + 0.00004 * U.gauss(r), 0.0001);
      // friction force log every 1 min
      const rows = []; for (let k = 0; k <= tmin; k += (tmin > 20 ? 3 : 2)) { const i = Math.round(k * 60 / tS * (n - 1)); rows.push([k, U.f(mu[i] * F, 2), U.f(mu[i], 3), U.f(Math.max(0, h[i]), 0)]); }
      const ssStart = Math.round((n - 1) * 0.4); const muSS = U.mean(mu.slice(ssStart)); const Ffs = U.q(muSS * F, 0.01);
      const T = { s, dm: m1 - m2, m1, m2, rho: M.rho, F, Ap, H: M.HV * 9.807, Ffs };
      T.V = T.dm / M.rho * 1000; T.wr = T.V / s; T.k = T.V / (F * s); T.K = T.k * T.H / 1000; T.mu = Ffs / F; T.hLVDT = U.q(h[n - 1], 1); T.Vlvdt = T.hLVDT / 1000 * Ap;
      return {
        F, mu, h, t, n, rpm, M, dur: 10,
        readout(f) { const i = Math.min(n - 1, Math.floor(f * (n - 1))); return [['Time', U.f(t[i] / 60, 2), 'min'], ['Sliding distance', U.f(vAct * t[i], 0), 'm'], ['Friction force', U.f(mu[i] * F, 2), 'N'], ['COF μ', U.f(mu[i], 3), ''], ['Linear wear', U.f(Math.max(0, h[i]), 0), 'µm']]; },
        plot: { title: 'Coefficient of friction', xlabel: 'Sliding distance (m)', ylabel: 'Coefficient of friction μ', series: [{ name: 'μ', x: t.map(x => x * vAct), y: mu, color: 's1', width: 1.4 }], ymin: 0, ymax: Math.max(...mu) * 1.15, caption: 'Coefficient of friction against sliding distance (running-in followed by steady state)' },
        plots: [{ xlabel: 'Sliding distance (m)', ylabel: 'Linear wear (µm)', series: [{ name: 'LVDT wear', x: t.map(x => x * vAct), y: h.map(x => Math.max(0, x)), color: 's2' }], caption: 'Height loss of pin measured by LVDT' }],
        specimen: [['Pin material', M.name, ''], ['Pin diameter', U.f(dp, 2), 'mm'], ['Counterface', 'EN31 disc, 62 HRC, Ra 0.3 µm', ''], ['Normal load F_N', F, 'N'], ['Track diameter', D, 'mm'], ['Disc speed', rpm, 'rpm'], ['Sliding velocity', U.f(vAct, 3), 'm/s'], ['Duration', tmin, 'min'], ['Pin density ρ', M.rho, 'g/cm³'], ['Pin hardness', M.HV, 'HV'], ['Environment', 'Dry, 27 °C, 60% RH', '']],
        obs: [{ title: 'Table 1. Mass of pin (balance, 0.1 mg)', cols: ['Reading', 'Mass (g)'], textCols: [0], rows: [['Initial mass m₁', U.f(m1, 4)], ['Final mass m₂', U.f(m2, 4)]] },
        { title: 'Table 2. Friction and wear log', cols: ['Time (min)', 'Friction force (N)', 'μ', 'LVDT wear (µm)'], rows, note: `Mean friction force over the steady-state region (last 60% of the test) = ${U.f(Ffs, 2)} N.` }],
        truth: T
      };
    },
    calcs(sim) { const T = sim.truth; return [{ key: 's', label: 'Sliding distance', unit: 'm', truth: T.s, tol: 0.006, hint: 'π D N t' }, { key: 'dm', label: 'Mass loss', unit: 'g', truth: T.dm, abs: 0.0001, hint: 'm₁ − m₂' }, { key: 'V', label: 'Volume loss', unit: 'mm³', truth: T.V, tol: 0.012, hint: 'Δm/ρ × 1000' }, { key: 'wr', label: 'Wear rate', unit: 'mm³/m', truth: T.wr, tol: 0.015, hint: 'V / s', fmt: v => U.sci(v, 3) }, { key: 'k', label: 'Specific wear rate k', unit: 'mm³/N·m', truth: T.k, tol: 0.015, hint: 'V / (F_N s)', fmt: v => U.sci(v, 3) }, { key: 'mu', label: 'Steady-state coefficient of friction', unit: '—', truth: T.mu, tol: 0.012, hint: 'F_f / F_N' }, { key: 'K', label: 'Archard coefficient K', unit: '—', truth: T.K, tol: 0.03, hint: 'K = k·H/1000 (k in mm³/N·m, H in N/mm² = HV × 9.807)', fmt: v => U.sci(v, 3) }, { key: 'vl', label: 'Volume loss from LVDT', unit: 'mm³', truth: T.Vlvdt, tol: 0.03, hint: 'h × πd²/4' }]; },
    reference(sim) { const T = sim.truth, M = sim.M; return [{ label: 'Specific wear rate', unit: 'mm³/N·m', value: T.k, lo: M.ref[0], hi: M.ref[1], src: 'Dry sliding vs steel, literature', fmt: v => U.sci(v, 3), range: `${U.sci(M.ref[0], 2)} – ${U.sci(M.ref[1], 2)}` }, { label: 'Coefficient of friction', unit: '', value: T.mu, lo: 0.25, hi: 0.75, src: 'Unlubricated metal on steel' }, { label: 'Archard K (mild wear < 10⁻⁴)', unit: '', value: T.K, lo: 1e-6, hi: 1e-2, src: 'Archard & Hirst', fmt: v => U.sci(v, 3), range: '10⁻⁶ – 10⁻²' }, { label: 'Mass vs LVDT volume ratio', unit: '', value: T.V / T.Vlvdt, lo: 0.85, hi: 1.15, src: 'Consistency check' }]; },
    sample(sim) { const T = sim.truth; return `<div class="eq">s = πDNt = v·t = <b>${U.f(T.s, 1)} m</b></div><div class="eq">Δm = ${U.f(T.m1, 4)} − ${U.f(T.m2, 4)} = <b>${U.f(T.dm, 4)} g</b>;  V = Δm/ρ = ${U.f(T.dm, 4)}/${T.rho} × 1000 = <b>${U.f(T.V, 3)} mm³</b></div><div class="eq">Wear rate = V/s = <b>${U.sci(T.wr, 3)} mm³/m</b>;  k = V/(F s) = ${U.f(T.V, 3)}/(${T.F} × ${U.f(T.s, 1)}) = <b>${U.sci(T.k, 3)} mm³/N·m</b></div><div class="eq">μ = F_f/F_N = ${U.f(T.Ffs, 2)}/${T.F} = <b>${U.f(T.mu, 3)}</b>;  K = k·H = ${U.sci(T.k, 3)} mm³/N·m × ${U.f(T.H, 0)} N/mm² × 10⁻³ m/mm = <b>${U.sci(T.K, 3)}</b></div><div class="eq">LVDT check: V = h·A = ${T.hLVDT} µm × ${U.f(T.Ap, 2)} mm² = <b>${U.f(T.Vlvdt, 3)} mm³</b></div>`; },
    uncert(sim) { const T = sim.truth; const um = 0.0001 / Math.sqrt(12) * Math.SQRT2; return [{ q: 'Mass loss', expr: '√2 × 0.1 mg/√12', val: T.dm, u: um, unit: 'g' }, { q: 'Specific wear rate', expr: '√[(u_Δm/Δm)² + (u_F/F)² + (u_s/s)²]', val: T.k, u: T.k * Math.hypot(um / T.dm, 0.005, 0.003), unit: 'mm³/N·m' }, { q: 'COF', expr: 'load cell 0.01 N and fluctuation', val: T.mu, u: Math.hypot(0.01 / T.F, 0.018 / Math.sqrt(100)), unit: '' }]; },
    conclude(sim) { const T = sim.truth; return `${sim.M.name} sliding dry against EN31 at ${T.F} N over ${U.f(T.s, 0)} m lost ${U.f(T.dm * 1000, 1)} mg (${U.f(T.V, 2)} mm³), giving a specific wear rate of ${U.sci(T.k, 2)} mm³/N·m and an Archard coefficient of ${U.sci(T.K, 2)}, which places it in the ${T.K < 1e-4 ? 'mild (oxidative)' : 'severe (adhesive/delamination)'} wear regime. The coefficient of friction rose to a running-in peak and settled at ${U.f(T.mu, 2)}. Mass-loss and LVDT volumes agree within ${U.f(Math.abs(T.V / T.Vlvdt - 1) * 100, 0)}%.`; },
    summary: 'In a pin-on-disc test a stationary pin is pressed with a normal load F_N onto a rotating disc, producing unidirectional sliding along a circular track. The wear volume is obtained from mass loss and density (or from LVDT height loss), and the friction force from a load cell. Archard’s law, V = K F_N s / H, states that wear volume is proportional to load and sliding distance and inversely proportional to hardness of the softer surface. The specific wear rate k = V/(F_N s) normalises the result for comparison; the dimensionless K = kH indicates the wear regime. Friction typically peaks during running-in while asperities are removed and transfer films form, then reaches a steady state.',
    formulas: [['Sliding distance', 's = π D N t = v t'], ['Volume loss', 'V = Δm / ρ'], ['Wear rate', 'W = V / s'], ['Specific wear rate', 'k = V / (F_N s)  [mm³/N·m]'], ['Archard equation', 'V = K F_N s / H ;  K = k H (consistent units)'], ['Coefficient of friction', 'μ = F_f / F_N']],
    theory: `<h3>Wear</h3><p>Wear is the progressive loss of material from surfaces in relative motion. It limits the life of bearings, gears, brakes, cutting tools and engine components. ASTM G40 identifies adhesive, abrasive, fatigue, corrosive and erosive wear; in dry metal-on-metal sliding the first two dominate, often with oxidation.</p>
    <h3>Pin-on-disc test (ASTM G99)</h3><p>A pin with a flat or hemispherical end is pressed against a disc rotating at constant speed. The pin traces a circular track of diameter D. Load, speed, sliding distance, counterface material and roughness, temperature and humidity are controlled, because wear is a system property, not a material property. Wear is measured by weighing the pin before and after the test, or continuously by an LVDT that follows the pin’s height loss.</p>
    <h3>Archard’s law</h3><p>Contact occurs at asperities, so the real contact area is A<sub>r</sub> ≈ F<sub>N</sub>/H. If each asperity contact has a probability K of producing a wear particle, the volume worn per unit distance is proportional to A<sub>r</sub>:</p><div class="eq">V = K F_N s / H        k = V/(F_N s) = K/H</div>
    <p>K ranges from about 10⁻⁷ (lubricated, mild) to 10⁻² (severe adhesive wear of like metals). For dry sliding, K below about 10⁻⁴ usually indicates <b>mild oxidative wear</b> with a protective oxide layer; higher values indicate <b>severe wear</b> with metallic debris, delamination and material transfer.</p>
    <h3>Friction</h3><p>The friction force is measured by a load cell restraining the pin arm. During <b>running-in</b> the contact conforms, asperities are flattened and transfer and oxide films form; μ usually rises to a peak and then settles to a steady-state value. Steady-state μ for unlubricated metals on steel is typically 0.3–0.7.</p>
    <h3>Metal matrix composites</h3><p>Hard ceramic reinforcements such as SiC in aluminium raise hardness and carry part of the load, reducing adhesion and wear rate, often by a factor of 2–5. At high loads, particle fracture and three-body abrasion by detached particles can reverse the benefit (mild-to-severe transition).</p>`,
    procedure: ['Clean pin and disc in acetone (ultrasonic bath), dry, and weigh the pin to 0.1 mg.', 'Measure pin diameter; mount the disc and set the track diameter.', 'Calculate the disc speed N = 60v/(πD) and set it.', 'Mount the pin perpendicular to the disc, apply the dead-weight load and zero the friction and LVDT channels.', 'Start the test and log friction force and wear continuously for the set duration.', 'Stop, remove the pin, clean off loose debris and re-weigh.', 'Examine the worn pin surface and the track; calculate wear and friction parameters.'],
    precautions: ['Pin face must be flat and perpendicular to the disc to avoid edge loading.', 'Weigh only after cleaning and drying, at room temperature.', 'Do not touch the specimen with bare fingers after cleaning.', 'Keep the track diameter within the flat region of the disc; use a fresh track for each test.', 'Record ambient humidity; it changes oxidative wear behaviour.'],
    applications: ['Selection of materials for bearings, bushes, brake pads and cylinder liners.', 'Evaluating coatings and surface treatments.', 'Development of metal matrix composites for automotive brake rotors and pistons.', 'Data generation for machine-learning wear prediction models (triboinformatics).'],
    errors: ['Balance readability compared with small mass loss (use longer distances if Δm is below 1 mg).', 'Debris adhering to the pin or material transferred from the disc (mass gain).', 'Pin misalignment causing edge contact.', 'Vibration of the loading arm affecting friction signal.', 'Temperature rise at the contact at high speed and load.'],
    discussion: ['Describe the friction history. What happens during running-in?', 'Is your wear in the mild or severe regime? Support with K and the appearance of the worn surface.', 'Compare k for the Al alloy and the Al–SiC composite. Explain the role of SiC.', 'Why should wear results always be reported with the test conditions?'],
    refs: ['ASTM G99-23, Standard Test Method for Wear and Friction Testing with a Pin-on-Disk or Ball-on-Disk Apparatus.', 'ASTM G40-22, Standard Terminology Relating to Wear and Erosion.', 'J. F. Archard, J. Appl. Phys. 24 (1953) 981–988.', 'I. M. Hutchings, P. Shipway, Tribology: Friction and Wear of Engineering Materials, 2nd ed., Butterworth-Heinemann, 2017.', 'K. Kato, K. Adachi, Wear mechanisms, in Modern Tribology Handbook, CRC Press, 2001.'],
    pre: [
      { q: 'According to Archard’s law, wear volume is proportional to', o: ['Hardness', 'Load × sliding distance / hardness', 'Speed only', 'Friction coefficient squared'], a: 1, why: 'V = K F s / H.' },
      { q: 'Specific wear rate is expressed in', o: ['mm³', 'mm³/N·m', 'g/min', 'N/m'], a: 1, why: 'Volume per unit load per unit distance.' },
      { q: 'The sliding distance in a pin-on-disc test is', o: ['πDN t', 'D t', 'N t', 'πD'], a: 0, why: 'Circumference × revolutions.' },
      { q: 'Coefficient of friction is', o: ['F_N / F_f', 'F_f / F_N', 'F_f × F_N', 'V / F'], a: 1, why: 'Friction force over normal load.' },
      { q: 'Before weighing, pins are cleaned in', o: ['Water', 'Acetone', 'Oil', 'Acid'], a: 1, why: 'Removes grease without leaving residue.' }
    ],
    post: [
      { q: 'A pin loses 4.0 mg of aluminium (ρ = 2.70 g/cm³). Volume loss is', o: ['0.148 mm³', '1.48 mm³', '14.8 mm³', '10.8 mm³'], a: 1, why: '4.0 × 10⁻³ g / 2.70 g/cm³ = 1.48 × 10⁻³ cm³ = 1.48 mm³.' },
      { q: 'Your friction coefficient peaked early and then fell to a steady value. The early peak is due to', o: ['Measurement error', 'Running-in: asperity removal and film formation', 'Disc heating only', 'Lubricant'], a: 1, why: 'Contact conformity and transfer layers develop.' },
      { q: 'An Archard coefficient of 3 × 10⁻³ indicates', o: ['Mild oxidative wear', 'Severe adhesive wear', 'Lubricated wear', 'No wear'], a: 1, why: 'K > 10⁻⁴ generally indicates severe wear.' },
      { q: 'Adding SiC particles to aluminium usually reduces wear because', o: ['It lowers density', 'It raises hardness and the particles carry load', 'It increases friction', 'It lowers melting point'], a: 1, why: 'Hard particles resist ploughing and adhesion.' },
      { q: 'If the pin gains mass after testing, the most likely reason is', o: ['Negative wear', 'Material transferred from the disc or oxide adhered', 'Balance drift only', 'Hardening'], a: 1, why: 'Transfer and oxidation can mask mass loss; use LVDT volume as a check.' }
    ]
  });
})();
