(function () {
    var root = document.documentElement;
    var STORAGE_KEY = 'uipact-theme';

    // Thème sombre par défaut (nouvelle charte), sauf choix explicite de l'utilisateur
    function getPreferredTheme() {
        var saved = localStorage.getItem(STORAGE_KEY);
        return (saved === 'light' || saved === 'dark') ? saved : 'dark';
    }
    var initial = getPreferredTheme();
    root.setAttribute('data-theme', initial);

    document.addEventListener('DOMContentLoaded', function () {
        var body = document.body;
        body.classList.toggle('dark-mode', root.getAttribute('data-theme') === 'dark');

        var btn = document.getElementById('themeToggle');
        if (btn) btn.addEventListener('click', function () {
            var cur = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', cur);
            body.classList.toggle('dark-mode', cur === 'dark');
            localStorage.setItem(STORAGE_KEY, cur);
        });

        // Ombre de la navigation au scroll
        var header = document.querySelector('header');
        window.addEventListener('scroll', function () {
            if (header) header.classList.toggle('scrolled', window.scrollY > 100);
        }, { passive: true });

        // Apparition au scroll
        var els = document.querySelectorAll('.section-title,.portfolio-item,.service-card,.about-content,.contact-form,.value-item,.project-card,.tarif-item,.legal-content');
        if ('IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (es) {
                es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
            }, { threshold: .1 });
            els.forEach(function (e) { e.classList.add('rv'); io.observe(e); });
        }

        // Écran de chargement : accueil uniquement, une fois par session
        if (document.getElementById('hero') && !sessionStorage.getItem('uipact-loaded')) {
            sessionStorage.setItem('uipact-loaded', '1');
            var W = ['Design', 'Create', 'Inspire'], i = 0;
            var ld = document.createElement('div');
            ld.id = 'loader';
            ld.innerHTML = '<div class="lt">Portfolio</div><div class="lw">Design</div><div class="lc">000</div><div class="lb"><i></i></div>';
            body.appendChild(ld);
            var lw = ld.querySelector('.lw'), lc = ld.querySelector('.lc'), lb = ld.querySelector('.lb i');
            var wi = setInterval(function () { i = (i + 1) % 3; lw.textContent = W[i]; }, 900);
            var t0 = performance.now(), D = 2700;
            (function f(n) {
                var p = Math.min((n - t0) / D, 1);
                lc.textContent = String(Math.round(p * 100)).padStart(3, '0');
                lb.style.transform = 'scaleX(' + p + ')';
                if (p < 1) requestAnimationFrame(f);
                else setTimeout(function () { clearInterval(wi); ld.style.opacity = 0; setTimeout(function () { ld.remove(); }, 600); }, 400);
            })(t0);
        }
    });
})();


