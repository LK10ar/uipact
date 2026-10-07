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
        if (false) {
            var sc = document.createElement('div'); sc.id = 'scene3d';
            var rig = document.createElement('div'); rig.className = 'rig'; sc.appendChild(rig);
            body.insertBefore(sc, body.firstChild);
            var defs = [[6,12,90,26,.5,-80],[84,8,60,20,.9,60],[72,55,130,34,.35,-160],[10,62,70,22,.7,80],[45,30,40,16,1.1,140],
                        [92,80,55,18,.6,-40],[28,92,100,30,.45,-120],[58,75,45,15,1,100],[18,35,35,14,1.2,160],[80,30,80,28,.55,-200]];
            var ps = (innerWidth < 700 ? defs.slice(0, 5) : defs).map(function (d) {
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
        if (false) $('#hero,.page-header,.portfolio-header').forEach(function (h) {
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

/* ===== V4 : carrousel 3D, sections landing, contact ===== */
(function () {
    document.addEventListener('DOMContentLoaded', function () {
        var $ = function (s) { return document.querySelector(s); };
        var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
        function html(t) { var d = document.createElement('div'); d.innerHTML = t.trim(); return d.firstChild; }

        // ---- Carrousel 3D (accueil + portfolio) ----
        var D = [['img/chene.png','Le Chêne Doré','Webdesign'],['img/tout.png','Novaflow Advisory','Branding'],['img/sport.png','Application Mobile','UX / UI Design'],
                 ['img/japan.png','Japan and Friends','Identité visuelle'],['img/foodweb.png','Food Burger','Webdesign'],['img/alpharun.png','AlphaRun','Mockup UI'],
                 ['img/flyers-alpharun.png','Flyers AlphaRun','Print'],['img/carte.png','Cartes de visite','Print']];
        var anchor = $('#portfolio') || (document.querySelector('.portfolio-header') && document.querySelector('.portfolio-header').nextElementSibling);
        if (false) {
            var sec = html('<section class="c3d" id="carousel3d"><div class="eb">Réalisations</div><h2 class="lp-t">Le portfolio en <i>3D</i></h2><div class="c3d-stage"><div class="c3d-ring"></div></div>' +
                '<div class="c3d-cap"><b></b><span></span></div><div class="c3d-nav"><button aria-label="Précédent">‹</button><button aria-label="Suivant">›</button></div></section>');
            anchor.parentNode.insertBefore(sec, $('#portfolio') ? anchor : anchor);
            var ring = sec.querySelector('.c3d-ring'), stage = sec.querySelector('.c3d-stage'), cap = sec.querySelector('.c3d-cap'), N = D.length, step = 360 / N, cards = [], R = 0;
            D.forEach(function (d) {
                var a = document.createElement('a'); a.href = 'portfolio.html'; a.className = 'c3d-card'; a.style.backgroundImage = "url('" + d[0] + "')"; a.draggable = false;
                ring.appendChild(a); cards.push(a);
            });
            function layout() {
                var w = innerWidth < 640 ? 170 : innerWidth < 1024 ? 230 : 290, h = Math.round(w * .68);
                R = Math.round((w / 2) / Math.tan(Math.PI / N) * 1.12);
                cards.forEach(function (c, i) {
                    c.style.cssText += ';width:' + w + 'px;height:' + h + 'px;margin:' + (-h / 2) + 'px 0 0 ' + (-w / 2) + 'px;transform:rotateY(' + (i * step) + 'deg) translateZ(' + R + 'px)';
                });
            }
            layout(); addEventListener('resize', layout);
            var ang = 0, mom = 0, drag = false, lx = 0, moved = 0, snap = null, hover = false, ci = -1;
            stage.addEventListener('pointerdown', function (e) { drag = true; lx = e.clientX; moved = 0; snap = null; });
            addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; moved += Math.abs(dx); mom = dx * .3; ang += mom; });
            addEventListener('pointerup', function () { drag = false; });
            stage.addEventListener('mouseenter', function () { hover = true; }); stage.addEventListener('mouseleave', function () { hover = false; });
            stage.addEventListener('click', function (e) { if (moved > 6) e.preventDefault(); }, true);
            var b = sec.querySelectorAll('.c3d-nav button');
            b[0].onclick = function () { snap = (Math.round(ang / step) + 1) * step; };
            b[1].onclick = function () { snap = (Math.round(ang / step) - 1) * step; };
            (function loop() {
                if (!drag) { if (snap !== null) { ang += (snap - ang) * .1; if (Math.abs(snap - ang) < .05) snap = null; } else { ang += mom + (hover || reduce ? 0 : .12); mom *= .94; } }
                ring.style.transform = 'translateZ(-' + R + 'px) rotateX(-8deg) rotateY(' + ang + 'deg)';
                cards.forEach(function (c, i) { var f = Math.cos((i * step + ang) * Math.PI / 180); c.style.opacity = (.3 + .7 * (f + 1) / 2).toFixed(2); });
                var idx = ((Math.round(-ang / step) % N) + N) % N;
                if (idx !== ci) { ci = idx; cap.querySelector('b').textContent = D[idx][1]; cap.querySelector('span').textContent = D[idx][2]; cap.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: 'ease-out' }); }
                requestAnimationFrame(loop);
            })();
        }

        // ---- Sections landing (accueil) ----
        if ($('#hero') && $('#services')) {
            var proc = html('<section class="lp" id="process"><div class="eb">Méthode</div><h2 class="lp-t">Trois étapes, <i>un résultat</i></h2><div class="lp-g">' +
                '<div class="glass lp-c"><div class="n">01</div><h3>Stratégie</h3><p>Comprendre votre projet, vos objectifs et votre cible avant de dessiner la moindre ligne.</p></div>' +
                '<div class="glass lp-c"><div class="n">02</div><h3>Créativité</h3><p>Concevoir une identité et des interfaces qui vous démarquent et racontent votre histoire.</p></div>' +
                '<div class="glass lp-c"><div class="n">03</div><h3>Précision</h3><p>Livrer des fichiers et des pages soignés, prêts à être utilisés partout.</p></div></div></section>');
            
            var cap5 = [['creation-graphique.html','Création graphique','Logo · Identité · Supports'],['creation-print.html','Création print','Cartes · Flyers · Affiches'],['sites-web.html','Sites internet','Vitrine · One-page'],
                        ['identite-visuelle.html','Identité visuelle','Charte · Rédaction'],['ux-ui.html','UX / UI design','Maquettes · Prototypes']];
            var caps = html('<section class="lp" id="capabilities"><div class="eb">Savoir-faire</div><h2 class="lp-t">Le studio, <i>de A à Z</i></h2><div class="lp-g f">' +
                cap5.map(function (c, i) { return '<a class="glass lp-c" href="' + c[0] + '"><div class="n">0' + (i + 1) + '</div><h3>' + c[1] + '</h3><div class="tg">' + c[2].split(' · ').map(function (t) { return '<span>' + t + '</span>'; }).join('') + '</div></a>'; }).join('') + '</div></section>');
            
            var cta = html('<div class="glass lp-cta"><h2 class="lp-t" style="margin-bottom:10px">Votre prochain projet <i>commence ici</i></h2><p style="color:#B9B6AC">Parlons de votre vision : stratégie, créativité et précision au service de votre image.</p>' +
                '<div class="bt"><a class="p" href="#contact">Démarrer un projet</a><a class="o" href="portfolio.html">Voir le portfolio</a></div></div>');
            
        }

        // ---- Contact : mise en page refaite, formulaire d'origine conservé ----
        var f = document.querySelector('form.contact-form');
        if (f && /contact\.html/.test(location.pathname)) {
            var grid = html('<div class="cgrid"></div>'); f.parentNode.insertBefore(grid, f);
            var side = html('<aside class="glass cside"><h2>Dites bonjour 👋</h2><p>Un projet de logo, de site, de print ou d\'application ? Décrivez-le, je reviens vers vous.</p>' +
                '<a class="ml" href="mailto:uipact@gmail.com">uipact@gmail.com</a><div class="st"><i></i>Disponible pour de nouveaux projets</div></aside>');
            grid.appendChild(side); grid.appendChild(f);
            var sv = ['Site internet', 'Identité visuelle', 'Création graphique', 'Création print', 'UX / UI design', 'Autre'];
            var grp = html('<div class="form-group full-width"><label>Services souhaités</label><div class="chips"></div><input type="hidden" name="services" value=""></div>');
            var hid = grp.querySelector('input'), sel = [];
            sv.forEach(function (s) {
                var c = document.createElement('button'); c.type = 'button'; c.className = 'chip'; c.textContent = s;
                c.onclick = function () { var k = sel.indexOf(s); if (k < 0) sel.push(s); else sel.splice(k, 1); c.classList.toggle('on', k < 0); hid.value = sel.join(', '); };
                grp.querySelector('.chips').appendChild(c);
            });
            var btn = f.querySelector('.valider-btn'); btn.parentNode.insertBefore(grp, btn);
            f.appendChild(html('<input type="hidden" name="_subject" value="Nouveau message depuis le site UIPACT !">'));
            f.addEventListener('submit', function () { setTimeout(function () { btn.disabled = true; btn.textContent = 'Envoi en cours…'; }, 0); });
        }
    });
})();

/* ===== V5 : polices, fond aurore + poussière, carrousels 3D partout, footer, contact ===== */
(function () {
    var lk = document.createElement('link'); lk.rel = 'stylesheet';
    lk.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&family=Caveat:wght@500;600&display=swap';
    document.head.appendChild(lk);
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    function h(t) { var d = document.createElement('div'); d.innerHTML = t.trim(); return d.firstChild; }
    function bgOf(el) { var m = getComputedStyle(el).backgroundImage.match(/url\(["']?([^"')]+)/); return m ? m[1] : ''; }

    // Carrousel coverflow 3D compact
    function c3d(items, key) {
        if (key && window.__cmsCar && window.__cmsCar[key] && window.__cmsCar[key].length) items = window.__cmsCar[key].map(function (x) { return { img: x.image, title: x.title, cat: x.subtitle, href: x.href || 'portfolio.html' }; });
        while (items.length < 8) items = items.concat(items);
        var N = items.length, sec = h('<div class="cf"><div class="cf-stage"></div><div class="cf-cap"><b></b><span></span></div><div class="cf-nav"><button aria-label="Précédent">‹</button><div class="cf-dots"></div><button aria-label="Suivant">›</button></div></div>');
        var st = sec.querySelector('.cf-stage'), dots = sec.querySelector('.cf-dots'), cap = sec.querySelector('.cf-cap'), cs = [], pos = 0, tgt = 0, drag = false, lx = 0, moved = 0, hov = false, t0 = 0, cw = 300, ci = -1;
        function go(i) { var cur = Math.round(tgt), d = (((i - cur) % N) + N) % N; if (d > N / 2) d -= N; tgt = cur + d; t0 = 0; }
        items.forEach(function (d, i) {
            var a = document.createElement('a'); a.className = 'cf-card'; a.href = d.href || 'portfolio.html'; a.draggable = false; a.style.backgroundImage = "url('" + d.img + "')"; a.innerHTML = '<i></i>';
            a.addEventListener('click', function (e) { if (moved > 6) { e.preventDefault(); return; } if (i !== ((Math.round(tgt) % N) + N) % N) { e.preventDefault(); go(i); } });
            st.appendChild(a); cs.push(a);
            var b = document.createElement('i'); b.onclick = function () { go(i); }; dots.appendChild(b);
        });
        st.addEventListener('pointerdown', function (e) { drag = true; lx = e.clientX; moved = 0; });
        addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; moved += Math.abs(dx); tgt -= dx / (cw * .5); pos = tgt; });
        addEventListener('pointerup', function () { if (drag) { drag = false; tgt = Math.round(tgt); } });
        st.addEventListener('mouseenter', function () { hov = true; }); st.addEventListener('mouseleave', function () { hov = false; });
        var bt = sec.querySelectorAll('.cf-nav button'); bt[0].onclick = function () { tgt = Math.round(tgt) - 1; t0 = 0; }; bt[1].onclick = function () { tgt = Math.round(tgt) + 1; t0 = 0; };
        (function loop(n) {
            var W = st.clientWidth || innerWidth; cw = Math.min(440, Math.max(200, W * .58)); var hh = Math.round(cw * .64); st.style.height = (hh + 40) + 'px';
            if (!t0) t0 = n; if (!drag && !hov && !reduce && n - t0 > 3800) { t0 = n; tgt++; }
            pos += (tgt - pos) * .09;
            cs.forEach(function (c, i) {
                var o = i - pos; o -= N * Math.round(o / N); var a = Math.abs(o);
                if (a > 2.6) { c.style.display = 'none'; return; } c.style.display = 'block';
                c.style.width = cw + 'px'; c.style.height = hh + 'px'; c.style.marginLeft = (-cw / 2) + 'px'; c.style.marginTop = (-hh / 2) + 'px';
                c.style.transform = 'translateX(' + (o * cw * .62) + 'px) translateZ(' + (-a * 150) + 'px) rotateY(' + (-Math.max(-1, Math.min(1, o)) * 42) + 'deg) scale(' + (1 - Math.min(a, 2) * .05) + ')';
                c.style.opacity = Math.max(0, 1 - a * .32).toFixed(2); c.style.zIndex = 100 - Math.round(a * 10); c.classList.toggle('on', a < .5);
            });
            var idx = ((Math.round(pos) % N) + N) % N;
            if (idx !== ci) { ci = idx; cap.querySelector('b').textContent = items[idx].title || ''; cap.querySelector('span').textContent = items[idx].cat || ''; [].forEach.call(dots.children, function (d, k) { d.className = k === idx ? 'on' : ''; }); }
            requestAnimationFrame(loop);
        })(0);
        return sec;
    }
    function c3d_old(items) {
        var sec = h('<div class="c3d" style="padding:20px 0 30px"><div class="c3d-stage"><div class="c3d-ring"></div></div><div class="c3d-cap"><b></b><span></span></div><div class="c3d-nav"><button aria-label="Précédent">‹</button><button aria-label="Suivant">›</button></div></div>');
        var ring = sec.querySelector('.c3d-ring'), stage = sec.querySelector('.c3d-stage'), cap = sec.querySelector('.c3d-cap'), N = items.length, step = 360 / N, cards = [], R = 0;
        items.forEach(function (d) { var a = document.createElement('a'); a.href = d.href || 'portfolio.html'; a.className = 'c3d-card'; a.style.backgroundImage = "url('" + d.img + "')"; a.draggable = false; ring.appendChild(a); cards.push(a); });
        function lay() {
            var w = innerWidth < 640 ? 170 : innerWidth < 1024 ? 230 : 290, hh = Math.round(w * .68); R = Math.round(w / 2 / Math.tan(Math.PI / Math.max(N, 3)) * 1.12);
            cards.forEach(function (c, i) { c.style.width = w + 'px'; c.style.height = hh + 'px'; c.style.margin = (-hh / 2) + 'px 0 0 ' + (-w / 2) + 'px'; c.style.transform = 'rotateY(' + (i * step) + 'deg) translateZ(' + R + 'px)'; });
        }
        lay(); addEventListener('resize', lay);
        var ang = 0, mom = 0, drag = false, lx = 0, moved = 0, snap = null, hov = false, ci = -1;
        stage.addEventListener('pointerdown', function (e) { drag = true; lx = e.clientX; moved = 0; snap = null; });
        addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; moved += Math.abs(dx); mom = dx * .3; ang += mom; });
        addEventListener('pointerup', function () { drag = false; });
        stage.addEventListener('mouseenter', function () { hov = true; }); stage.addEventListener('mouseleave', function () { hov = false; });
        stage.addEventListener('click', function (e) { if (moved > 6) e.preventDefault(); }, true);
        var b = sec.querySelectorAll('.c3d-nav button');
        b[0].onclick = function () { snap = (Math.round(ang / step) + 1) * step; }; b[1].onclick = function () { snap = (Math.round(ang / step) - 1) * step; };
        (function loop() {
            if (!drag) { if (snap !== null) { ang += (snap - ang) * .1; if (Math.abs(snap - ang) < .05) snap = null; } else { ang += mom + (hov || reduce ? 0 : .12); mom *= .94; } }
            ring.style.transform = 'translateZ(-' + R + 'px) rotateX(-8deg) rotateY(' + ang + 'deg)';
            cards.forEach(function (c, i) { c.style.opacity = (.3 + .7 * (Math.cos((i * step + ang) * Math.PI / 180) + 1) / 2).toFixed(2); });
            var idx = ((Math.round(-ang / step) % N) + N) % N;
            if (idx !== ci) { ci = idx; cap.querySelector('b').textContent = items[idx].title || ''; cap.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: 'ease-out' }); }
            requestAnimationFrame(loop);
        })();
        return sec;
    }

    window.__c3d = c3d;
    // AJAX FormSubmit avec repli sur l'envoi classique
    function ajax(f) {
        var btn = f.querySelector('button[type=submit],.valider-btn,.cta-button');
        f.addEventListener('submit', function (e) {
            e.preventDefault(); e.stopImmediatePropagation();
            var o = {}; new FormData(f).forEach(function (v, k) { o[k] = v; }); o._captcha = 'false';
            if (window.UIPACT_API && !/REMPLACER/.test(window.UIPACT_API)) { var nm = ((o.prenom || '') + ' ' + (o.nom || o.name || '')).trim() || 'Visiteur', ms = Object.keys(o).filter(function (k) { return k.charAt(0) !== '_' && o[k]; }).map(function (k) { return k + ' : ' + o[k]; }).join('\n'); fetch(window.UIPACT_API.replace(/\/$/, '') + '/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: nm.slice(0, 80), email: o.email || '', message: ms.slice(0, 3000) }) }).catch(function () {}); }
            var t = btn.textContent; btn.disabled = true; btn.textContent = 'Envoi en cours…';
            fetch('https://formsubmit.co/ajax/uipact@gmail.com', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(o) })
                .then(function (r) { return r.json(); })
                .then(function (j) {
                    if (j.success === 'true' || j.success === true) { f.innerHTML = '<div class="ok"><b>✓</b><h3>Message envoyé !</h3><p>Merci, je reviens vers vous très vite.</p></div>'; }
                    else { throw 0; }
                })
                .catch(function () { btn.disabled = false; btn.textContent = t; HTMLFormElement.prototype.submit.call(f); });
        }, true);
    }

    document.addEventListener('DOMContentLoaded', function () {
        var body = document.body;

        // Fond : aurore + poussière d'or reliée au curseur
        body.insertBefore(h('<div id="aurora"><i></i><i></i><i></i></div>'), body.firstChild);
        var cv = document.createElement('canvas'); cv.id = 'dust'; body.insertBefore(cv, body.firstChild);
        var cx = cv.getContext('2d'), W, H, P = [], mx = -999, my = -999;
        function rs() { W = cv.width = innerWidth; H = cv.height = innerHeight; P.forEach(function (p) { p.x = Math.random() * W; p.y = Math.random() * H; }); } rs(); addEventListener('resize', rs);
        for (var i = 0; i < (innerWidth < 700 ? 34 : 72); i++) P.push({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.6 + .6 });
        addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
        (function dl() {
            cx.clearRect(0, 0, W, H);
            P.forEach(function (p, i) {
                if (!reduce) { p.x += p.vx; p.y += p.vy; } if (p.x < 0) p.x = W; if (p.x > W) p.x = 0; if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
                cx.fillStyle = 'rgba(228,199,122,.7)'; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill();
                for (var j = i + 1; j < P.length; j++) { var q = P[j], d = Math.hypot(p.x - q.x, p.y - q.y); if (d < 110) { cx.strokeStyle = 'rgba(201,162,75,' + (.18 * (1 - d / 110)) + ')'; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(q.x, q.y); cx.stroke(); } }
                var dm = Math.hypot(p.x - mx, p.y - my); if (dm < 150) { cx.strokeStyle = 'rgba(228,199,122,' + (.5 * (1 - dm / 150)) + ')'; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(mx, my); cx.stroke(); }
            });
            requestAnimationFrame(dl);
        })();

        // Carrousels 3D : pages de services (ancien carrousel remplacé) et création print
        var sl = [].slice.call(document.querySelectorAll('.carousel-slide'));
        if (sl.length) {
            var host = document.querySelector('.carousel-container');
            var it = sl.map(function (s) { var im = s.querySelector('.carousel-image') || s, c = s.querySelector('.carousel-caption') || s.querySelector('p'); return { img: bgOf(im), title: c ? c.textContent.trim() : '', href: (s.querySelector('a') || {}).href }; });
            host.parentNode.insertBefore(c3d(it, window.__cmsPK && window.__cmsPK()), host); host.style.display = 'none'; var dt = document.querySelector('.carousel-dots'); if (dt) dt.style.display = 'none';
        }
        var pg = document.querySelector('.print-grid');
        if (pg) {
            var pi = [].map.call(pg.querySelectorAll('.print-card'), function (c) {
                var img = ''; [c].concat([].slice.call(c.querySelectorAll('*'))).some(function (e) { img = bgOf(e); return img; });
                if (!img) { var t = c.querySelector('img'); img = t ? t.src : ''; }
                return { img: img, title: c.textContent.trim().replace(/\s+/g, ' '), href: c.href };
            });
            pg.parentNode.insertBefore(c3d(pi, 'creation-print'), pg); pg.style.display = 'none';
        }

        // Portfolio : un seul carrousel
        var cfw = function () { var x = document.createElement('section'); x.className = 'cf-sec'; return x; };
        var H5 = [['img/chene.png','Le Chêne Doré','Webdesign'],['img/tout.png','Novaflow Advisory','Branding'],['img/sport.png','Application Mobile','UX / UI design'],['img/japan.png','Japan and Friends','Identité visuelle'],['img/foodweb.png','Food Burger','Webdesign']].map(function (d) { return { img: d[0], title: d[1], cat: d[2], href: 'portfolio.html' }; });
        var pf = document.getElementById('portfolio');
        if (pf && document.getElementById('hero')) {
            var ttl = pf.querySelector('.section-title'); pf.id = 'portfolio-classic'; pf.style.display = 'none';
            var ns = cfw(); ns.id = 'portfolio'; if (ttl) ns.appendChild(ttl); ns.appendChild(c3d(H5, 'home')); pf.parentNode.insertBefore(ns, pf);
        }
        var ph = document.querySelector('.portfolio-header');
        if (ph) { var p2 = cfw(); p2.appendChild(c3d(H5.concat([{ img: 'img/alpharun.png', title: 'AlphaRun', cat: 'Mockup UI', href: 'portfolio.html' }, { img: 'img/flyers-alpharun.png', title: 'Flyers AlphaRun', cat: 'Print', href: 'portfolio.html' }, { img: 'img/carte.png', title: 'Cartes de visite', cat: 'Print', href: 'portfolio.html' }]), 'portfolio')); ph.after(p2); }

        // Contact de l'accueil : formulaire classique dans une carte 3D
        var hf = document.querySelector('section#contact form.contact-form');
        if (hf) {
            hf.classList.add('hf');
            var sc = h('<div class="hc-scene"><div class="hc-card"></div></div>'), cd = sc.firstChild; hf.parentNode.insertBefore(sc, hf); cd.appendChild(hf);
            sc.addEventListener('mousemove', function (e) { var r = sc.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; cd.style.transform = 'rotateY(' + (x * 9) + 'deg) rotateX(' + (-y * 9) + 'deg)'; });
            sc.addEventListener('mouseleave', function () { cd.style.transform = ''; });
        }
        // Bouton haut : anneau de progression
        var tb = document.getElementById('scrollTopBtn');
        if (tb) {
            tb.innerHTML = '<svg viewBox="0 0 48 48"><circle class="tr" cx="24" cy="24" r="21"/><circle class="pr" cx="24" cy="24" r="21"/></svg><span class="ar">↑</span>';
            var C = 2 * Math.PI * 21, pr = tb.querySelector('.pr'); pr.style.strokeDasharray = C;
            var upd = function () { var p = scrollY / ((document.documentElement.scrollHeight - innerHeight) || 1); pr.style.strokeDashoffset = C * (1 - Math.min(1, p)); };
            addEventListener('scroll', upd, { passive: true }); upd();
        }
        // Grosses zones pleines → fond transparent avec filet doré
        setTimeout(function () {
            [].forEach.call(document.querySelectorAll('section,main>div,body>div,div[class*="header"],div[class*="gallery"],div[class*="cta"],div[class*="banner"]'), function (e) {
                if (e.id === 'hero' || e.closest('header,footer,nav,.kf,.glass,.cf,.contact-form,.hc-card,.popup-overlay')) return;
                var bg = getComputedStyle(e).backgroundColor, m = bg.match(/[\d.]+/g);
                if (m && (m.length === 3 || +m[3] > .5) && e.offsetWidth > innerWidth * .6 && e.offsetHeight > 120) e.classList.add('exb');
            });
        }, 500);
        document.querySelectorAll('form.contact-form').forEach(ajax);

        // Footer refait (mêmes liens)
        var ft = document.querySelector('footer.site-footer');
        if (ft) {
            var ig = ft.querySelector('.social-links a'), igh = ig ? ig.outerHTML : '';
            ft.innerHTML = window.__cmsFooter ? window.__cmsFooter(igh) : ('<div class="kf"><div class="kf-l"><div class="kf-logo"><img src="logo.png" alt="UIPACT"><b>UIPACT</b></div><p class="kf-tag">Agence de conception visuelle &amp; web.<br><span>Identité de marque, print et sites internet pensés pour convertir.</span></p><div class="kf-soc"><a class="kf-follow" href="https://www.instagram.com/uipact/" target="_blank" rel="noopener noreferrer">Suivez-nous !</a><div class="social-links">' + igh + '</div></div></div>' +
                '<div class="kf-r"><a class="kf-lucky" href="contact.html"><span><img src="logo.png" alt="UIPACT"></span><em>Un projet ?</em></a><div class="kf-cols">' +
                '<div><h4>Navigation</h4><a href="index.html">Accueil</a><a href="portfolio.html">Portfolio</a><a href="a-propos.html">À propos</a><a href="contact.html">Contact</a></div>' +
                '<div><h4>Savoir-faire</h4><a href="creation-graphique.html">Création graphique</a><a href="creation-print.html">Création Print</a><a href="sites-web.html">Sites internet</a><a href="identite-visuelle.html">Identité visuelle</a><a href="ux-ui.html">UX / UI Design</a></div>' +
                '<div><h4>Informations</h4><a href="mentions-legales.html">Mentions légales</a><a href="cgu.html">CGU</a><a href="politique-confidentialite.html">Politique de confidentialité</a></div></div>' +
                '<div class="kf-bot"><p>© 2026 UIPACT — Tous droits réservés.</p><p>Conçu et développé par Barrot Léo</p></div></div></div>' +
                '');
        }
    });
})();

