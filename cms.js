/* UIPACT — client du back-office : applique les modifications faites dans l'admin (textes, couleurs, images,
   carrousels, header, footer, langues). S'exécute AVANT theme.js. Sans API configurée, ne fait rien. */
(function () {
  var API = String(window.UIPACT_API || '').replace(/\/$/, '');
  var LIVE = API && !/REMPLACER/.test(API);
  var SKIP = /^(SCRIPT|STYLE|NOSCRIPT|SVG|IFRAME|TEXTAREA)$/;
  var LANGS = { fr: 'Français', en: 'English', es: 'Español', de: 'Deutsch', it: 'Italiano', pt: 'Português', nl: 'Nederlands' };
  var DEF = {
    theme: { gold: '#C9A24B', gold2: '#E4C77A', navy: '#101B3D', navy2: '#1C2C5C', bg: '#0A1024', bgAlt: '#131F42', card: '#16204A', text: '#EDEAE0', lightBg: '#FAF7F1', lightAlt: '#F1EAD9' },
    header: {
      brand: 'UIPACT', cta: { label: 'Contact', href: 'contact.html' },
      items: [{ label: 'Accueil', href: 'index.html#hero' }, { label: 'Mes savoir-faire', href: '#' }, { label: 'Portfolio', href: 'portfolio.html' }, { label: 'À propos', href: 'a-propos.html' }],
      dropdown: [{ label: 'Création graphique', href: 'creation-graphique.html' }, { label: 'Création Print', href: 'creation-print.html' }, { label: 'Sites internet', href: 'sites-web.html' }, { label: 'Identité visuelle', href: 'identite-visuelle.html' }, { label: 'UX / UI Design', href: 'ux-ui.html' }]
    },
    footer: {
      brand: 'UIPACT', tag1: 'Agence de conception visuelle & web.', tag2: 'Identité de marque, print et sites internet pensés pour convertir.',
      follow: 'Suivez-nous !', instagram: 'https://www.instagram.com/uipact/', lucky: 'Un projet ?', luckyHref: 'contact.html',
      copyright: '© 2026 UIPACT — Tous droits réservés.', signature: 'Conçu et développé par Barrot Léo',
      columns: [
        { title: 'Navigation', links: [{ label: 'Accueil', href: 'index.html' }, { label: 'Portfolio', href: 'portfolio.html' }, { label: 'À propos', href: 'a-propos.html' }, { label: 'Contact', href: 'contact.html' }] },
        { title: 'Savoir-faire', links: [{ label: 'Création graphique', href: 'creation-graphique.html' }, { label: 'Création Print', href: 'creation-print.html' }, { label: 'Sites internet', href: 'sites-web.html' }, { label: 'Identité visuelle', href: 'identite-visuelle.html' }, { label: 'UX / UI Design', href: 'ux-ui.html' }] },
        { title: 'Informations', links: [{ label: 'Mentions légales', href: 'mentions-legales.html' }, { label: 'CGU', href: 'cgu.html' }, { label: 'Politique de confidentialité', href: 'politique-confidentialite.html' }] }
      ]
    }
  };
  var PAGES = ['index', 'a-propos', 'portfolio', 'creation-graphique', 'creation-print', 'sites-web', 'identite-visuelle', 'ux-ui', 'contact', 'mentions-legales', 'cgu', 'politique-confidentialite'];
  function pk() { return location.pathname.split('/').pop().replace(/\.html$/, '') || 'index'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function merge(a, b) { var o = JSON.parse(JSON.stringify(a)); Object.keys(b || {}).forEach(function (k) { if (b[k] !== undefined && b[k] !== '') o[k] = b[k]; }); return o; }

  // Découpe stable d'une page en « éléments de texte » (e0, e1…) et « images » (i0, i1…). Utilisé aussi par l'admin.
  function scan(doc) {
    var out = [], n = 0;
    (function walk(el) {
      if (SKIP.test(el.tagName) || (el.classList && el.classList.contains('no-cms'))) return;
      var nodes = [];
      for (var i = 0; i < el.childNodes.length; i++) { var c = el.childNodes[i]; if (c.nodeType === 3 && c.nodeValue.trim()) nodes.push({ i: i, node: c }); }
      if (nodes.length) out.push({ key: 'e' + (n++), el: el, nodes: nodes, chrome: !!el.closest('header,footer') });
      for (var j = 0; j < el.children.length; j++) walk(el.children[j]);
    })(doc.body);
    return out;
  }
  function hsh(t) { var x = 5381; for (var i = 0; i < t.length; i++) x = ((x << 5) + x + t.charCodeAt(i)) | 0; return (x >>> 0).toString(36); }
  var UI = ["Un", "Graphiste", "Web designer", "Créatif", "Stratège", "passionné par l'art et la technique.", "Voir —", "Démarrer un projet", "Découvrir", "Voir le portfolio", "Un projet de site ou de logo ? Parlons-en 👋", "Fermer", "Méthode", "Trois étapes,", "un résultat", "Stratégie", "Comprendre votre projet, vos objectifs et votre cible avant de dessiner la moindre ligne.", "Créativité", "Concevoir une identité et des interfaces qui vous démarquent et racontent votre histoire.", "Précision", "Livrer des fichiers et des pages soignés, prêts à être utilisés partout.", "Savoir-faire", "Le studio,", "de A à Z", "Création graphique", "Logo · Identité · Supports", "Création print", "Cartes · Flyers · Affiches", "Sites internet", "Vitrine · One-page", "Identité visuelle", "Charte · Rédaction", "UX / UI design", "Maquettes · Prototypes", "Votre prochain projet", "commence ici", "Parlons de votre vision : stratégie, créativité et précision au service de votre image.", "Dites bonjour 👋", "Un projet de logo, de site, de print ou d'application ? Décrivez-le, je reviens vers vous.", "Disponible pour de nouveaux projets", "Services souhaités", "Site internet", "Autre", "Envoi en cours…", "Message envoyé !", "Merci, je reviens vers vous très vite.", "Du concept au", "site en ligne", "Wireframe", "La structure et le parcours de vos visiteurs, posés avant toute décoration.", "Palette", "Typographie", "Design", "Palette de couleurs, typographies et identité : votre univers visuel prend forme.", "Interface", "Intégration", "Interfaces soignées, pensées pour s'afficher parfaitement sur mobile comme sur ordinateur.", "En ligne", "● En ligne", "Votre site,", "prêt à convaincre", "Toutes les couches s'assemblent : votre site est prêt à convaincre.", "Étude de cas", "Description du projet", "Le contexte", "L'enjeu", "Notre approche", "Le résultat", "Services fournis", "Client", "Localisation", "Site web", "Prestation", "Nous contacter", "Projet suivant", "Un projet similaire ?", "Parlons de votre projet, sans engagement.", "France", "Développement web", "UX / UI Design", "UI", "UX", "SEO", "Branding", "Logo", "Figma", "Prototype", "Print", "Direction artistique", "Mise en page", "Une interface pensée pour convertir.", "Maquettes, hiérarchie visuelle et parcours simplifiés pour guider le visiteur jusqu'à l'action.", "Un site fluide sur tous les écrans.", "Développement responsive, rapide et soigné, du mobile au grand écran.", "Des bases solides pour le référencement.", "Structure propre, balises et contenus pensés pour apparaître sur Google.", "Une idée forte.", "Recherche de territoire de marque, de symboles et de références avant de dessiner.", "Un système cohérent.", "Logo, couleurs et typographies déclinés pour fonctionner partout.", "Des fichiers prêts à l'emploi.", "Livraison des formats utiles pour le web, le print et les réseaux sociaux.", "Comprendre les usages.", "Définition des besoins et des parcours avant toute maquette.", "Des écrans clairs et cohérents.", "Wireframes puis maquettes haute fidélité sur Figma, avec un design system.", "Un prototype testable.", "Parcours interactif pour valider les choix avant le développement.", "Un message lisible en un coup d'œil.", "Hiérarchie visuelle et mise en page travaillées pour capter l'attention.", "Une identité respectée.", "Couleurs, typographies et visuels alignés sur la charte du client.", "Des fichiers prêts à imprimer.", "Export aux bons formats, avec fonds perdus et profils couleur adaptés.", "Me contacter", "Portfolio", "Réalisations", "Le portfolio en", "Un projet ?", "La démonstration en vidéo", "Accueil", "À propos", "Contact", "Mentions légales", "© 2026 UIPACT — Tous droits réservés.", "Agence de conception visuelle & web."];
  window.CMS = { UI: UI, hsh: hsh, scan: scan, DEF: DEF, PAGES: PAGES, LANGS: LANGS, esc: esc, merge: merge, pk: pk };
  window.__cmsPK = pk;
  if (window.CMS_ADMIN) return;

  try { var ql = new URLSearchParams(location.search).get('lang'); if (ql && /^[a-z]{2,3}(-[a-z]{2,4})?$/.test(ql)) localStorage.setItem('uipact_lang', ql); } catch (e) {}
  var lang = localStorage.getItem('uipact_lang') || 'fr';
  var T = {}, D = {};
  function tr(id, fb) { return T[id] != null && T[id] !== '' ? T[id] : fb; }
  window.__u = function (s) { var v = T['ui_' + hsh(s)]; return v ? v : s; };
  window.__cmsTr = tr;
  window.__cmsPrj = {};

  // Traduit les textes ajoutés par les scripts du site (boutons, mots qui défilent, messages…)
  function uiNode(n) {
    var raw = n.nodeValue, t = raw.trim(); if (!t) return;
    var v = T['ui_' + hsh(t)]; if (!v || v === t) return;
    var m = raw.match(/^(\s*)[\s\S]*?(\s*)$/); n.nodeValue = m[1] + v + m[2];
  }
  function uiWalk(root) {
    if (root.nodeType === 3) { uiNode(root); return; }
    if (root.nodeType !== 1 || SKIP.test(root.tagName) || (root.closest && root.closest('.no-cms'))) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), n, list = [];
    while ((n = w.nextNode())) { if (!SKIP.test(n.parentNode.tagName)) list.push(n); }
    list.forEach(uiNode);
  }
  function startUI() {
    if (lang === 'fr' || window.__cmsUI) return; window.__cmsUI = true;
    uiWalk(document.body);
    new MutationObserver(function (ms) {
      ms.forEach(function (m) {
        if (m.type === 'characterData') uiWalk(m.target);
        else m.addedNodes.forEach(uiWalk);
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  function theme(th) {
    th = merge(DEF.theme, th || {});
    function rgb(h) { return parseInt(h.slice(1, 3), 16) + ',' + parseInt(h.slice(3, 5), 16) + ',' + parseInt(h.slice(5, 7), 16); }
    var css = ':root{--c-gold:' + th.gold + ';--c-gold-rgb:' + rgb(th.gold) + ';--c-gold2:' + th.gold2 + ';--c-gold2-rgb:' + rgb(th.gold2) + ';--c-navy:' + th.navy + ';--c-navy2:' + th.navy2 + ';--c-bg:' + th.bg +
      ';--color-gold:' + th.gold + ';--color-gold-light:' + th.gold2 + ';--color-navy:' + th.navy + ';--color-navy-light:' + th.navy2 + ';--color-purple-dark:' + th.gold + ';--color-fuchsia-vibrant:' + th.gold +
      ';--color-blue-dark:' + th.navy + ';--color-cyan-vibrant:' + th.navy + ';--bg-color:' + th.lightBg + ';--bg-alt-color:' + th.lightAlt + '}' +
      'html[data-theme="dark"]{--bg-color:' + th.bg + ';--bg-alt-color:' + th.bgAlt + ';--card-bg:' + th.card + ';--text-color:' + th.text + '}' +
      '.cms-lang{background:transparent;color:inherit;border:1px solid rgba(var(--c-gold-rgb),.5);border-radius:99px;padding:6px 10px;font:inherit;font-size:.78rem;cursor:pointer;margin-right:10px}';
    var s = document.getElementById('cms-theme') || document.createElement('style'); s.id = 'cms-theme'; s.textContent = css; document.head.appendChild(s);
  }
  function setLabel(a, v) { for (var i = 0; i < a.childNodes.length; i++) { var c = a.childNodes[i]; if (c.nodeType === 3 && c.nodeValue.trim()) { var m = c.nodeValue.match(/^(\s*)[\s\S]*?(\s*)$/); c.nodeValue = m[1] + v + m[2]; return; } } a.insertBefore(document.createTextNode(v), a.firstChild); }

  function pageContent(d) {
    var pg = pk(), t = (d.texts || {})[pg] || {}, hid = (d.hidden || {})[pg] || [], bl = (d.blocks || {})[pg] || [], im = (d.images || {})[pg] || {};
    var S = scan(document), byKey = {};
    S.forEach(function (s) {
      byKey[s.key] = s;
      s.nodes.forEach(function (nd) {
        var k = s.key + '_' + nd.i, v = tr(pg + '__' + k, t[k]);
        if (v != null) { var m = nd.node.nodeValue.match(/^(\s*)[\s\S]*?(\s*)$/); nd.node.nodeValue = m[1] + v + m[2]; }
      });
    });
    hid.forEach(function (k) { if (byKey[k]) byKey[k].el.style.display = 'none'; });
    bl.forEach(function (b) {
      var s = byKey[b.after]; if (!s) return;
      var e = document.createElement(b.tag || 'p'); e.className = 'cms-block ' + (s.el.className || ''); e.textContent = tr(pg + '__b' + b.id, b.text);
      s.el.parentNode.insertBefore(e, s.el.nextSibling);
    });
    var imgs = document.body.querySelectorAll('img');
    Object.keys(im).forEach(function (k) { var el = imgs[+k.slice(1)]; if (el && im[k]) { el.removeAttribute('srcset'); el.src = im[k]; } });
  }
  function header(d) {
    var H = merge(DEF.header, d.header || {}), nav = document.querySelector('header .nav-links'); if (!nav) return;
    var b = document.querySelector('.brand-name'); if (b && d.header && d.header.brand) setLabel(b, d.header.brand);
    var tops = nav.querySelectorAll(':scope > li > a');
    (H.items || []).forEach(function (it, i) { var a = tops[i]; if (!a) return; setLabel(a, tr('hdr_i' + i, it.label)); if (it.href && it.href !== '#') a.setAttribute('href', it.href); });
    var dd = nav.querySelector('.dropdown-content');
    if (dd && d.header && Array.isArray(d.header.dropdown)) { dd.innerHTML = ''; H.dropdown.forEach(function (l, i) { var a = document.createElement('a'); a.href = l.href; a.textContent = tr('hdr_d' + i, l.label); dd.appendChild(a); }); }
    else if (dd) [].forEach.call(dd.querySelectorAll('a'), function (a, i) { var v = T['hdr_d' + i]; if (v) a.textContent = v; });
    var c = document.querySelector('.cta-menu-button');
    if (c) { setLabel(c, tr('hdr_cta', H.cta.label)); if (d.header && d.header.cta && d.header.cta.href) c.setAttribute('href', d.header.cta.href); }
    var names = merge(LANGS, d.langNames || {}), langs = (d.languages || []).filter(function (l) { return names[l]; });
    if (langs.length > 1 && !document.querySelector('.cms-lang')) {
      var sel = document.createElement('select'); sel.className = 'cms-lang'; sel.setAttribute('aria-label', 'Langue');
      langs.forEach(function (l) { var o = document.createElement('option'); o.value = l; o.textContent = names[l]; if (l === lang) o.selected = true; sel.appendChild(o); });
      sel.onchange = function () { localStorage.setItem('uipact_lang', sel.value); location.reload(); };
      var tg = nav.parentNode.querySelector('.theme-toggle') || document.getElementById('themeToggle');
      (tg && tg.parentNode ? tg.parentNode : nav.parentNode).insertBefore(sel, tg || nav);
    }
  }
  window.__cmsFooter = function (igh) {
    var F = merge(DEF.footer, D.footer || {}), cols = (D.footer && D.footer.columns) || DEF.footer.columns;
    var h = '<div class="kf"><div class="kf-l"><div class="kf-logo"><img src="logo.png" alt="' + esc(F.brand) + '"><b>' + esc(F.brand) + '</b></div><p class="kf-tag">' + esc(tr('ftr_tag1', F.tag1)) + '<br><span>' + esc(tr('ftr_tag2', F.tag2)) +
      '</span></p><div class="kf-soc"><a class="kf-follow" href="' + esc(F.instagram) + '" target="_blank" rel="noopener noreferrer">' + esc(tr('ftr_follow', F.follow)) + '</a><div class="social-links">' + (igh || '') + '</div></div></div>' +
      '<div class="kf-r"><a class="kf-lucky" href="' + esc(F.luckyHref) + '"><span><img src="logo.png" alt="' + esc(F.brand) + '"></span><em>' + esc(tr('ftr_lucky', F.lucky)) + '</em></a><div class="kf-cols">';
    cols.forEach(function (c, i) { h += '<div><h4>' + esc(tr('ftr_c' + i + '_t', c.title)) + '</h4>'; (c.links || []).forEach(function (l, j) { h += '<a href="' + esc(l.href) + '">' + esc(tr('ftr_c' + i + '_l' + j, l.label)) + '</a>'; }); h += '</div>'; });
    return h + '</div><div class="kf-bot"><p>' + esc(tr('ftr_copy', F.copyright)) + '</p><p>' + esc(tr('ftr_sig', F.signature)) + '</p></div></div></div>';
  };
  function seo(d) {
    var S = d.seo || {}, g = S.site || {}, pg = pk(), p = (S.pages || {})[pg] || {};
    if (S.mode === 'off') return; // un autre outil (ex. plugin SEO de WordPress) gère déjà les balises : on n'y touche pas
    function abs(u) { try { return new URL(u, location.href).href; } catch (e) { return u; } }
    function meta(attr, name, val) { if (val == null || val === '') return; var m = document.querySelector('meta[' + attr + '="' + name + '"]'); if (!m) { m = document.createElement('meta'); m.setAttribute(attr, name); document.head.appendChild(m); } m.setAttribute('content', val); }
    function link(rel, href) { if (!href) return; var l = document.querySelector('link[rel="' + rel + '"]'); if (!l) { l = document.createElement('link'); l.setAttribute('rel', rel); document.head.appendChild(l); } l.setAttribute('href', href); }
    var title = tr('seo_' + pg + '_t', p.title), desc = tr('seo_' + pg + '_d', p.description) || tr('seo_site_d', g.description), img = p.image || g.image;
    var ogT = tr('seo_' + pg + '_ot', p.ogTitle) || title || document.title, ogD = tr('seo_' + pg + '_od', p.ogDescription) || desc;
    var url = p.canonical || ((document.querySelector('link[rel="canonical"]') || {}).href) || (location.origin + location.pathname);
    if (title) document.title = title;
    meta('name', 'description', desc); meta('name', 'keywords', p.keywords || g.keywords); meta('name', 'author', g.author); meta('name', 'theme-color', g.themeColor);
    meta('name', 'google-site-verification', g.googleVerify); meta('name', 'msvalidate.01', g.bingVerify);
    if (p.canonical) link('canonical', p.canonical);
    var rb = []; if (p.noindex || g.noindex) rb.push('noindex'); if (p.nofollow || g.nofollow) rb.push('nofollow'); if (p.noarchive) rb.push('noarchive');
    if (rb.length) meta('name', 'robots', rb.join(','));
    meta('property', 'og:type', p.ogType || 'website'); meta('property', 'og:url', url); meta('property', 'og:locale', lang === 'fr' ? 'fr_FR' : lang);
    meta('property', 'og:title', ogT); meta('property', 'og:description', ogD); meta('property', 'og:site_name', g.name); meta('property', 'og:image', img && abs(img));
    meta('name', 'twitter:card', img ? 'summary_large_image' : 'summary'); meta('name', 'twitter:title', ogT); meta('name', 'twitter:description', ogD); meta('name', 'twitter:image', img && abs(img)); meta('name', 'twitter:site', g.twitter);
    ['cms-ld', 'cms-ld2'].forEach(function (id) { var o = document.getElementById(id); if (o) o.remove(); });
    var sc = S.schema;
    if (sc && sc.enabled) {
      var base = sc.url || location.origin + location.pathname.replace(/[^/]*$/, '');
      var ld = { '@context': 'https://schema.org', '@type': sc.type || 'ProfessionalService', name: sc.name || g.name || 'UIPACT', url: base };
      if (sc.logo) ld.logo = abs(sc.logo); if (sc.email) ld.email = sc.email; if (sc.phone) ld.telephone = sc.phone; if (sc.description || g.description) ld.description = sc.description || g.description;
      if (sc.street || sc.city || sc.postalCode) ld.address = { '@type': 'PostalAddress', streetAddress: sc.street, postalCode: sc.postalCode, addressLocality: sc.city, addressCountry: sc.country };
      if (sc.sameAs && sc.sameAs.length) ld.sameAs = sc.sameAs;
      var put = function (id, o) { var el = document.createElement('script'); el.type = 'application/ld+json'; el.id = id; el.textContent = JSON.stringify(o); document.head.appendChild(el); };
      put('cms-ld', ld);
      if (sc.breadcrumbs !== false && pg !== 'index') put('cms-ld2', { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Accueil', item: base }, { '@type': 'ListItem', position: 2, name: title || document.title, item: url }] });
    }
  }
  function run(d) {
    D = d; T = (d.translations || {})[lang] || {};
    window.__cmsSec = d.sections || {}; window.__cmsTr = tr; window.__cmsPrj = d.projects || {};
    window.__cmsCar = {};
    Object.keys(d.carousels || {}).forEach(function (k) { window.__cmsCar[k] = (d.carousels[k] || []).map(function (x, i) { return { image: x.image, href: x.href, title: tr('car_' + k + '_' + i + '_t', x.title), subtitle: tr('car_' + k + '_' + i + '_s', x.subtitle) }; }); });
    theme(d.theme); pageContent(d); header(d); seo(d); startUI();
    if (lang !== 'fr') document.documentElement.lang = lang;
    document.documentElement.dir = /^(ar|he|fa|ur)/.test(lang) ? 'rtl' : 'ltr';
  }

  if (!LIVE) return;
  var KEY = 'uipact_cms_' + lang, raw = localStorage.getItem(KEY);
  document.addEventListener('DOMContentLoaded', function () {
    var d = null; try { d = raw && JSON.parse(raw); } catch (e) {}
    if (d) { try { run(d); } catch (e) { console.error('cms', e); } }
    fetch(API + '/api/site?lang=' + lang, { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (nd) {
      var s = JSON.stringify(nd);
      if (s === raw) return;
      localStorage.setItem(KEY, s);
      var last = +sessionStorage.getItem('cmsr') || 0;
      if (Date.now() - last > 8000 && (raw || Object.keys(nd).length > 1)) { sessionStorage.setItem('cmsr', Date.now()); location.reload(); }
    }).catch(function () {});
  });
})();
