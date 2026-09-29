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

        // Pilule fixe en bas
        var bp = document.createElement('div');
        bp.className = 'bottom-pill';
        bp.innerHTML = '<b>U</b><a href="contact.html">Démarrer un projet</a>';
        if (!document.getElementById('contact') || document.getElementById('contact').tagName !== 'SECTION') {
            body.appendChild(bp);
        } else {
            bp.querySelector('a').setAttribute('href', '#contact');
            body.appendChild(bp);
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

/* ===== MOTION 3D ===== */
(function () {
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.addEventListener('DOMContentLoaded', function () {
        if (reduce) return;

        // Scène 3D : cubes dorés flottants + logo en relief, réagissent à la souris
        var cubes = [
            ['8%', '18%', 90, 26, ''], ['82%', '14%', 60, 20, 'hide-m'], ['70%', '68%', 120, 32, ''],
            ['14%', '72%', 70, 22, 'hide-m'], ['46%', '8%', 40, 16, 'hide-m'], ['92%', '48%', 50, 18, '']
        ];
        document.querySelectorAll('#hero,.page-header,.portfolio-header').forEach(function (host) {
            var big = host.id === 'hero';
            var scene = document.createElement('div');
            scene.className = 'scene3d';
            var rig = document.createElement('div');
            rig.className = 'rig';
            if (big) {
                var lg = document.createElement('img');
                lg.src = 'logo.png'; lg.alt = ''; lg.className = 'logo3d';
                rig.appendChild(lg);
            }
            (big ? cubes : cubes.slice(0, 3)).forEach(function (c, i) {
                var w = document.createElement('div');
                w.className = 'float3d';
                w.style.cssText = 'left:' + c[0] + ';top:' + c[1] + ';animation-delay:-' + (i * 1.3) + 's;transform:translateZ(' + (i % 2 ? 80 : -60) + 'px)';
                var cu = document.createElement('div');
                cu.className = 'cube ' + c[4];
                cu.style.cssText = '--s:' + (big ? c[2] : Math.round(c[2] * .55)) + 'px;--d:' + c[3] + 's';
                for (var k = 0; k < 6; k++) { var f = document.createElement('div'); f.className = 'f'; cu.appendChild(f); }
                w.appendChild(cu); rig.appendChild(w);
            });
            scene.appendChild(rig);
            host.insertBefore(scene, host.firstChild);
            host.addEventListener('mousemove', function (e) {
                var r = host.getBoundingClientRect();
                var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
                rig.style.transform = 'rotateY(' + (x * 18) + 'deg) rotateX(' + (-y * 14) + 'deg)';
            });
            host.addEventListener('mouseleave', function () { rig.style.transform = ''; });
            // Rotation supplémentaire au scroll
            window.addEventListener('scroll', function () {
                var y = Math.min(window.scrollY, 900) / 900;
                scene.style.opacity = 1 - y * .8;
            }, { passive: true });
        });

        // Tilt 3D des cartes
        document.querySelectorAll('.portfolio-item,.service-card,.project-card,.tarif-item').forEach(function (el) {
            el.classList.add('tilt');
            el.addEventListener('mousemove', function (e) {
                var r = el.getBoundingClientRect();
                var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
                el.style.transform = 'perspective(800px) rotateY(' + ((px - .5) * 14) + 'deg) rotateX(' + ((.5 - py) * 14) + 'deg) translateY(-6px)';
                el.style.setProperty('--gx', (px * 100) + '%'); el.style.setProperty('--gy', (py * 100) + '%');
            });
            el.addEventListener('mouseleave', function () { el.style.transform = ''; });
        });
    });
})();