/* ===== V6 : boutons des cartes de services ===== */
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.service-btn,.btn-portfolio').forEach(function (b) { b.classList.add('cta-button'); });
});

/* ===== V7 : contraste automatique du mode sombre + bouton caché près du footer ===== */
(function () {
    var root = document.documentElement;
    function lum(c) {
        var m = c.match(/[\d.]+/g); if (!m) return null; if (m.length > 3 && +m[3] < .05) return null;
        var r = [+m[0], +m[1], +m[2]].map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
        return .2126 * r[0] + .7152 * r[1] + .0722 * r[2];
    }
    function bgLum(el) { while (el && el !== root) { var l = lum(getComputedStyle(el).backgroundColor); if (l !== null) return l; el = el.parentElement; } return .02; }
    function fix() {
        var dark = root.getAttribute('data-theme') === 'dark';
        if (!dark) { [].forEach.call(document.querySelectorAll('[data-cf]'), function (e) { e.style.removeProperty('color'); e.removeAttribute('data-cf'); }); return; }
        [].forEach.call(document.querySelectorAll('body *'), function (e) {
            if (e.closest('a,button,.cta-button,[class*="btn"],svg,.chip,.kf-lucky')) return;
            if (![].some.call(e.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); })) return;
            var l = lum(getComputedStyle(e).color);
            if (l !== null && l < .25 && bgLum(e) < .25) { e.style.setProperty('color', '#D9D5C8', 'important'); e.setAttribute('data-cf', '1'); }
        });
    }
    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(fix, 600); setTimeout(fix, 2500);
        var t = document.getElementById('themeToggle'); if (t) t.addEventListener('click', function () { setTimeout(fix, 80); });
        var ft = document.querySelector('footer.site-footer'), cta = document.querySelector('.cta-float');
        if (ft && cta && 'IntersectionObserver' in window) new IntersectionObserver(function (es) { cta.classList.toggle('nf', es[0].isIntersecting); }).observe(ft);
    });
})();

