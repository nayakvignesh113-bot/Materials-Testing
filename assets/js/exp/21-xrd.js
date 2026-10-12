(function () {
  const U = LAB.U, G = LAB.G;
  const LAM = 1.5406, BINST = 0.08; // Cu Kα1 (Å), instrumental FWHM (deg 2θ)
  const MAT = {
    fe: { name: 'α-Iron (ferrite)', s: 'BCC', a: 2.8665, Z: 26 },
    w: { name: 'Tungsten', s: 'BCC', a: 3.1652, Z: 74 },
    al: { name: 'Aluminium', s: 'FCC', a: 4.0495, Z: 13 },
    cu: { name: 'Copper', s: 'FCC', a: 3.6149, Z: 29 },
    ni: { name: 'Nickel', s: 'FCC', a: 3.5240, Z: 28 },
    si: { name: 'Silicon', s: 'Diamond cubic', a: 5.4309, Z: 14 }
  };
  const COND = { ann: ['Annealed powder (coarse crystallites)', 250, 0.0002], mill: ['Ball-milled 20 h (nanocrystalline, strained)', 22, 0.0035] };
  function peaks(M) {
    const seen = {}; const out = [];
    for (let h = 0; h <= 6; h++) for (let k = 0; k <= h; k++) for (let l = 0; l <= k; l++) {
      const N = h * h + k * k + l * l; if (!N || N > 44) continue;
      let F;
      if (M.s === 'BCC') F = (h + k + l) % 2 === 0 ? 2 : 0;
      else if (M.s === 'FCC') F = ((h % 2 === k % 2) && (k % 2 === l % 2)) ? 4 : 0;
      else { const allE = h % 2 === 0 && k % 2 === 0 && l % 2 === 0, allO = h % 2 && k % 2 && l % 2; if (allO) F = 4 * Math.SQRT2; else if (allE && (h + k + l) % 4 === 0) F = 8; else F = 0; }
      if (!F) continue; const d = M.a / Math.sqrt(N); const st = LAM / (2 * d); if (st >= 1) continue; const th = Math.asin(st); const tt = 2 * th * 180 / Math.PI; if (tt < 20 || tt > 120) continue;
      const key = N + ':' + F; if (seen[key]) { continue; } seen[key] = 1;
      // multiplicity
      const set = new Set(); const perm = [[h, k, l], [h, l, k], [k, h, l], [k, l, h], [l, h, k], [l, k, h]]; perm.forEach(([a, b, c]) => [1, -1].forEach(sa => [1, -1].forEach(sb => [1, -1].forEach(sc => set.add([a * sa, b * sb, c * sc].join(','))))));
      const s = st / LAM; const f = M.Z * Math.exp(-4.0 * s * s);
      const LP = (1 + Math.cos(2 * th) ** 2) / (Math.sin(th) ** 2 * Math.cos(th)); const DW = Math.exp(-2 * 0.45 * s * s);
      out.push({ hkl: `(${h}${k}${l})`, N, d, tt, th, I: set.size * F * F * f * f * LP * DW });
    }
    out.sort((a, b) => a.tt - b.tt); const mx = Math.max(...out.map(p => p.I)); out.forEach(p => p.I = p.I / mx * 100); return out;
  }
  LAB.register({
    id: 'xrd', no: 21, cat: 'meta', title: 'X-ray Diffraction Analysis', std: 'ASTM E975 / ICDD PDF data; Scherrer and Williamson–Hall methods', short: 'θ–2θ scan with Cu Kα: index peaks from sin²θ ratios, identify the lattice, compute lattice parameter, Scherrer crystallite size and Williamson–Hall strain.', tags: 'XRD Bragg diffraction lattice parameter Scherrer crystallite size Williamson Hall indexing', advanced: true,
    aim: 'To record the X-ray diffraction pattern of a metal powder using Cu Kα radiation, index the reflections, identify the crystal structure, determine the lattice parameter, and estimate crystallite size and microstrain from peak broadening.',
    objectives: ['Apply Bragg’s law to convert 2θ to interplanar spacing.', 'Index peaks from sin²θ ratios and identify BCC, FCC or diamond cubic structure.', 'Determine the lattice parameter accurately.', 'Estimate crystallite size (Scherrer) and microstrain (Williamson–Hall).'],
    apparatus: ['Powder X-ray diffractometer, Bragg–Brentano θ–2θ geometry', 'Cu target tube (40 kV, 30 mA), Ni filter, λ(Kα₁) = 1.5406 Å', 'Scintillation or 1D strip detector', 'Zero-background sample holder', 'Si standard (NIST SRM 640) for instrumental broadening'],
    stdNote: 'Instrumental FWHM from the Si standard = 0.08° 2θ. Scherrer constant K = 0.9.',
    params: [
      { id: 'mat', label: 'Sample', type: 'select', options: Object.entries(MAT).map(([k, v]) => [k, 'Unknown cubic powder ' + k.toUpperCase()]), def: 'cu', hint: 'Identify it from the pattern.' },
      { id: 'cond', label: 'Condition', type: 'select', options: Object.entries(COND).map(([k, v]) => [k, v[0]]), def: 'ann' },
      { id: 'step', label: 'Step size', type: 'select', options: [['0.02', '0.02°'], ['0.05', '0.05°']], def: '0.02' }
    ],
    opSteps: ['Mount powder flat in holder', 'Set 40 kV / 30 mA; align', 'Scan 2θ = 20°–120°', 'Background subtraction', 'Peak search: 2θ, intensity, FWHM', 'Index peaks; identify structure', 'Lattice parameter, size, strain'],
    svg() {
      return G.svg('0 0 520 280', `${G.r(0, 0, 520, 280, 'bg')}<circle cx="260" cy="200" r="150" fill="none" stroke="var(--line)" stroke-dasharray="3 5"/>${G.r(230, 196, 60, 10, 'spec', 'id="xs"')}${G.r(240, 206, 40, 30, 'mach2')}
        <g id="tube">${G.r(90, 188, 80, 26, 'mach', 'rx="4"')}${G.t(96, 205, 'Cu tube', 'm', 'style="fill:var(--panel-ink)"')}<line x1="170" y1="201" x2="255" y2="201" stroke="var(--straw)" stroke-width="3" opacity=".8"/></g>
        <g id="det">${G.r(350, 188, 80, 26, 'disp', 'rx="4"')}${G.t(360, 205, 'Detector', 'm', 'style="fill:var(--panel-ink)"')}<line x1="265" y1="201" x2="350" y2="201" stroke="var(--accent)" stroke-width="2" stroke-dasharray="4 3"/></g>
        ${G.t(20, 30, '', 'big', 'id="lab"')}${G.t(20, 50, '', 'm', 'id="sub"')}`, 'Bragg–Brentano diffractometer');
    },
    anim(svg, f, sim) { const tt = sim ? 20 + 100 * f : 20; const th = tt / 2; G.set(svg, 'tube', 'transform', `rotate(${th} 260 201)`); G.set(svg, 'det', 'transform', `rotate(${-th} 260 201)`); G.txt(svg, 'lab', `2θ = ${U.f(tt, 2)}°`); G.txt(svg, 'sub', sim ? `θ = ${U.f(th, 2)}° · ${sim.cps(tt)} counts` : ''); },
    simulate(p, r) {
      const M = MAT[p.mat]; const [cname, L, eps] = COND[p.cond]; const pk = peaks(M);
      pk.forEach(q => { const bs = 0.9 * LAM / (L * 10 * Math.cos(q.th)) * 180 / Math.PI; const be = 4 * eps * Math.tan(q.th) * 180 / Math.PI; q.bs = bs + be; q.fw = Math.sqrt(BINST * BINST + q.bs * q.bs); });
      const step = p.step; const x = [], y = []; const I0 = 9000;
      const pv = (t, c, w) => { const g = Math.exp(-4 * Math.LN2 * ((t - c) / w) ** 2), l = 1 / (1 + 4 * ((t - c) / w) ** 2); return 0.5 * g + 0.5 * l; };
      for (let t = 20; t <= 120 + 1e-9; t += step) { let s = 120 + 4000 / t; pk.forEach(q => { s += I0 * q.I / 100 * pv(t, q.tt, q.fw) * (BINST / q.fw) ** 0.3; }); const c = Math.max(0, s + Math.sqrt(s) * U.gauss(r)); x.push(+t.toFixed(3)); y.push(Math.round(c)); }
      const list = pk.filter(q => q.I > 1.5).map(q => ({ ...q, ttm: U.q(q.tt + 0.006 * U.gauss(r), 0.01), fwm: U.q(q.fw * (1 + 0.03 * U.gauss(r)), 0.001), Im: U.q(q.I * (1 + 0.04 * U.gauss(r)), 0.1) }));
      const mxI = Math.max(...list.map(q => q.Im)); list.forEach(q => q.Im = U.q(q.Im / mxI * 100, 0.1));
      // truths from recorded peak list
      const p1 = list[0]; const th1 = p1.ttm / 2 * Math.PI / 180; const d1 = LAM / (2 * Math.sin(th1));
      const hi = list[list.length - 1]; const thH = hi.ttm / 2 * Math.PI / 180; const aH = LAM / (2 * Math.sin(thH)) * Math.sqrt(hi.N);
      const aAll = U.mean(list.map(q => LAM / (2 * Math.sin(q.ttm / 2 * Math.PI / 180)) * Math.sqrt(q.N)));
      const s2 = list.map(q => Math.sin(q.ttm / 2 * Math.PI / 180) ** 2); const ratio2 = s2[1] / s2[0];
      const bcorr = Math.sqrt(Math.max(1e-6, p1.fwm ** 2 - BINST ** 2)) * Math.PI / 180; const Lsch = 0.9 * LAM / (bcorr * Math.cos(th1)) / 10; // nm
      const whx = list.map(q => 4 * Math.sin(q.ttm / 2 * Math.PI / 180)), why = list.map(q => Math.sqrt(Math.max(1e-6, q.fwm ** 2 - BINST ** 2)) * Math.PI / 180 * Math.cos(q.ttm / 2 * Math.PI / 180));
      const wh = U.linfit(whx, why); const Lwh = 0.9 * LAM / wh.c / 10; const eWH = wh.m;
      const T = { d1, hkl1: p1.hkl, s: M.s, aH, aAll, ratio2, Lsch, Lwh, eWH, a0: M.a, name: M.name, N1: p1.N, cond: p.cond };
      return {
        M, dur: 10, list,
        cps(tt) { const i = Math.min(y.length - 1, Math.max(0, Math.round((tt - 20) / step))); return y[i]; },
        readout(f) { const tt = 20 + 100 * f; return [['2θ', U.f(tt, 2), '°'], ['Counts', this.cps(tt), ''], ['Tube', '40 kV · 30 mA', ''], ['Step / time', `${step}° / 0.5 s`, '']]; },
        plot: { title: 'Diffraction pattern', xlabel: '2θ (degree), Cu Kα', ylabel: 'Intensity (counts)', xmin: 20, xmax: 120, series: [{ name: 'Measured', x, y, color: 's1', width: 1.2 }], marks: list.filter(q => q.Im > 6).map(q => ({ x: q.ttm, y: Math.max(...y.slice(Math.max(0, Math.round((q.ttm - 20) / step) - 3), Math.round((q.ttm - 20) / step) + 4)), text: q.ttm.toFixed(1) + '°', frac: (q.ttm - 20) / 100 })), caption: 'X-ray diffraction pattern (Cu Kα, θ–2θ)' },
        plots: [{ xlabel: '4 sin θ', ylabel: 'β cos θ (rad)', series: [{ name: 'Peaks', x: whx, y: why, type: 'scatter' }, { name: `Fit: L = ${U.f(Lwh, 0)} nm, ε = ${U.sci(eWH, 2)}`, x: [0, Math.max(...whx) * 1.05], y: [wh.c, wh.c + wh.m * Math.max(...whx) * 1.05], color: 's2', dash: true }], yzero: true, xzero: true, caption: 'Williamson–Hall plot' }],
        specimen: [['Sample', 'Unknown cubic metal powder ' + p.mat.toUpperCase(), ''], ['Condition', cname, ''], ['Radiation', 'Cu Kα₁, λ = 1.5406 Å (Kα₂ stripped)', ''], ['Scan', `2θ 20–120°, step ${step}°, 0.5 s/step`, ''], ['Instrumental FWHM', BINST, '° 2θ'], ['Scherrer constant K', 0.9, '']],
        obs: [{ title: 'Table 1. Peak list (after background subtraction and Kα₂ stripping)', cols: ['Peak', '2θ (°)', 'FWHM (°)', 'I/I₀ (%)'], rows: list.map((q, i) => [i + 1, U.f(q.ttm, 2), U.f(q.fwm, 3), U.f(q.Im, 1)]) }],
        truth: T
      };
    },
    calcs(sim) { const T = sim.truth; const opts = ['(100)', '(110)', '(111)', '(200)', '(211)', '(220)']; const a = [{ key: 'd1', label: 'Interplanar spacing of peak 1', unit: 'Å', truth: T.d1, tol: 0.003, hint: 'd = λ / (2 sin θ)' }, { key: 'r2', label: 'Ratio sin²θ₂ / sin²θ₁', unit: '—', truth: T.ratio2, tol: 0.01, hint: 'BCC 2.0, FCC 1.333, diamond 2.667' }, { key: 'str', label: 'Crystal structure', type: 'select', options: ['BCC', 'FCC', 'Diamond cubic', 'Simple cubic'], truth: T.s }, { key: 'hkl', label: 'Miller indices of peak 1', type: 'select', options: opts, truth: T.hkl1 }, { key: 'aH', label: 'Lattice parameter from the highest-angle peak', unit: 'Å', truth: T.aH, tol: 0.002, hint: 'a = d √(h²+k²+l²)' }, { key: 'L', label: 'Crystallite size from peak 1 (Scherrer)', unit: 'nm', truth: T.Lsch, tol: 0.1, hint: 'L = Kλ / (β cos θ), β² = β_obs² − β_inst² (rad)' }];
      if (T.cond === 'mill') a.push({ key: 'eps', label: 'Microstrain ε (Williamson–Hall slope)', unit: '—', truth: T.eWH, tol: 0.15, hint: 'slope of β cos θ vs 4 sin θ', fmt: v => U.sci(v, 3) });
      a.push({ key: 'id', label: 'Identify the material', type: 'select', options: Object.values(MAT).map(m => m.name), truth: T.name });
      return a; },
    reference(sim) { const T = sim.truth; return [{ label: 'Lattice parameter', unit: 'Å', value: T.aH, lo: T.a0 * 0.998, hi: T.a0 * 1.002, src: 'ICDD PDF reference', fmt: v => U.f(v, 4), range: `${U.f(T.a0, 4)} ± 0.2%` }, { label: 'Crystallite size (Scherrer)', unit: 'nm', value: T.Lsch, lo: T.cond === 'mill' ? 10 : 80, hi: T.cond === 'mill' ? 45 : 1000, src: T.cond === 'mill' ? 'Ball-milled powders' : 'Annealed: near instrument limit' }]; },
    sample(sim) { const T = sim.truth, q = sim.list[0], h = sim.list[sim.list.length - 1]; return `<div class="eq">Peak 1: 2θ = ${U.f(q.ttm, 2)}°, θ = ${U.f(q.ttm / 2, 3)}°;  d = λ/(2 sin θ) = 1.5406/(2 × ${U.f(Math.sin(q.ttm / 2 * Math.PI / 180), 5)}) = <b>${U.f(T.d1, 4)} Å</b></div><div class="eq">sin²θ ratios: ${sim.list.map(x => U.f(Math.sin(x.ttm / 2 * Math.PI / 180) ** 2 / Math.sin(q.ttm / 2 * Math.PI / 180) ** 2, 3)).join(', ')}<br>Multiply by ${T.s === 'BCC' ? 2 : T.s === 'FCC' ? 3 : 3}: ${sim.list.map(x => U.f(Math.sin(x.ttm / 2 * Math.PI / 180) ** 2 / Math.sin(q.ttm / 2 * Math.PI / 180) ** 2 * T.N1, 2)).join(', ')} → h²+k²+l² = ${sim.list.map(x => x.N).join(', ')} → <b>${T.s}</b>, peak 1 = ${T.hkl1}</div><div class="eq">Highest peak ${h.hkl} at 2θ = ${U.f(h.ttm, 2)}°: a = d√N = <b>${U.f(T.aH, 4)} Å</b> (mean of all peaks ${U.f(T.aAll, 4)} Å)</div><div class="eq">Scherrer: β = √(${U.f(q.fwm, 3)}² − 0.08²) = ${U.f(Math.sqrt(q.fwm ** 2 - 0.0064), 4)}° = ${U.f(Math.sqrt(q.fwm ** 2 - 0.0064) * Math.PI / 180, 6)} rad<br>L = 0.9 × 1.5406 / (β cos θ) = <b>${U.f(T.Lsch, 1)} nm</b>${T.cond === 'mill' ? `<br>Williamson–Hall: L = ${U.f(T.Lwh, 1)} nm, ε = <b>${U.sci(T.eWH, 3)}</b>` : ''}</div>`; },
    uncert(sim) { const T = sim.truth, h = sim.list[sim.list.length - 1]; const th = h.ttm / 2 * Math.PI / 180; const uth = 0.01 / 2 * Math.PI / 180 / Math.sqrt(3); return [{ q: 'Lattice parameter (highest angle)', expr: 'Δa/a = cot θ · Δθ', val: T.aH, u: T.aH / Math.tan(th) * uth, unit: 'Å' }, { q: 'Crystallite size', expr: 'u(β)/β, β from FWHM ± 0.002°', val: T.Lsch, u: T.Lsch * 0.002 / Math.max(0.005, Math.sqrt(Math.max(1e-6, sim.list[0].fwm ** 2 - 0.0064))), unit: 'nm' }]; },
    conclude(sim) { const T = sim.truth; return `The diffraction pattern shows peaks whose sin²θ values are in the ratio expected for a ${T.s} lattice. Peak 1 is ${T.hkl1} with d = ${U.f(T.d1, 4)} Å. The lattice parameter from the highest-angle reflection is ${U.f(T.aH, 4)} Å, which identifies the powder as ${T.name.toLowerCase()} (reference ${U.f(T.a0, 4)} Å). ${T.cond === 'mill' ? `Broad peaks give a Scherrer crystallite size of ${U.f(T.Lsch, 0)} nm and a Williamson–Hall size of ${U.f(T.Lwh, 0)} nm with microstrain ${U.sci(T.eWH, 2)}, consistent with severe deformation during milling.` : `Peaks are sharp; the apparent crystallite size of ${U.f(T.Lsch, 0)} nm is close to the resolution limit of the instrument.`}`; },
    summary: 'X-ray diffraction occurs when X-rays scattered by successive lattice planes interfere constructively, which happens at angles given by Bragg’s law, nλ = 2d sin θ. In a powder diffractometer the detector scans 2θ and records peaks for each family of planes {hkl}. For cubic crystals d = a/√(h²+k²+l²), so sin²θ is proportional to h²+k²+l². Structure factor rules decide which reflections appear: all h,k,l even or all odd for FCC; h+k+l even for BCC; FCC rules plus h+k+l ≠ 4n+2 for diamond cubic. The ratio of sin²θ values therefore identifies the lattice, and the peak positions give the lattice parameter. Peak broadening beyond the instrumental width arises from small crystallites (Scherrer) and microstrain (Williamson–Hall).',
    formulas: [['Bragg’s law', 'nλ = 2d sin θ'], ['Cubic interplanar spacing', 'd = a / √(h² + k² + l²)'], ['Indexing', 'sin²θ = (λ²/4a²)(h² + k² + l²)'], ['Scherrer equation', 'L = Kλ / (β cos θ),  K ≈ 0.9'], ['Williamson–Hall', 'β cos θ = Kλ/L + 4ε sin θ'], ['Instrument correction (Gaussian)', 'β² = β_obs² − β_inst²']],
    theory: `<h3>Bragg diffraction</h3><p>X-rays have wavelengths comparable to interatomic spacings (Cu Kα: 1.5406 Å). When a beam meets a crystal, waves scattered by successive parallel planes reinforce only if their path difference is a whole number of wavelengths:</p><div class="eq">nλ = 2d sin θ</div><p>In a powder sample, crystallites are randomly oriented, so for every set of planes some grains satisfy Bragg’s condition and produce a cone of diffracted X-rays. A diffractometer in Bragg–Brentano geometry rotates the specimen by θ and the detector by 2θ and records intensity against 2θ.</p>
    <h3>Indexing cubic patterns</h3><p>For a cubic lattice d = a/√N with N = h²+k²+l², so sin²θ = (λ²/4a²)N. Dividing every sin²θ by the first gives the ratios of N values. The <b>structure factor</b> F<sub>hkl</sub> = Σ f<sub>j</sub> exp[2πi(hx<sub>j</sub>+ky<sub>j</sub>+lz<sub>j</sub>)] removes some reflections:</p><ul><li><b>BCC</b>: reflections only when h+k+l is even → N = 2, 4, 6, 8, 10, 12… (ratios 1:2:3:4…).</li><li><b>FCC</b>: h, k, l all odd or all even → N = 3, 4, 8, 11, 12, 16… (ratios 1:1.33:2.67:3.67…).</li><li><b>Diamond cubic</b>: FCC rules and h+k+l ≠ 4n+2 → N = 3, 8, 11, 16, 19… (ratios 1:2.67:3.67…).</li></ul>
    <h3>Precise lattice parameter</h3><p>Because Δd/d = −cot θ·Δθ, an error in θ affects d least at high angles. The lattice parameter is therefore taken from the highest-angle peak, or extrapolated against the Nelson–Riley function to θ = 90°.</p>
    <h3>Peak broadening</h3><p>A perfect large crystal gives peaks as narrow as the instrument allows. Small coherently diffracting domains (crystallites below about 100 nm) broaden peaks as 1/(L cos θ) — the Scherrer equation. Non-uniform lattice strain broadens them as tan θ. The Williamson–Hall plot of β cos θ against 4 sin θ separates the two: the intercept gives size and the slope gives microstrain. Instrumental broadening, measured on a strain-free standard such as Si SRM 640, must be subtracted first.</p>`,
    procedure: ['Grind the powder (if needed) and press it into the holder so the surface is flat and level with the reference plane.', 'Switch on cooling water, raise the tube to 40 kV / 30 mA slowly.', 'Set the scan range 2θ = 20–120°, step and counting time.', 'Run the scan; save the data.', 'Subtract background, strip Kα₂ and run a peak search to obtain 2θ, intensity and FWHM.', 'Calculate d for each peak; index by sin²θ ratios; identify the structure.', 'Compute the lattice parameter, crystallite size and microstrain.'],
    precautions: ['Never open the enclosure while the shutter is open; check the interlock and radiation monitor.', 'Wear the personal dosimeter.', 'Specimen height error shifts peak positions; keep the surface on the focusing circle.', 'Avoid preferred orientation by back-loading powder.', 'Ramp tube voltage and current slowly.'],
    applications: ['Phase identification (ICDD database search-match).', 'Lattice parameter changes from alloying, residual stress (sin²ψ method).', 'Crystallite size of nanomaterials and milled powders.', 'Retained austenite measurement in hardened steels.', 'Texture analysis of rolled sheet.'],
    errors: ['Specimen displacement and zero-shift errors.', 'Kα₂ contribution if not stripped.', 'Preferred orientation altering intensities.', 'Instrumental broadening not subtracted.', 'Scherrer K depends on crystallite shape (0.89–0.94).'],
    discussion: ['Show how the sin²θ ratios identify the lattice type of your sample.', 'Why is the lattice parameter determined from the highest-angle reflection?', 'Explain the difference between crystallite size from XRD and grain size from optical microscopy.', 'How does ball milling change the diffraction pattern, and why?'],
    refs: ['B. D. Cullity, S. R. Stock, Elements of X-Ray Diffraction, 3rd ed., Pearson, 2014.', 'ASTM E975-22, Standard Practice for X-Ray Determination of Retained Austenite in Steel with Near Random Crystallographic Orientation.', 'P. Scherrer, Nachr. Ges. Wiss. Göttingen 26 (1918) 98–100.', 'G. K. Williamson, W. H. Hall, Acta Metall. 1 (1953) 22–31.', 'ICDD, Powder Diffraction File PDF-4+, International Centre for Diffraction Data.'],
    pre: [
      { q: 'Bragg’s law is', o: ['λ = 2d cos θ', 'nλ = 2d sin θ', 'd = λ sin θ', 'λ = d/θ'], a: 1, why: 'Path difference 2d sin θ = nλ.' },
      { q: 'The wavelength of Cu Kα₁ radiation is about', o: ['0.71 Å', '1.54 Å', '2.29 Å', '15.4 Å'], a: 1, why: '1.5406 Å.' },
      { q: 'For a cubic crystal, d of plane (hkl) is', o: ['a(h+k+l)', 'a/√(h²+k²+l²)', 'a·√(h²+k²+l²)', 'a/(hkl)'], a: 1, why: 'Standard cubic relation.' },
      { q: 'In a BCC lattice, reflections occur only when', o: ['h, k, l all odd', 'h + k + l is even', 'h + k + l is odd', 'all mixed'], a: 1, why: 'Structure factor 2f for h+k+l even, 0 otherwise.' },
      { q: 'Broad diffraction peaks usually indicate', o: ['Large crystallites', 'Small crystallites and/or microstrain', 'High X-ray power', 'Amorphous holder'], a: 1, why: 'Scherrer and strain broadening.' }
    ],
    post: [
      { q: 'A peak at 2θ = 43.3° with Cu Kα gives d ≈', o: ['1.04 Å', '2.09 Å', '3.61 Å', '4.18 Å'], a: 1, why: 'd = 1.5406/(2 sin 21.65°) = 2.088 Å — Cu (111).' },
      { q: 'sin²θ ratios of 1 : 1.333 : 2.667 : 3.667 indicate', o: ['BCC', 'FCC', 'Simple cubic', 'HCP'], a: 1, why: 'N = 3, 4, 8, 11.' },
      { q: 'With β = 0.5° (corrected), θ = 20°, λ = 1.5406 Å and K = 0.9, the crystallite size is about', o: ['1.7 nm', '17 nm', '170 nm', '1.7 µm'], a: 1, why: '0.9 × 1.5406/(0.008727 × 0.9397) = 169 Å ≈ 17 nm.' },
      { q: 'In a Williamson–Hall plot, the slope gives', o: ['Crystallite size', 'Microstrain', 'Lattice parameter', 'Wavelength'], a: 1, why: 'β cos θ = Kλ/L + 4ε sin θ.' },
      { q: 'Diamond-cubic silicon lacks the (200) reflection because', o: ['Absorption', 'Structure factor is zero for h+k+l = 4n+2', 'It is BCC', 'Preferred orientation'], a: 1, why: 'Basis atoms at (¼,¼,¼) cancel it.' }
    ]
  });
})();
