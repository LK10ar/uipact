/* UIPACT — pile de couches en verre (CSS 3D) qui se construit au défilement. Aucune dépendance. */
(function () {
  var sec = document.getElementById('story'); if (!sec) return;
  sec.classList.add('js');
  var stage = sec.querySelector('.sty-stage'), scene = stage.querySelector('.sty-scene'), vis = stage.querySelector('.sty-vis');
  var cnt = stage.querySelector('.sty-cnt'), card = stage.querySelector('.sty-card');
  var chs = [].slice.call(sec.querySelectorAll('.sty-ch')), n = chs.length;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ---------- dessins des couches (un par chapitre) ---------- */
  function dots() { var s = '<g fill="currentColor" stroke="none">'; for (var y = 0; y < 7; y++) for (var x = 0; x < 7; x++) s += '<circle cx="' + (30 + x * 23) + '" cy="' + (34 + y * 22) + '" r="1.7" opacity="' + (.2 + ((x * 2 + y) % 4) * .17) + '"/>'; return s + '</g>'; }
  var ART = [
    dots() + '<circle cx="134" cy="72" r="30"/><circle cx="134" cy="72" r="17"/><circle cx="134" cy="72" r="4" fill="currentColor"/><path d="M30 164C68 152 92 112 124 78" stroke-dasharray="4 5"/>',
    '<text x="100" y="92" text-anchor="middle" font-size="46" font-weight="700" fill="currentColor" stroke="none" letter-spacing="3">UIP</text><path d="M56 106h88"/><circle cx="70" cy="140" r="12" fill="#16224d"/><circle cx="104" cy="140" r="12" fill="#C9A24B" stroke="none"/><circle cx="138" cy="140" r="12" fill="#E4C77A" stroke="none"/><text x="26" y="176" font-size="13" fill="currentColor" stroke="none">Aa</text>',
    '<g transform="rotate(-9 100 100)"><rect x="34" y="52" width="104" height="66" rx="6"/><path d="M46 70h44M46 84h62M46 98h30"/></g><rect x="66" y="92" width="104" height="66" rx="6" fill="rgba(13,20,48,.55)"/><path d="M80 112h40M80 126h64M80 140h28"/>',
    '<rect x="22" y="36" width="156" height="128" rx="10"/><path d="M22 58h156"/><circle cx="36" cy="47" r="3" fill="currentColor"/><circle cx="48" cy="47" r="3" fill="currentColor"/><circle cx="60" cy="47" r="3" fill="currentColor"/><rect x="34" y="70" width="86" height="40" rx="5"/><rect x="128" y="70" width="38" height="40" rx="5"/><rect x="34" y="120" width="40" height="32" rx="5"/><rect x="80" y="120" width="40" height="32" rx="5"/><rect x="126" y="120" width="40" height="32" rx="5"/>',
    '<rect x="70" y="26" width="60" height="124" rx="10"/><path d="M92 36h16"/><rect x="78" y="48" width="44" height="30" rx="4"/><path d="M80 90h40M80 102h30"/><rect x="80" y="116" width="40" height="18" rx="9"/><circle cx="28" cy="70" r="8"/><circle cx="28" cy="130" r="8"/><circle cx="172" cy="100" r="8"/><path d="M36 72L70 80M36 128L70 116M164 100L130 100" stroke-dasharray="3 4"/><path d="M142 130l22 6-9 4 4 10-4 2-5-10-8 6z" fill="currentColor" stroke="none"/>',
    '<path d="M100 28l52 18v46c0 34-22 56-52 72-30-16-52-38-52-72V46z"/><path d="M76 98l17 17 32-34" stroke-width="3"/><path d="M100 28v-0M64 60l36-13 36 13" opacity=".35"/>',
    '<rect x="30" y="38" width="140" height="30" rx="8"/><rect x="30" y="85" width="140" height="30" rx="8"/><rect x="30" y="132" width="140" height="30" rx="8"/><circle cx="48" cy="53" r="7"/><circle cx="48" cy="100" r="7"/><circle cx="48" cy="147" r="7"/><path d="M45 53l2 2 4-4M45 100l2 2 4-4M45 147l2 2 4-4M66 53h70M66 100h56M66 147h82" /><path d="M150 52l3 3 6-6" opacity="0"/>'
  ];
  var slabs = chs.map(function (c, k) {
    var s = document.createElement('div'); s.className = 'sty-slab';
    s.innerHTML = '<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ART[k] || '') + '</svg><span class="sty-sl">' + ('0' + (k + 1)).slice(-2) + '</span>';
    scene.appendChild(s); return s;
  });

  /* ---------- état ---------- */
  var tf = 0, cf = 0, mx = 0, my = 0, smx = 0, smy = 0, vs = false, cur = -1;
  function onScroll() { var r = sec.getBoundingClientRect(); tf = clamp(-r.top / (stage.offsetHeight || innerHeight), 0, n - 1); }
  function setActive(a) {
    cur = a; idxBtns.forEach(function (b, j) { b.classList.toggle('on', j === a); });
    if (cnt) cnt.textContent = ('0' + (a + 1)).slice(-2);
    if (card) { card.querySelector('small').textContent = 'Couche ' + ('0' + (a + 1)).slice(-2); card.querySelector('b').textContent = chs[a].getAttribute('data-t') || ''; }
  }
  function frame() {
    cf += (tf - cf) * (reduce ? 1 : .12); smx += (mx - smx) * .06; smy += (my - smy) * .06;
    var gap = vis.clientWidth * .15;
    scene.style.transform = 'rotateX(' + (56 + smy * 5).toFixed(2) + 'deg) rotateZ(' + (-34 + smx * 9).toFixed(2) + 'deg) translateZ(' + (-cf * gap).toFixed(1) + 'px)';
    for (var k = 0; k < n; k++) {
      var d = Math.abs(cf - k), p = clamp(cf - k + 1, 0, 1), e = p * p * (3 - 2 * p), a = clamp(1 - d, 0, 1), far = clamp(1 - (d - 2.2) * .5, 0, 1);
      slabs[k].style.transform = 'translateZ(' + (k * gap + (1 - e) * gap * 2.6 + a * gap * .16).toFixed(1) + 'px)';
      slabs[k].style.opacity = (e * (.3 + .7 * a) * far).toFixed(3);
      slabs[k].style.setProperty('--a', a.toFixed(3));
    }
    if (card) card.style.setProperty('--p', (cf / (n - 1 || 1)).toFixed(3));
    var act = clamp(Math.round(cf), 0, n - 1); if (act !== cur) setActive(act);
  }
  function loop() { if (!vs) return; frame(); requestAnimationFrame(loop); }

  /* ---------- index, apparition des textes, chiffres animés ---------- */
  var idx = document.createElement('div'), idxBtns = []; idx.className = 'sty-idx'; idx.setAttribute('aria-label', 'Chapitres');
  chs.forEach(function (c, j) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = ('0' + (j + 1)).slice(-2); b.setAttribute('aria-label', 'Chapitre ' + (j + 1));
    b.onclick = function () { scrollTo({ top: c.getBoundingClientRect().top + scrollY, behavior: reduce ? 'auto' : 'smooth' }); };
    idx.appendChild(b); idxBtns.push(b);
  });
  stage.appendChild(idx);
  function countUp(el) {
    var to = +el.getAttribute('data-n'), t0 = performance.now();
    if (reduce) { el.textContent = to; return; }
    (function s(t) { var q = clamp((t - t0) / 1400, 0, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - q, 3))); if (q < 1) requestAnimationFrame(s); })(t0);
  }
  var ioR = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      e.target.classList.toggle('on', e.isIntersecting);
      if (e.isIntersecting) [].forEach.call(e.target.querySelectorAll('[data-n]:not([data-done])'), function (el) { el.setAttribute('data-done', 1); countUp(el); });
    });
  }, { threshold: .35 });
  chs.forEach(function (c) { ioR.observe(c); });
  new IntersectionObserver(function (es) { var v = es[0].isIntersecting; if (v && !vs) { vs = true; onScroll(); loop(); } vs = v; }, { rootMargin: '100px' }).observe(sec);

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', function () { onScroll(); if (!vs) frame(); });
  addEventListener('mousemove', function (e) { if (!reduce) { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; } }, { passive: true });
  onScroll(); cf = tf; frame();
})();