/* ===== V7 : relève les gris trop sombres en mode sombre + masque le bouton flottant sur le footer ===== */
(function () {
    function lum(c) { var m = c.match(/[\d.]+/g); if (!m) return 1; return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255; }
    function opaque(e) { while (e && e !== document.documentElement) { var b = getComputedStyle(e).backgroundColor, m = b.match(/[\d.]+/g); if (m && (m.length === 3 || +m[3] > .6)) return b; e = e.parentElement; } return null; }
    function fix() {
        var dark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.querySelectorAll('main *,section *,.container *,body > div *').forEach(function (e) {
            if (e.closest('header,footer,nav,button,a.cta-button,.cta-float,#scrollTopBtn,.kf')) return;
            var has = false; for (var i = 0; i < e.childNodes.length; i++) if (e.childNodes[i].nodeType === 3 && e.childNodes[i].textContent.trim()) { has = true; break; }
            if (!has) return;
            if (!dark) { e.classList.remove('lift'); return; }
            var cs = getComputedStyle(e).color, m = cs.match(/[\d.]+/g); if (!m) return;
            var bg = opaque(e);
            if (lum(cs) < .55 && (!bg || lum(bg) < .4)) e.classList.add('lift'); else e.classList.remove('lift');
        });
    }
    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(fix, 700);
        var t = document.getElementById('themeToggle'); if (t) t.addEventListener('click', function () { setTimeout(fix, 60); });
        var ft = document.querySelector('footer');
        if (ft && 'IntersectionObserver' in window) new IntersectionObserver(function (es) { document.body.classList.toggle('at-footer', es[0].isIntersecting); }, { threshold: .05 }).observe(ft);
    });
})();