/* ===== V3 : scène 3D plein écran, transitions de page, animations ===== */
(function () {
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var $ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
    document.addEventListener('DOMContentLoaded', function () {
        var body = document.body, loaderOn = !!document.getElementById('loader');

        // Transition de page (rideau doré)
        var pt = document.createElement('div'); pt.id = 'pt'; body.appendChild(pt);
        function lift() { requestAnimationFrame(function () { requestAnimationFrame(function () { pt.className = 'out'; }); }); }
        lift();
        addEventListener('pageshow', function (e) { if (e.persisted) lift(); });
        document.addEventListener('click', function (e) {
            var a = e.target.closest && e.target.closest('a[href]');
            if (!a || a.target === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey) return;
            var h = a.getAttribute('href');
            if (!h || h.charAt(0) === '#' || a.origin !== location.origin) return;
            if (a.pathname === location.pathname && a.hash) return;
            e.preventDefault(); pt.className = 'in';
            setTimeout(function () { location.href = a.href; }, 650);
        });

        // Scène 3D fixe sur TOUTE la page (cubes + logo), réagit souris + scroll
        if (!reduce) {
            var sc = document.createElement('div'); sc.id = 'scene3d';
            var rig = document.createElement('div'); rig.className = 'rig'; sc.appendChild(rig);
            body.insertBefore(sc, body.firstChild);
            var defs = [[6,12,90,26,.5,-80],[84,8,60,20,.9,60],[72,55,130,34,.35,-160],[10,62,70,22,.7,80],[45,30,40,16,1.1,140],
                        [92,80,55,18,.6,-40],[28,92,100,30,.45,-120],[58,75,45,15,1,100],[18,35,35,14,1.2,160],[80,30,80,28,.55,-200]];
            var ps = defs.map(function (d) {
                var p = document.createElement('div'); p.className = 'p';
                var c = document.createElement('div'); c.className = 'cube'; c.style.cssText = '--s:' + d[2] + 'px;--d:' + d[3] + 's';
                for (var k = 0; k < 6; k++) { var f = document.createElement('div'); f.className = 'f'; c.appendChild(f); }
                p.appendChild(c); rig.appendChild(p);
                return { p: p, x: d[0], y: d[1], s: d[2], sp: d[4], z: d[5] };
            });
            var lg = document.createElement('img'); lg.src = 'logo.png'; lg.alt = ''; lg.className = 'bglogo'; rig.appendChild(lg);
            var mx = 0, my = 0, cx = 0, cy = 0, sy = 0, ty = scrollY;
            addEventListener('mousemove', function (e) { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
            addEventListener('scroll', function () { ty = scrollY; }, { passive: true });
            (function loop() {
                sy += (ty - sy) * .08; cx += (mx - cx) * .06; cy += (my - cy) * .06;
                var W = innerWidth, H = innerHeight;
                ps.forEach(function (o) {
                    var span = H + o.s * 2, y = (((o.y / 100 * H - sy * o.sp) % span) + span) % span - o.s;
                    o.p.style.transform = 'translate3d(' + (o.x / 100 * W + cx * o.z * .6) + 'px,' + (y + cy * o.z * .6) + 'px,' + o.z + 'px)';
                });
                rig.style.transform = 'rotateY(' + (cx * 10) + 'deg) rotateX(' + (-cy * 8) + 'deg)';
                lg.style.transform = 'translate(-50%,-50%) translateZ(-300px) rotateY(' + (sy * .06) + 'deg) rotateX(' + (cy * 20) + 'deg)';
                requestAnimationFrame(loop);
            })();
        }

        // Titres : mots qui apparaissent un à un (flou + montée)
        function split(el) {
            var i = 0;
            el.innerHTML = el.textContent.trim().split(/\s+/).map(function (w) { return '<span class="w" style="--i:' + (i++) + '">' + w + '</span>'; }).join(' ');
        }
        var io2 = new IntersectionObserver(function (es) {
            es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('on'); io2.unobserve(x.target); } });
        }, { threshold: .2 });
        $('.section-title,.page-title,.portfolio-header h1,.contact-title,.service-title-page,.section-title-impact').forEach(function (e) {
            if (e.children.length) return;
            split(e); e.classList.add('sw'); e.classList.remove('rv'); io2.observe(e);
        });

        // Héros de l'accueil : entrée type « name-reveal / blur-in » + rôles qui défilent
        var hc = document.querySelector('.hero-content');
        if (hc) {
            var ht = hc.querySelector('.hero-title');
            if (ht && !ht.children.length) { split(ht); ht.classList.add('sw'); }
            var st = hc.querySelector('.hero-subtitle');
            if (st) {
                var rl = document.createElement('p'); rl.className = 'role-line';
                rl.innerHTML = 'Un <b id="rl">Graphiste</b> passionné par l\'art et la technique.'; st.after(rl);
                var R = ['Graphiste', 'Web designer', 'Créatif', 'Stratège'], ri = 0;
                setInterval(function () { ri = (ri + 1) % 4; var o = document.getElementById('rl'), n = o.cloneNode(); n.textContent = R[ri]; o.replaceWith(n); }, 2000);
            }
            Array.prototype.forEach.call(hc.children, function (c, i) {
                if (c !== ht) { c.classList.add('bi'); c.style.setProperty('--i', i + 5); }
            });
            setTimeout(function () { hc.classList.add('go'); if (ht) ht.classList.add('on'); }, loaderOn ? 3400 : 900);
        }

        // Apparition décalée des cartes
        var seen = new Map();
        $('.rv').forEach(function (e) {
            var i = seen.get(e.parentNode) || 0; seen.set(e.parentNode, i + 1);
            e.style.transitionDelay = Math.min(i, 6) * 90 + 'ms';
            e.addEventListener('transitionend', function h(ev) { if (ev.propertyName === 'opacity') { e.style.transitionDelay = ''; e.removeEventListener('transitionend', h); } });
        });

        // Traînée de logos sous le curseur (hero + en-têtes de page)
        if (!reduce) $('#hero,.page-header,.portfolio-header').forEach(function (h) {
            var last = 0;
            h.addEventListener('mousemove', function (e) {
                var n = performance.now(); if (n - last < 80) return; last = n;
                var r = h.getBoundingClientRect(), im = document.createElement('img');
                im.src = 'logo.png'; im.className = 'trail'; im.style.left = (e.clientX - r.left) + 'px'; im.style.top = (e.clientY - r.top) + 'px';
                h.appendChild(im);
                var rot = Math.random() * 20 - 10;
                im.animate([{ opacity: .9, transform: 'translate(-50%,-50%) rotate(' + rot + 'deg) scale(1)' }, { opacity: 0, transform: 'translate(-50%,-50%) rotate(' + rot + 'deg) scale(.6)' }],
                    { duration: 1000, easing: 'ease-out' }).onfinish = function () { im.remove(); };
            });
        });

        // Bandeau géant avant le footer
        var ft = document.querySelector('footer');
        if (ft) { var mb = document.createElement('div'); mb.className = 'mq-band'; var s = 'UIPACT • VISUAL CONCEPTION • WEB EXPERIENCE • '; mb.innerHTML = '<div>' + Array(9).join(s) + '</div>'; ft.parentNode.insertBefore(mb, ft); }

        // Portfolio : survol « Voir — Titre » + réanimation des cartes au filtrage
        var cards = $('.project-card');
        cards.forEach(function (c) {
            var t = c.querySelector('.project-title'), pv = document.createElement('div');
            pv.className = 'pv'; pv.innerHTML = '<b>Voir — <i>' + (t ? t.textContent.trim() : '') + '</i></b>'; c.appendChild(pv);
            c._v = c.offsetParent !== null;
        });
        var mo = new MutationObserver(function (ms) {
            ms.forEach(function (m) {
                var c = m.target, v = getComputedStyle(c).display !== 'none';
                if (v && c._v === false) c.animate([{ opacity: 0, transform: 'scale(.85) translateY(30px)' }, { opacity: 1, transform: 'none' }], { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)' });
                c._v = v;
            });
        });
        cards.forEach(function (c) { mo.observe(c, { attributes: true, attributeFilter: ['style', 'class'] }); });

        // Nouveau bouton flottant « Démarrer un projet » (magnétique)
        if (!/contact\.html/.test(location.pathname)) {
            var cta = document.createElement('a'); cta.className = 'cta-float';
            cta.href = document.querySelector('section#contact') ? '#contact' : 'contact.html';
            cta.innerHTML = '<span class="t">Démarrer un projet</span><span class="ar">↗</span>'; body.appendChild(cta);
            var ct = document.getElementById('contact');
            var vis = function () {
                var hide = false; if (ct) { var r = ct.getBoundingClientRect(); hide = r.top < innerHeight * .8 && r.bottom > 0; }
                cta.classList.toggle('show', scrollY > 240 && !hide);
            };
            addEventListener('scroll', vis, { passive: true }); vis();
            cta.addEventListener('mousemove', function (e) { var r = cta.getBoundingClientRect(); cta.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .15) + 'px,' + ((e.clientY - r.top - r.height / 2) * .25) + 'px)'; });
            cta.addEventListener('mouseleave', function () { cta.style.transform = ''; });
        }
    });
})();
