(function () {
  const U = LAB.U, G = LAB.G;
  const MAT = {
    ms: { name: 'Mild steel (IS 2062 E250)', G: 80000, ty: 150, ts: 360, g0: 0.25, gf: 1.7, ref: { G: [77, 83], tu: [290, 380] } },
    al: { name: 'Aluminium alloy 6061-T6', G: 26000, ty: 160, ts: 215, g0: 0.08, gf: 0.55, ref: { G: [25, 27.5], tu: [190, 240] } },
    br: { name: 'Brass CuZn30, annealed', G: 39000, ty: 70, ts: 270, g0: 0.4, gf: 1.6, ref: { G: [36, 42], tu: [200, 290] } },
    cu: { name: 'Copper, annealed', G: 45000, ty: 40, ts: 190, g0: 0.5, gf: 2.4, ref: { G: [42, 48], tu: [140, 200] } },
    ci: { name: 'Grey cast iron FG 200', G: 41000, brittle: 1, tu: 240, gf: 0.0085, ref: { G: [35, 50], tu: [200, 300] } }
  };
  function tauOf(M, g) { if (M.brittle) { const A = M.tu * 1.25; return A * (1 - Math.exp(-M.G * g / A)); } const gy = M.ty / M.G; if (g <= gy) return M.G * g; return M.ty + (M.ts - M.ty) * (1 - Math.exp(-(g - gy) / M.g0)); }
  function torque(M, th, c, L) { const n = 60; let s = 0; for (let i = 0; i <= n; i++) { const rho = c * i / n; const w = i === 0 || i === n ? 1 : (i % 2 ? 4 : 2); s += w * tauOf(M, rho * th / L) * rho * rho; } return 2 * Math.PI * s * (c / n) / 3; }
  LAB.register({
    id: 'torsion', no: 4, cat: 'mech', title: 'Torsion Test', std: 'IS 1717:2012 / ASTM E143', short: 'Torque–twist of a solid round bar: modulus of rigidity, shear yield, modulus of rupture and fully plastic shear strength.', tags: 'modulus of rigidity torque twist shaft troptometer',
    aim: 'To conduct a torsion test on a solid circular specimen and determine the modulus of rigidity, shear stress at the limit of proportionality, modulus of rupture and the shear strain at fracture.',
    objectives: ['Record torque against angle of twist up to fracture.', 'Determine G from the linear portion of the torque–twist curve using the torsion formula.', 'Determine shear strength by the elastic (modulus of rupture) and fully plastic (Nadai) approaches.', 'Identify fracture modes in torsion for ductile and brittle materials.'],
    apparatus: ['Torsion testing machine, 500 N·m, with torque measurement and angle encoder', 'Troptometer (twist meter), gauge length 100 mm, resolution 0.01°', 'Micrometer (LC 0.01 mm)', 'Steel rule and scriber for a longitudinal reference line'],
    stdNote: 'ASTM E143 governs determination of shear modulus; IS 1717 covers simple torsion of wire and bar to fracture.',
    params: [
      { id: 'mat', label: 'Material', type: 'select', options: Object.entries(MAT).map(([k, v]) => [k, v.name]), def: 'ms' },
      { id: 'd', label: 'Specimen diameter', type: 'select', options: [['8', '8 mm'], ['10', '10 mm'], ['12', '12 mm']], def: '10' },
      { id: 'L', label: 'Gauge length (troptometer)', type: 'select', options: [['100', '100 mm'], ['150', '150 mm'], ['200', '200 mm']], def: '100' }
    ],
    opSteps: ['Measure d at three places; scribe a longitudinal line', 'Clamp ends in chucks; set troptometer on gauge length', 'Zero torque and angle', 'Twist slowly in elastic range; record T and θ', 'Remove troptometer; continue twisting', 'Record maximum torque', 'Fracture: record total angle; inspect fracture'],
    svg(p) {
      return G.svg('0 0 520 300', `${G.r(0, 0, 520, 300, 'bg')}${G.r(20, 230, 480, 22, 'mach', 'rx="3"')}
        ${G.r(40, 120, 70, 110, 'mach', 'rx="4"')}${G.r(410, 120, 70, 110, 'mach', 'rx="4"')}
        <ellipse cx="110" cy="160" rx="10" ry="40" class="steelD"/><g id="rot"><ellipse cx="410" cy="160" rx="10" ry="40" class="steelD"/><line id="mk" x1="410" y1="160" x2="410" y2="122" class="lns" stroke-width="3"/></g>
        ${G.r(118, 151, 284, 18, 'spec', 'rx="2"')}
        <path id="helix" class="ln" stroke-width="1.6" d="M118 151 L402 151" />
        <path id="brk" class="lnb" stroke-width="3" d="" />
        <g id="trop">${G.r(190, 132, 6, 19, 'acc')}${G.r(330, 132, 6, 19, 'acc')}${G.l(196, 136, 330, 136, 'lna', 2)}</g>
        <g transform="translate(160,30)">${G.r(0, 0, 200, 70, 'disp', 'rx="4"')}${G.t(10, 18, 'TORQUE N·m', 'm', 'style="fill:var(--panel-ink);font-size:8px"')}${G.t(10, 44, '0.00', 'big', 'id="dT"')}${G.t(110, 18, 'TWIST °', 'm', 'style="fill:var(--panel-ink);font-size:8px"')}${G.t(110, 44, '0.0', 'big', 'id="dA"')}${G.t(10, 62, '', 'm', 'id="lab" style="fill:var(--panel-ink)"')}</g>
        ${G.t(120, 275, '', 'm', 'id="cap" style="fill:var(--panel-ink)"')}`, 'Torsion testing machine');
    },
    anim(svg, f, sim) {
      const a = sim ? sim.at(f) : { T: 0, th: 0, phase: 'Ready', broken: false, gamma: 0 };
      const deg = a.th; G.set(svg, 'mk', 'transform', `rotate(${deg % 360} 410 160)`); G.set(svg, 'mk', 'x2', 410);
      const shear = Math.atan(Math.min(a.gamma, 6)) ; const dx = 9 / Math.max(Math.tan(Math.PI / 2 - shear), 0.02);
      // helix: line on surface becomes inclined; draw zig-zag across specimen width
      const turns = Math.min(40, Math.floor(a.th / 360 * 1.0)); let d = `M118 160`; const len = 284; const seg = Math.max(1, Math.round(len / Math.max(8, 284 / (1 + turns * 2))));
      if (a.gamma < 0.02) d = 'M118 160 L402 160'; else { const pitch = Math.max(6, 18 / Math.tan(shear)); let x = 118, up = true; d = `M118 151`; while (x < 402) { x = Math.min(402, x + pitch); d += ` L${x} ${up ? 169 : 151}`; up = !up; } }
      G.set(svg, 'helix', 'd', d); void dx; void seg;
      G.set(svg, 'brk', 'd', a.broken ? (sim.M.brittle ? 'M250 151 L270 169' : 'M262 149 L262 171') : '');
      G.show(svg, 'trop', !sim || a.trop);
      G.txt(svg, 'dT', U.f(a.T, 2)); G.txt(svg, 'dA', U.f(deg, 1)); G.txt(svg, 'lab', a.phase); G.txt(svg, 'cap', sim ? sim.M.name : '');
    },
    simulate(p, r) {
      const base = MAT[p.mat]; const M = Object.assign({}, base); const fG = 1 + 0.02 * U.gauss(r), fs = 1 + 0.03 * U.gauss(r);
      M.G = base.G * fG; if (M.ty) { M.ty *= fs; M.ts *= fs; } else M.tu *= fs; M.gf = base.gf * (1 + 0.06 * U.gauss(r));
      const dm = [0, 1, 2].map(() => U.q(p.d + 0.01 * U.gauss(r), 0.01)); const d = U.mean(dm), c = d / 2, J = Math.PI * Math.pow(d, 4) / 32, L = p.L;
      const thf = M.gf * L / c; // rad at fracture (surface strain)
      const th = [], T = []; const N = 360; for (let i = 0; i <= N; i++) { const t = thf * Math.pow(i / N, M.brittle ? 1 : 1.8); th.push(t); T.push(torque(M, t, c, L) / 1000); }
      const deg = th.map(t => t * 180 / Math.PI);
      // elastic table with troptometer
      const Tlp = M.brittle ? M.tu * 0.35 * J / c / 1000 : (M.ty * J / c) / 1000; const step = U.q(Tlp * 0.9 / 6, 0.1) || 0.1; const el = [];
      for (let k = 0; k <= 6; k++) { const Tk = k * step; const thk = U.inv(th, T, Tk); el.push([Tk, k === 0 ? 0 : U.q(thk * 180 / Math.PI + 0.004 * U.gauss(r), 0.01)]); }
      const fit = U.linfit(el.map(v => v[1] * Math.PI / 180), el.map(v => v[0] * 1000)); // N·mm per rad
      const Gt = fit.m * L / J; // MPa
      const Tmax = U.q(Math.max(...T), 0.01), Tlpq = M.brittle ? null : U.q(Tlp, 0.01); const thfDeg = U.q(deg[deg.length - 1], 1);
      const Tr = { d, c, J, L, G: Gt / 1000, Tmax, Tlp: Tlpq, thf: thfDeg };
      Tr.tlp = Tlpq ? Tlpq * 1000 * c / J : null; Tr.tr = Tmax * 1000 * c / J; Tr.tn = 3 * Tmax * 1000 / (2 * Math.PI * c * c * c); Tr.gf = c * (thfDeg * Math.PI / 180) / L; Tr.turns = thfDeg / 360;
      const rows = []; for (let i = 0; i <= N; i += 18) rows.push([U.f(deg[i], 1), U.f(T[i], 2), U.f(T[i] * 1000 * c / J, 1), U.f(c * th[i] / L, 4)]);
      const at = f => { const i = Math.min(N, Math.floor(f * N)); const g = c * th[i] / L; const gy = M.ty ? M.ty / M.G : 0; return { T: T[i], th: deg[i], gamma: g, broken: f >= 1, trop: g < (gy || 0.004) * 1.4, phase: f >= 1 ? (M.brittle ? 'Fractured (helical, 45°)' : 'Fractured (flat, transverse)') : (M.brittle ? 'Elastic' : g < gy ? 'Elastic' : g < gy * 4 ? 'Elastic–plastic' : 'Fully plastic') }; };
      return {
        M, dur: 9, at,
        readout(f) { const a = at(f); return [['Torque', U.f(a.T, 2), 'N·m'], ['Twist', U.f(a.th, 1), '°'], ['Turns', U.f(a.th / 360, 2), ''], ['Surface γ', U.f(a.gamma, 4), 'rad'], ['Stage', a.phase, '']]; },
        plot: { title: 'Torque–twist diagram', xlabel: 'Angle of twist θ (degree)', ylabel: 'Torque T (N·m)', series: [{ name: 'Torque–twist', x: deg, y: T, color: 's1' }], caption: 'Torque against angle of twist to fracture' },
        plots: [{ xlabel: 'Angle of twist (degree)', ylabel: 'Torque (N·m)', series: [{ name: 'Troptometer readings', x: el.map(v => v[1]), y: el.map(v => v[0]), type: 'scatter' }, { name: 'Fit', x: [0, el[el.length - 1][1]], y: [fit.c / 1000, (fit.c + fit.m * el[el.length - 1][1] * Math.PI / 180) / 1000], color: 's2', dash: true }], caption: `Elastic region: G = ${U.f(Gt / 1000, 2)} GPa (R² = ${U.f(fit.r2, 4)})` }],
        specimen: [['Material', M.name, ''], ['Diameter readings', dm.map(x => U.f(x, 2)).join(', '), 'mm'], ['Gauge length L', L, 'mm'], ['Twisting rate (elastic / plastic)', '1 °/s / 60 °/min', ''], ['Temperature', '27', '°C']],
        obs: [{ title: 'Table 1. Elastic region (troptometer)', cols: ['Sl. no.', 'Torque T (N·m)', 'Angle of twist θ (degree)'], rows: el.map((v, i) => [i + 1, U.f(v[0], 2), U.f(v[1], 2)]) },
        { title: 'Table 2. Key readings', cols: ['Reading', 'Value', 'Unit'], textCols: [0, 2], rows: [...(Tlpq ? [['Torque at limit of proportionality T_lp (from graph)', U.f(Tlpq, 2), 'N·m']] : []), ['Maximum torque T_max', U.f(Tmax, 2), 'N·m'], ['Total angle of twist at fracture θ_f', thfDeg, 'degree']] },
        { title: 'Table 3. Torque–twist record', cols: ['θ (degree)', 'T (N·m)', 'τ_surface elastic formula (MPa)', 'γ surface (rad)'], rows }],
        truth: Tr, fit
      };
    },
    calcs(sim) {
      const T = sim.truth; const a = [{ key: 'J', label: 'Polar moment of inertia J', unit: 'mm⁴', truth: T.J, tol: 0.01, hint: 'πd⁴/32' }, { key: 'G', label: 'Modulus of rigidity G', unit: 'GPa', truth: T.G, tol: 0.05, hint: 'G = T·L/(J·θ), θ in rad (slope of Table 1)' }];
      if (T.tlp) a.push({ key: 'tlp', label: 'Shear stress at limit of proportionality', unit: 'MPa', truth: T.tlp, tol: 0.015, hint: 'τ = T_lp·r/J' });
      a.push({ key: 'tr', label: 'Modulus of rupture (elastic formula)', unit: 'MPa', truth: T.tr, tol: 0.015, hint: 'τ_r = T_max·r/J' });
      if (T.tlp) a.push({ key: 'tn', label: 'Shear strength, fully plastic (Nadai)', unit: 'MPa', truth: T.tn, tol: 0.015, hint: 'τ = 3T_max/(2πr³)' });
      a.push({ key: 'gf', label: 'Surface shear strain at fracture γ_f', unit: 'rad', truth: T.gf, tol: 0.02, hint: 'γ = r·θ_f/L (θ_f in rad)' }, { key: 'turns', label: 'Number of turns to fracture', unit: '—', truth: T.turns, tol: 0.01, hint: 'θ_f / 360' });
      return a;
    },
    reference(sim) { const T = sim.truth, R = sim.M.ref; return [{ label: 'Modulus of rigidity', unit: 'GPa', value: T.G, lo: R.G[0], hi: R.G[1], src: 'ASM Handbook' }, { label: 'Shear strength', unit: 'MPa', value: T.tn && !sim.M.brittle ? T.tn : T.tr, lo: R.tu[0], hi: R.tu[1], src: 'ASM / MMPDS' }, { label: 'E/(2(1+ν)) check: implied ν', unit: '', value: ({ ms: 205, al: 69, br: 110, cu: 117, ci: 100 })[Object.keys(MAT).find(k => MAT[k].name === sim.M.name)] / (2 * T.G) - 1, lo: 0.2, hi: 0.36, src: 'E from Exp. 1; ν ≈ 0.25–0.34' }]; },
    sample(sim) { const T = sim.truth, f = sim.fit; return `<div class="eq">d̄ = ${U.f(T.d, 3)} mm,  r = ${U.f(T.c, 3)} mm,  J = π(${U.f(T.d, 3)})⁴/32 = <b>${U.f(T.J, 1)} mm⁴</b></div>
      <div class="eq">Slope of T–θ (Table 1, θ in rad) = ${U.f(f.m, 0)} N·mm/rad<br>G = slope × L / J = ${U.f(f.m, 0)} × ${T.L} / ${U.f(T.J, 1)} = ${U.f(T.G * 1000, 0)} MPa = <b>${U.f(T.G, 2)} GPa</b></div>
      ${T.tlp ? `<div class="eq">τ_lp = T_lp·r/J = ${U.f(T.Tlp * 1000, 0)} × ${U.f(T.c, 3)} / ${U.f(T.J, 1)} = <b>${U.f(T.tlp, 1)} MPa</b></div>` : ''}
      <div class="eq">τ_r = T_max·r/J = ${U.f(T.Tmax * 1000, 0)} × ${U.f(T.c, 3)} / ${U.f(T.J, 1)} = <b>${U.f(T.tr, 1)} MPa</b>${T.tlp ? `<br>Fully plastic: τ = 3T_max/(2πr³) = 3 × ${U.f(T.Tmax * 1000, 0)} / (2π × ${U.f(T.c, 3)}³) = <b>${U.f(T.tn, 1)} MPa</b> (τ_r overestimates by 4/3 for a fully plastic section)` : ''}</div>
      <div class="eq">γ_f = r·θ_f/L = ${U.f(T.c, 3)} × ${U.f(T.thf * Math.PI / 180, 3)} / ${T.L} = <b>${U.f(T.gf, 4)} rad</b>;  turns = ${T.thf}/360 = <b>${U.f(T.turns, 2)}</b></div>`; },
    uncert(sim) { const T = sim.truth; const ud = 0.01 / Math.sqrt(12) / T.d; const uT = 0.005 / Math.sqrt(3); return [{ q: 'J', expr: 'u(J)/J = 4u(d)/d', val: T.J, u: T.J * 4 * ud, unit: 'mm⁴' }, { q: 'G', expr: '√[(4u_d/d)² + (u_slope/slope)²]', val: T.G, u: T.G * Math.hypot(4 * ud, Math.sqrt((1 - sim.fit.r2) / 5)), unit: 'GPa' }, { q: 'Modulus of rupture', expr: '√[(u_T/T)² + (3u_d/d)²]', val: T.tr, u: T.tr * Math.hypot(uT, 3 * ud), unit: 'MPa' }]; },
    conclude(sim) { const T = sim.truth; return `The modulus of rigidity of ${sim.M.name} is ${U.f(T.G, 1)} GPa. ${T.tlp ? `Shear stress at the limit of proportionality is ${U.f(T.tlp, 0)} MPa. The modulus of rupture (${U.f(T.tr, 0)} MPa) overestimates the true shear strength, which by the fully plastic analysis is ${U.f(T.tn, 0)} MPa. The bar sustained ${U.f(T.turns, 1)} turns (γ_f = ${U.f(T.gf, 2)}) and fractured on a flat transverse plane, the plane of maximum shear stress, which indicates ductile failure.` : `The bar fractured on a 45° helical surface with negligible plastic twist, at a modulus of rupture of ${U.f(T.tr, 0)} MPa. The helix follows the plane of maximum principal tensile stress, showing that grey iron fails by tension even under torsional loading.`}`; },
    summary: 'A circular bar twisted by torque T develops shear stress varying linearly with radius in the elastic range, τ = Tρ/J, and twists by θ = TL/(GJ). The slope of the torque–twist line therefore gives the modulus of rigidity G. When the outer fibre yields, a plastic annulus spreads inward and the torque–twist curve bends over. Applying the elastic formula to the maximum torque gives the modulus of rupture, which overestimates the shear strength of ductile metals; Nadai’s fully plastic analysis gives τ = 3T/(2πr³). Ductile metals fail on a transverse plane (maximum shear), while brittle grey iron fails on a 45° helix (maximum tension).',
    formulas: [['Torsion equation', 'T/J = τ/r = Gθ/L'], ['Polar moment (solid)', 'J = π d⁴ / 32'], ['Modulus of rigidity', 'G = T L / (J θ)'], ['Modulus of rupture', 'τ_r = T_max r / J'], ['Fully plastic shear strength', 'τ = 3 T_max / (2π r³)'], ['Shear strain at surface', 'γ = r θ / L'], ['Elastic constants', 'E = 2G(1 + ν)']],
    theory: `<h3>Torsion of a circular shaft</h3><p>Shafts, axles, springs and drill rods carry torque. For a solid circular bar the plane sections remain plane and radii remain straight, so the shear strain varies linearly from zero at the axis to γ = rθ/L at the surface. In the elastic range the stress follows: τ = Gγ. Integrating over the section gives the torsion equation:</p>
    <div class="eq">T / J = τ / r = G θ / L          J = π d⁴/32</div>
    <p>A troptometer measures θ over a known gauge length while the torque is small, so G can be computed from the slope of the T–θ line. Because G = E/(2(1+ν)), torsion and tension tests together give Poisson’s ratio.</p>
    <h3>Elastic–plastic and fully plastic torsion</h3><p>Once the surface reaches the shear yield stress, further twisting spreads a plastic annulus inward while the core remains elastic. The torque continues to rise more slowly. For an elastic–perfectly plastic material the torque tends to the fully plastic value T<sub>p</sub> = (2/3)πr³τ<sub>y</sub>, which is 4/3 of the torque at first yield. Applying the elastic formula τ = Tr/J to the maximum torque therefore overestimates shear strength by up to 33%; this value is called the <b>modulus of rupture</b>. Nadai’s analysis of the torque–twist curve gives the true surface stress; for a flat-topped curve it reduces to τ = 3T<sub>max</sub>/(2πr³).</p>
    <h3>Why torsion is useful</h3><p>Unlike tension, there is no necking in torsion: the specimen’s dimensions do not change and the strain can be taken to very large values. Torsion is therefore used to measure flow curves to high strain, as needed for hot-working studies. A scribed longitudinal line becomes a helix during the test and shows the shear strain directly.</p>
    <h3>Fracture modes</h3><p>In pure shear the principal stresses are ±τ at 45° to the axis. A ductile metal, which fails in shear, breaks on a flat plane perpendicular to the axis (plane of maximum shear). A brittle material, which fails in tension, breaks on a 45° helical surface normal to the maximum tensile stress. Chalk twisted between the fingers shows the same helix.</p>`,
    procedure: ['Measure the diameter at three positions with a micrometer and take the mean; scribe a longitudinal reference line.', 'Clamp the specimen in the chucks of the torsion machine, ensuring it is coaxial.', 'Mount the troptometer over the gauge length and set both torque and angle to zero.', 'Apply torque slowly and record torque and troptometer angle at equal increments in the elastic range.', 'Remove the troptometer before yielding becomes extensive.', 'Continue twisting at a steady rate, recording torque and machine angle, until fracture.', 'Record the maximum torque and the total angle of twist; examine the fracture surface and the helix formed by the scribed line.'],
    precautions: ['Ensure the specimen is coaxial with the chucks; misalignment adds bending.', 'Remove the troptometer before large deformations.', 'Twist slowly in the elastic range to allow accurate readings.', 'Keep hands clear of the rotating chuck.'],
    applications: ['Design of transmission shafts and axles.', 'Testing of fasteners and drill rods.', 'Determining G for spring design (helical springs are loaded in torsion).', 'Hot-torsion testing to simulate rolling and forging.'],
    errors: ['Slip of the specimen in the chucks, adding apparent twist.', 'Troptometer seating error at low torque.', 'Diameter measurement error, which enters J to the fourth power.', 'Axial loads from chuck clamping.'],
    discussion: ['Why does the modulus of rupture overestimate the shear strength of a ductile material?', 'Use your G and E from Exp. 1 to estimate Poisson’s ratio. Is it reasonable?', 'Explain the difference in fracture surface between mild steel and cast iron in torsion.', 'Why is a hollow shaft more efficient than a solid shaft of the same mass?'],
    refs: ['IS 1717:2012, Metallic Materials — Wire — Simple Torsion Test, BIS.', 'ASTM E143-20, Standard Test Method for Shear Modulus at Room Temperature.', 'A. Nadai, Theory of Flow and Fracture of Solids, McGraw-Hill, 1950.', 'G. E. Dieter, Mechanical Metallurgy, McGraw-Hill, Ch. 10.', 'S. P. Timoshenko, Strength of Materials, Part I, Van Nostrand.'],
    pre: [
      { q: 'The torsion equation is', o: ['T/J = τ/r = Gθ/L', 'M/I = σ/y = E/R', 'P/A = Eε', 'T = Fr'], a: 0, why: 'It relates torque, shear stress and twist.' },
      { q: 'Polar moment of inertia of a solid shaft of diameter d is', o: ['πd⁴/64', 'πd⁴/32', 'πd³/16', 'πd²/4'], a: 1, why: 'J = πd⁴/32.' },
      { q: 'In a solid shaft under elastic torsion, shear stress is maximum', o: ['At the centre', 'At the surface', 'Uniform', 'At mid-radius'], a: 1, why: 'τ ∝ radius.' },
      { q: 'An instrument used to measure small angles of twist over a gauge length is', o: ['Extensometer', 'Troptometer', 'Dial gauge', 'Strain gauge rosette'], a: 1, why: 'Troptometer = twist meter.' },
      { q: 'The relation between E, G and ν is', o: ['E = G(1+ν)', 'E = 2G(1+ν)', 'G = 2E(1+ν)', 'E = 3G(1−2ν)'], a: 1, why: 'Standard isotropic elasticity relation.' }
    ],
    post: [
      { q: 'Mild steel in torsion fractured on a flat transverse plane because', o: ['It fails by maximum tensile stress', 'It fails by maximum shear stress', 'Of machine misalignment', 'Of fatigue'], a: 1, why: 'Ductile metals fail in shear; the transverse plane carries maximum shear.' },
      { q: 'The fully plastic torque of a solid shaft is how many times the torque at first yield?', o: ['1', '4/3', '3/2', '2'], a: 1, why: 'T_p = (2/3)πr³τ_y; T_y = (π/2)r³τ_y; ratio 4/3.' },
      { q: 'A 1% error in diameter causes an error in J of about', o: ['1%', '2%', '3%', '4%'], a: 3, why: 'J ∝ d⁴.' },
      { q: 'Grey cast iron breaks on a 45° helix in torsion because', o: ['Maximum shear acts at 45°', 'Maximum principal tensile stress acts at 45°', 'Graphite is aligned at 45°', 'Of residual stress'], a: 1, why: 'Brittle materials fail normal to the maximum tension.' },
      { q: 'With E = 205 GPa and G = 80 GPa, Poisson’s ratio is', o: ['0.18', '0.28', '0.33', '0.40'], a: 1, why: 'ν = E/(2G) − 1 = 0.281.' }
    ]
  });
})();