/* ===== V8 : impact visuel et conversion ===== */
(function () {
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
    function h(t) { var d = document.createElement('div'); d.innerHTML = t.trim(); return d.firstChild; }
    document.addEventListener('DOMContentLoaded', function () {
        var body = document.body;
        // Barre de progression de lecture
        var sp = h('<div id="sp"></div>'); body.appendChild(sp);
        addEventListener('scroll', function () { var m = document.documentElement.scrollHeight - innerHeight; sp.style.transform = 'scaleX(' + (m > 0 ? scrollY / m : 0) + ')'; }, { passive: true });
        // Hero : cartes de réalisations flottantes en 3D + inclinaison + effet de scroll
        var hero = document.getElementById('hero'), hc = document.querySelector('.hero-content');
        if (hero && hc && !reduce) {
            var h3 = h('<div class="h3d"><div class="rg"></div></div>'), rg = h3.firstChild;
            [['img/japan.png', 'Identité visuelle', '3%', '22%', -16, 60], ['img/chene.png', 'Site web', 'auto', '16%', 14, -40, '3%'], ['img/sport.png', 'UX / UI', '6%', '64%', 12, 90], ['img/tout.png', 'Branding', 'auto', '62%', -12, 30, '5%']].forEach(function (c, i) {
                var d = document.createElement('div'); d.className = 'h3c'; d.style.backgroundImage = "url('" + c[0] + "')"; d.setAttribute('data-t', c[1]);
                d.style.left = c[2]; d.style.right = c[6] || 'auto'; d.style.top = c[3]; d.style.animationDelay = '-' + (i * 1.7) + 's';
                d.style.transform = 'translateZ(' + c[5] + 'px) rotateY(' + c[4] + 'deg) rotateZ(' + (c[4] / 4) + 'deg)'; d.dataset.sp = (0.06 + i * 0.035); rg.appendChild(d);
            });
            /* cartes flottantes retirées */
            hero.addEventListener('mousemove', function (e) {
                var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
                rg.style.transform = 'rotateY(' + (x * 14) + 'deg) rotateX(' + (-y * 10) + 'deg)';
                hc.style.setProperty('--ry', (x * 5) + 'deg'); hc.style.setProperty('--rx', (-y * 4) + 'deg');
            });
            hero.addEventListener('mouseleave', function () { rg.style.transform = ''; hc.style.setProperty('--ry', '0deg'); hc.style.setProperty('--rx', '0deg'); });
            addEventListener('scroll', function () {
                var s = Math.min(1, scrollY / (innerHeight * .75)); hc.style.setProperty('--hs', s);
                [].forEach.call(rg.children, function (c) { c.style.marginTop = (-scrollY * c.dataset.sp) + 'px'; });
            }, { passive: true });
            var b = hc.querySelector('.cta-button');
            if (b && !hc.querySelector('.cta-ghost')) b.insertAdjacentElement('afterend', h('<a class="cta-ghost bi" href="contact.html" style="--i:9">Me contacter</a>'));
        }
        if (fine && !reduce) {
            // Halo qui suit le curseur + anneau + boutons magnétiques
            var spot = h('<div id="spot"></div>'), cur = h('<div id="cur"></div>'); body.appendChild(spot); body.appendChild(cur);
            var tx = 0, ty = 0, cx = 0, cy = 0;
            addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; cur.classList.add('on'); spot.style.setProperty('--sx', tx + 'px'); spot.style.setProperty('--sy', ty + 'px'); }, { passive: true });
            document.addEventListener('mouseleave', function () { cur.classList.remove('on'); });
            (function lp() { cx += (tx - cx) * .2; cy += (ty - cy) * .2; cur.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)'; requestAnimationFrame(lp); })();
            document.addEventListener('mouseover', function (e) { cur.classList.toggle('big', !!(e.target.closest && e.target.closest('a,button,.c3d-card,.service-card,.project-card,.chip'))); });
            document.querySelectorAll('.cta-button,.cta-ghost,.service-btn,.cta-menu-button').forEach(function (m) {
                m.addEventListener('mousemove', function (e) { var r = m.getBoundingClientRect(); m.style.translate = ((e.clientX - r.left - r.width / 2) * .22) + 'px ' + ((e.clientY - r.top - r.height / 2) * .35) + 'px'; });
                m.addEventListener('mouseleave', function () { m.style.translate = ''; });
            });
        }
        // Bulle d'accroche vers le contact (une fois par session)
        if (!/contact\.html/.test(location.pathname) && !sessionStorage.getItem('uipact-bub')) {
            setTimeout(function () {
                var cta = document.querySelector('.cta-float.show'); if (!cta || document.body.classList.contains('at-footer')) return;
                sessionStorage.setItem('uipact-bub', '1');
                var bub = h('<a class="bub" href="contact.html">Un projet de site ou de logo ? Parlons-en 👋<button aria-label="Fermer">×</button></a>');
                bub.querySelector('button').onclick = function (e) { e.preventDefault(); e.stopPropagation(); bub.remove(); };
                body.appendChild(bub); setTimeout(function () { bub.remove(); }, 14000);
            }, 9000);
        }
    });
})();

