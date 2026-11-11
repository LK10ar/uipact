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
  var P = { rep: 3.8, rad: 1.8, ns: .08, nsp: .9, count: mobile() ? 5000 : 8500, size: 1.1, audio: false, bg: 'UIPACT' };

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
  var CFG = [{ ry: .12, rx: .28, px: 1.1, s: 1 }, { ry: -.22, rx: .1, px: -1.1, s: 1 }, { ry: .35, rx: .18, px: 1.1, s: 1 }, { ry: -.16, rx: .05, px: -1.1, s: 1 },
    { ry: .22, rx: .08, px: 1.1, s: 1 }, { ry: .05, rx: .04, px: -1.15, s: .78 }, { ry: -.14, rx: .06, px: 1.1, s: .92 }];
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

  /* ---------- souris : répulsion ---------- */
  var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -.3), ray = new THREE.Raycaster(), hit = new THREE.Vector3(), ndc = new THREE.Vector2(-999, -999);
  var tgt = new THREE.Vector3(0, 0, .4), cur = new THREE.Vector3(0, 0, .4), mT = 0, mA = 0, lastChime = 0, smx = 0, smy = 0, vs = false;
  function onMove(e) {
    if (!vs || reduce) return;
    var t = (e.touches && e.touches[0]) || e, r = host.getBoundingClientRect();
    ndc.set(((t.clientX - r.left) / r.width) * 2 - 1, -(((t.clientY - r.top) / r.height) * 2 - 1)); mT = 1;
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectPlane(plane, hit)) { tgt.copy(hit); if (P.audio && performance.now() - lastChime > 260) { chime(.45); lastChime = performance.now(); } }
  }
  addEventListener('mousemove', onMove, { passive: true }); addEventListener('touchmove', onMove, { passive: true });
  document.addEventListener('mouseleave', function () { mT = 0; });
  addEventListener('resize', function () { var w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); onScroll(); });

  /* ---------- audio procédural (optionnel) ---------- */
  var ac = null, mg = null, d1 = null, d2 = null;
  function audioOn() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      if (!ac) { ac = new AC(); mg = ac.createGain(); mg.gain.value = .08; mg.connect(ac.destination); }
      if (ac.state === 'suspended') ac.resume();
      var f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 320; f.Q.value = 3; f.connect(mg);
      d1 = ac.createOscillator(); d1.type = 'sine'; d1.frequency.value = 108; d2 = ac.createOscillator(); d2.type = 'triangle'; d2.frequency.value = 162;
      d1.connect(f); d2.connect(f); d1.start(); d2.start();
    } catch (e) { P.audio = false; }
  }
  function audioOff() { try { if (d1) { d1.stop(); d1.disconnect(); d1 = null; } if (d2) { d2.stop(); d2.disconnect(); d2 = null; } } catch (e) {} }
  function chime(k) {
    if (!ac || !mg || !d1) return;
    try {
      var t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(), f0 = 432 * (1 + k * .5);
      o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * 1.5, t + .35);
      g.gain.setValueAtTime(.01 + k * .04, t); g.gain.exponentialRampToValueAtTime(.0001, t + .5);
      o.connect(g); g.connect(mg); o.start(t); o.stop(t + .55);
    } catch (e) {}
  }

  /* ---------- boucle ---------- */
  var tf = 0, cf = 0, act = -1, cRY = 0, cRX = 0, cPX = 1.1, cPY = 0, cS = 1, last = performance.now(), running = false;
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
    var A = CFG[a], B = CFG[b], tw = Math.sin(m * Math.PI) * .35, mob = mobile();
    var mty = ndc.x !== -999 ? ndc.x * .2 : 0, mtx = ndc.y !== -999 ? -ndc.y * .14 : 0;
    cRY = damp(cRY, A.ry * (1 - m) + B.ry * m + tw + mty, 7, dt); cRX = damp(cRX, A.rx * (1 - m) + B.rx * m + mtx, 7, dt);
    cPX = damp(cPX, mob ? 0 : A.px * (1 - m) + B.px * m, 6, dt); cPY = damp(cPY, mob ? .62 : 0, 6, dt);
    cS = damp(cS, (A.s * (1 - m) + B.s * m) * (mob ? .62 : .92), 6, dt);
    group.rotation.y = cRY; group.rotation.x = cRX; group.position.set(cPX, cPY, 0); group.scale.setScalar(cS);
    renderer.render(scene, camera);
    // chapitre actif : index, réglages, texte de fond
    var ac2 = clamp(Math.round(cf), 0, n - 1);
    if (ac2 !== act) { act = ac2; idxBtns.forEach(function (x, j) { x.classList.toggle('on', j === act); }); dk.querySelectorAll('.sty-sh').forEach(function (x, j) { x.classList.toggle('on', j === act); }); dk.querySelector('[data-act]').textContent = ('0' + (act + 1)).slice(-2) + ' // ' + (chs[act].getAttribute('data-bg') || ''); if (P.bg === 'AUTO') setBg(); }
    smx += (((ndc.x === -999 ? 0 : ndc.x)) - smx) * .06; smy += (((ndc.y === -999 ? 0 : ndc.y)) - smy) * .06;
    bgw.style.transform = 'translate3d(' + (-smx * 24).toFixed(1) + 'px,' + (smy * 18).toFixed(1) + 'px,0)';
    requestAnimationFrame(tick);
  }

  /* ---------- panneau de réglages ---------- */
  var I = {
    sp: '<svg viewBox="0 0 24 24"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/></svg>',
    sl: '<svg viewBox="0 0 24 24"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
    ty: '<svg viewBox="0 0 24 24"><path d="M5 6V4h14v2M12 4v16M9 20h6"/></svg>',
    vo: '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9zM17 9a4 4 0 010 6M19.5 6.5a8 8 0 010 11"/></svg>',
    vx: '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9zM17 9l5 6M22 9l-5 6"/></svg>',
    rt: '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8M3 3v5h5"/></svg>',
    wv: '<svg viewBox="0 0 24 24"><path d="M2 8c2.5-3 5-3 7.5 0s5 3 7.5 0 3-2 5-1M2 14c2.5-3 5-3 7.5 0s5 3 7.5 0 3-2 5-1M2 20c2.5-3 5-3 7.5 0s5 3 7.5 0 3-2 5-1"/></svg>'
  };
  function rng(label, key, min, max, step, fmt) {
    return '<div class="sty-rg"><div class="sty-rl"><span>' + label + '</span><b data-v="' + key + '"></b></div><input type="range" data-k="' + key + '" min="' + min + '" max="' + max + '" step="' + step + '"></div>';
  }
  var FMT = {
    rep: function (v) { return v.toFixed(1); }, rad: function (v) { return v.toFixed(1) + ' m'; }, ns: function (v) { return Math.round(v * 100) + ' %'; },
    nsp: function (v) { return v.toFixed(1) + ' x'; }, count: function (v) { return v.toLocaleString('fr-FR'); }, size: function (v) { return v.toFixed(2) + ' px'; }
  };
  var NAMES = ['Cadrage', 'Réseau', 'Feuilles', 'Fenêtre', 'Mobile', 'Cadenas', 'Croissance'];
  var BGS = ['UIPACT', 'AUTO', 'DESIGN', 'WEB', 'MARQUE', 'PRINT'];
  var dk = document.createElement('div'); dk.className = 'sty-dock'; dk.setAttribute('data-open', '0'); dk.setAttribute('role', 'region'); dk.setAttribute('aria-label', 'Réglages des particules 3D');
  dk.innerHTML =
    '<div class="sty-dt"><button type="button" class="sty-tg">' + I.sl + '<span>RÉGLAGES 3D</span></button></div>' +
    '<div class="sty-db"><div class="sty-dh"><div class="sty-tabs">' +
    '<button type="button" class="on" data-t="shapes">' + I.sp + '<span>7 Formes 3D</span></button><button type="button" data-t="physics">' + I.sl + '<span>Physique &amp; Bruit</span></button><button type="button" data-t="text">' + I.ty + '<span>Texte Fond</span></button></div>' +
    '<div class="sty-act"><button type="button" class="sty-au">' + I.vx + '<span>AUDIO OFF</span></button><button type="button" class="sty-rs">' + I.rt + '<span>DÉBUT</span></button></div></div>' +
    '<div class="sty-pn on" data-p="shapes"><div class="sty-ph"><span>Naviguer directement vers une forme</span><b data-act></b></div><div class="sty-sg">' +
    NAMES.map(function (nm, i) { return '<button type="button" class="sty-sh" data-i="' + i + '"><i>' + ('0' + (i + 1)).slice(-2) + '</i>' + nm + '</button>'; }).join('') + '</div></div>' +
    '<div class="sty-pn" data-p="physics"><div class="sty-cd"><div class="sty-ct">' + I.wv + '<span>Répulsion au survol souris</span></div>' + rng('Force de répulsion', 'rep', 1, 6.5, .2) + rng('Rayon d\u2019action', 'rad', .8, 3.2, .1) + '</div>' +
    '<div class="sty-cd"><div class="sty-ct">' + I.sp + '<span>Mouvement perpétuel (bruit 3D)</span></div>' + rng('Amplitude du souffle', 'ns', .04, .28, .02) + rng('Vitesse de flottement', 'nsp', .3, 2.5, .1) + '</div>' +
    '<div class="sty-cd"><div class="sty-ct">' + I.sp + '<span>Lisibilité des formes</span></div><div class="sty-lb"><span>Particules (netteté)</span><b data-v="count"></b></div><div class="sty-pr">' +
    '<button type="button" data-c="5000">5k Épuré</button><button type="button" data-c="8500">8.5k Idéal</button><button type="button" data-c="14000">14k Riche</button></div>' +
    '<input type="range" data-k="count" min="3000" max="18000" step="500">' + rng('Finesse de grain (taille)', 'size', .6, 2, .05) + '</div></div>' +
    '<div class="sty-pn" data-p="text"><div class="sty-ph"><span>Texte géant en arrière-plan</span></div><div class="sty-sg sty-tx">' +
    BGS.map(function (t) { return '<button type="button" data-b="' + t + '">' + t + '</button>'; }).join('') + '</div><input type="text" class="sty-in" maxlength="14" placeholder="Votre texte…" aria-label="Texte de fond"></div></div>';
  document.body.appendChild(dk);

  function applyP() {
    uni.uRepulsionStrength.value = P.rep; uni.uRepulsionRadius.value = P.rad; uni.uNoiseStrength.value = P.ns; uni.uNoiseSpeed.value = reduce ? 0 : P.nsp; uni.uPointSize.value = P.size;
    dk.querySelectorAll('input[type=range]').forEach(function (r) { var k = r.getAttribute('data-k'), mn = +r.min, mx = +r.max; r.value = P[k]; r.style.setProperty('--v', ((P[k] - mn) / (mx - mn) * 100) + '%'); });
    dk.querySelectorAll('[data-v]').forEach(function (e) { var k = e.getAttribute('data-v'); e.textContent = FMT[k](P[k]); });
    dk.querySelectorAll('[data-c]').forEach(function (b) { b.classList.toggle('on', +b.getAttribute('data-c') === P.count); });
    dk.querySelectorAll('[data-b]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-b') === P.bg); });
    setBg();
  }
  dk.querySelectorAll('input[type=range]').forEach(function (r) {
    var k = r.getAttribute('data-k');
    r.addEventListener('input', function () { P[k] = parseFloat(r.value); if (k !== 'count') applyP(); else { P.count = parseInt(r.value, 10); applyP(); } });
    if (k === 'count') r.addEventListener('change', function () { build(P.count); });
  });
  dk.querySelectorAll('[data-c]').forEach(function (b) { b.onclick = function () { P.count = +b.getAttribute('data-c'); build(P.count); applyP(); }; });
  dk.querySelectorAll('[data-b]').forEach(function (b) { b.onclick = function () { P.bg = b.getAttribute('data-b'); applyP(); }; });
  dk.querySelector('.sty-in').addEventListener('input', function (e) { P.bg = e.target.value.toUpperCase() || 'UIPACT'; applyP(); });
  dk.querySelectorAll('.sty-sh').forEach(function (b) { b.onclick = function () { go(+b.getAttribute('data-i')); }; });
  dk.querySelectorAll('.sty-tabs button').forEach(function (b) {
    b.onclick = function () {
      var t = b.getAttribute('data-t');
      dk.querySelectorAll('.sty-tabs button').forEach(function (x) { x.classList.toggle('on', x === b); });
      dk.querySelectorAll('.sty-pn').forEach(function (p) { p.classList.toggle('on', p.getAttribute('data-p') === t); });
    };
  });
  dk.querySelector('.sty-tg').onclick = function () {
    var o = dk.getAttribute('data-open') === '1'; dk.setAttribute('data-open', o ? '0' : '1');
    dk.querySelector('.sty-tg span').textContent = o ? 'RÉGLAGES 3D' : 'MASQUER';
  };
  function setAudio(on) {
    var b = dk.querySelector('.sty-au'); P.audio = on; if (on) audioOn(); else audioOff();
    b.classList.toggle('on', on); b.innerHTML = (on ? I.vo : I.vx) + '<span>' + (on ? 'AUDIO ON' : 'AUDIO OFF') + '</span>';
  }
  dk.querySelector('.sty-au').onclick = function () { setAudio(!P.audio); };
  dk.querySelector('.sty-rs').onclick = function () { go(0); };
  applyP();

  /* ---------- visibilité : on ne calcule que lorsque la section est à l'écran ---------- */
  new IntersectionObserver(function (es) {
    vs = es[0].isIntersecting; dk.classList.toggle('show', vs);
    if (vs) { onScroll(); last = performance.now(); if (!running) { running = true; requestAnimationFrame(tick); } } else if (P.audio) { setAudio(false); }
  }, { rootMargin: '80px' }).observe(sec);
  onScroll(); cf = tf; setBg();
})();
