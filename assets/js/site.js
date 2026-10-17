/* Site features: navigation rail, About & validation, Compare materials, explainer player, Listen narration,
   tools & consumables, numericals stage, feedback form and submission to the faculty's Google Sheet. */
(function () {
  'use strict';
  const U = LAB.U, h = LAB.h, $ = (s, el) => (el || document).querySelector(s), esc = U.esc;
  const EXT = (LAB.ext = LAB.ext || {});
  const VERSION = (LAB.VERSION = '2.1'), VDATE = '17 Oct 2026';
  const CFG = (window.MTL_CONFIG = window.MTL_CONFIG || {});
  const AUDIO = 'audio/';
  const reduce = (() => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
  let MAN = null; // audio/manifest.json: clip durations
  try { fetch(AUDIO + 'manifest.json').then(r => r.ok ? r.json() : null).then(j => { MAN = j; }).catch(() => { }); } catch (e) { }

  /* ------------------------------------------------------------------ validation status */
  const VS = { v: ['Validated', 'ok', 'Key outputs reproduce published reference values within their stated ranges.'], p: ['Partly validated', 'warn', 'Governing relations are exact; material parameters are typical values, so magnitudes are representative rather than specific to one heat or batch.'], t: ['Teaching model', 'muted', 'Trends and procedure are correct; magnitudes are indicative only.'] };
  const VALID = (LAB.VALID = {
    tensile: ['v', 'E, yield, UTS and elongation of the six materials fall within ASM Handbook and IS 2062 ranges; the curve uses the Considère criterion and Swift hardening.', 'ASM Handbook Vol. 1 & 2; IS 2062:2011; Dieter (1988)'],
    compression: ['p', 'Strength and modulus within handbook ranges; barrelling from volume constancy with Siebel friction, which is approximate.', 'ASM Vol. 1; IS 399; Dieter Ch. 15'],
    shear: ['p', 'τ/σu ratios match published ranges for ductile metals (0.6–0.8) and grey iron; scatter between specimens is assumed.', 'ASM Vol. 1; MMPDS-17'],
    torsion: ['v', 'Torque from exact numerical integration of the τ–γ law; G within handbook ranges; Nadai fully plastic analysis.', 'ASM Vol. 2; Nadai (1950)'],
    bending: ['v', 'Deflection from exact Euler–Bernoulli solutions; E and timber MOR within handbook and IS 399 ranges.', 'Timoshenko & Gere; IS 399'],
    impact: ['p', 'Energy formulae exact; transition curves use the standard tanh fit with typical shelf energies and transition temperatures, not a specific heat.', 'ASTM E23; IS 2062; Anderson (2017)'],
    fatigue: ['p', 'Basquin relation and Se ≈ 0.5σu for steels (Shigley); life scatter log-normal with s(log N) = 0.18.', 'Shigley 11th ed.; ASM Vol. 19'],
    creep: ['t', 'Norton–Arrhenius form and parameters from deformation-mechanism maps; absolute rupture times are indicative.', 'Frost & Ashby (1982); Larson & Miller (1952)'],
    brinell: ['v', 'HBW formula exact; hardness values within ASM ranges; d/D validity rule per IS 1500.', 'IS 1500-1; ASTM E10'],
    rockwell: ['v', 'Depth–number relation exact; conversions interpolated from ASTM E140 tables.', 'ASTM E18; ASTM E140'],
    vickers: ['p', 'HV formula exact; indentation size effect modelled empirically; case profile shape typical of carburised 16MnCr5.', 'ASTM E384; ISO 2639; Nix & Gao (1998)'],
    wear: ['p', 'Archard law with specific wear rates and friction coefficients typical of dry sliding against hardened steel; running-in shape illustrative.', 'Hutchings & Shipway (2017); Archard (1953)'],
    ultrasonic: ['p', 'Velocities and time-of-flight geometry exact; echo amplitudes and beam profiles simplified.', 'Krautkrämer (1990); ASNT Handbook Vol. 7'],
    mpi: ['p', 'Magnetising current formulae from ASTM E1444; detectability modelled by flaw–field angle and depth.', 'ASTM E1444; ASNT Handbook Vol. 8'],
    dpt: ['t', 'Acceptance criteria per ASME VIII App. 8; detectability as a function of dwell, removal and developer is illustrative.', 'ASTM E165; ASME BPVC V & VIII'],
    specprep: ['t', 'Procedure, grit sizes and etchant choices from ASTM E3, E407 and FEPA; image effects schematic.', 'ASTM E3; ASTM E407; Vander Voort (1999)'],
    microstructure: ['p', 'Lever-rule fractions exact; micrographs generated procedurally to resemble reference structures.', 'ASM Vol. 9; ASTM E562; ISO 945-1'],
    grainsize: ['v', 'ASTM E112 equations exact; intercept and planimetric counts are exact on the generated grain structure.', 'ASTM E112; Hall (1951); Petch (1953)'],
    jominy: ['p', 'Hodge–Orehoski martensite hardness exact; curve shapes fitted to typical SAE hardenability bands.', 'ASTM A255; SAE J1268; Hodge & Orehoski (1946)'],
    heattreat: ['p', 'Hardness values typical for each condition; Hollomon–Jaffe parameter exact.', 'ASM Vol. 4; Krauss (2015)'],
    xrd: ['v', 'Peak positions from Bragg’s law with ICDD lattice parameters; structure-factor extinctions exact; intensities approximate.', 'Cullity & Stock (2014); ICDD PDF-4+'],
    sem: ['p', 'X-ray line energies exact; quantification uses simple k-factors; fractographs are schematic.', 'Goldstein et al. (2018); ASM Vol. 12; ASTM E1508']
  });
  const chip = id => { const v = VALID[id]; if (!v) return ''; const s = VS[v[0]]; return `<span class="vchip ${s[1]}" title="${esc(s[2])}">${s[0]}</span>`; };
  EXT.chip = chip;

  /* ------------------------------------------------------------------ rail */
  EXT.buildRail = function () {
    const bl = $('#brandLogo'); if (bl && LAB.LOGO) bl.src = LAB.LOGO;
    const r = $('#rail'); if (!r) return;
    r.innerHTML = `<div class="rgrp"><a class="rhome" data-go="home" href="#">Overview</a><a class="rhome" data-go="compare" href="#compare">Compare materials</a><a class="rhome" data-go="about" href="#about">About &amp; validation</a></div>` +
      LAB.CATS.map(([k, name]) => `<div class="rgrp"><div class="rcat">${name}</div>${LAB.list.filter(e => e.cat === k).map(e => `<a data-go="${e.id}" href="#${e.id}"><span class="rno">${String(e.no).padStart(2, '0')}</span>${e.title}</a>`).join('')}</div>`).join('');
    r.addEventListener('click', ev => { if (ev.target.closest('a')) document.body.classList.remove('rail-open'); });
    const t = $('#railBtn'); if (t) t.onclick = () => document.body.classList.toggle('rail-open');
  };
  EXT.markRail = function (id) { document.querySelectorAll('#rail [data-go]').forEach(a => a.setAttribute('aria-current', a.dataset.go === id ? 'page' : 'false')); };

  /* ------------------------------------------------------------------ theory: explainer, listen, library, validation */
  EXT.theory = function (e, body, S) {
    const xs = $('#xslot', body);
    if (xs) xs.innerHTML = listenHTML(e) + (LAB.EXPL && LAB.EXPL[e.id] ? xCardHTML(e, S) : '');
    bindListen(e, body);
    if (LAB.EXPL && LAB.EXPL[e.id]) { const b = $('#xopen'); if (b) b.onclick = () => xOpen(e, S); }
    const L = LAB.LIB && LAB.LIB[e.id];
    const ls = $('#libslot', body); if (ls && L) ls.innerHTML = `<h3>Tools and consumables</h3>${LAB.tableHTML({ cols: L.cols, rows: L.rows, textCols: [0, 1, 2] })}${L.note ? `<p class="muted" style="font-size:.84rem">${L.note}</p>` : ''}`;
    const vs = $('#valslot', body), V = VALID[e.id];
    if (vs && V) vs.innerHTML = `<div class="panel"><div class="panel-h"><h4>Simulator status</h4>${chip(e.id)}</div><p style="font-size:.86rem">${V[1]}</p><p class="muted" style="font-size:.78rem;margin-top:6px">Sources: ${V[2]}. <a href="#about">How this was checked</a></p></div>`;
  };

  /* ---------- Listen: theory narration with paragraph highlight ---------- */
  const LSN = { id: null, i: 0, on: false, rate: 1, els: [] };
  const lAudio = (typeof Audio !== 'undefined') ? new Audio() : null;
  if (lAudio) { lAudio.preload = 'auto'; if ('preservesPitch' in lAudio) lAudio.preservesPitch = true; }
  function listenHTML(e) { return `<div class="listen" id="lsnbar"><button class="btn small" type="button" id="lsn" aria-pressed="false">▶ Listen</button><label class="muted" for="lsnrate" style="font-size:.8rem">Speed <select id="lsnrate" style="width:auto;padding:3px 6px"><option value="0.9">Slow</option><option value="1" selected>Normal</option><option value="1.15">Fast</option><option value="1.3">Faster</option></select></label><span class="muted" id="lsnmsg" style="font-size:.8rem">Reads the theory aloud, paragraph by paragraph.</span></div>`; }
  function lsnStop() { LSN.on = false; try { lAudio && lAudio.pause(); } catch (e) { } LSN.els.forEach(x => x && x.classList.remove('reading')); const b = $('#lsn'); if (b) { b.textContent = '▶ Listen'; b.setAttribute('aria-pressed', 'false'); } }
  EXT.stopAudio = () => { lsnStop(); xStop(); };
  function lsnPlay() {
    if (!LSN.on) return; if (LSN.i >= LSN.els.length) { lsnStop(); LSN.i = 0; const m = $('#lsnmsg'); if (m) m.textContent = 'Finished. Press Listen to hear it again.'; return; }
    const el = LSN.els[LSN.i]; if (!el || !el.isConnected) { lsnStop(); return; }
    LSN.els.forEach(x => x && x.classList.remove('reading')); el.classList.add('reading'); try { el.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' }); } catch (e) { }
    lAudio.src = `${AUDIO}${LSN.id}/${LSN.i}.mp3`; lAudio.playbackRate = LSN.rate;
    lAudio.play().catch(err => { if (err && err.name === 'NotAllowedError') { lsnStop(); const m = $('#lsnmsg'); if (m) m.textContent = 'The browser blocked audio. Press Listen again.'; } });
  }
  if (lAudio) {
    lAudio.onended = () => { if (!LSN.on) return; LSN.i++; setTimeout(() => { if (LSN.on) lsnPlay(); }, 250); };
    lAudio.onerror = () => { if (!LSN.on) return; lsnStop(); const m = $('#lsnmsg'); if (m) m.textContent = 'Narration is not available in this copy of the lab (audio files missing or opened from disk).'; };
  }
  function bindListen(e, body) {
    lsnStop(); LSN.id = e.id; LSN.i = 0; LSN.els = [...body.querySelectorAll('.theory-body p, .theory-body li')];
    const b = $('#lsn'); if (!b || !lAudio) { if (b) b.disabled = true; return; }
    $('#lsnrate').value = String(LSN.rate);
    $('#lsnrate').onchange = ev => { LSN.rate = +ev.target.value; lAudio.playbackRate = LSN.rate; };
    LSN.els.forEach((el, i) => { el.classList.add('lsn-p'); el.title = 'Click to listen from here'; el.onclick = () => { if (!LSN.on) return; LSN.i = i; lsnPlay(); }; });
    b.onclick = () => { if (LSN.on) { lsnStop(); return; } xStop(); LSN.on = true; b.textContent = '❚❚ Pause'; b.setAttribute('aria-pressed', 'true'); $('#lsnmsg').textContent = 'Click any paragraph while playing to jump to it.'; lsnPlay(); };
  }

  /* ---------- Explainer player ---------- */
  const XP = { e: null, S: null, si: 0, li: 0, mode: 'idle', voice: true, rate: 1, tok: 0, timer: 0, raf: 0, t0: 0, dur: 1, cue: null, sim: null, p: null, noAudio: false };
  const xAudio = (typeof Audio !== 'undefined') ? new Audio() : null;
  if (xAudio) { xAudio.preload = 'auto'; if ('preservesPitch' in xAudio) xAudio.preservesPitch = true; }
  const xEst = s => (s.split(/\s+/).length / 2.6 + 0.8);
  const xDurOf = (id, key, text) => { const m = MAN && MAN[id] && MAN[id].x && MAN[id].x[key]; return (m || xEst(text)) / XP.rate; };
  function xRes(S, n) { if (!S.expl || !Array.isArray(S.expl.first) || S.expl.first.length !== n) S.expl = { first: Array(n).fill(null), replays: Array(n).fill(0), done: false, t: null }; return S.expl; }
  function xSummary(e, S) { const X = LAB.EXPL[e.id]; const n = X.scenes.length; const R = xRes(S, n); const Q = X.scenes.map((s, i) => s.q ? i : -1).filter(i => i >= 0); const ans = Q.filter(i => R.first[i] !== null); return { n: Q.length, answered: ans.length, right: ans.filter(i => R.first[i]).length, replays: R.replays.reduce((a, b) => a + b, 0), done: R.done }; }
  EXT.xSummary = (e, S) => LAB.EXPL && LAB.EXPL[e.id] ? xSummary(e, S) : null;
  function xMinutes(e) { let w = 0; LAB.EXPL[e.id].scenes.forEach(s => s.lines.forEach(l => w += l[0].split(/\s+/).length)); return Math.max(1, Math.round(w / 2.6 / 60)); }
  function xCardHTML(e, S) {
    const X = LAB.EXPL[e.id], sm = xSummary(e, S);
    return `<section class="xcard" id="xcard" aria-label="Explainer"><div class="xhead"><div><p class="eyebrow">Watch &amp; check</p><h3 style="margin-top:2px">How the ${e.title.toLowerCase().replace(/ \(.*\)/, '')} works</h3><p class="muted" style="font-size:.82rem;margin-top:2px">About ${xMinutes(e)} min · ${X.scenes.length} scenes · ${sm.n} concept checks. A wrong answer replays the scene.</p></div><div class="xstat" id="xstat">${sm.answered ? `${sm.right} of ${sm.answered} right first time` : ''}</div></div><div id="xbody"><button class="btn" type="button" id="xopen">▶ Watch explainer</button></div></section>`;
  }
  function xOpen(e, S) {
    lsnStop(); xStop();
    XP.e = e; XP.S = S; XP.p = LAB.paramsOf(e, { params: {} });
    try { XP.sim = e.simulate(XP.p, U.rng(20261013)); } catch (err) { XP.sim = null; }
    $('#xbody').innerHTML = `<div class="xstage" id="xstage"><div class="xrig rig" id="xrig"></div><div class="xside" id="xside" hidden><canvas id="xchart"></canvas><div id="xlv"></div></div></div>
      <div id="xbelow"><div class="xcap" id="xcap" aria-live="polite"></div></div>
      <div class="controls xctl"><button class="btn quiet small" id="xplay" type="button">Pause</button><button class="btn quiet small" id="xback" type="button">◀ Previous line</button><button class="btn quiet small" id="xrep" type="button">↺ Replay scene</button><button class="btn quiet small" id="xvoice" type="button" aria-pressed="${XP.voice}">${XP.voice ? 'Voice on' : 'Voice off'}</button>
      <label class="muted" for="xrate" style="font-size:.8rem">Speed <select id="xrate" style="width:auto;padding:3px 6px"><option value="0.9">Slow</option><option value="1">Normal</option><option value="1.15">Fast</option></select></label><span class="muted" id="xnote" style="font-size:.8rem" aria-live="polite"></span></div>
      <nav class="xchaps" id="xchaps" aria-label="Scenes"></nav>`;
    $('#xrate').value = String(XP.rate);
    $('#xplay').onclick = () => { if (XP.mode === 'play') { XP.mode = 'pause'; clearTimeout(XP.timer); try { xAudio.pause(); } catch (er) { } } else if (XP.mode === 'pause') { XP.mode = 'play'; xLine(true); } xButtons(); };
    $('#xback').onclick = () => { if (XP.li > 0) XP.li--; else if (XP.si > 0) { XP.si--; XP.li = LAB.EXPL[e.id].scenes[XP.si].lines.length - 1; } xResume(); };
    $('#xrep').onclick = () => { if (XP.mode === 'end') XP.si = LAB.EXPL[e.id].scenes.length - 1; XP.li = 0; xResume(); };
    $('#xvoice').onclick = ev => { XP.voice = !XP.voice; ev.target.setAttribute('aria-pressed', XP.voice); ev.target.textContent = XP.voice ? 'Voice on' : 'Voice off'; if (XP.mode === 'play') xLine(); };
    $('#xrate').onchange = ev => { XP.rate = +ev.target.value; if (xAudio) xAudio.playbackRate = XP.rate; };
    $('#xchaps').addEventListener('click', ev => { const b = ev.target.closest('[data-s]'); if (!b) return; XP.si = +b.dataset.s; XP.li = 0; xResume(); });
    XP.si = 0; XP.li = 0; XP.mode = 'play'; xScene(); xLine(); xButtons();
  }
  function xStop() { XP.tok++; clearTimeout(XP.timer); cancelAnimationFrame(XP.raf); try { xAudio && xAudio.pause(); } catch (e) { } if (XP.mode !== 'idle') XP.mode = 'pause'; }
  function xResume() { XP.mode = 'play'; const st = $('#xstage'); if (st) st.classList.remove('dim'); $('#xbelow').innerHTML = '<div class="xcap" id="xcap" aria-live="polite"></div>'; xScene(); xLine(); xButtons(); }
  function xButtons() { const b = $('#xplay'); if (!b) return; b.textContent = XP.mode === 'play' ? 'Pause' : XP.mode === 'pause' ? 'Resume' : 'Pause'; b.disabled = XP.mode === 'q' || XP.mode === 'end'; }
  function xChaps() { const c = $('#xchaps'); if (!c) return; const X = LAB.EXPL[XP.e.id], R = xRes(XP.S, X.scenes.length); c.innerHTML = X.scenes.map((s, i) => `<button type="button" data-s="${i}" class="${i === XP.si ? 'cur' : ''}">${i + 1}. ${s.title}${R.first[i] === true ? ' ✓' : R.first[i] === false ? ' ↺' : ''}</button>`).join(''); }
  function xStat() { const st = $('#xstat'); if (!st) return; const sm = xSummary(XP.e, XP.S); st.textContent = sm.answered ? `${sm.right} of ${sm.answered} right first time` : ''; }
  // ---- picture: rig with set-up layers, test animation and live chart
  function xScene() { // state at the start of the scene: replay cues of earlier lines in this scene instantly
    const L = LAB.EXPL[XP.e.id].scenes[XP.si].lines; let last = null;
    for (let s = 0; s <= XP.si; s++) { const ls = LAB.EXPL[XP.e.id].scenes[s].lines; const upto = s < XP.si ? ls.length : XP.li; for (let i = 0; i < upto; i++) if (ls[i][1]) last = ls[i][1]; }
    XP.cue = null; if (last) xDraw(last, 1); else xDraw({ s: -1 }, 1); void L;
  }
  function xDraw(cue, u) {
    const e = XP.e, rig = $('#xrig'); if (!rig) return;
    const steps = LAB.suSteps(e);
    if (cue.s != null) {
      let svg = rig.querySelector('svg');
      if (!svg || !svg._su) { rig.innerHTML = e.svg(XP.p); svg = rig.querySelector('svg'); try { e.anim && e.anim(svg, 0, null, XP.p); } catch (er) { } svg._su = steps.map(() => { const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'su-layer'); svg.appendChild(g); return g; }); $('#xside').hidden = true; }
      for (let i = 0; i <= Math.min(cue.s, steps.length - 1); i++) { try { steps[i].draw(svg._su[i], i === cue.s ? u : 1, LAB.suCtx(svg, i === cue.s && u < 1, XP.sim, XP.p)); } catch (er) { } }
      return;
    }
    if (cue.r) {
      const f = cue.r[0] + (cue.r[1] - cue.r[0]) * u; let svg = rig.querySelector('svg');
      if (!svg || svg._su || !svg._run) { rig.innerHTML = e.svg(XP.p); svg = rig.querySelector('svg'); svg._run = 1; }
      if (!XP.sim) return;
      try { e.anim && e.anim(svg, f, XP.sim, XP.p); } catch (er) { }
      const side = $('#xside'); const sim = XP.sim;
      if (sim.plot || e.liveView) { side.hidden = false; const c = $('#xchart'); if (sim.plot) { c.hidden = false; LAB.plot(c, Object.assign({}, sim.plot, { frac: sim.plot.reveal === 'all' ? 1 : (sim.plotFrac ? sim.plotFrac(f) : f), title: null }), { h: 220 }); } else c.hidden = true;
        if (e.liveView) { try { e.liveView($('#xlv'), f, sim, XP.p, { title() { }, sub() { } }); } catch (er) { } } }
    }
  }
  function xAnimate(cue, dur) { cancelAnimationFrame(XP.raf); if (!cue) return; const tok = XP.tok; const D = Math.max(0.6, Math.min(dur, cue.s != null ? 3.2 : dur)) * 1000; let t0 = null;
    const step = ts => { if (tok !== XP.tok || XP.mode !== 'play') return; if (t0 == null) t0 = ts; const u = reduce ? 1 : Math.min(1, (ts - t0) / D); xDraw(cue, u); if (u < 1) XP.raf = requestAnimationFrame(step); };
    XP.raf = requestAnimationFrame(step); }
  function xClip(src, done, ms) {
    const tok = ++XP.tok; clearTimeout(XP.timer);
    const fb = () => { XP.timer = setTimeout(() => { if (tok === XP.tok) done(); }, ms); };
    if (!XP.voice || XP.noAudio || !xAudio) { fb(); return tok; }
    xAudio.src = src; xAudio.playbackRate = XP.rate;
    xAudio.onended = () => { if (tok === XP.tok) setTimeout(() => { if (tok === XP.tok) done(); }, 300); };
    xAudio.onerror = () => { if (tok !== XP.tok) return; XP.noAudio = true; const n = $('#xnote'); if (n) n.textContent = 'Narration audio is not available here; captions only.'; fb(); };
    xAudio.play().catch(err => { if (tok !== XP.tok) return; if (err && err.name === 'NotAllowedError') { const n = $('#xnote'); if (n) n.textContent = 'Audio was blocked by the browser; captions only. Press Pause, then Resume to try again.'; } fb(); });
    return tok;
  }
  function xLine(resume) {
    const X = LAB.EXPL[XP.e.id], S = X.scenes[XP.si], [say, cue] = S.lines[XP.li];
    const cap = $('#xcap'); if (cap) cap.innerHTML = `<span class="who">Scene ${XP.si + 1} · ${S.title}</span>${say}`;
    const dur = xDurOf(XP.e.id, `${XP.si}_${XP.li}`, say);
    xClip(`${AUDIO}${XP.e.id}/x${XP.si}_${XP.li}.mp3`, () => { if (XP.mode === 'play') xNext(); }, dur * 1000);
    if (cue) xAnimate(cue, dur); else if (!resume) { /* hold picture */ }
    xChaps();
  }
  function xNext() { const X = LAB.EXPL[XP.e.id], S = X.scenes[XP.si]; if (XP.li < S.lines.length - 1) { XP.li++; xLine(); return; } if (S.q) { xAsk(); return; } if (XP.si < X.scenes.length - 1) { XP.si++; XP.li = 0; xLine(); } else xFinish(); }
  function xAsk() {
    XP.tok++; clearTimeout(XP.timer); XP.mode = 'q'; $('#xstage').classList.add('dim');
    const X = LAB.EXPL[XP.e.id], Q = X.scenes[XP.si].q, R = xRes(XP.S, X.scenes.length); const checks = X.scenes.map((s, i) => s.q ? i : -1).filter(i => i >= 0); const k = checks.indexOf(XP.si) + 1;
    $('#xbelow').innerHTML = `<div class="qcard" role="group" aria-labelledby="xqh"><span class="tag">Check ${k} of ${checks.length}${R.first[XP.si] !== null ? ' · second look' : ''}</span><h4 id="xqh">${Q.q}</h4><div class="xopts">${Q.o.map((o, i) => `<button class="xopt" type="button" data-i="${i}">${o}</button>`).join('')}</div><div class="xfb" id="xfb" aria-live="polite"></div></div>`;
    xClip(`${AUDIO}${XP.e.id}/xq${XP.si}.mp3`, () => { }, 100);
    document.querySelectorAll('#xbelow .xopt').forEach(b => b.onclick = () => xAnswer(+b.dataset.i, b)); xButtons(); xChaps();
  }
  function xAnswer(i, b) {
    const X = LAB.EXPL[XP.e.id], Q = X.scenes[XP.si].q, R = xRes(XP.S, X.scenes.length); if (document.querySelector('#xbelow .xopt.right')) return; XP.tok++; try { xAudio.pause(); } catch (er) { }
    const ok = i === Q.a; if (R.first[XP.si] === null) R.first[XP.si] = ok; b.classList.add(ok ? 'right' : 'wrong'); document.querySelectorAll('#xbelow .xopt').forEach(x => x.disabled = true);
    if (ok) { $('#xfb').innerHTML = `<b class="ok">Correct.</b> ${Q.why}<div style="margin-top:10px"><button class="btn small" id="xcont" type="button">Continue ▶</button></div>`; $('#xcont').onclick = () => { if (XP.si < X.scenes.length - 1) { XP.si++; XP.li = 0; xResume(); } else xFinish(); }; $('#xcont').focus(); }
    else { $('#xfb').innerHTML = `<b class="bad">Not quite.</b> Watch that part again; the answer is in it.<div style="margin-top:10px"><button class="btn small" id="xrew" type="button">↺ Replay scene ${XP.si + 1}</button></div>`; $('#xrew').onclick = () => { R.replays[XP.si]++; LAB.save(XP.e.id); XP.li = 0; xResume(); }; $('#xrew').focus(); }
    LAB.save(XP.e.id); xStat();
  }
  function xFinish() {
    XP.tok++; clearTimeout(XP.timer); XP.mode = 'end'; const X = LAB.EXPL[XP.e.id]; const R = xRes(XP.S, X.scenes.length); R.done = true; R.t = new Date().toISOString(); LAB.save(XP.e.id); const sm = xSummary(XP.e, XP.S);
    $('#xbelow').innerHTML = `<div class="qcard"><span class="tag">Done</span><h4>${sm.right} of ${sm.n} checks right first time${sm.replays ? ` · ${sm.replays} scene replay${sm.replays > 1 ? 's' : ''}` : ''}.</h4><p class="muted" style="font-size:.84rem">This result is included in your lab report. Use Replay scene or the scene buttons to revisit any part.</p></div>`; xChaps(); xButtons(); xStat();
  }

  /* ------------------------------------------------------------------ About & validation */
  const CITE = `Ullal, V. N. (2026). Materials Testing & Characterization Virtual Lab: an open virtual laboratory for mechanical testing, hardness, wear, NDT and metallography (Version ${VERSION}). Department of Mechanical Engineering, MITE Moodbidri. https://nayakvignesh113-bot.github.io/Materials-Testing/`;
  EXT.about = function (el) {
    document.title = 'About & validation — Materials Testing Virtual Lab';
    const counts = { v: 0, p: 0, t: 0 }; LAB.list.forEach(e => counts[VALID[e.id][0]]++);
    el.innerHTML = `<section class="wrap" style="padding-block:28px 40px"><p class="eyebrow">About this lab</p><h1 style="margin-top:6px">About &amp; validation</h1>
      <div class="prose" style="margin-top:14px"><p>The Materials Testing &amp; Characterization Virtual Lab is an open, browser-based laboratory for undergraduate courses in materials testing, mechanical behaviour of materials, non-destructive testing and metallography. It covers ${LAB.list.length} experiments in five groups and runs entirely in the browser: no login, server or installation is needed.</p>
      <p>Developed by <b>Dr. Vignesh Nayak Ullal</b>, Department of Mechanical Engineering, Mangalore Institute of Technology &amp; Engineering (MITE), Moodbidri, Karnataka, India.</p>
      <h3>What each experiment contains</h3><ol>${LAB.STAGES.map(s => `<li><b>${s[1]}</b>: ${({ pre: 'five questions before you start; the first attempt is kept for the learning-gain calculation.', theory: 'principles, governing equations, nomenclature, procedure, tools and consumables, a narrated explainer with concept checks, and a Listen button that reads the theory aloud.', operate: 'a safety briefing to acknowledge, then set up the machine yourself (actions in the wrong order trigger an interlock alarm) or watch a demonstration, and run the test.', experiment: 'observation tables from your own run, and the results you calculate.', validation: 'your results checked against values computed from the same observations, and compared with handbook and standard data.', num: 'three randomised problem types per experiment, answers within ±2 %, with graded hints.', post: 'five questions to assess what you learned.', report: 'a watermarked report of about 20 sections with uncertainty analysis, which you can print, download or submit to your faculty after a short feedback form, and a certificate of completion once your faculty approves it.' })[s[0]]}</li>`).join('')}</ol>
      <h3>How far the simulators have been checked</h3><p>Each simulator is labelled with one of three levels. ${Object.entries(VS).map(([k, v]) => `<span class="vchip ${v[1]}">${v[0]}</span> ${v[2]}`).join(' ')}</p>
      <p class="muted" style="font-size:.86rem">Currently ${counts.v} validated, ${counts.p} partly validated and ${counts.t} teaching models. All outputs are model estimates for teaching. Instrument resolution and specimen scatter are added to every run.</p></div>
      ${LAB.tableHTML({ cols: ['No.', 'Experiment', 'Status', 'Basis of the check', 'Main sources'], textCols: [1, 2, 3, 4], rows: LAB.list.map(e => [e.no, `<a href="#${e.id}">${e.title}</a>`, chip(e.id), VALID[e.id][1], VALID[e.id][2]]) })}
      <div class="prose"><h3>Version history</h3><ul><li><b>2.1</b> (17 Oct 2026): MITE logo on the site, lab reports and certificates. Each submitted report is saved in full to the faculty’s Google Drive and can be downloaded from the Faculty page, singly or a whole class in one file. Faculty can issue certificates for students who never requested one, and copy a certificate’s link to send it. Certificates can be downloaded from their verification link on any computer. The feedback form asks for the class code.</li><li><b>2.0</b> (${VDATE}): Narrated explainers with concept checks and a Listen button on every Theory tab; safety briefing with acknowledgement before operating; do-it-yourself machine set-up with interlock alarms; tools and consumables libraries; Numericals stage with graded hints; feedback form; submission of reports to the faculty's Google Sheet; watermarked report; certificates of completion approved by the faculty, with a public verification link; validation status for each simulator; materials comparison; single-file site.</li><li><b>1.2</b> (12 Oct 2026): Animated set-up steps before each test; nomenclature tables.</li><li><b>1.0</b> (12 Oct 2026): 22 experiments with seven stages and comprehensive report.</li></ul>
      <h3>Cite this lab</h3><div class="citebox"><p id="cite">${esc(CITE)}</p><button class="btn quiet small" id="copycite" type="button">Copy citation</button><span class="muted" id="citemsg" style="font-size:.8rem"></span></div>
      <h3>Licence</h3><p>© 2026 Vignesh Nayak Ullal. Licensed under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="license noopener">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)</a>. You may use and adapt it for teaching and research with attribution; commercial use requires the author's permission. Published data reproduced for validation remain the property of their sources.</p>
      <h3>Your data</h3><p>Progress, answers and report details are stored only in your browser. Nothing is sent anywhere unless you press <i>Submit feedback</i> or <i>Submit to faculty</i>, which send your name, USN, scores and written answers to your faculty's Google Sheet.</p></div></section>`;
    $('#copycite').onclick = () => { const t = $('#cite').textContent; const ok = () => $('#citemsg').textContent = 'Copied.'; try { navigator.clipboard.writeText(t).then(ok, () => { const r = document.createRange(); r.selectNodeContents($('#cite')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); $('#citemsg').textContent = 'Selected. Press Ctrl+C to copy.'; }); } catch (e) { } };
  };

  /* ------------------------------------------------------------------ Compare materials */
  const PROPS = [['E', 'Young’s modulus', 'GPa'], ['G', 'Modulus of rigidity', 'GPa'], ['sy', 'Yield / 0.2% proof strength', 'MPa'], ['su', 'Tensile strength', 'MPa'], ['el', 'Elongation', '%'], ['hb', 'Brinell hardness', 'HBW'], ['kv', 'Charpy energy at 20 °C', 'J'], ['se', 'Endurance limit / fatigue strength at 10⁷', 'MPa'], ['rho', 'Density', 'g/cm³']];
  const MATS = (LAB.MATS = [
    ['Mild steel IS 2062 E250', { E: 205, G: 80, sy: 260, su: 430, el: 28, hb: 128, kv: 100, se: 215, rho: 7.85 }],
    ['Medium-carbon steel C45, normalised', { E: 205, G: 80, sy: 340, su: 620, el: 18, hb: 190, kv: 45, se: 310, rho: 7.85 }],
    ['Stainless steel 304, annealed', { E: 193, G: 77, sy: 240, su: 590, el: 55, hb: 170, kv: 200, se: 240, rho: 8.0 }],
    ['Grey cast iron FG 200', { E: 100, G: 41, su: 205, el: 0.6, hb: 195, kv: 4, se: 90, rho: 7.2 }],
    ['Aluminium alloy 6061-T6', { E: 69, G: 26, sy: 276, su: 310, el: 12, hb: 95, kv: 18, se: 96, rho: 2.70 }],
    ['Aluminium alloy 2024-T3', { E: 73, G: 28, sy: 345, su: 480, el: 18, hb: 120, se: 140, rho: 2.78 }],
    ['Copper, annealed', { E: 117, G: 44, sy: 70, su: 220, el: 45, hb: 45, kv: 60, se: 76, rho: 8.96 }],
    ['Brass CuZn30, annealed', { E: 110, G: 39, sy: 125, su: 335, el: 55, hb: 65, se: 120, rho: 8.53 }],
    ['Bearing steel EN31, hardened 61 HRC', { E: 210, G: 81, su: 2200, el: 1, hb: 650, rho: 7.81 }]
  ]);
  EXT.compare = function (el) {
    document.title = 'Compare materials — Materials Testing Virtual Lab';
    const sel = LAB.Store.get('cmpProp', 'su');
    el.innerHTML = `<section class="wrap" style="padding-block:28px 40px"><p class="eyebrow">Reference data</p><h1 style="margin-top:6px">Compare materials</h1>
      <p class="muted" style="margin-top:8px;max-width:75ch">Typical room-temperature properties of the materials used in the experiments, from ASM Handbook and Indian Standards. Use them to judge your own results; real values depend on composition, processing and test conditions.</p>
      <div class="toolbar" style="margin-top:16px"><label for="cmpP" class="muted" style="font-size:.85rem">Property</label><select id="cmpP" style="width:auto">${PROPS.map(([k, n, u]) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${n} (${u})</option>`).join('')}</select></div>
      <div class="panel" id="cmpBars"></div>
      <h3 style="margin:22px 0 8px">All properties</h3>${LAB.tableHTML({ cols: ['Material', ...PROPS.map(p => `${p[1]} (${p[2]})`)], textCols: [0], rows: MATS.map(([n, v]) => [n, ...PROPS.map(p => v[p[0]] == null ? '—' : v[p[0]])]) })}
      <p class="muted" style="font-size:.8rem">— : not applicable or not commonly reported (for example, grey iron has no defined yield point).</p></section>`;
    const draw = () => { const k = $('#cmpP').value; LAB.Store.set('cmpProp', k); const P = PROPS.find(p => p[0] === k); const rows = MATS.filter(m => m[1][k] != null).sort((a, b) => b[1][k] - a[1][k]); const mx = Math.max(...rows.map(r => r[1][k]));
      $('#cmpBars').innerHTML = `<div class="panel-h"><h4>${P[1]}</h4><span class="eyebrow">${P[2]}</span></div><div class="bars">${rows.map(([n, v]) => `<div class="bar"><span class="bn">${n}</span><span class="bt"><i style="width:${(v[k] / mx * 100).toFixed(1)}%"></i></span><span class="bv num">${v[k]}</span></div>`).join('')}</div>`; };
    $('#cmpP').onchange = draw; draw();
  };

  /* ------------------------------------------------------------------ Numericals stage */
  EXT.numericals = function (e, body, S, api) {
    const T = LAB.NUM && LAB.NUM[e.id];
    if (!T || !T.length) { body.innerHTML = '<div class="panel lockmsg"><h3>No numericals for this experiment</h3></div>'; return; }
    const N = S.num || (S.num = { solved: 0, attempted: 0, withHints: 0, hintsTotal: 0, cur: null });
    const fresh = () => { const k = Math.floor(Math.random() * T.length); const g = T[k](U.rng(Math.floor(Math.random() * 1e9))); return { k, q: g.q, ans: g.ans, unit: g.unit, hints: g.hints || [], sol: g.sol, title: g.title || '', done: false, hintN: 0, fb: '' }; };
    if (!N.cur) { N.cur = fresh(); api.save(); }
    const c = N.cur;
    body.innerHTML = `<div class="stack" style="max-width:860px"><p class="muted" style="max-width:75ch"><b>Numerical problems.</b> ${T.length} problem types, each with fresh random values. Answers within ±2 % are accepted. Stuck? Open a hint; hints used are noted in your report.</p>
      <div class="score"><div><span class="eyebrow">This experiment</span><br><b class="num">${N.solved}</b> <span class="muted">solved of ${N.attempted} attempted${N.withHints ? ` · ${N.withHints} with hints` : ''}</span></div></div>
      <div class="panel numcard"><p class="eyebrow">Problem type ${c.k + 1} of ${T.length}${c.title ? ' · ' + c.title : ''}</p><p class="numq">${c.q}</p>
        <div id="nhints">${c.hints.slice(0, c.hintN).map((x, i) => `<div class="hint"><b>Hint ${i + 1}.</b> ${x}</div>`).join('')}</div>
        <form id="nform" class="numrow" onsubmit="return false"><label for="nans" class="sr">Your answer in ${c.unit}</label><div class="unit-in" style="max-width:260px"><input id="nans" inputmode="decimal" autocomplete="off" placeholder="Your answer" ${c.done ? 'disabled' : ''}><span class="u">${c.unit}</span></div>
          <button class="btn" type="submit" ${c.done ? 'disabled' : ''}>Check</button>${!c.done && c.hintN < c.hints.length ? `<button class="btn quiet" type="button" id="nhint">Hint ${c.hintN + 1} of ${c.hints.length}</button>` : ''}<button class="btn quiet" type="button" id="nshow">${c.done ? 'New problem' : 'Show solution'}</button></form>
        <div id="nfb" aria-live="polite">${c.done ? c.fb : ''}</div></div></div>`;
    const sol = `<div class="why"><b>Solution.</b> ${c.sol}</div>`;
    const fmt = x => Math.abs(x) >= 1e5 || (Math.abs(x) < 1e-3 && x !== 0) ? U.sci(x, 4) : U.sig(x, 4);
    const hb = $('#nhint'); if (hb) hb.onclick = () => { const v = $('#nans').value; c.hintN++; N.hintsTotal++; api.save(); EXT.numericals(e, body, S, api); $('#nans').value = v; $('#nans').focus(); };
    $('#nform').onsubmit = () => {
      const v = parseFloat(String($('#nans').value).replace(/,/g, '').replace('×10', 'e').replace('x10^', 'e'));
      if (!isFinite(v)) { $('#nfb').innerHTML = '<div class="why">Enter a number (use e for powers of ten, e.g. 2.4e-5).</div>'; return false; }
      const ok = c.ans === 0 ? Math.abs(v) < 1e-9 : Math.abs(v / c.ans - 1) <= 0.02;
      if (ok) { N.solved++; N.attempted++; if (c.hintN) N.withHints++; c.done = true; c.fb = `<div class="why"><b class="ok">Correct${c.hintN ? ` (with ${c.hintN} hint${c.hintN > 1 ? 's' : ''})` : ''}.</b> Exact answer ${fmt(c.ans)} ${c.unit}.</div>` + sol; api.save(); api.refreshBar(); EXT.numericals(e, body, S, api); }
      else $('#nfb').innerHTML = `<div class="why"><b class="bad">Not yet.</b> Your answer is ${U.f(Math.abs(v / c.ans - 1) * 100, 0)} % ${v > c.ans ? 'high' : 'low'}. Check the units${c.hintN < c.hints.length ? ', or open a hint' : ''}.</div>`;
      return false;
    };
    $('#nshow').onclick = () => { if (c.done) { N.cur = fresh(); api.save(); EXT.numericals(e, body, S, api); return; } N.attempted++; c.done = true; c.fb = `<div class="why">Answer: <b>${fmt(c.ans)} ${c.unit}</b>.</div>` + sol; api.save(); EXT.numericals(e, body, S, api); };
  };

  /* ------------------------------------------------------------------ feedback + submission (Report stage) */
  const FBQ = [['q1', 'The theory and explainer helped me understand the test.'], ['q2', 'Setting up and running the machine helped me understand the procedure.'], ['q3', 'The observations, calculations and validation helped me interpret results.'], ['q4', 'The tests and numericals were at the right level of difficulty.'], ['q5', 'The lab was easy to use on my device.'], ['q6', 'I would recommend this virtual lab to other students.']];
  const LIK = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'];
  EXT.submitUrl = () => CFG.submitUrl || '';
  EXT.fbHTML = function (S) {
    const F = S.feedback;
    if (F) return `<div class="panel fbdone" id="fbbox"><div><b class="ok">✓ Feedback recorded</b><br><span class="muted" style="font-size:.8rem">${new Date(F.t).toLocaleString()}${F.sent === true ? ' · received by your faculty’s sheet' : F.sent === 'unconfirmed' ? ' · sent, but the sheet’s reply could not be read; ask your faculty to confirm' : F.sent === false ? ' · saved on this device' : ''}. Print, download and submit are unlocked.</span></div><button class="btn quiet small" type="button" id="fbedit">Change my feedback</button></div>`;
    const D = S.fbd || (S.fbd = {});
    return `<fieldset class="panel fbform" id="fbbox"><legend><b>Feedback on this experiment</b> <span class="muted" style="font-size:.78rem">(required to print, download or submit)</span></legend>
      <p class="muted" style="font-size:.78rem;margin:0 0 6px">Your honest answers help improve the lab.${CFG.submitUrl ? ' They are sent to your faculty with your name and USN.' : ''}</p>
      ${FBQ.map(([k, q], qi) => `<div class="lik" role="radiogroup" aria-labelledby="fbl-${k}"><span class="likq" id="fbl-${k}">${qi + 1}. ${q}</span><span class="likopts">${LIK.map((l, i) => `<label title="${l}"><input type="radio" name="fb-${k}" value="${i + 1}"${D[k] == i + 1 ? ' checked' : ''}><span>${i + 1}</span></label>`).join('')}</span></div>`).join('')}
      <p class="muted" style="font-size:.72rem;margin:2px 0 8px">1 = strongly disagree … 5 = strongly agree</p>
      <div class="field"><label for="fb-time">Time spent on this experiment</label><select id="fb-time"><option value="">Choose…</option>${['Under 30 min', '30–60 min', '1–2 hours', 'Over 2 hours'].map(o => `<option${D.time === o ? ' selected' : ''}>${o}</option>`).join('')}</select></div>
      <div class="field"><label for="fb-dev">Device used</label><select id="fb-dev"><option value="">Choose…</option>${['Phone', 'Tablet', 'Laptop / desktop', 'College lab computer'].map(o => `<option${D.device === o ? ' selected' : ''}>${o}</option>`).join('')}</select></div>
      <div class="field"><label for="fb-help">What helped you most? (required)</label><textarea id="fb-help" rows="2">${esc(D.helped || '')}</textarea></div>
      <div class="field"><label for="fb-conf">What was confusing or did not work? (optional)</label><textarea id="fb-conf" rows="2">${esc(D.confusing || '')}</textarea></div>
      <div class="field"><label for="fb-sug">One suggestion (optional)</label><textarea id="fb-sug" rows="2">${esc(D.suggest || '')}</textarea></div>
      ${CFG.submitUrl ? `<div class="field"><label for="fb-code">Class code (from your faculty)</label><input type="text" id="fb-code" autocomplete="off" value="${esc(LAB.Store.get('classCode', ''))}"></div>` : ''}
      <div class="controls"><button class="btn small" type="button" id="fbsend">Submit feedback</button><span class="muted" id="fbmsg" style="font-size:.8rem" aria-live="polite"></span></div></fieldset>`;
  };
  async function post(d) { try { const r = await fetch(CFG.submitUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(d) }); return await r.json(); } catch (er) { return { unconfirmed: true }; } }
  EXT.fbBind = function (e, S, stu, rerender) {
    const ed = $('#fbedit'); if (ed) { ed.onclick = () => { S.fbd = { ...S.feedback }; delete S.feedback; LAB.save(e.id); rerender(); }; return; }
    const box = $('#fbbox'); if (!box) return; const D = S.fbd || (S.fbd = {});
    box.addEventListener('change', ev => { const t = ev.target; if (t.name && t.name.startsWith('fb-')) D[t.name.slice(3)] = +t.value; if (t.id === 'fb-time') D.time = t.value; if (t.id === 'fb-dev') D.device = t.value; LAB.save(e.id); });
    const fc = $('#fb-code'); if (fc) fc.oninput = ev => { LAB.Store.set('classCode', ev.target.value); const rk = $('#rk'); if (rk) rk.value = ev.target.value; };
    [['fb-help', 'helped'], ['fb-conf', 'confusing'], ['fb-sug', 'suggest']].forEach(([id, k]) => { $('#' + id).oninput = ev => { D[k] = ev.target.value; LAB.save(e.id); }; });
    $('#fbsend').onclick = async () => {
      const m = $('#fbmsg'); const st = stu();
      if (!(st.name || '').trim() || !(st.usn || '').trim()) { m.innerHTML = '<span class="bad">Enter your name and USN under Report details first.</span>'; return; }
      const miss = FBQ.map(([k], i) => D[k] ? 0 : i + 1).filter(Boolean); if (miss.length) { m.innerHTML = `<span class="bad">Rate every statement. Missing: ${miss.join(', ')}.</span>`; return; }
      if (!D.time || !D.device) { m.innerHTML = '<span class="bad">Choose the time spent and the device used.</span>'; return; }
      if ((D.helped || '').trim().length < 5) { m.innerHTML = '<span class="bad">Tell us briefly what helped you most.</span>'; return; }
      if (CFG.submitUrl && !(LAB.Store.get('classCode', '') || '').trim()) { m.innerHTML = '<span class="bad">Enter the class code your faculty gave you.</span>'; return; }
      const F = { ...D, t: new Date().toISOString(), sent: null };
      if (CFG.submitUrl) { $('#fbsend').disabled = true; m.textContent = 'Sending…';
        const r = await post({ type: 'feedback', version: VERSION, reportId: LAB.reportId(e, S), experiment: `Exp ${e.no} ${e.title}`, name: st.name.trim(), usn: st.usn.trim().toUpperCase(), section: st.section || '', batch: st.batch || '', institution: st.inst || '', classCode: (LAB.Store.get('classCode', '') || '').trim(), q1: F.q1, q2: F.q2, q3: F.q3, q4: F.q4, q5: F.q5, q6: F.q6, time: F.time, device: F.device, helped: F.helped, confusing: F.confusing || '', suggest: F.suggest || '', clientTime: F.t });
        $('#fbsend').disabled = false;
        if (r && r.error === 'class code') { m.innerHTML = '<span class="bad">Class code not accepted.</span> Enter the class code your faculty gave you in the field above, then submit again.'; return; }
        if (r && r.error && !r.unconfirmed) { m.innerHTML = '<span class="bad">Not recorded: ' + esc(r.error) + '.</span> Try again.'; return; }
        F.sent = r && r.ok ? true : 'unconfirmed'; } else F.sent = false;
      S.feedback = F; delete S.fbd; LAB.save(e.id); rerender();
    };
  };
  EXT.submitHTML = function (S) {
    const sub = S.submitted; const url = CFG.submitUrl;
    return `<div class="panel stack" style="gap:8px"><h4>Submit to faculty</h4><div class="field"><label for="rk">Class code (from your faculty)</label><input type="text" id="rk" value="${esc(LAB.Store.get('classCode', ''))}" autocomplete="off"></div>
      <button class="btn" type="button" id="rsub" ${url ? '' : 'disabled'}>Submit to faculty</button><span class="muted" id="rsubmsg" style="font-size:.8rem" aria-live="polite">${!url ? 'Submission is not set up for this copy of the lab. Print or download the report instead.' : sub ? `Last submitted ${new Date(sub.t).toLocaleString()} (Report ID ${esc(sub.id)}). You can submit again; your faculty sees every submission.` : 'Submitting sends your name, USN, scores, results, conclusion and discussion answers to your faculty’s Google Sheet.'}</span></div>`;
  };
  EXT.submitBind = function (e, S, payload) {
    const k = $('#rk'); if (k) k.oninput = ev => { LAB.Store.set('classCode', ev.target.value); const f = $('#fb-code'); if (f) f.value = ev.target.value; };
    const b = $('#rsub'); if (!b || !CFG.submitUrl) return;
    b.onclick = async () => {
      const m = $('#rsubmsg'); const d = payload();
      if (!d.name || !d.usn) { m.innerHTML = '<span class="bad">Enter your name and USN first.</span>'; return; }
      if (!d.classCode) { m.innerHTML = '<span class="bad">Enter the class code your faculty gave you.</span>'; return; }
      b.disabled = true; m.textContent = 'Submitting…'; const res = await post(d); b.disabled = false;
      if (res && res.ok) { S.submitted = { t: new Date().toISOString(), id: d.reportId }; LAB.save(e.id); m.innerHTML = `<span class="ok">Submitted.</span> Report ID ${esc(d.reportId)}. Keep this ID; your faculty will match it to the printed report.`; if (EXT.certHTML) { const cb = $('#certbox'); if (cb) { cb.outerHTML = EXT.certHTML(e, S); EXT.certBind(e, S, () => LAB.switchStage('report')); } } }
      else if (res && res.error === 'class code') m.innerHTML = '<span class="bad">Class code not accepted.</span> Check it with your faculty.';
      else if (res && res.unconfirmed) m.innerHTML = 'Sent, but the server reply could not be read (network or browser restriction). Ask your faculty to confirm it arrived before submitting again.';
      else m.innerHTML = '<span class="bad">Submission failed.</span> ' + esc((res && res.error) || 'Try again later.');
    };
  };
})();
