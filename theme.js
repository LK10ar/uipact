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
        if (anchor && !(location.pathname.indexOf('portfolio') < 0 && !$('#portfolio'))) {
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
            $('#services').after(proc);
            var cap5 = [['creation-graphique.html','Création graphique','Logo · Identité · Supports'],['creation-print.html','Création print','Cartes · Flyers · Affiches'],['sites-web.html','Sites internet','Vitrine · One-page'],
                        ['identite-visuelle.html','Identité visuelle','Charte · Rédaction'],['ux-ui.html','UX / UI design','Maquettes · Prototypes']];
            var caps = html('<section class="lp" id="capabilities"><div class="eb">Savoir-faire</div><h2 class="lp-t">Le studio, <i>de A à Z</i></h2><div class="lp-g f">' +
                cap5.map(function (c, i) { return '<a class="glass lp-c" href="' + c[0] + '"><div class="n">0' + (i + 1) + '</div><h3>' + c[1] + '</h3><div class="tg">' + c[2].split(' · ').map(function (t) { return '<span>' + t + '</span>'; }).join('') + '</div></a>'; }).join('') + '</div></section>');
            proc.after(caps);
            var cta = html('<div class="glass lp-cta"><h2 class="lp-t" style="margin-bottom:10px">Votre prochain projet <i>commence ici</i></h2><p style="color:#B9B6AC">Parlons de votre vision : stratégie, créativité et précision au service de votre image.</p>' +
                '<div class="bt"><a class="p" href="#contact">Démarrer un projet</a><a class="o" href="portfolio.html">Voir le portfolio</a></div></div>');
            $('#contact').before(cta);
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

    // Carrousel 3D générique
    function c3d(items) {
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

    // AJAX FormSubmit avec repli sur l'envoi classique
    function ajax(f) {
        var btn = f.querySelector('button[type=submit],.valider-btn,.cta-button');
        f.addEventListener('submit', function (e) {
            e.preventDefault(); e.stopImmediatePropagation();
            var o = {}; new FormData(f).forEach(function (v, k) { o[k] = v; }); o._captcha = 'false';
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
        function rs() { W = cv.width = innerWidth; H = cv.height = innerHeight; } rs(); addEventListener('resize', rs);
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
            host.parentNode.insertBefore(c3d(it), host); host.style.display = 'none'; var dt = document.querySelector('.carousel-dots'); if (dt) dt.style.display = 'none';
        }
        var pg = document.querySelector('.print-grid');
        if (pg) {
            var pi = [].map.call(pg.querySelectorAll('.print-card'), function (c) {
                var img = ''; [c].concat([].slice.call(c.querySelectorAll('*'))).some(function (e) { img = bgOf(e); return img; });
                if (!img) { var t = c.querySelector('img'); img = t ? t.src : ''; }
                return { img: img, title: c.textContent.trim().replace(/\s+/g, ' '), href: c.href };
            });
            pg.parentNode.insertBefore(c3d(pi), pg); pg.style.display = 'none';
        }

        // Contact de l'accueil : même mise en page que la page contact
        var hf = document.querySelector('section#contact form.contact-form');
        if (hf) {
            hf.classList.add('hf');
            var g = h('<div class="cgrid"></div>'); hf.parentNode.insertBefore(g, hf);
            g.appendChild(h('<aside class="glass cside"><h2>Dites bonjour 👋</h2><p>Un projet de logo, de site, de print ou d\'application ? Écrivez-moi.</p><a class="ml" href="mailto:uipact@gmail.com">uipact@gmail.com</a><div class="st"><i></i>Disponible pour de nouveaux projets</div></aside>'));
            g.appendChild(hf);
        }
        document.querySelectorAll('form.contact-form').forEach(ajax);

        // Footer refait (mêmes liens)
        var ft = document.querySelector('footer.site-footer');
        if (ft) {
            var ig = ft.querySelector('.social-links a'), igh = ig ? ig.outerHTML : '';
            ft.innerHTML = '<div class="kf"><div class="kf-l"><div class="kf-logo"><img src="logo.png" alt="UIPACT"><b>UIPACT</b></div><p class="kf-tag">Agence de conception visuelle &amp; web.<br><span>Identité de marque, print et sites internet pensés pour convertir.</span></p><div class="kf-soc"><em>Suivez-nous !</em><div class="social-links">' + igh + '</div></div></div>' +
                '<div class="kf-r"><a class="kf-lucky" href="contact.html"><span>UIP</span><em>Un projet ?</em></a><div class="kf-cols">' +
                '<div><h4>Navigation</h4><a href="index.html">Accueil</a><a href="portfolio.html">Portfolio</a><a href="a-propos.html">À propos</a><a href="contact.html">Contact</a></div>' +
                '<div><h4>Savoir-faire</h4><a href="creation-graphique.html">Création graphique</a><a href="creation-print.html">Création Print</a><a href="sites-web.html">Sites internet</a><a href="identite-visuelle.html">Identité visuelle</a><a href="ux-ui.html">UX / UI Design</a></div>' +
                '<div><h4>Informations</h4><a href="mentions-legales.html">Mentions légales</a><a href="cgu.html">CGU</a><a href="politique-confidentialite.html">Politique de confidentialité</a></div></div>' +
                '<div class="kf-bot"><p>© 2026 UIPACT — Tous droits réservés.</p><p>Conçu et développé par Barrot Léo</p></div></div></div>' +
                '<div class="kf-wm" aria-hidden="true"><svg viewBox="0 0 900 200"><text x="450" y="170" text-anchor="middle" font-size="230">UIPACT</text></svg></div>';
            var wm = ft.querySelector('.kf-wm svg'), tx = wm.querySelector('text');
            var fit = function () { try { var b = tx.getBBox(); wm.setAttribute('viewBox', b.x + ' ' + b.y + ' ' + b.width + ' ' + b.height); } catch (e) {} };
            (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(fit); addEventListener('resize', fit);
        }
    });
})();
