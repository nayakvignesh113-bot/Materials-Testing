(function () {
  const U = LAB.U, G = LAB.G;
  const MAT = {
    st: { name: 'Carbon steel', v: 5920, att: 0.010, noise: 1.2 },
    al: { name: 'Aluminium alloy', v: 6320, att: 0.006, noise: 0.8 },
    cu: { name: 'Copper', v: 4660, att: 0.018, noise: 2.0 },
    ss: { name: 'Austenitic stainless steel (cast)', v: 5740, att: 0.045, noise: 7 }
  };
  const PD = 10; // probe crystal diameter, mm
  const Phi = x => 0.5 * (1 + erf(x / Math.SQRT2));
  function erf(x) { const s = Math.sign(x); x = Math.abs(x); const t = 1 / (1 + 0.3275911 * x); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return s * y; }
  LAB.register({
    id: 'ultrasonic', no: 13, cat: 'ndt', title: 'Ultrasonic Flaw Detection', std: 'IS 3664:1981 / ASTM E114 / ASTM E317 / ISO 16810', short: 'Pulse-echo A-scan with a normal probe: velocity calibration, thickness, flaw depth, 6 dB flaw sizing, attenuation and near-field length.', tags: 'UT A-scan pulse echo probe 6dB drop velocity calibration NDT',
    aim: 'To calibrate an ultrasonic flaw detector using a reference block, measure the thickness of a test block, and locate and size an internal flaw by the pulse-echo contact method with a normal (0°) probe.',
    objectives: ['Determine the longitudinal wave velocity from multiple back-wall echoes of a calibration block.', 'Measure test block thickness and flaw depth from echo times.', 'Size the flaw length by the 6 dB drop method from a scan.', 'Estimate attenuation, wavelength and near-field length.'],
    apparatus: ['Digital ultrasonic flaw detector (pulse-echo, A-scan display)', 'Normal (0°) longitudinal-wave contact probe, Ø 10 mm crystal', 'Calibration block 25 mm thick (V1/IIW type) of the same material', 'Test block with internal flaw', 'Couplant (glycerine or gel), steel rule'],
    stdNote: 'ASTM E317 covers evaluation of instrument characteristics; ISO 16810 the general principles of ultrasonic testing.',
    params: [
      { id: 'mat', label: 'Material', type: 'select', options: Object.entries(MAT).map(([k, v]) => [k, v.name]), def: 'st' },
      { id: 'f', label: 'Probe frequency', type: 'select', options: [['2', '2 MHz'], ['4', '4 MHz'], ['5', '5 MHz']], def: '4', hint: 'Higher frequency: better resolution, more attenuation.' },
      { id: 'fl', label: 'Test block', type: 'select', options: [['lam', 'Block A (planar flaw)'], ['sdh', 'Block B (side-drilled hole)'], ['two', 'Block C (two flaws)']], def: 'lam' }
    ],
    opSteps: ['Apply couplant on the 25 mm calibration block', 'Record back-wall echoes B1–B3; set range', 'Move to test block; read back-wall time', 'Scan probe along the block in 2 mm steps', 'Note flaw echo time and amplitude', 'Find maximum echo and 6 dB drop positions', 'Mark flaw ends on the block'],
    svg(p) {
      return G.svg('0 0 520 260', `${G.r(0, 0, 520, 260, 'bg')}
        ${G.r(30, 120, 460, 110, 'steel', 'rx="2"')}${G.t(36, 246, 'Scan position x →', 'm')}
        <g id="flaws"></g>
        <g id="probe">${G.r(-12, 86, 24, 34, 'ink', 'rx="3"')}${G.l(0, 70, 0, 86, 'ln', 2)}<path id="beam" d="M-6 120 L-12 230 L12 230 L6 120 Z" fill="var(--accent)" opacity=".18"/></g>
        ${G.t(36, 112, '', 'm', 'id="px"')}
        <g transform="translate(360,14)">${G.r(0, 0, 140, 60, 'disp', 'rx="4"')}${G.t(10, 16, 'GATE A %FSH', 'm', 'style="fill:var(--panel-ink);font-size:8px"')}${G.t(10, 40, '—', 'big', 'id="dA"')}${G.t(80, 16, 'DEPTH mm', 'm', 'style="fill:var(--panel-ink);font-size:8px"')}${G.t(80, 40, '—', 'big', 'id="dD"')}</g>`, 'Ultrasonic probe scanning a test block');
    },
    anim(svg, f, sim, p) {
      if (!sim) { G.set(svg, 'probe', 'transform', 'translate(60,0)'); return; }
      const x = sim.manual != null && f >= 1 ? sim.manual : sim.xAt(f); const X = 30 + 460 * x / sim.Lb; const sc = 110 / sim.Tb;
      G.set(svg, 'probe', 'transform', `translate(${X},0)`); G.set(svg, 'beam', 'd', `M-5 120 L${-5 - sim.spread * 110} 230 L${5 + sim.spread * 110} 230 L5 120 Z`);
      const fl = svg.querySelector('#flaws'); if (fl && fl._sim !== sim) { fl.innerHTML = sim.flaws.map(q => q.kind === 'sdh' ? `<circle cx="${30 + 460 * (q.x1 + q.x2) / 2 / sim.Lb}" cy="${120 + q.d * sc}" r="${Math.max(3, (q.x2 - q.x1) / 2 * 460 / sim.Lb)}" class="ink"/>` : G.r(30 + 460 * q.x1 / sim.Lb, 120 + q.d * sc - 1.5, 460 * (q.x2 - q.x1) / sim.Lb, 3, 'ink')).join(''); fl._sim = sim; }
      const a = sim.scan(x); G.txt(svg, 'dA', U.f(a.amp, 0)); G.txt(svg, 'dD', a.amp > 20 ? U.f(a.depth, 1) : '—'); G.txt(svg, 'px', `Probe at x = ${U.f(x, 1)} mm`);
    },
    liveView(el, f, sim, p, api) {
      api.title('A-scan display'); api.sub(f < 0.12 ? 'calibration block 25 mm' : 'test block, rectified');
      let c = el.querySelector('canvas'); if (!c) { el.innerHTML = '<canvas style="width:100%;height:260px"></canvas>'; c = el.querySelector('canvas'); }
      const cal = f < 0.12 && sim.manual == null; const x = sim.manual != null && f >= 1 ? sim.manual : sim.xAt(f); const w = cal ? sim.ascanCal() : sim.ascan(x);
      LAB.plot(c, { xlabel: 'Time of flight (µs)', ylabel: 'Amplitude (% FSH)', series: [{ x: w.t, y: w.a, color: 's1', width: 1.3 }], ymin: 0, ymax: 105, xmin: 0, xmax: w.tmax, hlines: [{ y: 80, label: 'reference 80%', color: 'muted' }] }, { h: 260 });
    },
    afterRun(el, sim, p, ctx) {
      const box = LAB.h('div', { class: 'panel', style: 'margin-top:12px' }, `<div class="panel-h"><h4>Manual scan</h4><span class="eyebrow">drag the probe</span></div><input type="range" id="utx" min="0" max="${sim.Lb}" step="0.5" value="${sim.Lb / 2}" aria-label="Probe position"><p class="muted" style="font-size:.82rem;margin-top:6px">Move the probe to see how the flaw echo rises and falls; the back-wall echo drops when the flaw shadows it.</p>`);
      el.appendChild(box); const r = box.querySelector('#utx'); const upd = () => { sim.manual = +r.value; ctx.redraw(1); }; r.addEventListener('input', upd);
    },
    simulate(p, r) {
      const M = MAT[p.mat]; const v = M.v * (1 + 0.006 * U.gauss(r)); const vmm = v / 1000; const f = p.f; const lam = vmm / f; const N = PD * PD * f / (4 * vmm);
      const att = M.att * Math.pow(f / 4, 1.6) * (1 + 0.1 * U.gauss(r)); // dB/mm (one-way)
      const Tb = U.q(40 + 25 * r(), 0.5), Lb = 120;
      const flaws = [];
      if (p.fl === 'lam') { const x1 = 35 + 20 * r(); flaws.push({ kind: 'planar', d: U.q(Tb * (0.35 + 0.3 * r()), 0.1), x1, x2: x1 + 18 + 18 * r(), R: 0.9 }); }
      else if (p.fl === 'sdh') { const xc = 50 + 20 * r(); flaws.push({ kind: 'sdh', d: U.q(Tb * (0.3 + 0.4 * r()), 0.1), x1: xc - 1.5, x2: xc + 1.5, R: 0.35 }); }
      else { const x1 = 25 + 10 * r(); flaws.push({ kind: 'planar', d: U.q(Tb * (0.25 + 0.15 * r()), 0.1), x1, x2: x1 + 14 + 8 * r(), R: 0.85 }); const x3 = 75 + 10 * r(); flaws.push({ kind: 'planar', d: U.q(Tb * (0.6 + 0.2 * r()), 0.1), x1: x3, x2: x3 + 10 + 10 * r(), R: 0.7 }); }
      const sb = 0.42 * (PD / 2 + 1.2 * lam * 6 / PD * 10) / 2; const spread = Math.min(0.35, 0.51 * lam / PD * 4);
      const gain = 80; // B1 on calibration block set to 80%
      const dB = (d) => Math.pow(10, -att * 2 * d / 20);
      const nz = U.rng(Math.floor(r() * 1e9));
      const pulse = (t, t0, A, width) => A * Math.exp(-Math.pow((t - t0) / width, 2));
      const tof = d => 2 * d / vmm;
      const ascanGen = (echoes, tmax) => { const t = [], a = []; const nzr = U.rng(Math.round(tmax * 1000) + echoes.length * 7 + Math.round((echoes[0] || {}).A || 0)); const wdt = 0.9 / f + 0.05; for (let i = 0; i <= 700; i++) { const ti = tmax * i / 700; let s = pulse(ti, 0.25, 100, 0.35); for (const e of echoes) s += pulse(ti, e.t, e.A, wdt) * Math.abs(Math.cos((ti - e.t) * f * Math.PI * 2 * 0.5)); s += M.noise * Math.abs(U.gauss(nzr)) * (ti > 0.8 ? 1 : 0); t.push(ti); a.push(Math.min(100, s)); } return { t, a, tmax }; };
      // calibration block echoes
      const Tc = 25; const calB = [1, 2, 3, 4].map(n => ({ n, t: tof(Tc * n), A: gain * dB(Tc * (n - 1)) * Math.pow(n, -0.35) }));
      const flawAmp = (q, x) => { const s = q.kind === 'sdh' ? 2.4 : 2.0; return gain * q.R * (Phi((x - q.x1) / s) - Phi((x - q.x2) / s)) * dB(q.d - 0) * dB(0) * Math.pow(Tc / q.d, q.kind === 'sdh' ? 0.5 : 0.15); };
      const shadow = x => flaws.reduce((m, q) => m * (1 - 0.85 * (Phi((x - q.x1) / 2) - Phi((x - q.x2) / 2)) * (q.kind === 'sdh' ? 0.25 : 1)), 1);
      const bw = x => gain * dB(Tb - Tc) * Math.pow(Tc / Tb, 0.35) * 1.05 * shadow(x);
      const tmaxT = tof(Tb) * 2.2;
      const sim = {
        flaws, Tb, Lb, spread, dur: 11, manual: null, M,
        xAt(fr) { return fr < 0.12 ? 0 : U.clamp((fr - 0.12) / 0.86, 0, 1) * Lb; },
        ascanCal() { return ascanGen(calB.map(e => ({ t: e.t, A: e.A })), tof(Tc) * 4.4); },
        ascan(x) { const ech = flaws.map(q => ({ t: tof(q.d), A: flawAmp(q, x) })); ech.push({ t: tof(Tb), A: bw(x) }); ech.push({ t: tof(Tb) * 2, A: bw(x) * dB(Tb) * 0.7 }); return ascanGen(ech, tmaxT); },
        scan(x) { let best = null; flaws.forEach(q => { const a = flawAmp(q, x); if (!best || a > best.amp) best = { amp: a, depth: q.d }; }); return best; }
      };
      // observations
      const t1 = U.q(calB[0].t + 0.004 * U.gauss(r), 0.01), t2 = U.q(calB[1].t + 0.004 * U.gauss(r), 0.01), t3 = U.q(calB[2].t + 0.004 * U.gauss(r), 0.01);
      const A1 = U.q(calB[0].A, 1), A2 = U.q(calB[1].A, 1);
      const tB = U.q(tof(Tb) + 0.005 * U.gauss(r), 0.01);
      const xs = []; for (let x = 0; x <= Lb; x += 2) xs.push(x);
      const rows = xs.map(x => { const a = sim.scan(x); return [x, U.f(Math.max(0, a.amp + 0.4 * U.gauss(nz)), 0), a.amp > 8 ? U.f(tof(a.depth) + 0.005 * U.gauss(nz), 2) : '—', U.f(bw(x), 0)]; });
      // truths from observation data
      const vCal = (2 * Tc * 3) / ((t3 - t1 + t3 - t2 + t2 - t1) / 2 * 1) ; // placeholder replaced below
      const vT = 2 * Tc / ((t3 - t1) / 2) * 1000; // m/s from B1–B3 spacing
      const amps = rows.map(rw => +rw[1]);
      const main = flaws[0]; const iMax = amps.indexOf(Math.max(...amps.slice(0, p.fl === 'two' ? Math.round(55 / 2) : amps.length)));
      const half = amps[iMax] / 2; let xl = NaN, xr = NaN; for (let i = iMax; i > 0; i--) if (amps[i - 1] < half) { xl = xs[i - 1] + (half - amps[i - 1]) / (amps[i] - amps[i - 1]) * 2; break; } for (let i = iMax; i < amps.length - 1; i++) if (amps[i + 1] < half) { xr = xs[i] + (amps[i] - half) / (amps[i] - amps[i + 1]) * 2; break; }
      const tF = +rows[iMax][2];
      const T = { v: vT, Tb: vT / 1000 * tB / 2, df: vT / 1000 * tF / 2, len: xr - xl, xc: (xl + xr) / 2, att: 20 * Math.log10(A1 / A2) / (2 * Tc), lam: vT / 1000 / f, N: PD * PD * f / (4 * vT / 1000), tB, tF, t1, t3, A1, A2, f };
      if (flaws.length > 1) { const j0 = Math.round(65 / 2); const sub = amps.slice(j0); const im2 = j0 + sub.indexOf(Math.max(...sub)); T.df2 = vT / 1000 * (+rows[im2][2]) / 2; }
      void vCal; void sb; void N; void lam;
      sim.plot = { title: 'Flaw echo amplitude along the scan', xlabel: 'Probe position x (mm)', ylabel: 'Flaw echo amplitude (% FSH)', series: [{ name: 'Flaw echo', x: xs, y: amps, type: 'linepts', color: 's1', r: 2.5 }, { name: 'Back-wall echo', x: xs, y: rows.map(rw => +rw[3]), color: 's3', dash: true }], ymin: 0, ymax: 100, hlines: [{ y: amps[iMax], label: 'max', color: 'muted' }, { y: half, label: '−6 dB', color: 's5' }], caption: 'Echo-dynamic curve: flaw echo amplitude against probe position (6 dB drop sizing)' };
      sim.plotFrac = fr => fr < 0.12 ? 0 : (fr - 0.12) / 0.86;
      sim.readout = fr => { const x = sim.manual != null && fr >= 1 ? sim.manual : sim.xAt(fr); const a = sim.scan(x); return [['Probe x', U.f(x, 1), 'mm'], ['Flaw echo', U.f(a.amp, 0), '% FSH'], ['Flaw depth', a.amp > 8 ? U.f(a.depth, 1) : '—', 'mm'], ['Back wall', U.f(bw(x), 0), '% FSH'], ['Stage', fr < 0.12 ? 'Calibration' : 'Scanning', '']]; };
      sim.specimen = [['Material', M.name, ''], ['Probe', `${f} MHz, normal 0°, Ø ${PD} mm`, ''], ['Calibration block thickness', Tc, 'mm'], ['Test block length', Lb, 'mm'], ['Couplant', 'Glycerine', ''], ['Gain', 'B1 of calibration block set to 80% FSH', '']];
      sim.obs = [{ title: 'Table 1. Calibration block (25 mm) echoes', cols: ['Echo', 'Time of flight (µs)', 'Amplitude (% FSH)'], textCols: [0], rows: [['B1', U.f(t1, 2), A1], ['B2', U.f(t2, 2), A2], ['B3', U.f(t3, 2), U.q(calB[2].A, 1)]] },
      { title: 'Table 2. Test block back-wall echo (clear area)', cols: ['Echo', 'Time of flight (µs)'], textCols: [0], rows: [['Back wall B1', U.f(tB, 2)]] },
      { title: 'Table 3. Scan along test block (2 mm steps)', cols: ['x (mm)', 'Flaw echo (% FSH)', 'Flaw echo time (µs)', 'Back-wall echo (% FSH)'], rows }];
      sim.truth = T; return sim;
    },
    calcs(sim) { const T = sim.truth; const a = [{ key: 'v', label: 'Longitudinal velocity (from B1–B3)', unit: 'm/s', truth: T.v, tol: 0.008, hint: 'v = 2·(2T)/(t₃ − t₁)' }, { key: 'Tb', label: 'Test block thickness', unit: 'mm', truth: T.Tb, tol: 0.008, hint: 'T = v t_B / 2' }, { key: 'df', label: 'Depth of flaw (largest echo)', unit: 'mm', truth: T.df, tol: 0.01, hint: 'd = v t_F / 2' }];
      if (sim.flaws[0].kind !== 'sdh') a.push({ key: 'len', label: 'Flaw length by 6 dB drop', unit: 'mm', truth: T.len, abs: 1.5, hint: 'distance between positions where echo = ½ max' }); else a.push({ key: 'xc', label: 'Flaw centre position', unit: 'mm', truth: T.xc, abs: 1.5, hint: 'position of maximum echo' });
      if (T.df2) a.push({ key: 'df2', label: 'Depth of second flaw', unit: 'mm', truth: T.df2, tol: 0.015, hint: 'from echo time near x ≈ 75–100 mm' });
      a.push({ key: 'att', label: 'Attenuation coefficient (B1/B2, uncorrected)', unit: 'dB/mm', truth: T.att, tol: 0.05, hint: '20 log(A₁/A₂) / (2 × 25)' }, { key: 'lam', label: 'Wavelength λ', unit: 'mm', truth: T.lam, tol: 0.01, hint: 'v/f' }, { key: 'N', label: 'Near-field length N', unit: 'mm', truth: T.N, tol: 0.015, hint: 'D²f/(4v)' });
      return a; },
    reference(sim) { const T = sim.truth; const v0 = sim.M.v; return [{ label: 'Velocity', unit: 'm/s', value: T.v, lo: v0 * 0.98, hi: v0 * 1.02, src: 'ASNT NDT Handbook Vol. 7' }, { label: 'Flaw depth vs actual (block drawing)', unit: 'mm', value: T.df, lo: sim.flaws[0].d - 0.6, hi: sim.flaws[0].d + 0.6, src: 'Fabrication record' }, ...(sim.flaws[0].kind !== 'sdh' ? [{ label: '6 dB length vs actual', unit: 'mm', value: T.len, lo: (sim.flaws[0].x2 - sim.flaws[0].x1) - 3, hi: (sim.flaws[0].x2 - sim.flaws[0].x1) + 3, src: 'Fabrication record' }] : [])]; },
    sample(sim) { const T = sim.truth; return `<div class="eq">Velocity: B1 → B3 spans 2 round trips of 25 mm, t₃ − t₁ = ${U.f(T.t3, 2)} − ${U.f(T.t1, 2)} = ${U.f(T.t3 - T.t1, 2)} µs<br>v = 2 × 2 × 25 / ${U.f(T.t3 - T.t1, 2)} = ${U.f(T.v / 1000, 4)} mm/µs = <b>${U.f(T.v, 0)} m/s</b></div><div class="eq">Thickness = v t_B/2 = ${U.f(T.v / 1000, 4)} × ${U.f(T.tB, 2)} / 2 = <b>${U.f(T.Tb, 2)} mm</b><br>Flaw depth = ${U.f(T.v / 1000, 4)} × ${U.f(T.tF, 2)} / 2 = <b>${U.f(T.df, 2)} mm</b></div>${sim.flaws[0].kind !== 'sdh' ? `<div class="eq">6 dB drop: echo falls to half of maximum at x = ${U.f(T.xc - T.len / 2, 1)} and ${U.f(T.xc + T.len / 2, 1)} mm → length = <b>${U.f(T.len, 1)} mm</b></div>` : ''}<div class="eq">Attenuation ≈ 20 log(${T.A1}/${T.A2}) / 50 = <b>${U.f(T.att, 4)} dB/mm</b>;  λ = v/f = <b>${U.f(T.lam, 3)} mm</b>;  N = D²f/(4v) = 10² × ${T.f}/(4 × ${U.f(T.v / 1000, 3)}) = <b>${U.f(T.N, 1)} mm</b></div>`; },
    uncert(sim) { const T = sim.truth; const ut = 0.01 / Math.sqrt(12); return [{ q: 'Velocity', expr: '√2 u(t)/(t₃ − t₁)', val: T.v, u: T.v * Math.SQRT2 * ut / (T.t3 - T.t1), unit: 'm/s' }, { q: 'Flaw depth', expr: '√[(u_v/v)² + (u_t/t)²]', val: T.df, u: T.df * Math.hypot(Math.SQRT2 * ut / (T.t3 - T.t1), ut / T.tF), unit: 'mm' }, ...(sim.flaws[0].kind !== 'sdh' ? [{ q: 'Flaw length (6 dB)', expr: 'scan step 2 mm/√12 per end, beam width effect', val: T.len, u: Math.hypot(2 / Math.sqrt(12), 2 / Math.sqrt(12), 1), unit: 'mm' }] : [])]; },
    conclude(sim) { const T = sim.truth; return `Calibration on the 25 mm block gave a longitudinal velocity of ${U.f(T.v, 0)} m/s for ${sim.M.name.toLowerCase()}. The test block is ${U.f(T.Tb, 1)} mm thick and contains a ${sim.flaws[0].kind === 'sdh' ? 'small reflector (side-drilled hole)' : 'planar flaw'} at a depth of ${U.f(T.df, 1)} mm${sim.flaws[0].kind !== 'sdh' ? `, ${U.f(T.len, 1)} mm long by the 6 dB drop method` : ''}${T.df2 ? `, and a second flaw at ${U.f(T.df2, 1)} mm depth` : ''}. Because the flaw is ${T.df > T.N ? 'beyond' : 'within'} the near field (N = ${U.f(T.N, 1)} mm), amplitude-based sizing is ${T.df > T.N ? 'reliable' : 'less reliable'}.`; },
    summary: 'In pulse-echo ultrasonic testing a piezoelectric probe sends a short pulse of high-frequency sound (1–10 MHz) into the part through a couplant. Sound reflects from the back wall and from internal discontinuities with different acoustic impedance. The A-scan displays echo amplitude against time of flight; with the velocity known from calibration, time converts to depth, d = vt/2. Flaw length is measured by moving the probe and finding where the echo falls by 6 dB (to half its maximum), when the beam axis is at the flaw edge. Attenuation and beam spread reduce amplitude with distance; the near field N = D²f/(4v) is a zone of irregular amplitude close to the probe.',
    formulas: [['Depth from time of flight', 'd = v t / 2'], ['Velocity from multiple echoes', 'v = 2 n T / (t_{n+1} − t_1)'], ['Wavelength', 'λ = v / f'], ['Near-field length', 'N = D² f / (4v)'], ['Beam half-angle (−6 dB)', 'sin γ = 0.51 λ / D'], ['Decibel ratio', 'ΔdB = 20 log₁₀(A₁/A₂)']],
    theory: `<h3>Principle</h3><p>Ultrasound is mechanical vibration above 20 kHz. Flaw detection uses 0.5–10 MHz, where the wavelength in steel is about 0.6–12 mm. A piezoelectric crystal in the probe converts an electrical spike into a short pressure pulse. The pulse travels through the couplant into the part, reflects from any interface where the acoustic impedance Z = ρv changes, and returns to the crystal, which converts it back into a voltage. Because Z of air is about 10⁵ times smaller than that of steel, cracks and laminations reflect almost all incident sound.</p>
    <h3>The A-scan</h3><p>The display shows amplitude against time. The initial pulse appears at zero, the back-wall echo at t = 2T/v, and a flaw echo, if present, in between. After calibrating the time base on a block of known thickness of the same material, the screen reads depth directly:</p><div class="eq">d = v t / 2        (the factor 2 accounts for the round trip)</div>
    <h3>Calibration</h3><p>Multiple back-wall echoes from a 25 mm calibration block are equally spaced by the round-trip time. Using the spacing between B1 and B3, rather than the absolute time of B1, removes the delay through the probe wear plate and couplant.</p>
    <h3>Beam characteristics</h3><p>Close to the probe, interference between waves from different parts of the crystal produces the <b>near field</b>, of length N = D²f/(4v), where amplitude varies erratically. Beyond N the beam diverges with half-angle sin γ = 0.51λ/D (−6 dB edge). Higher frequency gives a longer near field, a narrower beam and better resolution, but higher attenuation.</p>
    <h3>Flaw sizing by the 6 dB drop</h3><p>When the probe is moved across a flaw larger than the beam, the echo is maximum while the whole beam hits the flaw, and falls to half (−6 dB) when the beam axis is exactly over the flaw edge. Marking the two −6 dB positions gives the flaw length. For flaws smaller than the beam, the 6 dB method measures the beam width instead and amplitude comparison with reference reflectors (DGS or DAC methods) is used.</p>
    <h3>Attenuation</h3><p>Amplitude decreases with distance because of scattering at grain boundaries and absorption. Coarse-grained materials such as cast austenitic stainless steel scatter strongly, producing "grass" noise and making inspection at high frequency difficult.</p>`,
    procedure: ['Connect the normal probe and switch on the flaw detector; select single-crystal pulse-echo mode.', 'Apply couplant to the 25 mm calibration block and place the probe on it.', 'Adjust range and delay so that B1, B2 and B3 appear; enter or calculate the velocity; set B1 to 80% FSH with the gain.', 'Move the probe to a flaw-free area of the test block and record the back-wall time.', 'Scan the probe along the test block in 2 mm steps, keeping pressure and couplant uniform; record flaw echo amplitude and time at each position.', 'Locate the maximum flaw echo; find the positions on either side where it drops by 6 dB.', 'Report flaw depth, length and position, and the test parameters.'],
    precautions: ['Use enough couplant and constant probe pressure; air gaps block sound.', 'Calibrate on a block of the same material and temperature as the part.', 'Avoid scanning faster than the instrument pulse rate allows.', 'Check probe wear and zero offset regularly.', 'Clean the surface of scale, paint and loose rust.'],
    applications: ['Weld inspection (with angle probes).', 'Thickness gauging of pipes and pressure vessels for corrosion.', 'Detecting laminations in rolled plate and inclusions in forgings.', 'In-service inspection of rails, axles and aircraft components.'],
    errors: ['Couplant thickness and pressure variation changing amplitude.', 'Velocity difference between calibration block and test part.', 'Beam spread overestimating the length of small flaws.', 'Near-field amplitude variation.', 'Surface roughness and curvature.'],
    discussion: ['Why is the time between B1 and B3 used for velocity instead of the time of B1 alone?', 'Your flaw echo reduced the back-wall echo. Explain why.', 'Why does the 6 dB method not work for a small side-drilled hole?', 'What frequency would you choose for coarse-grained cast stainless steel, and why?'],
    refs: ['IS 3664:1981, Code of Practice for Ultrasonic Pulse Echo Testing by Contact and Immersion Methods, BIS.', 'ASTM E114-20, Standard Practice for Ultrasonic Pulse-Echo Straight-Beam Contact Testing.', 'ASTM E317-21, Standard Practice for Evaluating Performance Characteristics of Ultrasonic Pulse-Echo Testing Instruments.', 'ISO 16810:2012, Non-destructive Testing — Ultrasonic Testing — General Principles.', 'J. Krautkrämer, H. Krautkrämer, Ultrasonic Testing of Materials, 4th ed., Springer, 1990.'],
    pre: [
      { q: 'In pulse-echo testing, depth is calculated as', o: ['d = vt', 'd = vt/2', 'd = 2vt', 'd = v/t'], a: 1, why: 'The sound travels to the reflector and back.' },
      { q: 'Couplant is used because', o: ['It cools the probe', 'Air gaps reflect almost all ultrasound', 'It is required by law', 'It improves resolution only'], a: 1, why: 'Huge impedance mismatch at an air gap.' },
      { q: 'Increasing probe frequency', o: ['Increases wavelength', 'Improves resolution but increases attenuation', 'Reduces near field', 'Has no effect'], a: 1, why: 'λ = v/f becomes smaller.' },
      { q: 'A 6 dB drop corresponds to amplitude falling to', o: ['25%', '50%', '75%', '10%'], a: 1, why: '20 log(0.5) = −6 dB.' },
      { q: 'Typical longitudinal velocity in steel is', o: ['1480 m/s', '3240 m/s', '5920 m/s', '340 m/s'], a: 2, why: '3240 m/s is the shear-wave velocity.' }
    ],
    post: [
      { q: 'A back-wall echo at 16.9 µs in steel (5920 m/s) means thickness is about', o: ['25 mm', '50 mm', '100 mm', '12.5 mm'], a: 1, why: '5.92 × 16.9/2 = 50 mm.' },
      { q: 'The near-field length of a 10 mm, 4 MHz probe in steel is about', o: ['1.7 mm', '17 mm', '170 mm', '4 mm'], a: 1, why: '100 × 4/(4 × 5.92) = 16.9 mm.' },
      { q: 'The back-wall echo dropped while the probe was over the flaw because', o: ['Gain changed', 'The flaw shadowed the back wall', 'Couplant dried', 'Attenuation increased'], a: 1, why: 'Sound reflected by the flaw does not reach the back wall.' },
      { q: 'Using B1–B3 spacing for calibration eliminates error from', o: ['Material velocity', 'Probe delay and couplant path', 'Attenuation', 'Beam spread'], a: 1, why: 'Fixed delays cancel in the difference.' },
      { q: 'Coarse-grained austenitic castings give high noise ("grass") because', o: ['Of low velocity', 'Of grain-boundary scattering', 'Of magnetism', 'Of surface finish'], a: 1, why: 'Scattering increases sharply when grain size approaches λ.' }
    ]
  });
})();
