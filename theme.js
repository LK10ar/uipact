(function () {
    var root = document.documentElement;
    var STORAGE_KEY = 'uipact-theme';

    function getPreferredTheme() {
        var saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') return saved;
        return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }

    // Appliqué immédiatement pour éviter le flash de couleur au chargement
    var initial = getPreferredTheme();
    root.setAttribute('data-theme', initial);
    applyBodyClass(initial);

    function applyBodyClass(theme) {
        // Compatibilité avec d'anciens blocs CSS (ex: body.dark-mode) déjà présents sur certaines pages
        if (document.body) {
            document.body.classList.toggle('dark-mode', theme === 'dark');
        } else {
            document.addEventListener('DOMContentLoaded', function () {
                document.body.classList.toggle('dark-mode', theme === 'dark');
            });
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.body.classList.toggle('dark-mode', root.getAttribute('data-theme') === 'dark');
        var btn = document.getElementById('themeToggle');
        if (!btn) return;

        btn.addEventListener('click', function () {
            var current = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', current);
            document.body.classList.toggle('dark-mode', current === 'dark');
            localStorage.setItem(STORAGE_KEY, current);
        });
    });
})();
