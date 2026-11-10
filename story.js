/* UIPACT — particules 3D qui se transforment au défilement (aucune dépendance, canvas 2D) */
(function () {
  var sec = document.getElementById('story'); if (!sec) return;
  sec.classList.add('js');
  var stage = sec.querySelector('.sty-stage'), cv = stage.querySelector('canvas'), ctx = cv.getContext('2d');
  var chs = [].slice.call(sec.querySelectorAll('.sty-ch')), n = chs.length;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var N = innerWidth < 820 ? 1500 : 3000, W, H, dpr;
  var PI = Math.PI, clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var g = function () { return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; };

  /* ---------- formes : chaque forme = N points 3D dans [-1,1] ---------- */
  function fromSegs(list) {
    var L = list.map(function (s) { return Math.hypot(s[3] - s[0], s[4] - s[1], s[5] - s[2]); }), cum = [], c = 0, o = new Float32Array(N * 3);
    L.forEach(function (l) { c += l; cum.push(c); });
    for (var i = 0; i < N; i++) {
      var r = Math.random() * c, k = 0; while (cum[k] < r) k++;
      var s = list[k], t = Math.random();
      o[i * 3] = s[0] + (s[3] - s[0]) * t + g() * .012; o[i * 3 + 1] = s[1] + (s[4] - s[1]) * t + g() * .012; o[i * 3 + 2] = s[2] + (s[5] - s[2]) * t + g() * .012;
    }
    return o;
  }
  function rect(cx, cy, w, h, z) {
    var x1 = cx - w / 2, x2 = cx + w / 2, y1 = cy - h / 2, y2 = cy + h / 2; z = z || 0;
    return [[x1, y1, z, x2, y1, z], [x2, y1, z, x2, y2, z], [x2, y2, z, x1, y2, z], [x1, y2, z, x1, y1, z]];
  }
  function funnel() {
    var o = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      var t = i / N, r = .1 + .9 * (1 - t), a = t * 30 * PI + g() * .25;
      o[i * 3] = Math.cos(a) * r + g() * .03; o[i * 3 + 1] = .95 - 1.9 * t; o[i * 3 + 2] = Math.sin(a) * r + g() * .03;
    }
    return o;
  }
  function star() {
    var nodes = [], sp = [], o = new Float32Array(N * 3), i, k;
    for (k = 0; k < 8; k++) { var a = k / 8 * 2 * PI + .3, e = (k % 2 ? .55 : .9); nodes.push([Math.cos(a) * e, Math.sin(a * 1.3) * .8, Math.sin(a) * e * .7]); sp.push([0, 0, 0, nodes[k][0], nodes[k][1], nodes[k][2]]); }
    var lines = fromSegs(sp);
    for (i = 0; i < N; i++) {
      var q = Math.random(), x, y, z;
      if (q < .22) { x = g() * .09; y = g() * .09; z = g() * .09; }
      else if (q < .4) { var nd = nodes[(Math.random() * 8) | 0]; x = nd[0] + g() * .07; y = nd[1] + g() * .07; z = nd[2] + g() * .07; }
      else { x = lines[i * 3]; y = lines[i * 3 + 1]; z = lines[i * 3 + 2]; }
      o[i * 3] = x; o[i * 3 + 1] = y; o[i * 3 + 2] = z;
    }
    return o;
  }
  function sheets() {
    var list = [];
    for (var j = 0; j < 3; j++) {
      var a = (j - 1) * .5, ox = (j - 1) * .5, oz = (1 - j) * .3, loc = rect(0, 0, .72, .98);
      [-.22, -.05, .12, .29].forEach(function (y) { loc.push([-.26, y, 0, .2, y, 0]); });
      loc.push([-.26, .36, 0, .26, .36, 0]);
      loc.forEach(function (s) {
        var p = function (x, y) { return [x * Math.cos(a) + ox, y, -x * Math.sin(a) + oz]; }, A = p(s[0], s[1]), B = p(s[3], s[4]);
        list.push([A[0], A[1], A[2], B[0], B[1], B[2]]);
      });
    }
    return fromSegs(list);
  }
  function browser() {
    var l = rect(0, 0, 1.7, 1.15).concat([[-.85, .38, 0, .85, .38, 0]], rect(-.74, .475, .06, .06), rect(-.62, .475, .06, .06), rect(-.5, .475, .06, .06),
      rect(-.3, .1, 1, .4), rect(.5, .1, .5, .4), rect(-.55, -.33, .5, .38), rect(0, -.33, .5, .38), rect(.55, -.33, .5, .38),
      [[-.7, .22, 0, -.1, .22, 0]], [[-.7, .1, 0, -.2, .1, 0]]);
    return fromSegs(l);
  }
  function phone() {
    var l = rect(0, 0, .8, 1.5).concat([[-.15, .66, 0, .15, .66, 0]], rect(0, .3, .62, .4), rect(-.16, -.13, .3, .3), rect(.2, -.13, .22, .3), rect(0, -.4, .62, .12),
      rect(-.2, -.63, .1, .1), rect(0, -.63, .1, .1), rect(.2, -.63, .1, .1));
    return fromSegs(l);
  }
  function bars() {
    var l = [], i;
    for (i = 0; i < 6; i++) { var h = .25 + i * .22; l = l.concat(rect(-.9 + i * .36, -.7 + h / 2, .24, h)); }
    l.push([-.95, -.35, 0, .95, .92, 0]);
    return fromSegs(l);
  }
  var SH = [{ p: funnel(), r: 0 }, { p: star(), r: .3 }, { p: sheets(), r: -.15 }, { p: browser(), r: -.45 }, { p: phone(), r: .35 }, { p: bars(), r: -.3 }].slice(0, n);

  /* ---------- particules ---------- */
  var rn = new Float32Array(N), nx = new Float32Array(N), ny = new Float32Array(N), nz = new Float32Array(N), cls = new Uint8Array(N), PX = new Float32Array(N), PY = new Float32Array(N), PS = new Float32Array(N), i;
  for (i = 0; i < N; i++) { rn[i] = Math.random(); nx[i] = g(); ny[i] = g(); nz[i] = g(); var q = Math.random(); cls[i] = q < .68 ? 0 : q < .9 ? 1 : 2; }
  var COL = ['201,162,75', '228,199,122', '255,255,255'], AL = [.9, .85, .8];
  function readColors() {
    var cs = getComputedStyle(document.documentElement), a = cs.getPropertyValue('--c-gold-rgb').trim(), b = cs.getPropertyValue('--c-gold2-rgb').trim();
    if (a) COL[0] = a; if (b) COL[1] = b;
  }

  /* ---------- état ---------- */
  var tf = 0, cf = 0, mx = 0, my = 0, smx = 0, smy = 0, vis = false, frame = 0;
  function size() { dpr = Math.min(devicePixelRatio || 1, 2); W = stage.clientWidth; H = stage.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function onScroll() { var r = sec.getBoundingClientRect(); tf = clamp(-r.top / (stage.offsetHeight || innerHeight), 0, n - 1); }
  var sideX = function (k) { return innerWidth < 820 ? .5 : (k % 2 === 0 ? .72 : .28); };

  function draw() {
    cf += (tf - cf) * (reduce ? 1 : .1);
    smx += (mx - smx) * .06; smy += (my - smy) * .06;
    var a = Math.floor(cf + 1e-4), b = Math.min(a + 1, n - 1), fr = cf - a, tt = clamp((fr - .1) / .8, 0, 1); tt = tt * tt * (3 - 2 * tt);
    var A = SH[a].p, B = SH[b].p, mob = innerWidth < 820;
    var cx = W * (sideX(a) + (sideX(b) - sideX(a)) * tt), cy = H * (mob ? .3 : .5), S = Math.min(W * (mob ? .42 : .3), H * (mob ? .26 : .42));
    var t = reduce ? 0 : performance.now() / 1000, ry = SH[a].r + (SH[b].r - SH[a].r) * tt + Math.sin(t * .4) * .35 + smx * .45, rx = smy * .22 - .08;
    var cyR = Math.cos(ry), syR = Math.sin(ry), cxR = Math.cos(rx), sxR = Math.sin(rx);
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < N; i++) {
      var u = clamp(tt * 1.5 - rn[i] * .5, 0, 1), e = u * u * (3 - 2 * u), s = Math.sin(PI * e) * .45, k = i * 3;
      var x = A[k] + (B[k] - A[k]) * e + nx[i] * s, y = A[k + 1] + (B[k + 1] - A[k + 1]) * e + ny[i] * s, z = A[k + 2] + (B[k + 2] - A[k + 2]) * e + nz[i] * s;
      var x1 = x * cyR + z * syR, z1 = -x * syR + z * cyR, y1 = y * cxR - z1 * sxR, z2 = y * sxR + z1 * cxR, f = 3 / (3 - z2);
      PX[i] = cx + x1 * f * S; PY[i] = cy - y1 * f * S; PS[i] = (.7 + (z2 + 1) * .6) * (f > 1 ? 1.1 : .95);
    }
    for (var c = 0; c < 3; c++) {
      ctx.fillStyle = 'rgba(' + COL[c] + ',' + AL[c] + ')';
      for (i = 0; i < N; i++) if (cls[i] === c) ctx.fillRect(PX[i], PY[i], PS[i], PS[i]);
    }
    var act = Math.round(cf); idxBtns.forEach(function (bt, j) { bt.classList.toggle('on', j === act); });
  }
  function loop() { if (!vis) return; draw(); if (++frame % 120 === 0) readColors(); requestAnimationFrame(loop); }

  /* ---------- index latéral + apparition des textes ---------- */
  var idx = document.createElement('div'), idxBtns = []; idx.className = 'sty-idx'; idx.setAttribute('aria-label', 'Chapitres');
  chs.forEach(function (c, j) {
    var bt = document.createElement('button'); bt.type = 'button'; bt.textContent = ('0' + (j + 1)).slice(-2); bt.setAttribute('aria-label', 'Chapitre ' + (j + 1));
    bt.onclick = function () { window.scrollTo({ top: c.getBoundingClientRect().top + scrollY, behavior: reduce ? 'auto' : 'smooth' }); };
    idx.appendChild(bt); idxBtns.push(bt);
  });
  stage.appendChild(idx);
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('on', e.isIntersecting); }); }, { threshold: .35 });
  chs.forEach(function (c) { io.observe(c); });
  new IntersectionObserver(function (es) { var v = es[0].isIntersecting; if (v && !vis) { vis = true; onScroll(); loop(); } vis = v; }, { rootMargin: '100px' }).observe(sec);

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', function () { size(); onScroll(); if (!vis) draw(); });
  addEventListener('mousemove', function (e) { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; }, { passive: true });
  readColors(); size(); onScroll(); cf = tf; draw();
})();
