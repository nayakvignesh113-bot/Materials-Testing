(function () {
  const U = LAB.U, G = LAB.G;
  const MAT = {
    ms: { name: 'Mild steel IS 2062 E250 (BR)', us: 110, ls: 6, T0: -15, C: 16, izod: 75, ref: [60, 150] },
    c45: { name: 'Medium-carbon steel C45, normalised', us: 48, ls: 4, T0: 15, C: 18, izod: 30, ref: [25, 60] },
    al: { name: 'Aluminium alloy 6061-T6', us: 18, ls: 15, T0: -200, C: 200, izod: 16, fcc: 1, ref: [12, 26] },
    cu: { name: 'Copper, annealed', us: 62, ls: 58, T0: -300, C: 300, izod: 55, fcc: 1, ref: [45, 80] },
    ss: { name: 'Austenitic stainless steel 304', us: 210, ls: 190, T0: -300, C: 400, izod: 150, fcc: 1, ref: [150, 250] },
    ci: { name: 'Grey cast iron FG 200', us: 4, ls: 3, T0: 20, C: 60, izod: 3, ref: [2, 8] }
  };
  const TEMPS = [-60, -40, -20, 0, 20, 50, 100];
  LAB.register({
    id: 'impact', no: 6, cat: 'mech', title: 'Impact Test (Izod and Charpy)', std: 'IS 1757 (Part 1):2020 Charpy / IS 1598:1977 Izod / ASTM E23', short: 'Pendulum impact energy of notched bars: Izod at room temperature and a Charpy temperature sweep to find the ductile-to-brittle transition.', tags: 'toughness charpy izod DBTT pendulum notch',
    aim: 'To determine the impact energy absorbed by notched specimens using Izod and Charpy pendulum tests, and to determine the ductile-to-brittle transition temperature of steel from a Charpy temperature sweep.',
    objectives: ['Determine energy absorbed from pendulum rise angle, correcting for friction losses.', 'Calculate impact strength of notched specimens.', 'Plot energy and fracture appearance against temperature and locate the DBTT and FATT.', 'Contrast the behaviour of BCC steels with FCC alloys.'],
    apparatus: ['Pendulum impact tester: Charpy 300 J (release angle 140°), Izod 168 J (release angle 90°)', 'Charpy V-notch specimens 10 × 10 × 55 mm, 2 mm × 45° notch', 'Izod V-notch specimens 10 × 10 × 75 mm', 'Conditioning bath (alcohol + dry ice / liquid nitrogen; heated oil) with thermometer', 'Specimen tongs, notch gauge, centring device'],
    stdNote: 'IS 1757 / ASTM E23 require the specimen to be struck within 5 s of removal from the bath.',
    params: [
      { id: 'mat', label: 'Material', type: 'select', options: Object.entries(MAT).map(([k, v]) => [k, v.name]), def: 'ms' },
      { id: 'mode', label: 'Test', type: 'select', options: [['charpy', 'Charpy V — temperature sweep (7 specimens)'], ['izod', 'Izod V — room temperature (3 specimens)']], def: 'charpy' }
    ],
    opSteps: ['Free swing: record friction loss angle', 'Condition specimen at test temperature', 'Place specimen (notch away from striker for Charpy, facing striker for Izod)', 'Release pendulum; read rise angle', 'Record energy and fracture appearance', 'Repeat for each specimen', 'Plot energy against temperature'],
    svg(p) {
      return G.svg('0 0 520 340', `${G.r(0, 0, 520, 340, 'bg')}${G.r(60, 300, 400, 22, 'mach', 'rx="3"')}${G.r(244, 40, 32, 262, 'steel')}<circle cx="260" cy="60" r="10" class="mach"/>
        <path d="M260 60 m-110 0 a110 110 0 0 0 220 0" class="lnm" stroke-dasharray="3 4" fill="none"/>
        <g id="arm"><line x1="260" y1="60" x2="260" y2="230" class="ln" stroke-width="5"/><circle cx="260" cy="240" r="24" class="mach"/>${G.r(253, 254, 14, 10, 'steelD')}</g>
        <g id="spg">${p.mode === 'izod' ? G.r(278, 230, 10, 70, 'spec') + G.r(272, 268, 22, 34, 'mach2') : G.r(220, 266, 80, 10, 'spec') + G.r(214, 276, 10, 24, 'mach2') + G.r(296, 276, 10, 24, 'mach2')}</g>
        <g id="pcs"></g>
        <g transform="translate(16,20)">${G.r(0, 0, 150, 92, 'disp', 'rx="4"')}${G.t(10, 16, 'ENERGY J', 'm', 'style="fill:var(--panel-ink);font-size:8px"')}${G.t(10, 38, '—', 'big', 'id="dE"')}${G.t(84, 16, 'ANGLE °', 'm', 'style="fill:var(--panel-ink);font-size:8px"')}${G.t(84, 38, '—', 'big', 'id="dA"')}${G.t(10, 60, 'TEMP °C', 'm', 'style="fill:var(--panel-ink);font-size:8px"')}${G.t(10, 80, '—', 'big', 'id="dT"')}${G.t(84, 60, 'SPECIMEN', 'm', 'style="fill:var(--panel-ink);font-size:8px"')}${G.t(84, 80, '—', 'big', 'id="dS"')}</g>
        ${G.t(340, 30, '', 'm', 'id="lab"')}`, 'Pendulum impact tester');
    },
    anim(svg, f, sim, p) {
      const izod = (sim ? sim.mode : p.mode) === 'izod';
      if (!sim) { G.set(svg, 'arm', 'transform', `rotate(${izod ? 90 : 140} 260 60)`); return; }
      const n = sim.list.length; const k = Math.min(n - 1, Math.floor(f * n)); const t = f * n - k; const s = sim.list[k]; const al = sim.alpha;
      let ang; if (t < 0.15) ang = al; else if (t < 0.45) ang = al - (al) * U.ease((t - 0.15) / 0.3); else if (t < 0.75) ang = -s.beta * U.ease((t - 0.45) / 0.3); else ang = -s.beta;
      G.set(svg, 'arm', 'transform', `rotate(${ang} 260 60)`);
      const hit = t >= 0.45; G.show(svg, 'spg', !hit); const pc = svg.querySelector('#pcs');
      if (pc) pc.innerHTML = hit ? (s.E > sim.full * 0.4 ? (izod ? G.r(278, 236, 10, 34, 'spec', 'transform="rotate(-30 283 268)"') + G.r(272, 268, 22, 34, 'mach2') : `<path d="M222 270 L258 266 L262 276 L226 280 Z" class="spec"/><path d="M262 268 L298 260 L302 270 L266 278 Z" class="spec"/>`) : (izod ? G.r(286, 180 + 60 * (t - .45), 10, 30, 'spec', `transform="rotate(${200 * t} 291 200)"`) + G.r(272, 268, 22, 34, 'mach2') : G.r(200 - 60 * (t - .45), 250 - 40 * (t - .45), 36, 10, 'spec') + G.r(300 + 60 * (t - .45), 250 - 40 * (t - .45), 36, 10, 'spec'))) : '';
      G.txt(svg, 'dE', t > 0.75 ? U.f(s.E, 1) : '—'); G.txt(svg, 'dA', t > 0.75 ? U.f(s.beta, 1) : U.f(Math.abs(ang), 0)); G.txt(svg, 'dT', s.T); G.txt(svg, 'dS', (k + 1) + '/' + n);
      G.txt(svg, 'lab', t > 0.75 ? (s.shear > 70 ? 'Ductile: fibrous, shear lips' : s.shear > 25 ? 'Mixed fracture' : 'Brittle: crystalline, flat') : 'Striking…');
    },
    simulate(p, r) {
      const M = MAT[p.mode === 'izod' ? p.mat : p.mat]; const izod = p.mode === 'izod';
      const E0 = izod ? 168 : 300, alpha = izod ? 90 : 140; const WR = E0 / (1 - Math.cos(alpha * Math.PI / 180));
      const beta0 = U.q(alpha - 0.35 - 0.15 * r(), 0.1); // free-swing rise angle
      const Eloss = WR * (Math.cos(beta0 * Math.PI / 180) - Math.cos(alpha * Math.PI / 180));
      const energy = T => izod ? M.izod : M.ls + (M.us - M.ls) / 2 * (1 + Math.tanh((T - M.T0) / M.C));
      const shearPct = T => M.fcc ? 100 : M.us < 10 ? 0 : U.clamp(100 / 2 * (1 + Math.tanh((T - (M.T0 + 8)) / (M.C * 0.9))), 0, 100);
      const temps = izod ? [27, 27, 27] : TEMPS;
      const list = temps.map(T => { const Ea = Math.max(1, energy(T) * (1 + (izod ? 0.05 : 0.07) * U.gauss(r))); const cb = Math.cos(alpha * Math.PI / 180) + (Ea + Eloss) / WR; const beta = U.q(Math.acos(U.clamp(cb, -1, 1)) * 180 / Math.PI, 0.1); const Erec = WR * (Math.cos(beta * Math.PI / 180) - Math.cos(beta0 * Math.PI / 180)); const sh = U.clamp(U.q(shearPct(T) + 6 * U.gauss(r), 5), 0, 100); const le = U.q(Math.max(0, Erec * 0.0155 + 0.03 * U.gauss(r)), 0.01); return { T, beta, E: Erec, shear: M.fcc ? 100 : sh, le }; });
      const A = 80; // mm² below notch
      const Tr = { WR, beta0, Eloss, list, A, izod, E0, alpha };
      if (izod) { Tr.mean = U.mean(list.map(s => s.E)); Tr.is = Tr.mean / A; Tr.E1 = list[0].E; }
      else { const Es = list.map(s => s.E); const us = Math.max(...Es), ls = Math.min(...Es); Tr.us = us; Tr.ls = ls; Tr.mid = (us + ls) / 2; Tr.dbtt = U.inv(temps, Es, Tr.mid); Tr.fatt = U.inv(temps, list.map(s => s.shear), 50); Tr.E20 = list.find(s => s.T === 20).E; Tr.is20 = Tr.E20 / A; Tr.T27J = U.inv(temps, Es, 27);
        if (!isFinite(Tr.dbtt)) Tr.dbtt = null; if (!isFinite(Tr.fatt)) Tr.fatt = null; if (!isFinite(Tr.T27J)) Tr.T27J = null; }
      const xs = list.map(s => s.T), ys = list.map(s => s.E);
      const plot = izod ? { title: 'Izod energy', xlabel: 'Specimen number', ylabel: 'Energy absorbed (J)', series: [{ name: 'Izod energy', x: [1, 2, 3], y: ys, type: 'bar', color: 's1', bw: 40 }], xmin: 0, xmax: 4, caption: 'Izod impact energy of three specimens' } :
        { title: 'Charpy transition curve', xlabel: 'Test temperature (°C)', ylabel: 'Absorbed energy KV (J)', series: [{ name: 'KV₂ energy', x: xs, y: ys, type: 'linepts', color: 's1' }], hlines: M.fcc || M.us < 10 ? [] : [{ y: 27, label: '27 J criterion', color: 'muted' }], caption: 'Charpy V-notch absorbed energy against temperature' };
      const plots = izod ? [] : [{ xlabel: 'Test temperature (°C)', ylabel: 'Shear fracture (%)', series: [{ name: 'Shear fracture appearance', x: xs, y: list.map(s => s.shear), type: 'linepts', color: 's2' }], ymin: 0, ymax: 100, caption: 'Fracture appearance (percent shear) against temperature' }, { xlabel: 'Test temperature (°C)', ylabel: 'Lateral expansion (mm)', series: [{ name: 'Lateral expansion', x: xs, y: list.map(s => s.le), type: 'linepts', color: 's3' }], caption: 'Lateral expansion against temperature' }];
      return {
        mode: p.mode, alpha, list, full: E0, dur: list.length * 1.6, M,
        readout(f) { const n = list.length; const k = Math.min(n - 1, Math.floor(f * n)); const t = f * n - k; const s = list[k]; return [['Specimen', `${k + 1} / ${n}`, ''], ['Temperature', s.T, '°C'], ['Rise angle β', t > .75 || f >= 1 ? U.f(s.beta, 1) : '—', '°'], ['Energy', t > .75 || f >= 1 ? U.f(s.E, 1) : '—', 'J'], ['Shear fracture', t > .75 || f >= 1 ? s.shear : '—', '%']]; },
        plot, plots, plotFrac: f => f,
        specimen: [['Material', M.name, ''], ['Test', izod ? 'Izod, V-notch, cantilever' : 'Charpy, V-notch (KV₂), simply supported', ''], ['Specimen size', izod ? '10 × 10 × 75 mm' : '10 × 10 × 55 mm', ''], ['Area below notch', '8 × 10 = 80', 'mm²'], ['Pendulum capacity E₀', E0, 'J'], ['Release angle α', alpha, '°'], ['Free-swing rise angle β₀', U.f(beta0, 1), '°']],
        obs: [{ title: izod ? 'Table 1. Izod readings' : 'Table 1. Charpy readings', cols: ['Specimen', 'Temperature (°C)', 'Rise angle β (°)', 'Dial energy (J)', 'Shear fracture (%)', 'Lateral expansion (mm)'], rows: list.map((s, i) => [i + 1, s.T, U.f(s.beta, 1), U.f(s.E, 1), s.shear, U.f(s.le, 2)]), note: 'Dial energy is already corrected for friction. Specimen 1 rise angle can be used to check the dial reading.' }],
        truth: Tr
      };
    },
    calcs(sim) {
      const T = sim.truth; const a = [{ key: 'WR', label: 'Pendulum constant WR', unit: 'J', truth: T.WR, tol: 0.005, hint: `E₀/(1 − cos α), α = ${T.alpha}°` }, { key: 'loss', label: 'Friction and windage loss', unit: 'J', truth: T.Eloss, abs: Math.max(0.05, T.Eloss * 0.08), hint: 'WR(cos β₀ − cos α)' }, { key: 'E1', label: 'Energy absorbed by specimen 1 (from β)', unit: 'J', truth: T.list[0].E, tol: 0.02, abs: undefined, hint: 'WR(cos β − cos β₀)' }];
      a[2].abs = Math.max(0.3, T.list[0].E * 0.02);
      if (T.izod) a.push({ key: 'mean', label: 'Mean Izod energy', unit: 'J', truth: T.mean, tol: 0.01, hint: 'mean of three' }, { key: 'is', label: 'Izod impact strength', unit: 'J/mm²', truth: T.is, tol: 0.015, hint: 'mean energy / 80 mm²' });
      else {
        a.push({ key: 'is20', label: 'Impact strength at 20 °C', unit: 'J/mm²', truth: T.is20, tol: 0.015, hint: 'KV(20 °C) / 80' }, { key: 'us', label: 'Upper-shelf energy (highest value)', unit: 'J', truth: T.us, tol: 0.01, hint: 'max KV' });
        if (T.dbtt != null && !sim.M.fcc && sim.M.us - sim.M.ls > 15) a.push({ key: 'dbtt', label: 'DBTT (mid-energy temperature)', unit: '°C', truth: T.dbtt, abs: 4, hint: 'T at (US + LS)/2, linear interpolation' });
        if (T.fatt != null && !sim.M.fcc && sim.M.us > 10) a.push({ key: 'fatt', label: 'FATT (50% shear)', unit: '°C', truth: T.fatt, abs: 4, hint: 'T at 50% shear, interpolation' });
        if (T.T27J != null && !sim.M.fcc && sim.M.us > 30) a.push({ key: 't27', label: 'T₂₇J (27 J transition temperature)', unit: '°C', truth: T.T27J, abs: 4, hint: 'T where KV = 27 J' });
      }
      return a;
    },
    reference(sim) { const T = sim.truth, M = sim.M; const E = T.izod ? T.mean : T.E20; const o = [{ label: T.izod ? 'Izod energy (RT)' : 'Charpy KV at 20 °C', unit: 'J', value: E, lo: T.izod ? M.ref[0] * 0.6 : M.ref[0], hi: T.izod ? M.ref[1] * 0.75 : M.ref[1], src: 'ASM Vol. 1 / IS 2062' }]; if (!T.izod && sim.M.name.startsWith('Mild')) o.push({ label: 'IS 2062 E250 BR: KV at RT ≥ 27 J', unit: 'J', value: T.E20, lo: 27, hi: 400, src: 'IS 2062:2011 Table 2' }); return o; },
    sample(sim) { const T = sim.truth, s = sim.list[0]; return `<div class="eq">WR = E₀/(1 − cos α) = ${T.E0}/(1 − cos ${T.alpha}°) = <b>${U.f(T.WR, 2)} J</b></div><div class="eq">Loss = WR(cos β₀ − cos α) = ${U.f(T.WR, 2)}(cos ${U.f(T.beta0, 1)}° − cos ${T.alpha}°) = <b>${U.f(T.Eloss, 2)} J</b></div><div class="eq">Specimen 1: E = WR(cos β − cos β₀) = ${U.f(T.WR, 2)}(cos ${U.f(s.beta, 1)}° − cos ${U.f(T.beta0, 1)}°) = <b>${U.f(s.E, 1)} J</b></div>
      ${T.izod ? `<div class="eq">Mean = <b>${U.f(T.mean, 2)} J</b>; impact strength = ${U.f(T.mean, 2)}/80 = <b>${U.f(T.is, 4)} J/mm²</b> (= ${U.f(T.is * 100, 2)} J/cm²)</div>` : `<div class="eq">KV(20 °C) = ${U.f(T.E20, 1)} J; impact strength = ${U.f(T.E20, 1)}/80 = <b>${U.f(T.is20, 4)} J/mm²</b><br>Upper shelf = ${U.f(T.us, 1)} J, lower shelf = ${U.f(T.ls, 1)} J; mid-energy = ${U.f(T.mid, 1)} J${T.dbtt != null ? ` → DBTT ≈ <b>${U.f(T.dbtt, 1)} °C</b>` : ''}${T.fatt != null ? `; FATT (50% shear) ≈ <b>${U.f(T.fatt, 1)} °C</b>` : ''}${T.T27J != null ? `; T₂₇J ≈ <b>${U.f(T.T27J, 1)} °C</b>` : ''}</div>`}`; },
    uncert(sim) { const T = sim.truth, s = sim.list[0]; const ub = 0.1 / Math.sqrt(12) * Math.PI / 180; const uE = T.WR * Math.hypot(Math.sin(s.beta * Math.PI / 180) * ub, Math.sin(T.beta0 * Math.PI / 180) * ub); const rows = [{ q: 'Energy, specimen 1 (reading)', expr: 'WR·√[(sin β u_β)² + (sin β₀ u_β)²]', val: s.E, u: uE, unit: 'J' }]; if (T.izod) rows.push({ q: 'Mean Izod energy (type A)', expr: 's/√n', val: T.mean, u: U.sd(sim.list.map(x => x.E)) / Math.sqrt(3), unit: 'J' }); else rows.push({ q: 'KV scatter (typical, ASTM E23)', expr: '±7% between specimens', val: T.E20, u: T.E20 * 0.07, unit: 'J' }); return rows; },
    conclude(sim) { const T = sim.truth, M = sim.M; if (T.izod) return `The mean Izod energy of ${M.name} is ${U.f(T.mean, 1)} J (impact strength ${U.f(T.is * 100, 2)} J/cm²).`;
      if (M.fcc) return `${M.name} absorbed ${U.f(T.ls, 0)}–${U.f(T.us, 0)} J over −60 to 100 °C with fully fibrous fractures and no transition. FCC metals have many slip systems and a yield stress that is almost independent of temperature, so they do not become brittle at low temperature.`;
      return `${M.name} showed a ductile-to-brittle transition: energy fell from an upper shelf of ${U.f(T.us, 0)} J to a lower shelf of ${U.f(T.ls, 0)} J${T.dbtt != null ? `, with a mid-energy transition temperature of about ${U.f(T.dbtt, 0)} °C` : ''}${T.fatt != null ? ` and FATT of ${U.f(T.fatt, 0)} °C` : ''}. Fracture changed from fibrous with shear lips to flat and crystalline. The steel should not be used below its transition temperature in impact or notch-sensitive service.`; },
    summary: 'Impact tests measure the energy a notched bar absorbs when broken by a swinging pendulum at high strain rate. The energy equals the loss of potential energy of the pendulum, WR(cos β − cos α), corrected for friction measured in a free swing. The notch creates triaxial stress that suppresses plastic flow and promotes cleavage. BCC steels show a ductile-to-brittle transition because their yield stress rises steeply as temperature falls while the cleavage stress does not; FCC metals do not. The transition is described by the mid-energy temperature, the 27 J temperature and the 50% fracture-appearance transition temperature (FATT).',
    formulas: [['Pendulum constant', 'WR = E₀ / (1 − cos α)'], ['Energy absorbed', 'E = WR(cos β − cos α) − loss'], ['Friction loss (free swing)', 'loss = WR(cos β₀ − cos α)'], ['Hence', 'E = WR(cos β − cos β₀)'], ['Impact strength', 'I = E / A_notch'], ['Transition curve fit', 'E(T) = LS + (US − LS)/2 · [1 + tanh((T − T₀)/C)]']],
    theory: `<h3>Why impact testing</h3><p>A tensile test is slow and uses a smooth specimen. Many failures (ships, pipelines, pressure vessels, bridges) occurred by brittle fracture in steels that were ductile in the tensile test. The cause was the combination of a notch, high loading rate and low temperature. Impact tests reproduce all three in a simple, cheap test.</p>
    <h3>Energy from the pendulum</h3><p>The pendulum of weight W and effective arm R is released from angle α. After breaking the specimen it rises to angle β on the other side. The energy absorbed is the loss of potential energy:</p><div class="eq">E = WR(cos β − cos α)</div><p>Some energy is lost to bearing friction and air drag. A free swing without a specimen gives rise angle β₀ &lt; α, so the corrected energy is E = WR(cos β − cos β₀). Modern machines apply this correction on the dial.</p>
    <h3>Izod and Charpy</h3><p>In the <b>Izod</b> test the specimen is a vertical cantilever clamped at the notch, struck on the notch side 22 mm above it. In the <b>Charpy</b> test the specimen is a simply supported beam (40 mm span) struck behind the notch. Charpy is easier to cool or heat because the specimen is placed rather than clamped, so it is used for temperature sweeps.</p>
    <h3>Ductile-to-brittle transition</h3><p>Body-centred cubic metals such as ferritic steel have a yield stress that rises sharply as temperature falls (dislocation motion needs thermal activation to overcome the Peierls stress). The cleavage fracture stress changes little. Below a certain temperature the material reaches the cleavage stress before it can yield, and it breaks in a brittle manner with little energy. The energy–temperature curve is S-shaped, with an <b>upper shelf</b> (ductile, fibrous fracture), a <b>lower shelf</b> (cleavage, crystalline fracture) and a transition region. Face-centred cubic metals (aluminium, copper, austenitic stainless steel) have no such transition.</p>
    <div class="eq">E(T) = LS + (US − LS)/2 · [1 + tanh((T − T₀)/C)]<span class="w">T₀ = mid-energy transition temperature; C sets the width of the transition.</span></div>
    <p>Three criteria are used: the mid-energy temperature, the temperature at which energy is 27 J (used in IS 2062 and EN 10025 steel grades), and the <b>FATT</b>, at which half the fracture surface is fibrous. Fine grain size, low carbon and phosphorus, and nickel additions lower the transition temperature.</p>`,
    procedure: ['Check the pendulum: release it with no specimen and record the free-swing rise angle β₀.', 'Measure specimen dimensions and check the notch with a notch gauge.', 'Condition each Charpy specimen in the bath at the test temperature for at least 10 minutes.', 'Transfer the specimen to the anvils with centring tongs and strike it within 5 s.', 'For Izod, clamp the specimen vertically with the notch at the vise top, facing the striker.', 'Release the pendulum; read the rise angle and energy.', 'Examine the fracture surface: estimate percentage shear (fibrous) area and measure lateral expansion.', 'Repeat for all temperatures and plot energy and percentage shear against temperature.'],
    precautions: ['Stand outside the swing path; engage the safety catch while placing specimens.', 'Handle cold or hot specimens with tongs and gloves.', 'Strike within 5 s of removal from the bath to limit temperature change.', 'Centre the notch on the striker line using the centring device.', 'Do not catch the swinging pendulum by hand; use the brake.'],
    applications: ['Material qualification for pressure vessels, pipelines, ships and offshore structures.', 'Grading of structural steels (IS 2062 grades A, BR, B0, C).', 'Weld procedure qualification (weld metal and HAZ toughness).', 'Monitoring embrittlement (temper embrittlement, neutron irradiation surveillance).'],
    errors: ['Temperature change between bath and strike.', 'Specimen not centred on the anvils.', 'Notch geometry variation (root radius strongly affects energy).', 'Reading error of the dial or rise angle.', 'Scatter within the transition region is inherently high (±20%).'],
    discussion: ['Why does mild steel show a ductile-to-brittle transition while aluminium does not?', 'Compare the DBTT and FATT you obtained. Why are they not identical?', 'Why is the impact energy not a design property like yield strength?', 'Suggest two metallurgical changes that would lower the transition temperature of your steel.'],
    refs: ['IS 1757 (Part 1):2020, Metallic Materials — Charpy Pendulum Impact Test, BIS.', 'IS 1598:1977, Method for Izod Impact Test of Steel, BIS.', 'ASTM E23-18, Standard Test Methods for Notched Bar Impact Testing of Metallic Materials.', 'IS 2062:2011, Hot Rolled Medium and High Tensile Structural Steel, BIS.', 'T. L. Anderson, Fracture Mechanics, 4th ed., CRC Press, Ch. 7.'],
    pre: [
      { q: 'Impact energy absorbed in a pendulum test is calculated from', o: ['Specimen hardness', 'Loss in potential energy of the pendulum', 'Kinetic energy of fragments', 'Notch depth'], a: 1, why: 'E = WR(cos β − cos α).' },
      { q: 'In the Charpy test the specimen is supported as', o: ['A cantilever', 'A simply supported beam', 'A column', 'A ring'], a: 1, why: 'Charpy = three-point bending; Izod = cantilever.' },
      { q: 'The ductile-to-brittle transition is characteristic of', o: ['FCC metals', 'BCC metals', 'All metals equally', 'Polymers only'], a: 1, why: 'BCC yield stress rises steeply at low temperature.' },
      { q: 'The purpose of the notch is to', o: ['Make machining easy', 'Create triaxial stress and localise fracture', 'Reduce cost', 'Measure hardness'], a: 1, why: 'Constraint at the notch raises local stress and promotes brittleness.' },
      { q: 'Units of impact strength are', o: ['J', 'J/mm²', 'N/mm²', 'N·m/s'], a: 1, why: 'Energy per notched area.' }
    ],
    post: [
      { q: 'For WR = 170 J, β₀ = 139.6° and β = 60°, the absorbed energy E = WR(cos β − cos β₀) is about', o: ['85 J', '130 J', '215 J', '300 J'], a: 2, why: '170 × (0.5 + 0.7615) = 214.5 J.' },
      { q: 'At the lower shelf, the fracture surface of steel is', o: ['Fibrous with shear lips', 'Flat and crystalline (cleavage)', 'Cup and cone', 'Covered with striations'], a: 1, why: 'Cleavage facets reflect light and look bright and granular.' },
      { q: 'Your aluminium 6061 specimens gave nearly the same energy at −60 °C and 100 °C because', o: ['The test failed', 'FCC metals do not show a ductile–brittle transition', 'The notch was missing', 'Aluminium is brittle'], a: 1, why: 'Many slip systems and a temperature-insensitive yield stress.' },
      { q: 'Which change lowers the DBTT of a steel?', o: ['Grain refinement', 'Higher phosphorus', 'Coarse grains', 'Higher carbon'], a: 0, why: 'Grain refinement raises cleavage resistance more than yield stress.' },
      { q: 'IS 2062 specifies a minimum Charpy energy of 27 J because', o: ['It is a design stress', 'It is an empirical toughness criterion correlated with service performance', 'It equals upper shelf', 'It is the machine capacity'], a: 1, why: 'Developed from Liberty-ship fracture experience.' }
    ]
  });
})();
