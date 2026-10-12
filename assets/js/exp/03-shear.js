(function () {
  const U = LAB.U, G = LAB.G;
  const MAT = {
    ms: { name: 'Mild steel (IS 2062 E250)', su: 432, k: 0.76, G: 80000, duct: 1, ref: [290, 360] },
    al: { name: 'Aluminium alloy 6061-T6', su: 310, k: 0.67, G: 26000, duct: 0.6, ref: [190, 225] },
    br: { name: 'Brass CuZn37 (half hard)', su: 400, k: 0.6, G: 37000, duct: 0.8, ref: [220, 270] },
    cu: { name: 'Copper, annealed', su: 222, k: 0.72, G: 44000, duct: 1.2, ref: [140, 175] },
    ci: { name: 'Grey cast iron FG 200', su: 205, k: 1.3, G: 40000, duct: 0.05, ref: [220, 300] }
  };
  LAB.register({
    id: 'shear', no: 3, cat: 'mech', title: 'Shear Test', std: 'IS 5242:1979 / ASTM B769 (double shear)', short: 'Single- and double-shear of round bars in a shear fixture: ultimate shear strength and its ratio to tensile strength.', tags: 'double shear single shear rivet pin fixture',
    aim: 'To determine the ultimate shear strength of a round bar in single or double shear using a shear fixture in a universal testing machine, and to compare it with the tensile strength.',
    objectives: ['Test three specimens of the same material in direct shear.', 'Calculate ultimate shear strength and its statistical scatter.', 'Relate shear strength to tensile strength and to the von Mises and Tresca criteria.', 'Interpret the sheared surfaces.'],
    apparatus: ['Universal testing machine, 400 kN', 'Double-shear fixture with hardened shear blades (bore to suit 10 mm bar)', 'Single-shear attachment', 'Micrometer (LC 0.01 mm)'],
    stdNote: 'IS 5242 covers shear testing of steel wire and bars; ASTM B769 describes the double-shear fixture for aluminium alloys.',
    params: [
      { id: 'mat', label: 'Material', type: 'select', options: Object.entries(MAT).map(([k, v]) => [k, v.name]), def: 'ms' },
      { id: 'mode', label: 'Shear mode', type: 'select', options: [['double', 'Double shear'], ['single', 'Single shear']], def: 'double' },
      { id: 'd', label: 'Bar diameter', type: 'select', options: [['8', '8 mm'], ['10', '10 mm'], ['12', '12 mm']], def: '10' }
    ],
    opSteps: ['Measure bar diameter with micrometer', 'Insert bar through fixture bores', 'Place fixture centrally on UTM table', 'Apply load to the central blade at constant rate', 'Record maximum load at shearing', 'Repeat for specimens 2 and 3', 'Examine sheared faces'],
    svg(p) {
      const dbl = p.mode !== 'single';
      return G.utm(`${G.r(256, 56, 8, 30, 'mach2')}
        <g id="ram">${G.r(230, 86, 60, 18, 'steelD')}</g>
        ${dbl ? G.r(170, 170, 50, 90, 'steelD', 'rx="2"') + G.r(300, 170, 50, 90, 'steelD', 'rx="2"') : G.r(170, 170, 70, 90, 'steelD', 'rx="2"')}
        <g id="mid">${G.r(dbl ? 230 : 250, 104, dbl ? 60 : 50, 80, 'mach2', 'rx="2"')}</g>
        <g id="barL">${G.r(150, 180, dbl ? 75 : 95, 14, 'spec', 'rx="3"')}</g>
        <g id="barM">${G.r(dbl ? 225 : 245, 180, dbl ? 70 : 125, 14, 'spec')}</g>
        ${dbl ? `<g id="barR">${G.r(295, 180, 75, 14, 'spec', 'rx="3"')}</g>` : ''}
        ${G.r(150, 260, 220, 10, 'mach')}${G.t(150, 300, '', 'm', 'id="lab"')}${G.t(380, 160, '', 'm', 'id="spn"')}`, 'Shear fixture in UTM');
    },
    anim(svg, f, sim, p) {
      const a = sim ? sim.at(f) : { P: 0, disp: 0, phase: 'Ready', k: 0, broken: false };
      const dy = Math.min(26, a.disp * 6) + (a.broken ? 14 : 0);
      G.set(svg, 'mid', 'transform', `translate(0,${dy})`); G.set(svg, 'ram', 'transform', `translate(0,${dy})`); G.set(svg, 'barM', 'transform', `translate(0,${dy})`);
      G.txt(svg, 'dL', U.f(a.P, 2)); G.txt(svg, 'dD', U.f(a.disp, 2)); G.txt(svg, 'lab', a.phase); G.txt(svg, 'spn', sim ? `Specimen ${a.k + 1} of 3` : ''); G.txt(svg, 'cap', sim ? sim.name : '');
    },
    simulate(p, r) {
      const M = MAT[p.mat]; const nPl = p.mode === 'single' ? 1 : 2; const specs = [];
      const X = [], Y = [], ser = [];
      for (let k = 0; k < 3; k++) {
        const d = U.mean([U.q(p.d + 0.01 * U.gauss(r), 0.01), U.q(p.d + 0.01 * U.gauss(r), 0.01)]); const A = Math.PI * d * d / 4;
        const tau = M.su * M.k * (1 + 0.03 * U.gauss(r)) * (p.mode === 'single' ? 0.97 : 1);
        const Pmax = tau * A * nPl / 1000; const dpk = 0.3 + 1.6 * M.duct * (p.d / 10); const dfr = dpk * (M.duct > 0.2 ? 1.35 : 1.02);
        const x = [], y = []; const kel = Pmax / (0.18 * dpk + 0.05);
        for (let i = 0; i <= 120; i++) { const dd = dfr * i / 120; let P; if (dd <= dpk) { const lin = kel * dd; P = Math.min(lin, Pmax * (1 - Math.pow(1 - dd / dpk, 2.4)) / (1 - 0) ); P = Math.min(P, lin); } else P = Pmax * (1 - 0.85 * Math.pow((dd - dpk) / (dfr - dpk), 1.6)); x.push(dd); y.push(Math.max(0, P)); }
        x.push(dfr * 1.01); y.push(0);
        const PmaxR = U.q(Math.max(...y), 0.01);
        specs.push({ d, A, Pmax: PmaxR, tau: PmaxR * 1000 / (nPl * A) }); ser.push({ name: 'Specimen ' + (k + 1), x, y, color: 's' + (k + 1) });
      }
      const taus = specs.map(s => s.tau); const T = { taus, mean: U.mean(taus), sd: U.sd(taus), A1: specs[0].A, su: M.su, nPl };
      T.ratio = T.mean / M.su; T.cov = T.sd / T.mean * 100;
      const tot = ser.reduce((a, s) => a + s.x.length, 0);
      const at = f => { let n = Math.floor(f * tot); for (let k = 0; k < 3; k++) { const L = ser[k].x.length; if (n < L || k === 2) { const i = Math.min(L - 1, n); return { k, P: ser[k].y[i], disp: ser[k].x[i], broken: i >= L - 2, phase: i >= L - 2 ? 'Sheared' : (ser[k].y[i] < specs[k].Pmax * 0.6 && i < L / 3 ? 'Elastic / bearing' : 'Plastic shearing') }; } n -= L; } };
      return {
        name: M.name, dur: 9, M,
        at, readout(f) { const a = at(f); return [['Specimen', a.k + 1 + ' / 3', ''], ['Load', U.f(a.P, 2), 'kN'], ['Blade travel', U.f(a.disp, 2), 'mm'], ['Shear planes', nPl, ''], ['Stage', a.phase, '']]; },
        plot: { title: 'Load–displacement', xlabel: 'Blade displacement (mm)', ylabel: 'Load (kN)', series: ser, caption: 'Load–displacement curves of three specimens' },
        specimen: [['Material', M.name, ''], ['Nominal diameter', p.d, 'mm'], ['Shear mode', p.mode === 'single' ? 'Single shear (1 plane)' : 'Double shear (2 planes)', ''], ['Tensile strength of same lot (Exp. 1 / mill certificate)', M.su, 'MPa'], ['Loading rate', '1 mm/min', '']],
        obs: [{ title: 'Table 1. Shear test readings', cols: ['Specimen', 'Diameter d (mm, mean of 2)', 'Maximum load P_max (kN)', 'Shear planes'], rows: specs.map((s, i) => [i + 1, U.f(s.d, 3), U.f(s.Pmax, 2), nPl]) }],
        truth: T, specs
      };
    },
    calcs(sim) {
      const T = sim.truth; const a = sim.specs.map((s, i) => ({ key: 't' + i, label: `Ultimate shear strength, specimen ${i + 1}`, unit: 'MPa', truth: s.tau, tol: 0.012, hint: T.nPl === 2 ? 'τ = P_max / (2 × πd²/4)' : 'τ = P_max / (πd²/4)' }));
      a.unshift({ key: 'A1', label: 'Shear area of one plane, specimen 1', unit: 'mm²', truth: T.A1, tol: 0.005, hint: 'πd²/4' });
      a.push({ key: 'mean', label: 'Mean ultimate shear strength τ̄', unit: 'MPa', truth: T.mean, tol: 0.01, hint: 'mean of three' }, { key: 'sd', label: 'Standard deviation s', unit: 'MPa', truth: T.sd, abs: Math.max(0.6, T.sd * 0.08), hint: '√[Σ(τ−τ̄)²/(n−1)]' }, { key: 'ratio', label: 'Ratio τ̄ / σ_u', unit: '—', truth: T.ratio, tol: 0.015, hint: 'τ̄ / tensile strength' });
      return a;
    },
    reference(sim) { const T = sim.truth, M = sim.M; return [{ label: 'Ultimate shear strength', unit: 'MPa', value: T.mean, lo: M.ref[0], hi: M.ref[1], src: 'ASM / MMPDS' }, { label: 'τ/σ_u ratio', unit: '', value: T.ratio, lo: M.k > 1 ? 1.0 : 0.55, hi: M.k > 1 ? 1.6 : 0.82, src: M.k > 1 ? 'Grey iron, ASM Vol. 1' : 'Ductile metals 0.6–0.8' }]; },
    sample(sim) { const T = sim.truth, s = sim.specs[0]; return `<div class="eq">Specimen 1: A = π(${U.f(s.d, 3)})²/4 = ${U.f(s.A, 2)} mm²<br>τ₁ = P_max / (n·A) = ${U.f(s.Pmax * 1000, 0)} / (${T.nPl} × ${U.f(s.A, 2)}) = <b>${U.f(s.tau, 1)} MPa</b></div><div class="eq">τ̄ = (${T.taus.map(t => U.f(t, 1)).join(' + ')})/3 = <b>${U.f(T.mean, 1)} MPa</b>;  s = <b>${U.f(T.sd, 2)} MPa</b> (CoV ${U.f(T.cov, 2)}%)<br>τ̄/σ_u = ${U.f(T.mean, 1)}/${T.su} = <b>${U.f(T.ratio, 3)}</b>  (von Mises predicts 0.577 at yield; Tresca 0.5)</div>`; },
    uncert(sim) { const T = sim.truth; const s = sim.specs[0]; const ud = 0.01 / Math.sqrt(12); const uP = 0.01 / Math.sqrt(3); return [{ q: 'τ (single specimen)', expr: '√[(u_P/P)² + (2u_d/d)²]', val: s.tau, u: s.tau * Math.hypot(uP, 2 * ud / s.d), unit: 'MPa' }, { q: 'Mean τ̄ (type A)', expr: 's/√n', val: T.mean, u: T.sd / Math.sqrt(3), unit: 'MPa' }]; },
    conclude(sim) { const T = sim.truth; return `The mean ultimate shear strength of ${sim.name} in ${T.nPl === 2 ? 'double' : 'single'} shear is ${U.f(T.mean, 1)} MPa (s = ${U.f(T.sd, 1)} MPa, n = 3), which is ${U.f(T.ratio, 2)} times the tensile strength. ${T.ratio < 1 ? 'This is consistent with the 0.6–0.8 range expected for ductile metals; work hardening before separation raises the ratio above the 0.577 von Mises value for yield.' : 'For grey cast iron the shear strength exceeds the tensile strength because graphite flakes are less damaging under shear than under tension.'}`; },
    summary: 'In direct shear a round bar is cut across one plane (single shear) or two planes (double shear) by hardened blades. The average shear stress at failure is the maximum load divided by the total sheared area, τ = P/(nA). The test models rivets, pins, keys and bolts. Pure shear theory gives a shear yield of 0.5σ_y (Tresca) or 0.577σ_y (von Mises); the ultimate shear strength of ductile metals is typically 0.6–0.8 of the tensile strength because the material hardens before separating. The direct shear test also includes some bending and bearing, so it gives an engineering rather than a pure shear strength.',
    formulas: [['Shear stress, single shear', 'τ = P / A'], ['Shear stress, double shear', 'τ = P / (2A)'], ['Area of bar', 'A = π d² / 4'], ['von Mises shear yield', 'τ_y = σ_y / √3 = 0.577 σ_y'], ['Tresca shear yield', 'τ_y = 0.5 σ_y'], ['Sample standard deviation', 's = √[Σ(τ − τ̄)²/(n − 1)]']],
    theory: `<h3>Direct shear</h3><p>Pins, rivets, bolts in clearance holes and keys fail by shearing across their section. The direct shear test reproduces this: a bar passes through a fixture and a central blade pushes it sideways. In <b>single shear</b> the bar is cut on one plane; in <b>double shear</b> the central blade cuts it on two planes at once, so the load is shared between two areas.</p>
    <div class="eq">τ = P_max / (n · πd²/4)       n = 1 (single) or 2 (double)</div>
    <h3>Stress state</h3><p>The calculated value is an average. The real stress distribution is not uniform: there is bearing (contact) stress on the bar from the blades and some bending, especially in single shear where the blades are offset. Double shear is preferred because it is symmetric and reduces bending, which is why ASTM B769 uses it for aluminium rivet wire.</p>
    <h3>Relation to tensile strength</h3><p>For a ductile metal the shear stress at yield is predicted by the yield criteria: Tresca gives τ<sub>y</sub> = 0.5σ<sub>y</sub> and von Mises gives τ<sub>y</sub> = 0.577σ<sub>y</sub>. At fracture the material has strain-hardened, so the ratio of ultimate shear strength to tensile strength is higher, commonly 0.6–0.8. Design codes use this ratio when tensile data are available but shear data are not (for example IS 800 uses f<sub>y</sub>/√3 for shear in steel members).</p>
    <p>For brittle grey cast iron the shear strength can exceed the tensile strength, because the graphite flakes that act as cracks in tension are less effective in shear.</p>
    <h3>Fracture surface</h3><p>A ductile bar shows a smooth, burnished shear zone where the blade has sheared the material, followed by a rougher fracture zone. The proportion of burnish indicates ductility, the same feature used to judge blanking quality in sheet metal.</p>
    <h3>Statistics</h3><p>Three specimens are tested because individual results scatter with diameter, local hardness and fixture clearance. Report the mean, the standard deviation and the coefficient of variation; a CoV above about 5% for a homogeneous bar suggests a test problem.</p>`,
    procedure: ['Measure the diameter of each specimen at the two shear planes with a micrometer.', 'Insert the bar in the fixture; it must fit the bores with minimum clearance.', 'Place the fixture centrally on the lower table of the UTM, with the central blade under the upper crosshead.', 'Apply load at a uniform slow rate until the bar shears; record the maximum load.', 'Remove the pieces and inspect the sheared surfaces.', 'Repeat for the remaining specimens.'],
    precautions: ['Keep blade clearance small; excessive clearance adds bending and lowers the apparent strength.', 'Use hardened blades and check them for wear before each test.', 'The sheared pieces can be ejected; keep the guard in place.', 'Ensure the load is applied centrally on the fixture.'],
    applications: ['Design of rivets, pins, keys, cotters and bolts.', 'Acceptance of rivet wire and fastener materials.', 'Estimating blanking and punching forces in press tools (F = τ_u × perimeter × thickness).'],
    errors: ['Fixture clearance causing bending.', 'Blade wear causing tearing rather than shearing.', 'Diameter variation between the two shear planes.', 'Loading rate effects.'],
    discussion: ['Why is double shear preferred over single shear for material testing?', 'Compare your τ/σ_u ratio with the Tresca and von Mises predictions. Why is the measured ratio higher?', 'How would you use your result to find the force needed to punch a 20 mm hole in 3 mm sheet of the same material?'],
    refs: ['IS 5242:1979, Method of Test for Determining Shear Strength of Metals, BIS.', 'ASTM B769-11, Standard Test Method for Shear Testing of Aluminum Alloys.', 'IS 800:2007, General Construction in Steel — Code of Practice, Cl. 8.4.', 'R. C. Hibbeler, Mechanics of Materials, Pearson, Ch. 1.', 'G. E. Dieter, Mechanical Metallurgy, McGraw-Hill, Ch. 3.'],
    pre: [
      { q: 'In double shear, the load is resisted by', o: ['One area', 'Two areas', 'Half an area', 'Four areas'], a: 1, why: 'The bar is cut on two planes.' },
      { q: 'A rivet in a lap joint is loaded in', o: ['Tension', 'Single shear', 'Double shear', 'Torsion'], a: 1, why: 'Two plates overlap on one plane.' },
      { q: 'The von Mises criterion predicts shear yield stress as', o: ['0.5σ_y', '0.577σ_y', '0.707σ_y', 'σ_y'], a: 1, why: 'τ_y = σ_y/√3.' },
      { q: 'The direct shear test gives an average shear stress because', o: ['Load is not measured', 'Bearing and bending stresses are also present', 'Area changes', 'It is a dynamic test'], a: 1, why: 'The real distribution is non-uniform.' },
      { q: 'Units of shear strength are', o: ['N', 'N/mm²', 'N·m', 'J'], a: 1, why: 'Stress = force/area.' }
    ],
    post: [
      { q: 'A 10 mm bar fails at 48 kN in double shear. τ_u is about', o: ['611 MPa', '306 MPa', '153 MPa', '480 MPa'], a: 1, why: '48000/(2 × 78.54) = 305.6 MPa.' },
      { q: 'Your ductile specimen gave τ/σ_u ≈ 0.75. The main reason it exceeds 0.577 is', o: ['Machine error', 'Strain hardening before separation', 'Bending', 'Elastic recovery'], a: 1, why: 'von Mises applies at yield, not at ultimate.' },
      { q: 'If fixture clearance is large, measured shear strength tends to be', o: ['Higher', 'Lower', 'Unchanged', 'Infinite'], a: 1, why: 'Bending adds tensile stress, causing earlier failure.' },
      { q: 'The force to punch a 20 mm hole in 3 mm MS sheet (τ_u = 320 MPa) is about', o: ['60 kN', '30 kN', '120 kN', '15 kN'], a: 0, why: 'F = τ·πd·t = 320 × π × 20 × 3 ≈ 60.3 kN.' },
      { q: 'A coefficient of variation of 1.5% for three specimens indicates', o: ['Poor repeatability', 'Good repeatability', 'Wrong units', 'Brittle material'], a: 1, why: 'Low scatter.' }
    ]
  });
})();
