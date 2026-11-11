/* UIPACT — formes 3D en particules (Three.js) qui changent au défilement + panneau de réglages.
   Nécessite three.js (r150) et story-shapes.js chargés avant. Si WebGL est indisponible, le texte reste affiché. */
(function () {
  'use strict';
  var sec = document.getElementById('story'); if (!sec) return;
  sec.classList.add('js');
  var S = window.UIPShapes, stage = sec.querySelector('.sty-stage'), host = stage.querySelector('.sty-gl'), bgw = stage.querySelector('.sty-bgt'), bgt = bgw.querySelector('span');
  var chs = [].slice.call(sec.querySelectorAll('.sty-ch')), n = chs.length;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = function () { return innerWidth < 820; };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  // Valeurs par défaut = tes réglages ; l'admin peut les modifier (section « particles », enregistrée sur l'API)
  var P = { rep: 1, rad: .8, ns: .04, nsp: .3, count: 18000, size: .6, bg: 'UIPACT' };
  try {
    var cached = JSON.parse(localStorage.getItem('uipact_cms_' + (localStorage.getItem('uipact_lang') || 'fr')) || '{}').particles || {};
    ['rep', 'rad', 'ns', 'nsp', 'count', 'size'].forEach(function (k) { if (typeof cached[k] === 'number' && isFinite(cached[k])) P[k] = cached[k]; });
    if (typeof cached.bg === 'string' && cached.bg.trim()) P.bg = cached.bg.trim().slice(0, 14).toUpperCase();
  } catch (e) {}
  if (mobile()) P.count = Math.min(P.count, 6000);

  /* ---------- index latéral + apparition des textes (fonctionnent même sans WebGL) ---------- */
  var idx = document.createElement('div'), idxBtns = []; idx.className = 'sty-idx'; idx.setAttribute('aria-label', 'Chapitres');
  var go = function (i) { chs[i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); };
  chs.forEach(function (c, j) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = ('0' + (j + 1)).slice(-2); b.setAttribute('aria-label', 'Chapitre ' + (j + 1));
    b.onclick = function () { go(j); }; idx.appendChild(b); idxBtns.push(b);
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

  if (!window.THREE || !S) { sec.classList.add('nogl'); return; }

const SIMPLEX_NOISE_GLSL = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0 );
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}
`;

const VERTEX_SHADER = `
${SIMPLEX_NOISE_GLSL}

attribute vec3 color;
attribute vec3 aTargetPosition;
attribute vec3 aTargetColor;
attribute float aScale;

uniform float uMorphProgress;
uniform float uTime;
uniform float uNoiseStrength;
uniform float uNoiseSpeed;
uniform vec3 uMouse3D;
uniform float uMouseActive;
uniform float uRepulsionRadius;
uniform float uRepulsionStrength;
uniform float uPointSize;

varying vec3 vColor;
varying float vDistToMouse;

void main() {
  // 1. Smooth morphing between Shape A (position) and Shape B (aTargetPosition)
  float m = smoothstep(0.0, 1.0, uMorphProgress);

  // Transition turbulence burst: particles swirl organically between shapes
  float burst = sin(uMorphProgress * 3.14159265);
  vec3 noiseCoord = mix(position, aTargetPosition, m) * 1.5 + vec3(uTime * 0.4);
  float nX = snoise(noiseCoord);
  float nY = snoise(noiseCoord + vec3(17.1, 31.7, 43.3));
  float nZ = snoise(noiseCoord + vec3(63.9, 11.5, 87.2));
  vec3 transitionTurbulence = vec3(nX, nY, nZ) * (burst * 0.45);

  // Perpetual living float (always active)
  vec3 perpetualCoord = position * 1.2 + vec3(uTime * uNoiseSpeed * 0.35);
  vec3 perpetualNoise = vec3(
    snoise(perpetualCoord),
    snoise(perpetualCoord + vec3(19.3, 31.7, 47.1)),
    snoise(perpetualCoord + vec3(73.1, 13.9, 89.5))
  ) * uNoiseStrength;

  vec3 basePos = mix(position, aTargetPosition, m) + transitionTurbulence + perpetualNoise;
  vColor = mix(color, aTargetColor, m);

  // 2. World space mouse repulsion
  vec4 worldPos = modelMatrix * vec4(basePos, 1.0);
  vec3 toMouse = worldPos.xyz - uMouse3D;
  float dist = length(toMouse);
  vDistToMouse = dist;

  vec3 repulsionWorld = vec3(0.0);
  if (dist < uRepulsionRadius && dist > 0.0001) {
    float normDist = dist / uRepulsionRadius;
    float falloff = (1.0 - normDist) * (1.0 - normDist);
    float force = falloff * uRepulsionStrength * uMouseActive;

    vec3 pushDir = normalize(toMouse);
    repulsionWorld = pushDir * force;

    // Fluid swirl around mouse direction
    vec3 swirl = cross(pushDir, vec3(0.0, 1.0, 0.0)) * (force * 0.35);
    repulsionWorld += swirl;
  }

  // Inverse model rotation back to local coordinates
  mat3 invModel = inverse(mat3(modelMatrix));
  vec3 finalPos = basePos + (invModel * repulsionWorld);

  vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Crisp perspective particle sizing
  float proximityBoost = 1.0 + (1.0 - clamp(dist / uRepulsionRadius, 0.0, 1.0)) * 0.8 * uMouseActive;
  gl_PointSize = aScale * uPointSize * proximityBoost * (15.5 / -mvPosition.z);
}
`;

const FRAGMENT_SHADER = `
varying vec3 vColor;
varying float vDistToMouse;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) discard;

  // High-definition optical star speck
  float core = exp(-dist * dist * 16.0);
  float ring = smoothstep(0.5, 0.1, dist);
  float alpha = (core * 0.75 + ring * 0.25);

  // Gold sparkle highlight near interaction
  float mouseGlow = 1.0 - clamp(vDistToMouse / 1.5, 0.0, 1.0);
  vec3 glowColor = vColor + vec3(0.25, 0.20, 0.10) * mouseGlow;

  gl_FragColor = vec4(glowColor, alpha);
}
`;

  /* ---------- scène Three.js ---------- */
  var GEN = [S.generateCompass, S.generateNetwork, S.generatePrintedSheets, S.generateWebWindow, S.generateMobile, S.generatePadlock, S.generateGrowthChart].slice(0, n);
  // une pose par forme : rotation Y/X, position X (+ = à droite, - = à gauche), échelle. Le texte est de l'autre côté.
  var CFG = [{ ry: .12, rx: .28 }, { ry: -.22, rx: .1 }, { ry: .35, rx: .18 }, { ry: -.16, rx: .05 }, { ry: .22, rx: .08 }, { ry: .05, rx: .04 }, { ry: -.14, rx: .06 }];
  var uni = {
    uMorphProgress: { value: 0 }, uTime: { value: 0 }, uNoiseStrength: { value: P.ns }, uNoiseSpeed: { value: reduce ? 0 : P.nsp },
    uMouse3D: { value: new THREE.Vector3(0, 0, .4) }, uMouseActive: { value: 0 }, uRepulsionRadius: { value: P.rad }, uRepulsionStrength: { value: P.rep }, uPointSize: { value: P.size }
  };
  var renderer, scene, camera, group, points, shapes = [], pa, pt, ca, ct, aS = -1, bS = -1;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { sec.classList.add('nogl'); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(host.clientWidth || innerWidth, host.clientHeight || innerHeight);
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
  host.appendChild(renderer.domElement);
  scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(45, (host.clientWidth || innerWidth) / (host.clientHeight || innerHeight), .1, 50); camera.position.set(0, .1, 4);
  group = new THREE.Group(); scene.add(group);
  points = new THREE.Points(new THREE.BufferGeometry(), new THREE.ShaderMaterial({ vertexShader: VERTEX_SHADER, fragmentShader: FRAGMENT_SHADER, uniforms: uni, transparent: true, depthWrite: false }));
  points.frustumCulled = false; group.add(points);

  function build(count) {
    shapes = GEN.map(function (g) { return g(count); });
    var geo = new THREE.BufferGeometry();
    pa = new THREE.BufferAttribute(new Float32Array(shapes[0].positions), 3); pt = new THREE.BufferAttribute(new Float32Array(shapes[1].positions), 3);
    ca = new THREE.BufferAttribute(new Float32Array(shapes[0].colors), 3); ct = new THREE.BufferAttribute(new Float32Array(shapes[1].colors), 3);
    [pa, pt, ca, ct].forEach(function (a) { a.setUsage(THREE.DynamicDrawUsage); });
    geo.setAttribute('position', pa); geo.setAttribute('aTargetPosition', pt); geo.setAttribute('color', ca); geo.setAttribute('aTargetColor', ct);
    geo.setAttribute('aScale', new THREE.BufferAttribute(new Float32Array(shapes[0].scales), 1));
    var old = points.geometry; points.geometry = geo; old.dispose(); aS = bS = -1;
  }
  build(P.count);

  /* ---------- mise en page : la forme se place dans l'espace libre à côté du texte, sans jamais le toucher ---------- */
  var BD = [], LAY = [];
  function bounds(sh) {
    var p = sh.positions, x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (var i = 0; i < p.length; i += 3) { if (p[i] < x0) x0 = p[i]; if (p[i] > x1) x1 = p[i]; if (p[i + 1] < y0) y0 = p[i + 1]; if (p[i + 1] > y1) y1 = p[i + 1]; }
    return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, hw: Math.max((x1 - x0) / 2, .2), hh: Math.max((y1 - y0) / 2, .2) };
  }
  function layout() {
    var W = host.clientWidth || innerWidth, H = host.clientHeight || innerHeight, mob = mobile();
    var ppu = H / (2 * 4 * Math.tan(22.5 * Math.PI / 180)); // pixels par unité 3D (caméra à 4 de distance, champ 45°)
    BD = shapes.map(bounds);
    LAY = shapes.map(function (sh, i) {
      var bd = BD[i], x0, x1, y0, y1;
      if (mob) { x0 = W * .06; x1 = W * .94; y0 = 80; y1 = H * .46; }
      else {
        var r = chs[i].querySelector('.sty-txt').getBoundingClientRect(), right = chs[i].classList.contains('r');
        y0 = 96; y1 = H - 72;
        if (right) { x0 = 110; x1 = r.left - 64; } else { x0 = r.right + 64; x1 = W - 40; }
      }
      var bw = Math.max(x1 - x0, 180), bh = Math.max(y1 - y0, 180);
      var sc = Math.min(bw / (2 * bd.hw * ppu * 1.16), bh / (2 * bd.hh * ppu * 1.16), 1.3);
      return { s: sc, x: ((x0 + x1) / 2 - W / 2) / ppu - bd.cx * sc, y: -((y0 + y1) / 2 - H / 2) / ppu - bd.cy * sc };
    });
  }
  layout();
  addEventListener('load', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

  /* ---------- souris : répulsion ---------- */
  var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -.3), ray = new THREE.Raycaster(), hit = new THREE.Vector3(), ndc = new THREE.Vector2(-999, -999);
  var tgt = new THREE.Vector3(0, 0, .4), cur = new THREE.Vector3(0, 0, .4), mT = 0, mA = 0, lastChime = 0, smx = 0, smy = 0, vs = false;
  function onMove(e) {
    if (!vs || reduce) return;
    var t = (e.touches && e.touches[0]) || e, r = host.getBoundingClientRect();
    ndc.set(((t.clientX - r.left) / r.width) * 2 - 1, -(((t.clientY - r.top) / r.height) * 2 - 1)); mT = 1;
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectPlane(plane, hit)) tgt.copy(hit);
  }
  addEventListener('mousemove', onMove, { passive: true }); addEventListener('touchmove', onMove, { passive: true });
  document.addEventListener('mouseleave', function () { mT = 0; });
  addEventListener('resize', function () { var w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); layout(); onScroll(); });

  /* ---------- boucle ---------- */
  var tf = 0, cf = 0, act = -1, cRY = 0, cRX = 0, cPX = 0, cPY = 0, cS = 1, snap = true, last = performance.now(), running = false;
  function onScroll() { var r = sec.getBoundingClientRect(); tf = clamp(-r.top / (stage.offsetHeight || innerHeight), 0, n - 1); }
  addEventListener('scroll', onScroll, { passive: true });
  var damp = THREE.MathUtils.damp;
  function setBg() { bgt.textContent = P.bg === 'AUTO' ? (chs[Math.max(act, 0)].getAttribute('data-bg') || 'UIPACT') : P.bg; }
  function tick() {
    if (!vs) { running = false; return; }
    var now = performance.now(), dt = Math.min((now - last) / 1000, .1); last = now;
    uni.uTime.value += dt; cf += (tf - cf) * (reduce ? 1 : .14);
    var a = Math.min(n - 2, Math.floor(cf)), b = a + 1, fr = clamp(cf - a, 0, 1), m = 0;
    if (fr >= .78) m = 1; else if (fr > .22) { var k = (fr - .22) / .56; m = k * k * (3 - 2 * k); }
    if (a !== aS || b !== bS) {
      aS = a; bS = b;
      pa.copyArray(shapes[a].positions); pa.needsUpdate = true; pt.copyArray(shapes[b].positions); pt.needsUpdate = true;
      ca.copyArray(shapes[a].colors); ca.needsUpdate = true; ct.copyArray(shapes[b].colors); ct.needsUpdate = true;
    }
    uni.uMorphProgress.value = m;
    cur.lerp(tgt, .14); uni.uMouse3D.value.copy(cur); mA += (mT - mA) * .1; uni.uMouseActive.value = mA;
    var A = CFG[a], B = CFG[b], tw = Math.sin(m * Math.PI) * .35;
    var mty = ndc.x !== -999 ? ndc.x * .2 : 0, mtx = ndc.y !== -999 ? -ndc.y * .14 : 0;
    cRY = damp(cRY, A.ry * (1 - m) + B.ry * m + tw + mty, 7, dt); cRX = damp(cRX, A.rx * (1 - m) + B.rx * m + mtx, 7, dt);
    var LA = LAY[a] || { s: 1, x: 0, y: 0 }, LB = LAY[b] || LA, tx = LA.x * (1 - m) + LB.x * m, ty = LA.y * (1 - m) + LB.y * m, ts = LA.s * (1 - m) + LB.s * m;
    if (snap) { cPX = tx; cPY = ty; cS = ts; snap = false; }
    cPX = damp(cPX, tx, 6, dt); cPY = damp(cPY, ty, 6, dt); cS = damp(cS, ts, 6, dt);
    group.rotation.y = cRY; group.rotation.x = cRX; group.position.set(cPX, cPY, 0); group.scale.setScalar(cS);
    renderer.render(scene, camera);
    // chapitre actif : index, réglages, texte de fond
    var ac2 = clamp(Math.round(cf), 0, n - 1);
    if (ac2 !== act) { act = ac2; idxBtns.forEach(function (x, j) { x.classList.toggle('on', j === act); }); if (P.bg === 'AUTO') setBg(); }
    smx += (((ndc.x === -999 ? 0 : ndc.x)) - smx) * .06; smy += (((ndc.y === -999 ? 0 : ndc.y)) - smy) * .06;
    bgw.style.transform = 'translate3d(' + (-smx * 24).toFixed(1) + 'px,' + (smy * 18).toFixed(1) + 'px,0)';
    requestAnimationFrame(tick);
  }

  /* ---------- visibilité : on ne calcule que lorsque la section est à l'écran ---------- */
  new IntersectionObserver(function (es) {
    vs = es[0].isIntersecting;
    if (vs) { onScroll(); last = performance.now(); if (!running) { running = true; requestAnimationFrame(tick); } }
  }, { rootMargin: '80px' }).observe(sec);
  onScroll(); cf = tf; setBg();
})();
