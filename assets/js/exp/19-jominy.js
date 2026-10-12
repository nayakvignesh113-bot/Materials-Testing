(function () {
  const U = LAB.U, G = LAB.G;
  const ST = {
    s1045: { name: 'AISI 1045 (C45) — plain carbon', C: 0.45, xs: 3.6, p: 2.6, jmin: 22, ref: [2, 6] },
    s1080: { name: 'AISI 1080 — eutectoid plain carbon', C: 0.80, xs: 4.5, p: 2.8, jmin: 33, ref: [3, 7] },
    s5140: { name: 'AISI 5140 (40Cr4) — Cr alloy', C: 0.40, xs: 9, p: 2.4, jmin: 24, ref: [6, 12] },
    s4140: { name: 'AISI 4140 (42CrMo4) — Cr–Mo alloy', C: 0.41, xs: 20, p: 2.2, jmin: 30, ref: [14, 26] },
    s8620: { name: 'AISI 8620 (20NiCrMo2) — carburising grade', C: 0.20, xs: 8, p: 2.2, jmin: 20, ref: [5, 11] }
  };
  const hrcMax = C => 35.395 + 6.990 * C + 312.330 * C * C - 821.744 * C ** 3 + 1015.479 * C ** 4 - 538.346 * C ** 5; // 99% martensite (Hodge–Orehoski)
  const hrc50 = C => 22.974 + 6.214 * C + 356.364 * C * C - 1091.488 * C ** 3 + 1464.880 * C ** 4 - 750.441 * C ** 5; // 50% martensite
  const POS = [1.5, 3, 5, 7, 9, 11, 13, 15, 20, 25, 30, 35, 40, 45, 50];
  LAB.register({
    id: 'jominy', no: 19, cat: 'meta', title: 'Jominy End-Quench Hardenability', std: 'IS 3848:1981 / ASTM A255-20a / ISO 642', short: 'End-quench a 25 mm bar, grind flats and traverse with Rockwell C: hardenability curve, J-distance to 50% martensite and comparison of plain and alloy steels.', tags: 'hardenability end quench Rockwell C martensite alloying elements',
    aim: 'To determine the hardenability of a steel by the Jominy end-quench test and to compare the hardenability of plain carbon and alloy steels.',
    objectives: ['Austenitise and end-quench a standard Jominy bar.', 'Measure hardness along the bar and plot the hardenability curve.', 'Determine the Jominy distance to 50% martensite hardness.', 'Explain the effect of carbon and alloying elements on hardenability.'],
    apparatus: ['Jominy fixture with water nozzle (12.5 mm orifice, free water column 63.5 mm)', 'Furnace with protective atmosphere/charcoal, up to 1000 °C', 'Standard specimen Ø 25 × 100 mm with collar', 'Surface grinder for two flats 0.4–0.5 mm deep', 'Rockwell hardness tester (HRC) with Jominy traverse fixture'],
    stdNote: 'Quench water 5–30 °C; transfer from furnace to fixture within 5 s; water flow for at least 10 min.',
    params: [
      { id: 'st', label: 'Steel', type: 'select', options: Object.entries(ST).map(([k, v]) => [k, v.name]), def: 's4140' },
      { id: 'T', label: 'Austenitising', type: 'select', options: [['845', '845 °C, 30 min'], ['870', '870 °C, 30 min'], ['900', '900 °C, 30 min']], def: '870', hint: 'Higher austenitising temperature coarsens austenite grains and slightly raises hardenability.' }
    ],
    opSteps: ['Austenitise specimen in furnace', 'Transfer to fixture within 5 s', 'Water jet on bottom end for 10 min', 'Grind two opposite flats 0.4 mm deep', 'Mark positions from quenched end', 'Measure HRC along the flat', 'Plot hardness vs distance'],
    svg(p) {
      return G.svg('0 0 520 260', `${G.r(0, 0, 520, 260, 'bg')}${G.r(40, 20, 120, 160, 'mach', 'rx="6"')}<rect id="fglow" x="56" y="36" width="88" height="128" class="bad" opacity=".25"/>${G.t(52, 196, 'Furnace', 'm')}
        ${G.r(240, 20, 200, 16, 'mach')}${G.r(320, 36, 40, 8, 'mach2')}
        <defs><linearGradient id="jg" x1="0" x2="0" y1="1" y2="0"><stop id="g0" offset="0" stop-color="#ffb347"/><stop id="g1" offset="0.3" stop-color="#ff6a00"/><stop id="g2" offset="1" stop-color="#b30000"/></linearGradient></defs>
        <g id="bar"><rect x="324" y="44" width="32" height="140" fill="url(#jg)" rx="2"/></g>
        <path id="jet" d="M334 230 Q340 205 340 186 Q340 205 346 230 Z" fill="var(--fluid)" opacity="0"/>${G.r(328, 228, 24, 14, 'mach2')}${G.r(240, 242, 200, 10, 'mach')}
        ${G.t(380, 120, '', 'm', 'id="lab"')}${G.t(380, 138, '', 'm', 'id="tt"')}`, 'Jominy end-quench fixture');
    },
    anim(svg, f, sim) {
      if (!sim) return; const ph = f < .15 ? 'furnace' : f < .2 ? 'transfer' : f < .7 ? 'quench' : 'test';
      G.set(svg, 'fglow', 'opacity', ph === 'furnace' ? .85 : .25); G.set(svg, 'jet', 'opacity', ph === 'quench' ? .9 : 0);
      const tq = ph === 'quench' ? (f - .2) / .5 * 600 : ph === 'test' ? 600 : 0; // seconds of quench
      const col = T => T > 700 ? `rgb(255,${Math.round(120 + (T - 700) / 200 * 100)},40)` : T > 450 ? `rgb(${Math.round(150 + (T - 450) / 250 * 105)},${Math.round(30 + (T - 450) / 250 * 90)},20)` : `rgb(${Math.round(90 + T / 450 * 60)},${Math.round(90 - T / 450 * 60)},${Math.round(100 - T / 450 * 80)})`;
      const Tat = x => sim.Ta - (sim.Ta - 25) * (1 - erf(x / 1000 / (2 * Math.sqrt(1.2e-5 * Math.max(tq, 0.01)))));
      G.set(svg, 'g0', 'stop-color', col(ph === 'furnace' || ph === 'transfer' ? sim.Ta : Tat(0))); G.set(svg, 'g1', 'stop-color', col(ph === 'quench' || ph === 'test' ? Tat(30) : sim.Ta)); G.set(svg, 'g2', 'stop-color', col(ph === 'quench' || ph === 'test' ? Tat(100) : sim.Ta));
      G.txt(svg, 'lab', ph === 'furnace' ? `Austenitising ${sim.Ta} °C` : ph === 'transfer' ? 'Transfer < 5 s' : ph === 'quench' ? 'End quench' : 'Hardness traverse'); G.txt(svg, 'tt', ph === 'quench' ? `t = ${U.f(tq, 0)} s` : '');
    },
    simulate(p, r) {
      const S = ST[p.st]; const Ta = p.T; const gs = 1 + (Ta - 870) / 870 * 2.2; // grain size effect on xs
      const Jmax = hrcMax(S.C) + 0.6 * U.gauss(r), J50 = hrc50(S.C); const xs = S.xs * gs * (1 + 0.06 * U.gauss(r));
      const Jfun = x => S.jmin + (Jmax - S.jmin) / (1 + Math.pow(x / xs, S.p));
      const rd = POS.map(x => { const v = U.q(Jfun(x) + 0.5 * U.gauss(r), 0.5); return { x, a: v, b: U.q(v + 0.6 * U.gauss(r), 0.5) }; });
      rd.forEach(o => o.m = (o.a + o.b) / 2);
      const ms = rd.map(o => o.m); const jd50 = U.inv(POS, ms, J50);
      const T = { J15: rd[0].m, J50, jd50, drop: rd[0].m - rd[9].m, Jmax: hrcMax(S.C), C: S.C };
      const xsF = U.lin(1.5, 50, 100), ysF = xsF.map(Jfun);
      return {
        Ta, dur: 10, M: { name: S.name }, S,
        readout(f) { const k = f < .7 ? -1 : Math.min(POS.length - 1, Math.floor((f - .7) / .3 * POS.length)); return [['Stage', f < .15 ? 'Austenitising' : f < .2 ? 'Transfer' : f < .7 ? 'Quenching' : 'Traverse', ''], ['Position', k >= 0 ? POS[k] : '—', 'mm'], ['Hardness', k >= 0 ? U.f(rd[k].m, 1) : '—', 'HRC']]; },
        plot: { title: 'Hardenability curve', xlabel: 'Distance from quenched end J (mm)', ylabel: 'Hardness (HRC)', ymin: 10, ymax: 70, xmin: 0, xmax: 52, series: [{ name: S.name.split(' —')[0], x: POS, y: ms, type: 'linepts', color: 's1' }], hlines: [{ y: J50, label: `50% martensite ${U.f(J50, 1)} HRC`, color: 's5' }, { y: T.Jmax, label: `99% martensite ${U.f(T.Jmax, 1)} HRC`, color: 's3' }], caption: 'Jominy hardenability curve' },
        plotFrac: f => f < .7 ? 0 : (f - .7) / .3,
        plots: [{ xlabel: 'Distance from quenched end J (mm)', ylabel: 'Hardness (HRC)', ymin: 10, ymax: 70, xmin: 0, xmax: 52, series: Object.values(ST).map((s, i) => ({ name: s.name.split(' —')[0], x: xsF, y: xsF.map(x => s.jmin + (hrcMax(s.C) - s.jmin) / (1 + Math.pow(x / s.xs, s.p))), color: 's' + (i + 1), dash: s !== S })), caption: 'Typical hardenability bands of the five steels (your steel solid)' }],
        specimen: [['Steel', S.name, ''], ['Carbon content', S.C, 'wt%'], ['Austenitising', `${Ta} °C, 30 min`, ''], ['Specimen', 'Ø 25 × 100 mm, normalised before test', ''], ['Quench water', '24 °C, free height 63.5 mm', ''], ['Flats', '0.4 mm deep, two opposite sides', '']],
        obs: [{ title: 'Table 1. Rockwell C traverse on two flats', cols: ['J (mm)', 'Flat A (HRC)', 'Flat B (HRC)'], rows: rd.map(o => [o.x, U.f(o.a, 1), U.f(o.b, 1)]) }],
        truth: T
      };
    },
    calcs(sim) { const T = sim.truth; return [{ key: 'j15', label: 'Mean hardness at J = 1.5 mm', unit: 'HRC', truth: T.J15, abs: 0.3 }, { key: 'h50', label: '50% martensite hardness (Hodge–Orehoski, from %C)', unit: 'HRC', truth: T.J50, abs: 0.5, hint: '22.974 + 6.214C + 356.364C² − 1091.488C³ + 1464.88C⁴ − 750.441C⁵' }, { key: 'jd', label: 'Jominy distance to 50% martensite J₅₀', unit: 'mm', truth: T.jd50, abs: Math.max(0.8, T.jd50 * 0.06), hint: 'interpolate mean hardness = HRC₅₀' }, { key: 'drop', label: 'Hardness drop from J1.5 to J25', unit: 'HRC', truth: T.drop, abs: 0.6 }]; },
    reference(sim) { const T = sim.truth; return [{ label: 'J₅₀ distance', unit: 'mm', value: T.jd50, lo: sim.S.ref[0], hi: sim.S.ref[1], src: 'SAE J406 / ASM hardenability bands' }, { label: 'Hardness at J1.5 vs 99% martensite', unit: 'HRC', value: T.J15, lo: T.Jmax - 4, hi: T.Jmax + 2, src: 'Hodge–Orehoski' }]; },
    sample(sim) { const T = sim.truth; const C = T.C; return `<div class="eq">HRC₅₀ = 22.974 + 6.214(${C}) + 356.364(${C})² − 1091.488(${C})³ + 1464.88(${C})⁴ − 750.441(${C})⁵ = <b>${U.f(T.J50, 1)} HRC</b><br>HRC₉₉ (max) = <b>${U.f(T.Jmax, 1)} HRC</b></div><div class="eq">Mean hardness falls through ${U.f(T.J50, 1)} HRC at J₅₀ ≈ <b>${U.f(T.jd50, 1)} mm</b> (linear interpolation between bracketing positions)<br>Drop J1.5 → J25 = <b>${U.f(T.drop, 1)} HRC</b></div>`; },
    uncert(sim) { const T = sim.truth; return [{ q: 'J₅₀ distance', expr: 'u(HRC) / slope at J₅₀', val: T.jd50, u: 0.5 / Math.max(0.3, Math.abs((T.J15 - T.J50) / Math.max(T.jd50, 1))), unit: 'mm' }]; },
    conclude(sim) { const T = sim.truth; return `${sim.S.name} reached ${U.f(T.J15, 1)} HRC at the quenched end, close to the 99%-martensite value of ${U.f(T.Jmax, 1)} HRC for ${T.C}% C. The 50%-martensite hardness (${U.f(T.J50, 1)} HRC) is reached at J₅₀ ≈ ${U.f(T.jd50, 1)} mm. ${T.jd50 > 10 ? 'The flat curve reflects the high hardenability given by the alloying elements, which slow pearlite and bainite formation, so thick sections can be through-hardened by oil quenching.' : 'The steep fall shows low hardenability: only thin sections or the surface of thicker parts will be fully hardened even in water.'}`; },
    summary: 'Hardenability is the ability of a steel to form martensite to a depth when quenched. In the Jominy test a standard bar is austenitised and quenched by a water jet on one end only, so the cooling rate falls continuously along its length. Hardness measured along ground flats gives the hardenability curve. Maximum hardness at the quenched end depends mainly on carbon content; how far the high hardness extends depends on alloying elements (Cr, Mo, Ni, Mn) and austenite grain size, which delay the diffusional transformations to ferrite, pearlite and bainite. The distance to 50% martensite is a convenient single index.',
    formulas: [['Max (99% martensite) hardness', 'HRC = 35.395 + 6.990C + 312.330C² − 821.744C³ + 1015.479C⁴ − 538.346C⁵'], ['50% martensite hardness', 'HRC = 22.974 + 6.214C + 356.364C² − 1091.488C³ + 1464.880C⁴ − 750.441C⁵'], ['Quenched-end cooling', 'T(x,t) ≈ T_w + (T_a − T_w) erf[x / 2√(αt)]'], ['Grossmann ideal diameter', 'D_I = D_I,base × f_Mn × f_Cr × f_Mo × f_Ni …']],
    theory: `<h3>Hardenability versus hardness</h3><p>Hardness is a property of a microstructure; hardenability is a property of a steel describing <i>how easily</i> it forms martensite. Two steels with the same carbon content reach the same maximum hardness at a fast-cooled surface, but an alloy steel will stay hard much deeper below the surface than a plain carbon steel. Hardenability decides whether a shaft, gear or die can be hardened through its section, and what quenchant is needed.</p>
    <h3>The Jominy test</h3><p>A 25 mm diameter, 100 mm long bar is austenitised and placed in a fixture where a water jet of fixed height strikes only the bottom face. The quenched end cools at several hundred °C/s; the far end cools at a few °C/s, like a still-air cooled bar. After cooling, two opposite flats are ground 0.4 mm deep and Rockwell C hardness is measured at standard distances from the quenched end. Each distance corresponds to a known cooling rate, so one specimen records the response to the whole range of cooling rates.</p>
    <h3>What controls the curve</h3><ul><li><b>Carbon</b> sets the maximum (martensite) hardness, given by Hodge and Orehoski’s relation; martensite hardness rises steeply up to about 0.6% C.</li><li><b>Alloying elements</b> (Mn, Cr, Mo, Ni, B) dissolved in austenite shift the TTT/CCT curves to longer times, so martensite forms at lower cooling rates; the curve stays high further from the quenched end.</li><li><b>Austenite grain size</b>: coarser austenite grains have fewer boundary nucleation sites for pearlite, so hardenability increases slightly with austenitising temperature.</li></ul>
    <h3>Using the data</h3><p>The Jominy distance to 50% martensite (J₅₀) is a convenient index. Using charts that relate Jominy distance to cooling rates at the centre or half-radius of bars quenched in oil or water, the depth of hardening in real components can be predicted. Steel specifications (SAE J1268, IS 4367) give hardenability bands with minimum and maximum curves.</p>`,
    procedure: ['Normalise the specimen; austenitise at the specified temperature for 30 minutes in a protective atmosphere.', 'Check the water jet: free height 63.5 mm, temperature 5–30 °C.', 'Transfer the specimen from the furnace to the fixture within 5 s; start the jet immediately.', 'Continue the jet for at least 10 minutes until the bar is cold.', 'Grind two diametrically opposite flats 0.4–0.5 mm deep with coolant to avoid tempering.', 'Measure HRC at the specified distances from the quenched end on both flats.', 'Plot mean hardness against distance; determine J₅₀.'],
    precautions: ['Transfer quickly; delay lets the end cool in air and scale form.', 'Avoid scale and decarburisation (pack in charcoal or use protective atmosphere).', 'Do not overheat during grinding; use light cuts with coolant.', 'Use tongs and face shield when handling the hot bar.'],
    applications: ['Selecting steels and quenchants for gears, shafts and axles.', 'Steel purchase specifications (H-band steels).', 'Predicting hardness distribution in components.', 'Quality control of heat-to-heat variation in steelmaking.'],
    errors: ['Delay in transfer from the furnace.', 'Water temperature and jet height outside limits.', 'Decarburisation lowering hardness near the end.', 'Grinding burn tempering the flats.', 'Rockwell test spacing too close.'],
    discussion: ['Why do 1045 and 4140 have almost the same hardness at the quenched end but very different curves?', 'Which elements increase hardenability, and how do they act on the CCT diagram?', 'Estimate the cooling rate regime at your J₅₀ position and the microstructure there.', 'Suggest a steel and quenchant for a 60 mm diameter shaft that must be hard through the section.'],
    refs: ['IS 3848:1981, Method for End Quench Test for Hardenability of Steel, BIS.', 'ASTM A255-20a, Standard Test Methods for Determining Hardenability of Steel.', 'ISO 642:1999, Steel — Hardenability Test by End Quenching (Jominy Test).', 'J. M. Hodge, M. A. Orehoski, Trans. AIME 167 (1946) 627–642.', 'G. E. Totten (ed.), Steel Heat Treatment Handbook, 2nd ed., CRC Press, 2006.'],
    pre: [
      { q: 'Hardenability refers to', o: ['Maximum hardness', 'Depth to which a steel can be hardened', 'Resistance to wear', 'Surface hardness only'], a: 1, why: 'Ability to form martensite in depth.' },
      { q: 'In the Jominy test the specimen is quenched', o: ['Fully immersed', 'At one end by a water jet', 'In oil', 'In air'], a: 1, why: 'End quench gives a range of cooling rates.' },
      { q: 'Maximum hardness of martensite depends mainly on', o: ['Chromium', 'Carbon', 'Nickel', 'Grain size'], a: 1, why: 'Carbon in solution distorts the lattice.' },
      { q: 'The standard Jominy specimen size is', o: ['10 × 55 mm', '25 mm dia × 100 mm', '50 × 200 mm', '12.5 × 50 mm'], a: 1, why: 'ASTM A255 / IS 3848.' },
      { q: 'Hardness in the Jominy test is normally measured on', o: ['Brinell', 'Rockwell C', 'Shore', 'Mohs'], a: 1, why: 'HRC traverse on ground flats.' }
    ],
    post: [
      { q: 'For 0.40% C the 50% martensite hardness is about', o: ['32 HRC', '42 HRC', '52 HRC', '62 HRC'], a: 1, why: 'Hodge–Orehoski gives ≈ 42 HRC.' },
      { q: 'A flatter Jominy curve indicates', o: ['Lower hardenability', 'Higher hardenability', 'Lower carbon', 'Faster cooling'], a: 1, why: 'Martensite forms even at slow cooling rates.' },
      { q: 'Which addition increases hardenability most per unit mass?', o: ['Boron (ppm level)', 'Silicon', 'Sulphur', 'Phosphorus'], a: 0, why: 'A few ppm B segregate to austenite boundaries and retard ferrite nucleation.' },
      { q: 'Raising austenitising temperature slightly increases hardenability because', o: ['Carbon content rises', 'Austenite grains grow, reducing nucleation sites', 'Martensite softens', 'Water cools faster'], a: 1, why: 'Fewer grain boundaries per volume.' },
      { q: 'Why are the flats ground with coolant and light cuts?', o: ['For appearance', 'To avoid tempering the martensite', 'To remove all scale', 'To save time'], a: 1, why: 'Grinding heat would soften the surface.' }
    ]
  });
  function erf(x) { const s = Math.sign(x); x = Math.abs(x); const t = 1 / (1 + 0.3275911 * x); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return s * y; }
})();