/* ===== V8b : badge de disponibilité, boutons du hero regroupés, indicateur de scroll ===== */
document.addEventListener('DOMContentLoaded', function () {
    function h(t) { var d = document.createElement('div'); d.innerHTML = t.trim(); return d.firstChild; }
    var hero = document.getElementById('hero'), hc = document.querySelector('.hero-content');
    if (!hero || !hc) return;
    var main = hc.querySelector('.cta-button'), gh = hc.querySelector('.cta-ghost');
    if (main) {
        var row = h('<div class="hero-ctas"></div>'); main.parentNode.insertBefore(row, main); row.appendChild(main);
        row.appendChild(gh || h('<a class="cta-ghost" href="contact.html">Démarrer un projet</a>'));
    }
    hero.appendChild(h('<a class="hero-scroll" href="#services"><b></b>Découvrir</a>'));
});

/* ===== V9 : showcase 3D piloté par le scroll (ordinateur qui s'ouvre, sites qui défilent, téléphone) ===== */
document.addEventListener('DOMContentLoaded', function () {
    var hero = document.getElementById('hero'); if (!hero || document.getElementById('sc3')) return;
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, mob = matchMedia('(max-width:900px)');
    var X = (window.__cmsSec && window.__cmsSec.showcase) || {}, tt = window.__cmsTr || function (i, f) { return f; }, E = (window.CMS && window.CMS.esc) || function (v) { return v; };
    var D0 = [['Stratégie', 'Comprendre votre projet, vos objectifs et votre cible avant de dessiner la moindre ligne.', 'img/tout.png'],
              ['Créativité', 'Concevoir une identité et des interfaces qui vous démarquent et racontent votre histoire.', 'img/chene.png'],
              ['Précision', 'Livrer des fichiers et des pages soignés, prêts à être utilisés partout.', 'img/foodweb.png']];
    var S = D0.map(function (d, i) { var z = (X.steps || [])[i] || {}; return [tt('sc_' + i + '_t', z.title || d[0]), tt('sc_' + i + '_p', z.text || d[1]), z.image || d[2]]; });
    var EB = tt('sc_eb', X.eyebrow || 'Ma méthode'), CTA = tt('sc_cta', (X.cta && X.cta.label) || 'Démarrer un projet'), CTAH = (X.cta && X.cta.href) || 'contact.html', PH = X.phone || 'img/sport.png';
    var sec = document.createElement('section'); sec.id = 'sc3'; sec.className = 'sc3';
    sec.innerHTML = '<div class="sc3-stick"><div class="sc3-txt"><div class="eb">' + E(EB) + '</div><div class="sc3-n">01</div><h3 class="sc3-h"></h3><p class="sc3-p"></p><div class="sc3-d"><i></i><i></i><i></i></div><a class="cta-button" href="' + E(CTAH) + '">' + E(CTA) + '</a></div>' +
        '<div class="sc3-scene"><div class="lap"><div class="lap-lid"><div class="lap-page">' + S.map(function (s) { return '<img src="' + E(s[2]) + '" alt="">'; }).join('') + '</div></div><div class="lap-deck"></div></div><div class="phone"><img src="' + E(PH) + '" alt=""></div></div></div>';
    (document.querySelector('.ticker-wrap') || hero).after(sec);
    var q = function (s) { return sec.querySelector(s); }, lap = q('.lap'), lid = q('.lap-lid'), ph = q('.phone'), n = q('.sc3-n'), hh = q('.sc3-h'), pp = q('.sc3-p'), dots = sec.querySelectorAll('.sc3-d i'), imgs = sec.querySelectorAll('.lap-page img'), cur = -1, mx = 0, my = 0;
    addEventListener('mousemove', function (e) { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
    function step(i) {
        if (i === cur) return; cur = i; n.textContent = '0' + (i + 1); hh.textContent = S[i][0]; pp.textContent = S[i][1];
        [].forEach.call(imgs, function (m, k) { m.classList.toggle('on', k === i); }); [].forEach.call(dots, function (d, k) { d.classList.toggle('on', k <= i); });
        [n, hh, pp].forEach(function (e) { e.classList.remove('sw3'); void e.offsetWidth; e.classList.add('sw3'); });
    }
    var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
    (function frame() {
        var auto = mob.matches || reduce, p;
        if (auto) p = .12 + .88 * ((performance.now() / 13500) % 1);
        else { var r = sec.getBoundingClientRect(), tot = sec.offsetHeight - innerHeight; p = Math.max(0, Math.min(1, -r.top / tot)); }
        var o = auto ? 1 : ease(Math.min(1, p / .14)), open = -88 * (1 - o) + 6 * o;
        var k = Math.max(0, (p - .12) / .88), i = Math.min(2, Math.floor(k * 3)), lp = (k * 3) % 1;
        step(i);
        lid.style.transform = 'rotateX(' + open + 'deg)';
        lap.style.transform = 'rotateX(' + (16 - 5 * Math.sin(p * Math.PI) + my * -8) + 'deg) rotateY(' + (-16 + p * 30 + mx * 8) + 'deg) scale(' + (.9 + .12 * o) + ')';
        imgs[i].style.transform = 'scale(1.28) translateY(' + ((.5 - lp) * 11) + '%)';
        var pv = Math.max(0, Math.min(1, (p - .1) * 5)); ph.style.opacity = pv; ph.style.transform = 'translateZ(' + (60 + pv * 60) + 'px) rotateY(-22deg) rotateX(6deg) translateY(' + (-p * 40) + 'px)';
        requestAnimationFrame(frame);
    })();
});

/* ===== V9 : phrase révélée au scroll + « du wireframe au site » (3D piloté par le scroll) ===== */
document.addEventListener('DOMContentLoaded', function () {
    function h(t) { var d = document.createElement('div'); d.innerHTML = t.trim(); return d.firstChild; }
    var cl = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
    ['#process', '#capabilities'].forEach(function (s) { var e = document.querySelector(s); if (e) e.remove(); });
    var hero = document.getElementById('hero'), sv = document.getElementById('services');
    if (!hero || !sv) return;
    // 1. Phrase d'engagement qui se révèle mot à mot
    var XS = window.__cmsSec || {}, tt2 = window.__cmsTr || function (i, f) { return f; };
    var T = tt2('st_txt', (XS.statement && XS.statement.text) || "La garantie d'un résultat 100% en adéquation avec vos valeurs, les messages et l'image que vous souhaitez véhiculer.");
    var st = h('<section class="st-sec"><p class="st-txt"></p></section>'), tp = st.firstChild;
    tp.innerHTML = T.split(' ').map(function (w) { return '<span class="sw2">' + w + '</span>'; }).join(' ');
    (document.querySelector('.ticker-wrap') || hero).after(st);
    var ws = [].slice.call(tp.children);
    // 2. Du wireframe au site : maquette 3D pilotée par le scroll
    var M = XS.method || {}, MS = M.steps || [], CH = M.chips || {}, E2 = (window.CMS && window.CMS.esc) || function (v) { return v; };
    var MD = [['01 · Stratégie', 'Comprendre votre projet, vos objectifs et votre cible avant de dessiner la moindre ligne.'], ['02 · Design', 'Wireframes puis maquettes : identité, typographies, couleurs et interface pensées pour votre image.'], ['03 · Développement', 'Un site à votre image, responsive et facile à prendre en main.']];
    var li = MD.map(function (d, i) { var z = MS[i] || {}; return '<li' + (i === 0 ? ' class="on"' : '') + '><b>' + E2(tt2('m_' + i + '_t', z.title || d[0])) + '</b><span>' + E2(tt2('m_' + i + '_p', z.text || d[1])) + '</span></li>'; }).join('');
    var p3 = h('<section class="p3" id="methode"><div class="p3-in"><div class="p3-txt"><div class="eb">' + E2(tt2('m_eb', M.eyebrow || 'Méthode')) + '</div><h2 class="p3-h">' + E2(tt2('m_title', M.title || 'Du wireframe au site')) + ' <i>' + E2(tt2('m_em', M.titleEm || 'qui convertit')) + '</i></h2><ul class="p3-steps">' + li + '</ul></div>' +
        '<div class="p3-stage"><div class="p3-rig" data-s="0"><div class="p3-win">' +
        '<div class="p3-lay on"><div class="wf"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>' +
        '<div class="p3-lay"><div class="wf d"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>' +
        '<div class="p3-lay"><img class="p3-live" src="' + E2(M.image || 'img/chene.png') + '" alt=""></div></div>' +
        '<div class="p3-chip c1">Aa<small>' + E2(tt2('m_c1', CH.typo || 'Typographie')) + '</small></div><div class="p3-chip c2"><u></u><u></u><u></u></div>' +
        '<div class="p3-chip c3">' + E2(tt2('m_c3', CH.button || 'Bouton')) + '</div><div class="p3-chip c4">' + E2(tt2('m_c4', CH.resp || 'Responsive')) + '<small>' + E2(tt2('m_c4s', CH.respSmall || 'mobile · tablette · bureau')) + '</small></div></div></div></div></section>');
    sv.after(p3);
    var rig = p3.querySelector('.p3-rig'), lays = [].slice.call(p3.querySelectorAll('.p3-lay')), lis = [].slice.call(p3.querySelectorAll('.p3-steps li')), tg = 0, cur = 0, mx = 0, cx = 0, last = -1;
    addEventListener('mousemove', function (e) { mx = e.clientX / innerWidth - .5; }, { passive: true });
    (function loop() {
        var r = tp.getBoundingClientRect(), pr = cl((innerHeight * .88 - r.top) / (innerHeight * .5 + r.height), 0, 1), k = pr * (ws.length + 4);
        ws.forEach(function (w, i) { w.style.opacity = (.15 + .85 * cl(k - i, 0, 1)).toFixed(2); });
        var q = p3.getBoundingClientRect(); tg = cl(-q.top / (q.height - innerHeight), 0, 1);
        cur += (tg - cur) * .1; cx += (mx - cx) * .06;
        var e = cur < .1 ? 0 : cur;
        rig.style.transform = 'rotateY(' + (-30 + cur * 42 + cx * 8) + 'deg) rotateX(' + (14 - cur * 12) + 'deg) translateZ(' + (cur * 50) + 'px)';
        rig.style.setProperty('--p', cur.toFixed(3));
        var s = tg < .33 ? 0 : tg < .66 ? 1 : 2;
        if (s !== last) { last = s; rig.dataset.s = s; lays.forEach(function (l, i) { l.classList.toggle('on', i === s); }); lis.forEach(function (l, i) { l.classList.toggle('on', i === s); }); }
        requestAnimationFrame(loop);
    })();
});

/* ===== V9 : vue éclatée d'un site au scroll + services empilés en 3D ===== */
document.addEventListener('DOMContentLoaded', function () {
    function h(t) { var d = document.createElement('div'); d.innerHTML = t.trim(); return d.firstChild; }
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hh = document.querySelector('.h3d'); if (hh) hh.remove();
    var anchor = document.querySelector('.ticker-wrap');
    if (false && anchor) {
        var sec = h('<section class="l3d" id="studio"><div class="l3d-pin"><div class="l3d-head"><div class="eb">Méthode</div><h2 class="lp-t">Du concept au <i>site en ligne</i></h2></div>' +
            '<div class="l3d-scene"><div class="l3d-stack">' +
            '<div class="ly ly1"><span>Wireframe</span></div>' +
            '<div class="ly ly2"><span>Palette</span><i style="background:#101B3D"></i><i style="background:#1C2C5C"></i><i style="background:#C9A24B"></i><i style="background:#E4C77A"></i><i style="background:#FAF7F1"></i></div>' +
            '<div class="ly ly3"><span>Typographie</span><b>Aa</b><em>Instrument Serif<br>Inter</em></div>' +
            '<div class="ly ly4"><span>Interface</span><u></u><u></u><u></u><s></s></div>' +
            '<div class="ly ly5"><div class="bar"><i></i><i></i><i></i><em>● En ligne</em></div><div class="pg"><b>Votre site,<br>prêt à convaincre</b><u></u><s></s></div></div>' +
            '</div></div><div class="l3d-cap"><div class="n">01</div><div><h3></h3><p></p></div></div><div class="l3d-bar"><i></i></div></div></section>');
        anchor.after(sec);
        var steps = [['Wireframe', 'La structure et le parcours de vos visiteurs, posés avant toute décoration.'], ['Design', 'Palette de couleurs, typographies et identité : votre univers visuel prend forme.'],
                     ['Intégration', 'Interfaces soignées, pensées pour s\'afficher parfaitement sur mobile comme sur ordinateur.'], ['En ligne', 'Toutes les couches s\'assemblent : votre site est prêt à convaincre.']];
        var stack = sec.querySelector('.l3d-stack'), ly = [].slice.call(sec.querySelectorAll('.ly')), n = sec.querySelector('.l3d-cap .n'), t = sec.querySelector('.l3d-cap h3'), d = sec.querySelector('.l3d-cap p'), bar = sec.querySelector('.l3d-bar i'), cur = -1;
        function upd() {
            var r = sec.getBoundingClientRect(), tot = sec.offsetHeight - innerHeight, p = Math.min(1, Math.max(0, -r.top / tot)), e = p * p * (3 - 2 * p);
            var gap = (innerWidth < 700 ? 62 : 92) * Math.sin(Math.PI * Math.min(1, p));
            stack.style.transform = 'rotateX(' + (64 - 64 * e) + 'deg) rotateZ(' + (-42 * (1 - e)) + 'deg) scale(' + (.85 + .2 * e) + ')';
            ly.forEach(function (l, i) { l.style.transform = 'translateZ(' + (i * gap) + 'px)'; });
            bar.style.width = (p * 100) + '%';
            var s = Math.min(3, Math.floor(p * 4)); if (s !== cur) { cur = s; n.textContent = '0' + (s + 1); t.textContent = steps[s][0]; d.textContent = steps[s][1]; }
        }
        if (!reduce) { addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); } upd();
    }
    // Services empilés : chaque carte reste collée et se réduit quand la suivante arrive (ordinateur)
    var cards = [].slice.call(document.querySelectorAll('#services .service-card'));
    if (cards.length > 1 && innerWidth >= 900 && !reduce) {
        cards[0].parentNode.classList.add('stk');
        cards.forEach(function (c, i) { c.style.top = (96 + i * 20) + 'px'; c.classList.remove('rv', 'tilt'); c.style.opacity = 1; });
        var upd2 = function () {
            cards.forEach(function (c, i) {
                var sum = 0; for (var j = i + 1; j < cards.length; j++) { sum += Math.min(1, Math.max(0, 1 - (cards[j].getBoundingClientRect().top - (96 + j * 20)) / (innerHeight * .7))); }
                c.style.scale = (1 - .04 * sum).toFixed(4); c.style.filter = 'brightness(' + (1 - .1 * sum).toFixed(3) + ')';
            });
        };
        addEventListener('scroll', upd2, { passive: true }); upd2();
    }
});
