(function () {
  const U = LAB.U, G = LAB.G;
  const R = 8.314;
  const MAT = {
    pb: { name: 'Lead wire (99.9% Pb)', Tm: 600, n: 6.2, Q: 109000, s0: 5.0, rate0: 1.4e-5, T0: 298, temps: [25, 40, 60], sig: [4.0, 5.0, 6.0], ef: 0.42, ref: [4, 8] },
    sn: { name: 'Sn–37Pb solder wire', Tm: 456, n: 5.5, Q: 80000, s0: 6.0, rate0: 1.0e-5, T0: 298, temps: [25, 50, 75], sig: [5.0, 6.0, 7.2], ef: 0.5, ref: [4, 8] },
    al: { name: 'Aluminium 1100-O wire', Tm: 933, n: 4.6, Q: 142000, s0: 20, rate0: 8e-6, T0: 523, temps: [200, 250, 300], sig: [16, 20, 25], ef: 0.35, ref: [3.5, 5.5] }
  };
  LAB.register({
    id: 'creep', no: 8, cat: 'mech', title: 'Creep Test', std: 'IS 3407 / ASTM E139 / ISO 204', short: 'Constant-load creep of lead, solder or aluminium at several stresses: three creep stages, minimum creep rate, Norton exponent and Larson–Miller parameter.', tags: 'creep rupture norton larson miller monkman grant high temperature', advanced: true,
    aim: 'To study the creep behaviour of a metal at homologous temperature above 0.4 T_m under constant load, determine the minimum creep rate at three stress levels, and evaluate the Norton stress exponent and the Larson–Miller parameter.',
    objectives: ['Record creep strain against time to rupture at three stresses.', 'Identify primary, secondary and tertiary creep stages.', 'Determine the minimum (steady-state) creep rate and the Norton exponent n.', 'Calculate the Larson–Miller parameter and the Monkman–Grant constant.'],
    apparatus: ['Lever-arm creep frame (three stations), constant-load dead weights', 'Furnace or water/oil bath with PID control (±1 °C)', 'LVDT extensometer, resolution 0.001 mm, with data logger', 'Wire specimens, gauge length 100 mm', 'Thermocouple (type K)'],
    stdNote: 'Lead and Sn–Pb solder have T/T_m ≈ 0.5–0.65 at room temperature, so creep can be observed within one laboratory session.',
    params: [
      { id: 'mat', label: 'Material', type: 'select', options: Object.entries(MAT).map(([k, v]) => [k, v.name]), def: 'pb' },
      { id: 'ti', label: 'Test temperature', type: 'select', options: [['0', 'Low'], ['1', 'Medium'], ['2', 'High']], def: '0', hint: 'Actual values depend on the material (see specimen table).' }
    ],
    opSteps: ['Measure wire diameter; mark 100 mm gauge', 'Mount in three stations; soak at temperature', 'Apply dead weights smoothly', 'Log instantaneous strain', 'Log strain–time through primary and secondary stages', 'Tertiary creep and rupture', 'Record rupture time and elongation'],
    svg(p) {
      let st = ''; [0, 1, 2].forEach(i => { const x = 90 + i * 140; st += `${G.r(x - 30, 40, 60, 14, 'mach')}${G.l(x, 54, x, 64, 'ln', 2)}<g id="w${i}">${G.r(x - 3, 64, 6, 120, 'spec')}${G.r(x - 22, 184, 44, 30 + i * 8, 'straw', 'rx="2"')}</g><path id="b${i}" class="lnb" stroke-width="3" d=""/>${G.t(x - 30, 270, '', 'm', `id="t${i}"`)}`; });
      return G.svg('0 0 520 300', `${G.r(0, 0, 520, 300, 'bg')}${G.r(40, 60, 440, 150, 'surf', 'rx="6" opacity=".35"')}${G.r(30, 240, 460, 16, 'mach', 'rx="3"')}${G.r(20, 30, 480, 12, 'mach')}${st}${G.t(380, 80, '', 'm', 'id="tt"')}`, 'Three-station creep frame');
    },
    anim(svg, f, sim) {
      if (!sim) return; const tt = f * sim.tmax;
      sim.curves.forEach((c, i) => { const done = tt >= c.tr; const e = done ? c.e[c.e.length - 1] : U.interp(c.t, c.e, tt); const L = 120 * (1 + e * 1.2); const x = 90 + i * 140;
        G.set(svg, 'w' + i, 'transform', `translate(0,0)`); const g = svg.querySelector('#w' + i); if (g) { g.children[0].setAttribute('height', done ? L * 0.5 : L); g.children[1].setAttribute('y', done ? 214 : 64 + L); }
        G.set(svg, 'b' + i, 'd', done ? `M${x - 4} ${64 + L * 0.5} L${x + 4} ${64 + L * 0.5}` : ''); G.txt(svg, 't' + i, `σ=${U.f(c.s, 1)} MPa ε=${U.f(e * 100, 1)}%`); });
      G.txt(svg, 'tt', `t = ${U.f(tt / 60, 1)} min · ${sim.Tc} °C`);
    },
    simulate(p, r) {
      const M = MAT[p.mat]; const Tc = M.temps[p.ti]; const TK = Tc + 273.15; const A = M.rate0 / (Math.pow(M.s0, M.n) * Math.exp(-M.Q / (R * M.T0)));
      const d = U.q(2.0 + 0.005 * U.gauss(r), 0.01); const area = Math.PI * d * d / 4; const L0 = 100;
      const curves = M.sig.map(s0 => {
        const s = s0; const W = U.q(s * area / 9.81, 0.01); const sAct = W * 9.81 / area;
        const rate = A * Math.pow(sAct, M.n) * Math.exp(-M.Q / (R * TK)) * Math.pow(10, 0.06 * U.gauss(r));
        const C = 0.1 + 0.02 * r(); const tr = C / rate * 2.2; const e0 = sAct / (M.name.startsWith('Al') ? 60000 : 14000); const ep = 0.012 + 0.004 * r(); const tau = tr * 0.05;
        const t = [], e = []; const N = 180; for (let i = 0; i <= N; i++) { const ti = tr * (1 - Math.pow(1 - i / N, 1.6)) * 0.995; let ev = e0 + ep * (1 - Math.exp(-ti / tau)) - rate * tr * 0.45 * Math.log(1 - ti / tr) / 0.45; t.push(ti); e.push(ev); }
        // scale so that rupture strain ≈ ef
        const last = e[e.length - 1]; const ef = M.ef * (0.9 + 0.2 * r()); if (last > ef) { /* clip at rupture strain */ let k = e.findIndex(v => v > ef); if (k > 0) { t.length = k + 1; e.length = k + 1; } }
        return { s: sAct, W, rate, tr: t[t.length - 1], t, e };
      });
      // observation tables: strain at equal time intervals (LVDT extension in mm)
      const obs = curves.map((c, i) => { const n = 12; const rows = []; for (let k = 0; k <= n; k++) { const tt = c.tr * k / n; const ev = U.interp(c.t, c.e, tt); rows.push([U.f(tt / 60, 1), U.f(ev * L0, 3), U.f(ev * 100, 3)]); } return { title: `Table ${i + 1}. Station ${i + 1}: σ = ${U.f(c.s, 2)} MPa (W = ${U.f(c.W, 2)} kg)`, cols: ['Time (min)', 'Extension (mm)', 'Strain (%)'], rows, raw: rows }; });
      // truth: minimum creep rate from tabulated values (min slope between consecutive rows), per hour
      const mins = obs.map(o => { let m = 1e9; for (let k = 1; k < o.rows.length; k++) { const de = (+o.rows[k][2] - +o.rows[k - 1][2]) / 100, dt = (+o.rows[k][0] - +o.rows[k - 1][0]) / 60; if (dt > 0) m = Math.min(m, de / dt); } return m; });
      const trs = curves.map(c => U.q(c.tr / 3600, 0.01));
      const fit = U.linfit(curves.map(c => Math.log10(c.s)), mins.map(Math.log10));
      const T = { mins, n: fit.m, trs, TK, LMP: TK * (20 + Math.log10(trs[1])), MG: mins[1] * trs[1], s: curves.map(c => c.s), d, area };
      const tmax = Math.max(...curves.map(c => c.tr));
      return {
        curves, tmax, Tc, dur: 10, M,
        readout(f) { const tt = f * tmax; return [['Elapsed', U.f(tt / 60, 1), 'min'], ...curves.map((c, i) => [`Station ${i + 1} ε`, tt >= c.tr ? 'RUPTURED' : U.f(U.interp(c.t, c.e, tt) * 100, 2), tt >= c.tr ? '' : '%']), ['Temperature', Tc, '°C']]; },
        plot: { title: 'Creep curves', xlabel: 'Time (min)', ylabel: 'Creep strain (%)', parallel: true, series: curves.map((c, i) => ({ name: `σ = ${U.f(c.s, 1)} MPa`, x: c.t.map(v => v / 60), y: c.e.map(v => v * 100), color: 's' + (i + 1) })), caption: 'Creep strain against time at three stresses' },
        plotFrac(f) { return f; },
        plots: [{ xlabel: 'Stress σ (MPa)', ylabel: 'Minimum creep rate (1/h)', xlog: true, ylog: true, series: [{ name: `Test data, n = ${U.f(fit.m, 2)}`, x: T.s, y: mins, type: 'linepts', color: 's1' }], caption: 'Norton plot: log minimum creep rate against log stress' }],
        specimen: [['Material', M.name, ''], ['Wire diameter d', U.f(d, 2), 'mm'], ['Area', U.f(area, 3), 'mm²'], ['Gauge length', L0, 'mm'], ['Test temperature', `${Tc} °C (${U.f(TK, 1)} K)`, ''], ['Homologous temperature T/T_m', U.f(TK / M.Tm, 3), ''], ['Rupture times (h)', trs.map(v => U.f(v, 2)).join(', '), 'h']],
        obs, truth: T
      };
    },
    calcs(sim) {
      const T = sim.truth; const a = T.mins.map((m, i) => ({ key: 'm' + i, label: `Minimum creep rate, station ${i + 1}`, unit: '1/h', truth: m, tol: 0.15, hint: 'smallest Δε/Δt between table rows', fmt: v => U.sci(v, 3) }));
      a.push({ key: 'n', label: 'Norton stress exponent n', unit: '—', truth: T.n, tol: 0.08, hint: 'slope of log ε̇_min vs log σ' }, { key: 'lmp', label: 'Larson–Miller parameter, station 2', unit: 'K·(log h)', truth: T.LMP, tol: 0.006, hint: 'T(K) × (20 + log t_r)' }, { key: 'mg', label: 'Monkman–Grant constant, station 2', unit: '—', truth: T.MG, tol: 0.18, hint: 'ε̇_min × t_r' });
      return a;
    },
    reference(sim) { const T = sim.truth, M = sim.M; return [{ label: 'Norton exponent n (dislocation creep)', unit: '', value: T.n, lo: M.ref[0], hi: M.ref[1], src: 'Frost & Ashby deformation maps' }, { label: 'Monkman–Grant constant', unit: '', value: T.MG, lo: 0.05, hi: 0.5, src: 'Typical 0.05–0.5' }, { label: 'Homologous temperature', unit: '', value: T.TK / M.Tm, lo: 0.4, hi: 1, src: 'Creep significant above 0.4 T_m' }]; },
    sample(sim) { const T = sim.truth; const o = sim.obs[1].rows; return `<div class="eq">Station 2 (σ = ${U.f(T.s[1], 2)} MPa): smallest slope in Table 2 between successive rows gives ε̇_min = <b>${U.sci(T.mins[1], 3)} h⁻¹</b></div><div class="eq">Norton: log ε̇ = log A′ + n log σ. Least squares on (${T.s.map((s, i) => `${U.f(Math.log10(s), 3)}, ${U.f(Math.log10(T.mins[i]), 3)}`).join('; ')}) → <b>n = ${U.f(T.n, 2)}</b></div><div class="eq">LMP = T(C + log t_r) = ${U.f(T.TK, 1)} × (20 + log ${U.f(T.trs[1], 2)}) = <b>${U.f(T.LMP, 0)}</b><br>Monkman–Grant: ε̇_min·t_r = ${U.sci(T.mins[1], 3)} × ${U.f(T.trs[1], 2)} = <b>${U.f(T.MG, 3)}</b></div>`; void o; },
    uncert(sim) { const T = sim.truth; return [{ q: 'Applied stress', expr: '√[(u_W/W)² + (2u_d/d)²]', val: T.s[1], u: T.s[1] * Math.hypot(0.005 / Math.sqrt(3) / 1, 2 * 0.01 / Math.sqrt(12) / T.d), unit: 'MPa' }, { q: 'Minimum creep rate', expr: 'slope of two readings, u(ε) = 0.001 mm/100 mm', val: T.mins[1], u: T.mins[1] * 0.05, unit: '1/h' }]; },
    conclude(sim) { const T = sim.truth; return `${sim.M.name} at ${sim.Tc} °C (T/T_m = ${U.f(T.TK / sim.M.Tm, 2)}) showed all three creep stages at each stress. The minimum creep rate rose from ${U.sci(T.mins[0], 2)} to ${U.sci(T.mins[2], 2)} h⁻¹ as stress increased, giving a Norton exponent n = ${U.f(T.n, 1)}, which indicates dislocation (power-law) creep. The Larson–Miller parameter for the middle stress is ${U.f(T.LMP, 0)} and the Monkman–Grant constant is ${U.f(T.MG, 2)}.`; },
    summary: 'Creep is time-dependent plastic deformation under constant stress at temperatures above about 0.4 of the absolute melting temperature. A creep curve shows an instantaneous strain, a primary stage of decreasing rate (work hardening dominates), a secondary steady-state stage where hardening and recovery balance, and a tertiary stage of accelerating strain due to necking and cavity growth ending in rupture. The steady-state rate follows the Norton–Arrhenius law ε̇ = Aσⁿ exp(−Q/RT). Rupture data at different temperatures are combined with the Larson–Miller parameter T(C + log t_r).',
    formulas: [['Norton–Arrhenius law', 'ε̇_ss = A σⁿ exp(−Q/RT)'], ['Stress exponent', 'n = Δ log ε̇ / Δ log σ'], ['Larson–Miller parameter', 'LMP = T (C + log t_r), C ≈ 20'], ['Monkman–Grant relation', 'ε̇_min · t_r = C_MG'], ['Homologous temperature', 'T/T_m (absolute)']],
    theory: `<h3>What creep is</h3><p>At low temperature a metal loaded below its yield strength deforms elastically and stays put. Above about 0.4 T<sub>m</sub> (in kelvin) atoms diffuse fast enough for dislocations to climb past obstacles and for grain boundaries to slide, so the metal keeps deforming under constant load. Turbine blades, boiler tubes, steam pipes, solder joints and lead sheathing are designed against creep.</p>
    <h3>The creep curve</h3><p>Under constant load the strain–time curve has three stages after the instantaneous elastic strain:</p><ol><li><b>Primary</b>: the creep rate falls as the dislocation substructure hardens.</li><li><b>Secondary (steady state)</b>: hardening and recovery balance; the rate is constant and minimum. Designers use this rate.</li><li><b>Tertiary</b>: the rate accelerates because the cross-section reduces and internal cavities grow and link; the specimen ruptures.</li></ol>
    <h3>Stress and temperature dependence</h3><div class="eq">ε̇_ss = A σⁿ exp(−Q/RT)</div><p>The stress exponent n identifies the mechanism: n ≈ 1 for diffusional creep (Nabarro–Herring, Coble) at low stress, n ≈ 3–8 for dislocation (power-law) creep. The activation energy Q is usually close to that for self-diffusion. Plotting log ε̇ against log σ at constant temperature gives n as the slope.</p>
    <h3>Rupture life prediction</h3><p>Creep tests that last the full design life (10⁵ h for power plants) are impractical, so short tests at higher temperature are extrapolated using time–temperature parameters. The Larson–Miller parameter LMP = T(C + log t<sub>r</sub>) with C ≈ 20 (t<sub>r</sub> in hours) is the most common: all stress-rupture data fall on one master curve of stress against LMP. The Monkman–Grant relation ε̇<sub>min</sub>·t<sub>r</sub> = constant links the steady-state rate with rupture life.</p>
    <h3>Why lead and solder</h3><p>Lead melts at 600 K, so room temperature is already 0.5 T<sub>m</sub>. Creep that would need 600 °C in steel happens at 25 °C in lead within an hour. Tin–lead solder (T<sub>m</sub> = 456 K) is at 0.65 T<sub>m</sub> at room temperature, which is why solder joints in electronics creep and fatigue.</p>`,
    procedure: ['Measure wire diameter at several places; mark a 100 mm gauge length.', 'Mount the specimens in the three stations and fit the LVDTs.', 'Bring the bath or furnace to the test temperature and soak for 15 minutes.', 'Apply the dead weights smoothly without impact; start the data logger.', 'Record extension at regular time intervals until rupture.', 'Record rupture time and total elongation for each station.', 'Plot strain against time; find the minimum creep rate from the straight portion.'],
    precautions: ['Apply load without shock; impact adds a spurious instantaneous strain.', 'Maintain temperature within ±1 °C; creep rate changes by several percent per degree.', 'Lead is toxic: wear gloves and wash hands.', 'Protect the set-up from vibration.'],
    applications: ['Design of gas turbine blades and discs.', 'Boiler and steam pipe life assessment (remaining life by LMP).', 'Solder joint reliability in electronics.', 'Lead sheathing and roofing; polymer creep in pipes.'],
    errors: ['Temperature fluctuation.', 'Load application shock.', 'Choice of points for slope of secondary stage.', 'Specimen diameter variation.', 'LVDT drift.'],
    discussion: ['Explain the mechanisms responsible for each of the three creep stages.', 'What does your value of n suggest about the creep mechanism?', 'Why can lead be creep-tested at room temperature but steel cannot?', 'Use your LMP to estimate how long the specimen would last at 20 °C lower temperature at the same stress.'],
    refs: ['ASTM E139-11(2018), Standard Test Methods for Conducting Creep, Creep-Rupture, and Stress-Rupture Tests of Metallic Materials.', 'ISO 204:2018, Metallic Materials — Uniaxial Creep Testing in Tension.', 'H. J. Frost, M. F. Ashby, Deformation-Mechanism Maps, Pergamon, 1982.', 'F. R. Larson, J. Miller, Trans. ASME 74 (1952) 765–775.', 'G. E. Dieter, Mechanical Metallurgy, McGraw-Hill, Ch. 13.'],
    pre: [
      { q: 'Creep becomes significant in metals above about', o: ['0.1 T_m', '0.4 T_m', '0.9 T_m', 'Room temperature always'], a: 1, why: 'Diffusion-assisted processes become active.' },
      { q: 'The stage of creep used for design is', o: ['Primary', 'Secondary (steady state)', 'Tertiary', 'Instantaneous'], a: 1, why: 'Constant, minimum rate.' },
      { q: 'A creep test is normally conducted at constant', o: ['Strain', 'Strain rate', 'Load (or stress) and temperature', 'Crosshead speed'], a: 2, why: 'Dead-weight loading at fixed temperature.' },
      { q: 'Lead creeps at room temperature because', o: ['It is soft', 'Room temperature is about 0.5 of its absolute melting point', 'It is BCC', 'It is impure'], a: 1, why: '298/600 ≈ 0.5.' },
      { q: 'The Larson–Miller parameter combines', o: ['Stress and strain', 'Temperature and rupture time', 'Hardness and strength', 'Load and area'], a: 1, why: 'LMP = T(C + log t_r).' }
    ],
    post: [
      { q: 'Your log ε̇ vs log σ plot had slope 5.5. This indicates', o: ['Diffusional creep', 'Dislocation (power-law) creep', 'Grain boundary melting', 'Elastic behaviour'], a: 1, why: 'n ≈ 3–8 for dislocation climb.' },
      { q: 'Tertiary creep is caused mainly by', o: ['Work hardening', 'Necking and growth of internal cavities', 'Recovery', 'Elastic strain'], a: 1, why: 'Damage accumulation accelerates strain.' },
      { q: 'If n = 5, doubling the stress changes the minimum creep rate by a factor of', o: ['2', '10', '32', '5'], a: 2, why: '2⁵ = 32.' },
      { q: 'The Monkman–Grant relation states that', o: ['ε̇_min·t_r ≈ constant', 'σ·t_r = constant', 'LMP = constant', 'n = 1'], a: 0, why: 'Higher minimum rate → proportionally shorter life.' },
      { q: 'Raising test temperature at the same stress will', o: ['Lower the creep rate', 'Raise the creep rate exponentially', 'Not change it', 'Cause elastic recovery'], a: 1, why: 'Arrhenius term exp(−Q/RT).' }
    ]
  });
})();
