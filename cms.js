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
  var EDIT = /[?&]cmsedit=1(&|$)/.test(location.search) && window.parent !== window;
  if (EDIT) visualEdit();

  try { var ql = new URLSearchParams(location.search).get('lang'); if (ql && /^[a-z]{2,3}(-[a-z]{2,4})?$/.test(ql)) localStorage.setItem('uipact_lang', ql); } catch (e) {}
  var lang = EDIT ? 'fr' : (localStorage.getItem('uipact_lang') || 'fr');
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
    var lastB = {};
    bl.forEach(function (b) {
      var s = byKey[b.after]; if (!s) return;
      var e = document.createElement(b.tag || 'p'); e.className = 'cms-block ' + (s.el.className || ''); e.textContent = tr(pg + '__b' + b.id, b.text);
      var prev = lastB[b.after] || s.el; prev.parentNode.insertBefore(e, prev.nextSibling); lastB[b.after] = e;
    });
    var imgs = document.body.querySelectorAll('img'), bgs = [].filter.call(document.body.querySelectorAll('[style*="background"]'), function (e) { return /url\(/.test(e.getAttribute('style') || ''); });
    Object.keys(im).forEach(function (k) {
      if (!im[k]) return;
      if (k.charAt(0) === 'b') { var b = bgs[+k.slice(1)]; if (b) b.style.backgroundImage = 'url("' + im[k] + '")'; }
      else { var el = imgs[+k.slice(1)]; if (el) { el.removeAttribute('srcset'); el.src = im[k]; } }
    });
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
    var h = '<div class="kf"><div class="kf-l"><div class="kf-logo" data-fe="brand"><img src="logo.png" alt="' + esc(F.brand) + '"><b>' + esc(F.brand) + '</b></div><p class="kf-tag" data-fe="tag">' + esc(tr('ftr_tag1', F.tag1)) + '<br><span>' + esc(tr('ftr_tag2', F.tag2)) +
      '</span></p><div class="kf-soc"><a class="kf-follow" data-fe="follow" href="' + esc(F.instagram) + '" target="_blank" rel="noopener noreferrer">' + esc(tr('ftr_follow', F.follow)) + '</a><div class="social-links">' + (igh || '') + '</div></div></div>' +
      '<div class="kf-r"><a class="kf-lucky" data-fe="lucky" href="' + esc(F.luckyHref) + '"><span><img src="logo.png" alt="' + esc(F.brand) + '"></span><em>' + esc(tr('ftr_lucky', F.lucky)) + '</em></a><div class="kf-cols">';
    cols.forEach(function (c, i) { h += '<div><h4 data-fe="c' + i + '">' + esc(tr('ftr_c' + i + '_t', c.title)) + '</h4>'; (c.links || []).forEach(function (l, j) { h += '<a data-fe="c' + i + 'l' + j + '" href="' + esc(l.href) + '">' + esc(tr('ftr_c' + i + '_l' + j, l.label)) + '</a>'; }); h += '</div>'; });
    return h + '</div><div class="kf-bot"><p data-fe="copy">' + esc(tr('ftr_copy', F.copyright)) + '</p><p data-fe="sig">' + esc(tr('ftr_sig', F.signature)) + '</p></div></div></div>';
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

  if (!LIVE || EDIT) return;
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
  /* ===== Éditeur visuel : la page s'affiche dans l'admin (iframe « ?cmsedit=1&m=… »). L'admin envoie l'état en cours
     (sessionStorage au chargement, messages ensuite) et reçoit les clics. Rien n'est chargé ni enregistré depuis ici. ===== */
  function visualEdit() {
    var M = (location.search.match(/[?&]m=([a-z]+)/) || [])[1] || 'texts', pg = pk(), ed = {};
    try { ed = JSON.parse(sessionStorage.getItem('uipact_edit') || '{}'); } catch (e) {}
    var st = { texts: (ed.texts || {})[pg] || {}, hidden: (ed.hidden || {})[pg] || [], blocks: (ed.blocks || {})[pg] || [], images: (ed.images || {})[pg] || {}, theme: ed.theme || null };
    var items = {}, groups = {}, imgs = {}, sel = null, hov = null, bar = null, hideT, SEL = { texts: '[data-cms],[data-cms-block]', images: '[data-cms-img]', projects: '[data-project]', header: '[data-fe]', footer: '[data-fe]' }[M] || null;
    var SECSEL = '.role-line,.cta-ghost,.st-txt,.sc3-txt,.sc3-scene,.p3-txt,.p3-stage';
    function secName(t) { return t.matches('.role-line,.cta-ghost') ? 'hero' : t.matches('.st-txt') ? 'statement' : t.matches('.sc3-txt,.sc3-scene') ? 'showcase' : t.matches('.p3-txt,.p3-stage') ? 'method' : null; }
    function secStep(n) { if (n === 'showcase') { var e = document.querySelector('.sc3-n'); return (parseInt(e && e.textContent, 10) || 1) - 1; } if (n === 'method') { var l = [].slice.call(document.querySelectorAll('.p3-steps li')); return Math.max(0, l.findIndex(function (x) { return x.classList.contains('on'); })); } return 0; }
    var I = {
      edit: '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zM20.7 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',
      add: '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>',
      del: '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M19 13H5v-2h14v2z"/></svg>',
      restore: '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.09-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>'
    };
    function send(m) { m.source = 'uipact-preview'; window.parent.postMessage(m, location.origin); }
    function target(e) { var t = e.target; if (!t || !t.closest) return null; if (M === 'texts') { var s = t.closest(SECSEL); if (s) return s; } return SEL ? t.closest(SEL) : null; }
    function hide() { if (bar) bar.style.display = 'none'; if (hov) hov.classList.remove('cms-hov'); hov = null; }
    function cfg(t) {
      if (M === 'texts' && secName(t)) return { edit: 'Modifier ce texte / cette animation', add: null, del: null };
      if (M === 'header' || M === 'footer') {
        var k = t.getAttribute('data-fe'), col = /^c\d+$/.test(k), dd = M === 'header' ? /^d\d+$/.test(k) : /^c\d+l\d+$/.test(k);
        return { edit: 'Modifier', add: dd ? 'Ajouter un lien après celui-ci' : (col ? 'Ajouter un lien dans cette colonne' : null), del: dd ? ['del', 'Supprimer ce lien'] : (col ? ['del', 'Supprimer cette colonne'] : null) };
      }
      if (M === 'texts') { var b = t.hasAttribute('data-cms-block'), off = !b && st.hidden.indexOf(t.getAttribute('data-cms')) > -1; return { edit: off ? null : 'Modifier ce texte', add: off ? null : 'Ajouter un texte en dessous', del: off ? ['restore', 'Afficher à nouveau ce texte'] : ['del', b ? 'Supprimer ce texte' : 'Masquer ce texte'] }; }
      if (M === 'images') return { edit: 'Changer la photo', add: null, del: st.images[t.getAttribute('data-cms-img')] ? ['restore', 'Remettre la photo d’origine'] : null };
      return { edit: 'Modifier la fiche de ce projet', add: 'Ajouter un projet', del: ((ed.projects || {})[t.getAttribute('data-project')] || {}).custom ? ['del', 'Supprimer ce projet'] : null };
    }
    function place(t) {
      clearTimeout(hideT); if (hov && hov !== t) hov.classList.remove('cms-hov');
      hov = t; t.classList.add('cms-hov');
      var c = cfg(t), e = bar.querySelector('[data-s=edit]'), a = bar.querySelector('[data-s=add]'), d = bar.querySelector('[data-s=del]');
      e.style.display = c.edit ? '' : 'none'; e.title = c.edit || ''; a.style.display = c.add ? '' : 'none'; a.title = c.add || '';
      d.style.display = c.del ? '' : 'none'; if (c.del) { d.setAttribute('data-a', c.del[0]); d.innerHTML = I[c.del[0]]; d.title = c.del[1]; }
      bar.style.display = 'flex';
      var r = t.getBoundingClientRect(), w = bar.offsetWidth || 100, left = Math.min(Math.max(4, r.right - w), window.innerWidth - w - 4), top = r.top - 36;
      if (top < 4) top = Math.min(r.bottom + 6, window.innerHeight - 40);
      bar.style.left = left + 'px'; bar.style.top = top + 'px';
    }
    function act(a) {
      if (!hov) return;
      var key = hov.getAttribute('data-cms'), blk = hov.getAttribute('data-cms-block'), im = hov.getAttribute('data-cms-img'), pr = hov.getAttribute('data-project');
      if (M === 'header' || M === 'footer') return send({ type: 'fe', action: a, key: hov.getAttribute('data-fe') });
      if (M === 'texts' && secName(hov)) { var sn = secName(hov); return send({ type: 'sec', name: sn, step: secStep(sn) }); }
      if (M === 'images') return send({ type: a === 'edit' ? 'img' : 'imgreset', key: im });
      if (M === 'projects') return send({ type: 'proj', action: a, id: pr });
      if (a === 'edit') {
        if (blk) send({ type: 'edit', block: blk });
        else { var g = groups[items[key].gid]; send({ type: 'edit', key: key, tag: items[key].el.tagName.toLowerCase(), members: g.map(function (k) { return { key: k, nodes: items[k].nodes.map(function (n) { return { k: n.k, orig: n.orig.trim() }; }) }; }) }); }
      } else if (a === 'add') send(blk ? { type: 'add', block: blk } : { type: 'add', after: key });
      else if (a === 'del') send(blk ? { type: 'remove', block: blk } : { type: 'remove', keys: groups[items[key].gid] });
      else if (a === 'restore') send({ type: 'restore', keys: groups[items[key].gid] });
    }
    function select(m) {
      [].forEach.call(document.querySelectorAll('.cms-sel'), function (e) { e.classList.remove('cms-sel'); });
      sel = m || sel; if (!sel) return;
      var el = sel.img ? imgs[sel.img] : sel.block ? document.querySelector('[data-cms-block="' + sel.block + '"]') : (items[sel.key] && items[sel.key].el);
      if (!el) return; el.classList.add('cms-sel');
      var r = el.getBoundingClientRect(); if (r.bottom < 60 || r.top > window.innerHeight - 60) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    function goScroll(v) { if (v == null) return; if (/^[#.]/.test(String(v))) { var el = document.querySelector(v); if (el) el.scrollIntoView({ block: 'start', behavior: 'instant' }); } else window.scrollTo({ top: +v || 0, behavior: 'instant' }); }
    function apply() {
      Object.keys(items).forEach(function (key) {
        var it = items[key];
        it.nodes.forEach(function (n) {
          var v = st.texts[n.k]; if (v == null) v = n.orig.trim();
          if (n.node.isConnected) { var m = n.node.nodeValue.match(/^(\s*)[\s\S]*?(\s*)$/); n.node.nodeValue = m[1] + v + m[2]; }
          else if (it.nodes.length === 1) it.el.textContent = v;
        });
        it.el.classList.toggle('cms-off', st.hidden.indexOf(key) > -1);
      });
      if (M === 'texts') {
        [].forEach.call(document.querySelectorAll('.cms-block'), function (b) { b.remove(); });
        var last = {};
        st.blocks.forEach(function (b) {
          var it = items[b.after]; if (!it) return;
          var e = document.createElement(b.tag || 'p'); e.className = 'cms-block ' + (it.el.className || '').replace(/\bcms-(off|hov|sel)\b/g, ''); e.textContent = b.text; e.setAttribute('data-cms-block', b.id);
          var prev = last[b.after] || it.el; prev.parentNode.insertBefore(e, prev.nextSibling); last[b.after] = e;
        });
      }
      Object.keys(imgs).forEach(function (k) {
        var el = imgs[k], u = st.images[k];
        if (k[0] === 'i') { if (u) { el.removeAttribute('srcset'); el.src = u; } else if (el.__o != null) { el.src = el.__o; } }
        else if (u) el.style.backgroundImage = 'url("' + u + '")'; else if (el.__s != null) el.setAttribute('style', el.__s);
      });
      try { if (st.theme) theme(st.theme); } catch (e) {}
      select();
      if (hov && bar && bar.style.display === 'flex') place(hov);
    }
    function pageOf(href) {
      var m = String(href || '').split('#')[0].split('?')[0]; if (!m || /^(https?:|mailto:|tel:|javascript:)/i.test(m)) return null;
      m = m.replace(/^.*\//, ''); var k = m ? m.replace(/\.html$/, '') : 'index'; return PAGES.indexOf(k) > -1 ? k : null;
    }
    function init() {
      var css = document.createElement('style');
      css.textContent = '#instaPopup,.popup-overlay{display:none!important}.cms-hov{outline:2px dashed #C9A24B!important;outline-offset:3px}.cms-sel{outline:2px solid #E4C77A!important;outline-offset:3px}' +
        '.cms-off{opacity:.3!important;text-decoration:line-through!important}.cms-block{opacity:1!important;transform:none!important;visibility:visible!important}' +
        '.cms-bar{position:fixed;z-index:2147483647;display:none;gap:3px;padding:3px;background:#101B3D;border:1px solid #C9A24B;border-radius:99px;box-shadow:0 8px 24px rgba(0,0,0,.45)}' +
        '.cms-bar button{all:unset;box-sizing:border-box;width:28px;height:28px;display:grid;place-items:center;border-radius:50%;color:#E4C77A;cursor:pointer}.cms-bar button:hover{background:#C9A24B;color:#101B3D}';
      document.head.appendChild(css);
      if (M === 'texts') {
        var gm = {}, n = 0;
        scan(document).forEach(function (s) {
          var txt = s.nodes.map(function (x) { return x.node.nodeValue.trim(); }).join(' ');
          if (s.chrome || !/[A-Za-zÀ-ÿ]/.test(txt)) return;
          var gid = s.el.tagName + '|' + txt; if (gm[gid] == null) gm[gid] = n++;
          s.el.setAttribute('data-cms', s.key);
          items[s.key] = { el: s.el, gid: gm[gid], nodes: s.nodes.map(function (x) { return { k: s.key + '_' + x.i, node: x.node, orig: x.node.nodeValue }; }) };
          (groups[gm[gid]] = groups[gm[gid]] || []).push(s.key);
        });
      } else if (M === 'images') {
        [].forEach.call(document.body.querySelectorAll('img'), function (im, i) { im.setAttribute('data-cms-img', 'i' + i); im.__o = im.getAttribute('src'); imgs['i' + i] = im; });
        [].filter.call(document.body.querySelectorAll('[style*="background"]'), function (e) { return /url\(/.test(e.getAttribute('style') || ''); }).forEach(function (el, i) { el.setAttribute('data-cms-img', 'b' + i); el.__s = el.getAttribute('style'); imgs['b' + i] = el; });
      }
      // même état que le vrai site (couleurs, animations, carrousels, projets, menu) avant que theme.js ne construise la page
      D = ed; T = {}; window.__cmsSec = ed.sections || {}; window.__cmsTr = tr; window.__cmsPrj = ed.projects || {}; window.__cmsCar = {};
      Object.keys(ed.carousels || {}).forEach(function (k) { window.__cmsCar[k] = (ed.carousels[k] || []).map(function (x) { return { image: x.image, href: x.href, title: x.title, subtitle: x.subtitle }; }); });
      try { theme(ed.theme); header(ed); } catch (e) { console.error(e); }
      if (M === 'header') {
        var nv = document.querySelector('header .nav-links');
        if (nv) { [].forEach.call(nv.querySelectorAll(':scope > li > a'), function (a, i) { a.setAttribute('data-fe', 'i' + i); }); [].forEach.call(nv.querySelectorAll('.dropdown-content a'), function (a, i) { a.setAttribute('data-fe', 'd' + i); }); }
        var bn = document.querySelector('.brand-name'), cb = document.querySelector('.cta-menu-button'); if (bn) bn.setAttribute('data-fe', 'brand'); if (cb) cb.setAttribute('data-fe', 'cta');
      }
      if (SEL) {
        bar = document.createElement('div'); bar.className = 'cms-bar no-cms';
        bar.innerHTML = '<button type="button" data-s="edit" data-a="edit">' + I.edit + '</button><button type="button" data-s="add" data-a="add">' + I.add + '</button><button type="button" data-s="del" data-a="del">' + I.del + '</button>';
        document.body.appendChild(bar);
        bar.addEventListener('mouseover', function () { clearTimeout(hideT); });
        bar.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; e.preventDefault(); e.stopPropagation(); act(b.getAttribute('data-a')); });
        document.addEventListener('mouseover', function (e) { if (bar.contains(e.target)) return; var t = target(e); if (t) place(t); }, true);
        document.addEventListener('mouseout', function () { clearTimeout(hideT); hideT = setTimeout(hide, 400); }, true);
        document.addEventListener('dblclick', function (e) { var t = target(e); if (t && M === 'texts') { place(t); act('edit'); } }, true);
        window.addEventListener('scroll', hide, true);
      }
      document.addEventListener('click', function (e) {
        if (bar && bar.contains(e.target)) return;
        if (M === 'projects') { var c = e.target.closest && e.target.closest('[data-project]'); if (c) { e.preventDefault(); e.stopPropagation(); send({ type: 'proj', action: 'edit', id: c.getAttribute('data-project') }); return; } }
        var a = e.target.closest && e.target.closest('a[href]');
        if (a) { e.preventDefault(); var k = pageOf(a.getAttribute('href')); if (k) send({ type: 'navigate', page: k }); }
      }, true);
      document.addEventListener('submit', function (e) { e.preventDefault(); }, true);
      window.addEventListener('message', function (e) {
        if (e.origin !== location.origin || e.source !== window.parent || !e.data || e.data.source !== 'uipact-admin') return;
        var d = e.data;
        if (d.type === 'state') { st = { texts: d.texts || {}, hidden: d.hidden || [], blocks: d.blocks || [], images: d.images || {}, theme: d.theme || null }; apply(); }
        else if (d.type === 'select') select(d.key || d.block || d.img ? { key: d.key, block: d.block, img: d.img } : null);
        else if (d.type === 'scroll') goScroll(d.sel);
      });
      window.addEventListener('load', function () { setTimeout(function () { var v = null; try { v = sessionStorage.getItem('uipact_edit_scroll'); } catch (e) {} goScroll(v); }, 700); });
      apply();
      send({ type: 'ready', page: pg, list: Object.keys(imgs).map(function (k) { var el = imgs[k]; return { key: k, src: k[0] === 'i' ? el.__o : (((el.__s || '').match(/url\(['"]?([^'")]+)/) || [])[1] || ''), label: k[0] === 'i' ? (el.getAttribute('alt') || 'Image ' + (+k.slice(1) + 1)) : 'Image de fond ' + (+k.slice(1) + 1) }; }) });
    }
    document.addEventListener('DOMContentLoaded', init);
  }
})();
