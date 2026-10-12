(function () {
  const U = LAB.U, G = LAB.G;
  const MAT = {
    ms: { name: 'Mild steel flat', E: 205000, sy: 260, b: 25, h: 6, ref: [195, 215] },
    al: { name: 'Aluminium 6061-T6 flat', E: 69000, sy: 276, b: 25, h: 6, ref: [66, 72] },
    br: { name: 'Brass flat', E: 105000, sy: 200, b: 25, h: 6, ref: [95, 115] },
    wd: { name: 'Teak wood beam (to failure)', E: 12000, mor: 105, b: 25, h: 25, wood: 1, ref: [9, 15], mref: [85, 125] }
  };
  LAB.register({
    id: 'bending', no: 5, cat: 'mech', title: 'Bending (Flexure) Test', std: 'IS 1599:2019 (bend test) / ASTM E855 / IS 1708 (Part 5) for timber', short: 'Load–deflection of simply supported and cantilever beams: Young’s modulus from deflection, bending stress and modulus of rupture.', tags: 'beam deflection flexure modulus of rupture cantilever simply supported',
    aim: 'To determine the Young’s modulus of a beam material from load–deflection measurements on a simply supported (central load) or cantilever beam, and to determine the modulus of rupture of timber by loading to failure.',
    objectives: ['Measure deflection under increasing and decreasing loads within the elastic range.', 'Calculate E from beam deflection theory and check linearity and hysteresis.', 'Calculate the maximum bending stress and compare it with yield strength.', 'Determine the modulus of rupture of timber in three-point bending.'],
    apparatus: ['Beam test rig with knife-edge supports (span adjustable) and cantilever clamp', 'Slotted weights and hanger (0.5 kg steps); UTM with three-point bend fixture for timber', 'Dial gauge, range 25 mm, LC 0.01 mm, on magnetic stand', 'Vernier calliper (LC 0.02 mm) and steel rule'],
    stdNote: 'ASTM E855 covers bend tests for elastic modulus of flat metallic specimens; IS 1708 (Part 5) covers static bending of timber.',
    params: [
      { id: 'mat', label: 'Beam material', type: 'select', options: Object.entries(MAT).map(([k, v]) => [k, v.name]), def: 'ms' },
      { id: 'sup', label: 'Support condition', type: 'select', options: [['ss', 'Simply supported, central load'], ['cant', 'Cantilever, end load']], def: 'ss', hint: 'Timber is always tested simply supported in the UTM.' },
      { id: 'L', label: 'Span / cantilever length', type: 'select', options: [['300', '300 mm'], ['400', '400 mm'], ['600', '600 mm']], def: '600' }
    ],
    opSteps: ['Measure b and h at three points', 'Set span; place beam on supports', 'Set dial gauge at load point; zero it', 'Add weights in steps; read deflection', 'Remove weights in steps; read deflection', 'Check recovery to zero', 'Compute E for each load'],
    svg(p) {
      const cant = p.sup === 'cant' && p.mat !== 'wd';
      return G.svg('0 0 520 300', `${G.r(0, 0, 520, 300, 'bg')}${G.r(30, 240, 460, 20, 'mach', 'rx="3"')}
        ${cant ? G.r(40, 90, 50, 150, 'mach', 'rx="3"') + G.r(40, 112, 70, 26, 'steelD') : `<path d="M70 150 L84 178 L56 178 Z" class="steelD"/><path d="M450 150 L464 178 L436 178 Z" class="steelD"/>${G.r(52, 178, 36, 62, 'mach2')}${G.r(432, 178, 36, 62, 'mach2')}`}
        <path id="beam" class="spec" d=""/>
        <g id="hang">${G.l(0, 0, 0, 40, 'ln', 2)}${G.r(-16, 40, 32, 8, 'steelD')}<g id="wts"></g></g>
        <g id="dial">${G.l(0, -70, 0, -14, 'lnm', 2)}<circle cx="0" cy="-84" r="16" class="surf" stroke="var(--ink)"/><line id="ndl" x1="0" y1="-84" x2="0" y2="-97" class="lnb" stroke-width="2"/></g>
        <path id="crack" class="lnb" stroke-width="2.5" d=""/>
        <g transform="translate(360,22)">${G.r(0, 0, 140, 62, 'disp', 'rx="4"')}${G.t(10, 16, 'LOAD N', 'm', 'style="fill:var(--panel-ink);font-size:8px"')}${G.t(10, 38, '0.0', 'big', 'id="dL"')}${G.t(76, 16, 'DEFL. mm', 'm', 'style="fill:var(--panel-ink);font-size:8px"')}${G.t(76, 38, '0.00', 'big', 'id="dD"')}${G.t(10, 54, '', 'm', 'id="lab" style="fill:var(--panel-ink)"')}</g>`, 'Beam bending rig');
    },
    anim(svg, f, sim, p) {
      const cant = sim ? sim.cant : (p.sup === 'cant' && p.mat !== 'wd'); const a = sim ? sim.at(f) : { P: 0, d: 0, phase: 'Ready', w: 0, broken: false };
      const th = sim && sim.M.wood ? 18 : 10; const x0 = cant ? 110 : 60, x1 = cant ? 470 : 460; const vis = Math.min(40, a.d * (sim && sim.M.wood ? 2.2 : 6));
      const lp = cant ? x1 : (x0 + x1) / 2; const yT = 140;
      const tp = [], bp = []; const N = 40;
      for (let i = 0; i <= N; i++) { const x = x0 + (x1 - x0) * i / N; const s = (x - x0) / (x1 - x0); const shape = cant ? (s * s * (3 - s)) / 2 : (s <= .5 ? (3 * s - 4 * s * s * s) : (3 * (1 - s) - 4 * Math.pow(1 - s, 3))); const yy = yT + vis * shape; tp.push(x + ' ' + yy); bp.push(x + ' ' + (yy + th)); }
      G.set(svg, 'beam', 'd', 'M' + tp.join(' L') + ' L' + bp.reverse().join(' L') + ' Z');
      G.set(svg, 'hang', 'transform', `translate(${lp},${yT + vis + th})`); G.set(svg, 'dial', 'transform', `translate(${cant ? lp - 30 : lp + 30},${yT + vis * 0.95})`);
      G.set(svg, 'ndl', 'transform', `rotate(${(a.d * 36) % 360} 0 -84)`);
      const nw = sim && !sim.M.wood ? Math.round(a.w) : 0; let wts = ''; for (let k = 0; k < nw; k++) wts += G.r(-14, 48 + k * 7, 28, 6, k % 2 ? 'straw' : 'steelD'); G.set(svg, 'wts', 'innerHTML', ''); const wg = svg.querySelector('#wts'); if (wg) wg.innerHTML = wts;
      G.set(svg, 'crack', 'd', a.broken ? `M${lp - 4} ${yT + vis + th} L${lp + 2} ${yT + vis + th * 0.4} L${lp - 3} ${yT + vis + 2}` : '');
      G.txt(svg, 'dL', U.f(a.P, 1)); G.txt(svg, 'dD', U.f(a.d, 2)); G.txt(svg, 'lab', a.phase);
    },
    simulate(p, r) {
      const M = MAT[p.mat]; const cant = p.sup === 'cant' && !M.wood; const L = p.L;
      const bm = [0, 1, 2].map(() => U.q(M.b + 0.02 * U.gauss(r), 0.02)), hm = [0, 1, 2].map(() => U.q(M.h + 0.015 * U.gauss(r), 0.02));
      const b = U.mean(bm), hh = U.mean(hm), I = b * hh * hh * hh / 12, y = hh / 2; const E = M.E * (1 + 0.02 * U.gauss(r));
      const k = cant ? 3 * E * I / (L * L * L) : 48 * E * I / (L * L * L); // N/mm
      const T = { b, h: hh, I, L, cant };
      if (!M.wood) {
        const Mlim = 0.6 * M.sy * I / y; const Pmax = cant ? Mlim / L : 4 * Mlim / L; // keep within 60% of yield
        const stepKg = U.clamp(Math.floor(Pmax / 9.81 / 6 * 2) / 2, 0.5, 10); const n = U.clamp(Math.floor(Pmax / (stepKg * 9.81)), 3, 8);
        const rows = [], Ls = [], ds = [], dsU = [];
        for (let i = 0; i <= n; i++) { const P = i * stepKg * 9.81; const dl = U.q(P / k + 0.004 * U.gauss(r), 0.01); Ls.push(P); ds.push(Math.max(0, dl)); }
        for (let i = 0; i <= n; i++) { const P = Ls[i]; dsU.push(Math.max(0, U.q(P / k * 1.004 + 0.0025 * (n - i > 0 && i > 0 ? 1 : 0) + 0.004 * U.gauss(r), 0.01))); }
        dsU[0] = U.q(Math.abs(0.004 * U.gauss(r)), 0.01);
        for (let i = 0; i <= n; i++) rows.push([i + 1, U.f(i * stepKg, 1), U.f(Ls[i], 2), U.f(ds[i], 2), U.f(dsU[i], 2), U.f((ds[i] + dsU[i]) / 2, 3)]);
        const mean = ds.map((d, i) => (d + dsU[i]) / 2);
        const fit = U.linfit(mean.slice(1), Ls.slice(1)); // P = k δ  -> slope k (approx through origin)
        const kz = Ls.slice(1).reduce((s, P, i) => s + P * mean[i + 1], 0) / mean.slice(1).reduce((s, d) => s + d * d, 0);
        T.k = kz; T.E = (cant ? kz * L * L * L / (3 * I) : kz * L * L * L / (48 * I)) / 1000;
        const Pm = Ls[n]; T.Pm = Pm; T.dm = mean[n]; T.Mmax = cant ? Pm * L : Pm * L / 4; T.smax = T.Mmax * y / I; T.Elast = (cant ? Pm * L * L * L / (3 * I * mean[n]) : Pm * L * L * L / (48 * I * mean[n])) / 1000;
        T.hyst = Math.max(...ds.map((d, i) => Math.abs(dsU[i] - d)));
        const seqX = [...ds, ...dsU.slice().reverse()], seqY = [...Ls, ...Ls.slice().reverse()];
        return {
          M, cant, dur: 8,
          at(f) { const N = seqX.length; const i = Math.min(N - 1, Math.floor(f * N)); const w = i <= n ? i : 2 * n + 1 - i; return { P: seqY[i], d: seqX[i], w: w * stepKg / 0.5 / 2, phase: i <= n ? 'Loading' : 'Unloading' }; },
          readout(f) { const a = this.at(f); return [['Load', U.f(a.P, 2), 'N'], ['Deflection', U.f(a.d, 2), 'mm'], ['Bending moment', U.f((cant ? a.P * L : a.P * L / 4) / 1000, 2), 'N·m'], ['Outer fibre σ', U.f((cant ? a.P * L : a.P * L / 4) * y / I, 1), 'MPa'], ['Stage', a.phase, '']]; },
          plot: { title: 'Load–deflection', xlabel: 'Deflection δ (mm)', ylabel: 'Load P (N)', series: [{ name: 'Loading', x: ds, y: Ls, type: 'linepts', color: 's1' }, { name: 'Unloading', x: dsU, y: Ls, type: 'linepts', color: 's2', dash: true }], caption: 'Load–deflection during loading and unloading' },
          specimen: [['Material', M.name, ''], ['Width b (3 readings)', bm.map(v => U.f(v, 2)).join(', '), 'mm'], ['Depth h (3 readings)', hm.map(v => U.f(v, 2)).join(', '), 'mm'], [cant ? 'Cantilever length L' : 'Span L', L, 'mm'], ['Support', cant ? 'Cantilever, load at free end' : 'Simply supported, central point load', ''], ['Weight step', stepKg + ' kg (g = 9.81 m/s²)', '']],
          obs: [{ title: 'Table 1. Load–deflection (dial gauge at load point)', cols: ['Sl. no.', 'Mass (kg)', 'Load P (N)', 'δ loading (mm)', 'δ unloading (mm)', 'Mean δ (mm)'], rows }],
          truth: T, fit
        };
      }
      // timber to failure in UTM (3-point)
      const mor = M.mor * (1 + 0.05 * U.gauss(r)); const Pf = mor * 2 * b * hh * hh / (3 * L); const dpl = 0.6 * Pf / k;
      const xs = [], ys = []; const df = Pf / k * 1.35;
      for (let i = 0; i <= 200; i++) { const d = df * i / 200; const P = d < dpl ? k * d : Math.min(k * d, Pf * (1 - Math.pow(1 - (d - dpl) / (df - dpl), 2) * 0.4) ); xs.push(d); ys.push(P); }
      xs.push(df * 1.01); ys.push(Pf * 0.25);
      const el = []; const st = U.q(Pf * 0.5 / 5, 10); for (let i = 0; i <= 5; i++) { const P = i * st; el.push([P, U.q(P / k + 0.01 * U.gauss(r), 0.01) * (i ? 1 : 0)]); }
      const kz = el.slice(1).reduce((s, v) => s + v[0] * v[1], 0) / el.slice(1).reduce((s, v) => s + v[1] * v[1], 0);
      T.k = kz; T.E = kz * L * L * L / (48 * I) / 1000; T.Pf = U.q(Math.max(...ys), 1); T.mor = 3 * T.Pf * L / (2 * b * hh * hh); T.dm = U.q(xs[ys.indexOf(Math.max(...ys))], 0.01);
      T.Ppl = U.q(k * dpl, 1); T.fpl = 3 * T.Ppl * L / (2 * b * hh * hh);
      const rows = []; for (let i = 0; i < xs.length; i += 12) rows.push([U.f(xs[i], 2), U.f(ys[i], 0)]);
      return {
        M, cant: false, dur: 8,
        at(f) { const i = Math.min(xs.length - 1, Math.floor(f * (xs.length - 1))); return { P: ys[i], d: xs[i], w: 0, broken: f >= 1, phase: f >= 1 ? 'Failed (tension side)' : xs[i] < dpl ? 'Elastic' : 'Non-linear' }; },
        readout(f) { const a = this.at(f); return [['Load', U.f(a.P, 0), 'N'], ['Deflection', U.f(a.d, 2), 'mm'], ['Outer fibre σ', U.f(1.5 * a.P * L / (b * hh * hh), 1), 'MPa'], ['Stage', a.phase, '']]; },
        plot: { title: 'Load–deflection', xlabel: 'Deflection δ (mm)', ylabel: 'Load P (N)', series: [{ name: 'Load–deflection', x: xs, y: ys, color: 's1' }], caption: 'Three-point bending of teak to failure' },
        specimen: [['Material', M.name, ''], ['Width b', bm.map(v => U.f(v, 2)).join(', '), 'mm'], ['Depth h', hm.map(v => U.f(v, 2)).join(', '), 'mm'], ['Span L', L, 'mm'], ['Moisture content', '12 ± 1', '%'], ['Loading rate', '2.5 mm/min', '']],
        obs: [{ title: 'Table 1. Elastic readings', cols: ['Sl. no.', 'Load P (N)', 'Deflection δ (mm)'], rows: el.map((v, i) => [i + 1, U.f(v[0], 0), U.f(v[1], 2)]) },
        { title: 'Table 2. Key readings', cols: ['Reading', 'Value', 'Unit'], textCols: [0, 2], rows: [['Load at limit of proportionality (from graph)', U.f(T.Ppl, 0), 'N'], ['Maximum load P_max', U.f(T.Pf, 0), 'N'], ['Deflection at maximum load', U.f(T.dm, 2), 'mm'], ['Failure', 'Splintering tension on bottom face', '']] },
        { title: 'Table 3. Load–deflection record', cols: ['δ (mm)', 'P (N)'], rows }],
        truth: T, el
      };
    },
    calcs(sim) {
      const T = sim.truth; const a = [{ key: 'I', label: 'Second moment of area I', unit: 'mm⁴', truth: T.I, tol: 0.012, hint: 'b h³ / 12' }, { key: 'E', label: 'Young’s modulus E (best fit of all readings)', unit: 'GPa', truth: T.E, tol: 0.04, hint: T.cant ? 'E = (P/δ) L³/(3I)' : 'E = (P/δ) L³/(48I)' }];
      if (!sim.M.wood) a.push({ key: 'Elast', label: 'E from the maximum load reading alone', unit: 'GPa', truth: T.Elast, tol: 0.03, hint: 'same formula, last row' }, { key: 'smax', label: 'Maximum bending stress', unit: 'MPa', truth: T.smax, tol: 0.015, hint: 'σ = M·y/I, M = ' + (T.cant ? 'PL' : 'PL/4') }, { key: 'hyst', label: 'Maximum loading–unloading difference', unit: 'mm', truth: T.hyst, abs: 0.006, hint: 'max |δ_unload − δ_load|' });
      else a.push({ key: 'fpl', label: 'Fibre stress at limit of proportionality', unit: 'MPa', truth: T.fpl, tol: 0.015, hint: '3P_pl L/(2bh²)' }, { key: 'mor', label: 'Modulus of rupture', unit: 'MPa', truth: T.mor, tol: 0.015, hint: 'MOR = 3P_max L/(2bh²)' });
      return a;
    },
    reference(sim) { const T = sim.truth, M = sim.M; const o = [{ label: 'Young’s modulus', unit: 'GPa', value: T.E, lo: M.ref[0], hi: M.ref[1], src: M.wood ? 'IS 399 (teak)' : 'ASM Handbook' }]; if (M.wood) o.push({ label: 'Modulus of rupture', unit: 'MPa', value: T.mor, lo: M.mref[0], hi: M.mref[1], src: 'IS 399 (teak, 12% MC)' }); else o.push({ label: 'Max. bending stress / yield', unit: '', value: T.smax / M.sy, lo: 0, hi: 1, src: 'Must stay < 1 for elastic test' }); return o; },
    sample(sim) { const T = sim.truth; const f = T.cant ? 3 : 48; return `<div class="eq">b̄ = ${U.f(T.b, 3)} mm, h̄ = ${U.f(T.h, 3)} mm;  I = b h³/12 = ${U.f(T.b, 3)} × ${U.f(T.h, 3)}³ / 12 = <b>${U.f(T.I, 1)} mm⁴</b></div>
      <div class="eq">Stiffness by least squares through origin: k = ΣPδ/Σδ² = ${U.f(T.k, 3)} N/mm<br>E = k L³ / (${f} I) = ${U.f(T.k, 3)} × ${T.L}³ / (${f} × ${U.f(T.I, 1)}) = ${U.f(T.E * 1000, 0)} MPa = <b>${U.f(T.E, 2)} GPa</b></div>
      ${!sim.M.wood ? `<div class="eq">At P = ${U.f(T.Pm, 2)} N: M = ${T.cant ? 'PL' : 'PL/4'} = ${U.f(T.Mmax, 0)} N·mm; σ = M(h/2)/I = ${U.f(T.Mmax, 0)} × ${U.f(T.h / 2, 3)} / ${U.f(T.I, 1)} = <b>${U.f(T.smax, 1)} MPa</b><br>E from last reading = ${U.f(T.Elast, 2)} GPa</div>` : `<div class="eq">MOR = 3 P_max L/(2bh²) = 3 × ${U.f(T.Pf, 0)} × ${T.L} / (2 × ${U.f(T.b, 2)} × ${U.f(T.h, 2)}²) = <b>${U.f(T.mor, 1)} MPa</b></div>`}`; },
    uncert(sim) { const T = sim.truth; const ub = 0.02 / Math.sqrt(12); const uI = Math.hypot(ub / T.b, 3 * ub / T.h); const ud = 0.01 / Math.sqrt(12); return [{ q: 'I', expr: '√[(u_b/b)² + (3u_h/h)²]', val: T.I, u: T.I * uI, unit: 'mm⁴' }, { q: 'E', expr: '√[(3u_L/L)² + (u_I/I)² + (u_δ/δ)²]', val: T.E, u: T.E * Math.hypot(3 * 1 / Math.sqrt(12) / T.L, uI, ud / (T.dm || 1)), unit: 'GPa' }]; },
    conclude(sim) { const T = sim.truth; return sim.M.wood ? `Teak in three-point bending gave E = ${U.f(T.E, 1)} GPa and a modulus of rupture of ${U.f(T.mor, 0)} MPa. Failure started on the tension face by splintering of fibres after a non-linear stage caused by compressive crushing on the top face.` : `${sim.M.name} gave a linear load–deflection response with E = ${U.f(T.E, 1)} GPa. Loading and unloading readings agreed within ${U.f(T.hyst, 2)} mm and the beam returned to zero, confirming that the maximum bending stress (${U.f(T.smax, 0)} MPa) stayed below yield.`; },
    summary: 'A beam under transverse load bends; for small elastic deflections the Euler–Bernoulli theory gives the deflection at the load point as δ = PL³/(48EI) for a simply supported beam with central load and δ = PL³/(3EI) for a cantilever with end load. Measuring δ for known loads therefore gives E. The bending stress varies linearly across the depth, σ = My/I, with the maximum at the outer fibres. For timber loaded to failure the elastic flexure formula applied to the maximum load gives the modulus of rupture, MOR = 3PL/(2bh²).',
    formulas: [['Flexure formula', 'M/I = σ/y = E/R'], ['Second moment, rectangle', 'I = b h³ / 12'], ['Deflection, simply supported, central load', 'δ = P L³ / (48 E I)'], ['Deflection, cantilever, end load', 'δ = P L³ / (3 E I)'], ['Max moment', 'M = PL/4 (SS) ;  M = PL (cantilever)'], ['Modulus of rupture (3-point)', 'MOR = 3 P L / (2 b h²)']],
    theory: `<h3>Beam bending</h3><p>A beam carries load by bending: fibres on one side shorten, those on the other lengthen, and the neutral axis is unstrained. For a linearly elastic beam with plane sections remaining plane, the flexure formula applies:</p><div class="eq">M / I = σ / y = E / R</div>
    <p>Integrating the curvature 1/R = M/(EI) twice with the boundary conditions gives the deflection. For the two set-ups used here:</p><div class="eq">Simply supported, central load:  δ_max = P L³ / (48 E I)<br>Cantilever, end load:  δ_max = P L³ / (3 E I)</div>
    <p>Since P, L, I and δ are measured, E follows. This method is useful when a specimen is too stiff or too small for an extensometer, and it is the basis of ASTM E855.</p>
    <h3>Linearity and hysteresis</h3><p>Loading in steps and unloading in the same steps checks that the beam is elastic: the readings should agree and the dial should return to zero. A difference indicates friction at supports, settlement, or local yielding. The maximum stress should be kept well below the yield strength (here ≤ 60%).</p>
    <h3>Shear deflection</h3><p>Euler–Bernoulli theory ignores shear deformation. For slender beams (L/h &gt; 20) the error is below 1%; for deep beams Timoshenko theory adds a shear term proportional to PL/(κGA).</p>
    <h3>Modulus of rupture</h3><p>Timber and brittle materials are often tested to failure in bending. Applying the elastic flexure formula to the maximum load gives the modulus of rupture. Because wood is weaker in compression than in tension parallel to the grain, the top fibres yield first, the neutral axis moves down, and final failure starts in tension on the bottom face. MOR is therefore a convenient index rather than a true stress.</p>`,
    procedure: ['Measure width and depth of the beam at three locations and take the mean.', 'Set the required span (or cantilever length) and place the beam on the supports.', 'Place the load hanger at mid-span (or at the free end) and position the dial gauge directly over the load point; set it to zero.', 'Add weights in equal steps and record the dial reading after each step once the needle is steady.', 'Remove weights in the same steps and record the readings again.', 'For timber, place the specimen in the three-point fixture of the UTM and load to failure at a constant rate, recording load and deflection.', 'Calculate E for each reading and from the slope of the load–deflection line.'],
    precautions: ['Place the load and dial gauge exactly at mid-span for the simply supported case.', 'Avoid impact when adding weights; lower them gently.', 'Keep the maximum stress below yield; check with σ = My/I before the test.', 'Ensure supports are knife-edges that allow free rotation.', 'Tap the dial gauge lightly before reading to overcome stiction.'],
    applications: ['Design of beams, shafts and floor joists for stiffness.', 'Determining E of composites and brittle materials (three- and four-point bending, ASTM D790).', 'Grading of structural timber by stiffness.', 'Leaf spring design.'],
    errors: ['Error in depth h, which enters E cubed.', 'Support settlement and indentation at knife edges.', 'Dial gauge not positioned exactly at the load point.', 'Friction at supports causing hysteresis.', 'Self-weight of hanger not accounted for.'],
    discussion: ['Why does an error in depth h affect E more than an error in width b?', 'What do your loading and unloading readings tell you about the elastic behaviour of the beam?', 'Compare E from bending with E from the tensile test (Exp. 1). Explain any difference.', 'Why is MOR not a true fracture stress for timber?'],
    refs: ['IS 1599:2019, Metallic Materials — Bend Test, BIS.', 'ASTM E855-08(2021), Standard Test Methods for Bend Testing of Metallic Flat Materials for Spring Applications Involving Static Loading.', 'IS 1708 (Part 5):1986, Testing of Small Clear Specimens of Timber — Static Bending.', 'S. P. Timoshenko, J. M. Gere, Mechanics of Materials, CBS.', 'R. C. Hibbeler, Mechanics of Materials, Pearson, Ch. 12.'],
    pre: [
      { q: 'Maximum deflection of a simply supported beam with central load P is', o: ['PL³/(3EI)', 'PL³/(48EI)', '5PL³/(384EI)', 'PL²/(16EI)'], a: 1, why: 'Standard result.' },
      { q: 'The neutral axis in a beam carries', o: ['Maximum stress', 'Zero bending stress', 'Maximum shear stress always zero', 'Constant tension'], a: 1, why: 'Bending strain is zero at the neutral axis.' },
      { q: 'For a rectangular section b × h, I about the neutral axis is', o: ['bh²/6', 'bh³/12', 'b³h/12', 'bh³/3'], a: 1, why: 'I = bh³/12.' },
      { q: 'Why are readings taken during unloading as well?', o: ['To save time', 'To check for permanent set and hysteresis', 'To find yield', 'Required by law'], a: 1, why: 'Elastic behaviour must be reversible.' },
      { q: 'Maximum bending moment of a cantilever with end load P is', o: ['PL/4', 'PL/2', 'PL', '2PL'], a: 2, why: 'At the fixed end, M = PL.' }
    ],
    post: [
      { q: 'A 2% error in depth h gives an error in E of about', o: ['2%', '4%', '6%', '8%'], a: 2, why: 'E ∝ 1/h³.' },
      { q: 'If the dial gauge is placed 20 mm away from mid-span, the calculated E will be', o: ['Too low', 'Too high', 'Unchanged', 'Zero'], a: 1, why: 'Deflection there is smaller than at mid-span, so E appears higher.' },
      { q: 'Your unloading readings were slightly larger than the loading readings. A likely cause is', o: ['Yielding of the beam', 'Friction and settlement at supports', 'Wrong E', 'Temperature drop'], a: 1, why: 'Small hysteresis at low stress comes from support friction, not yielding.' },
      { q: 'Timber in bending usually fails first by', o: ['Tension on the top face', 'Compression crushing on the top face followed by tension failure at the bottom', 'Shear at supports always', 'Buckling'], a: 1, why: 'Wood is weaker in compression than in tension along the grain.' },
      { q: 'Doubling the span of a simply supported beam under the same load increases deflection by a factor of', o: ['2', '4', '8', '16'], a: 2, why: 'δ ∝ L³.' }
    ]
  });
})();
