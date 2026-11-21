/* ============================================================
   assets/js/pages.js —— 各页面的内容渲染
   ------------------------------------------------------------
   日常补内容不用改。每个 HTML 页面是一个"壳"，<body data-page="..."> 标明类型：
     home → index.html            products → pages/products.html
     publications → pages/publications.html
     thinking → pages/thinking.html     post → pages/post.html?id=<slug>
   所有文字都经 Core.t() 取当前语言那一份（内容文件里写成 { zh, en }），界面文字走 Core.ui()。
   依赖 core.js。
   ============================================================ */
(function () {
  'use strict';
  var esc = Core.esc, url = Core.url, page = Core.page, t = Core.t, ui = Core.ui;
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- 共用片段 ---------- */
  function tagDef(id) {
    var list = (window.THINKING && THINKING.tags) || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return { id: id, label: t(list[i].label), desc: t(list[i].desc) };
    return { id: id, label: id, desc: '' };
  }
  // 一篇思考 = 一行：左边日期，右边标题 + 摘要 + 标签。首页和思考页共用。draft: true 的会多一个「写作中」标签
  function postTagsHtml(p) {
    return (p.draft ? [Core.tagHtml(ui('draft'), 'amber')] : [])
      .concat((p.tags || []).map(function (id) { return Core.tagHtml(tagDef(id).label); })).join('');
  }
  function threadHtml(p) {
    return '<a class="thread" href="' + page('post', '?id=' + encodeURIComponent(p.slug)) + '">' +
      '<span class="thread-date">' + esc(Core.fmtDateShort(p.date)) + '</span>' +
      '<div class="thread-main"><h3 class="thread-title">' + esc(t(p.title)) + '</h3><p class="thread-desc">' + esc(t(p.summary)) + '</p>' +
      '<div class="thread-tags">' + postTagsHtml(p) + '</div></div></a>';
  }

  var STATUS = { 'live': ['statusLive', 'green'], 'soon': ['statusSoon', 'amber'], 'private': ['statusPrivate', 'slate'] };
  function productCardHtml(p) {
    var st = STATUS[p.status] || STATUS.soon;
    var link = p.url && p.status !== 'private';
    var tag = link ? 'a' : 'div';
    var href = link ? ' href="' + esc(p.url) + '" target="_blank" rel="noopener"' : '';
    return '<' + tag + ' class="card"' + href + '>' +
      '<div class="card-top">' + Core.tagHtml(ui(st[0]), st[1]) +
        (p.tags || []).slice(0, 1).map(function (x) { return Core.tagHtml(t(x), 'slate'); }).join('') + '</div>' +
      '<h3>' + esc(t(p.title)) + '</h3><p class="card-desc">' + esc(t(p.summary)) + '</p>' +
      (p.note ? '<p class="card-note">' + esc(t(p.note)) + '</p>' : '') +
      (link ? '<div class="card-foot">' + ui('open') + '</div>' : '') + '</' + tag + '>';
  }

  function boldOwnName(s) {
    ((window.PROFILE && PROFILE.authorNames) || []).forEach(function (n) {
      var e = esc(n).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      s = s.replace(new RegExp(e, 'g'), '<strong>' + esc(n) + '</strong>');
    });
    return s;
  }
  var PUB_GROUPS = [
    { status: 'published', labelKey: 'pubPublished', style: 'green' },
    { status: 'submitted', labelKey: 'pubSubmitted', style: 'amber' },
    { status: 'in-prep',   labelKey: 'pubInPrep',    style: 'slate' }
  ];
  function pubStatus(p) { return p.status || 'published'; }
  function groupOf(p) { return PUB_GROUPS.filter(function (g) { return g.status === pubStatus(p); })[0] || PUB_GROUPS[0]; }
  function pubHtml(p) {
    var volume = t(p.volume), venue = t(p.venue);
    var line = [venue ? '<em>' + esc(venue) + '</em>' : '', volume ? esc(volume) : ''].filter(Boolean).join(Core.lang === 'en' ? ', ' : '，');
    if (venue && !volume && p.year) line += Core.lang === 'en' ? ' (' + esc(p.year) + ')' : '（' + esc(p.year) + '）';
    var href = p.doi ? 'https://doi.org/' + esc(p.doi) : (p.link ? esc(p.link) : '');
    var title = href
      ? '<a class="pub-title" href="' + href + '" target="_blank" rel="noopener">' + esc(t(p.title)) + '</a>'
      : '<span class="pub-title">' + esc(t(p.title)) + '</span>';
    var g = groupOf(p);
    return '<li class="pub"><div class="pub-main">' + title +
      '<p class="pub-authors">' + boldOwnName(esc(t(p.authors))) + '</p>' +
      (line ? '<p class="pub-venue">' + line + '</p>' : '') +
      (p.summary ? '<p class="pub-summary">' + esc(t(p.summary)) + '</p>' : '') +
      '</div><span class="pub-status">' + Core.tagHtml(ui(g.labelKey), g.style) + '</span></li>';
  }
  function byGroupThenYear(a, b) {
    return PUB_GROUPS.indexOf(groupOf(a)) - PUB_GROUPS.indexOf(groupOf(b)) || (b.year || 0) - (a.year || 0);
  }

  /* ---------- 首页：顶部 / 关于 / 论文 / 思考 / 产品 ---------- */
  function renderHome() {
    var P = PROFILE, name = t(P.name), other = Core.lang === 'en' ? 'zh' : 'en';
    Core.setTitle(name + ' | ' + t(P.role));
    $('hero').innerHTML =
      '<div class="hero-photo">' + (P.photo
        ? '<img src="' + url(P.photo) + '" alt="' + esc(ui('photoAlt', { name: name })) + '">'
        : '<div class="avatar" aria-hidden="true">' + esc(name.charAt(0)) + '</div>') + '</div>' +
      '<div class="hero-text">' +
        // 大标题是当前语言的名字，下面一行小字是另一种语言的写法（两边一样就不重复）
        '<h1>' + esc(name) + (P.name[other] && P.name[other] !== name ? '<span class="hero-en" lang="' + (other === 'en' ? 'en' : 'zh-CN') + '">' + esc(P.name[other]) + '</span>' : '') + '</h1>' +
        '<p class="hero-role">' + esc(t(P.role)) + '</p>' +
        '<div class="hero-affils">' + (P.affiliation || []).map(function (a) { return '<p class="hero-affil">' + esc(t(a)) + '</p>'; }).join('') + '</div>' +
        '<div class="hero-links">' + (P.links || []).map(function (l) {
          var ext = /^https?:/i.test(l.url) ? ' target="_blank" rel="noopener"' : '';
          return '<a class="hero-link" href="' + esc(l.url) + '"' + ext + '>' + Core.icon(l.icon) + '<span>' + esc(t(l.label)) + '</span></a>';
        }).join('') + '</div></div>';

    $('bio').innerHTML = (t(P.bio) || []).map(function (s, i) { return '<p' + (i === 0 ? ' class="lead"' : '') + '>' + s + '</p>'; }).join('');
    $('education').innerHTML = (P.education || []).map(function (e) {
      return '<div class="edu-item"><div class="edu-date">' + esc(t(e.period)) + '</div>' +
        '<div class="edu-body"><strong>' + esc(t(e.degree)) + '</strong><p>' + esc(t(e.detail)) + '</p>' + '</div></div>';
    }).join('');

    // 论文：首页放已发表 + 在投（撰写中的只在论文页），已发表在前
    var pubs = ((window.PUBLICATIONS && PUBLICATIONS.items) || []).filter(function (p) {
      return pubStatus(p) !== 'in-prep';
    }).sort(byGroupThenYear).slice(0, SITE.homePubCount || 5);
    $('pub-preview').innerHTML = pubs.length ? pubs.map(pubHtml).join('') : '<li class="placeholder">' + ui('empty') + '</li>';

    // 思考：最新 N 篇
    var posts = ((window.THINKING && THINKING.posts) || []).slice(0, SITE.homeThinkingCount || 6);
    $('thinking-list').innerHTML = posts.length ? posts.map(threadHtml).join('') : '<div class="placeholder">' + ui('noPosts') + '</div>';

    // 产品：全部显示
    var prods = (window.PRODUCTS && PRODUCTS.items) || [];
    $('product-cards').innerHTML = prods.length ? prods.map(productCardHtml).join('') : '<div class="placeholder">' + ui('empty') + '</div>';
  }

  /* ---------- 产品页 ---------- */
  function renderProducts() {
    Core.setTitle(ui('products'));
    $('page-desc').textContent = t(PRODUCTS.intro) || '';
    $('product-cards').innerHTML = (PRODUCTS.items || []).map(productCardHtml).join('') || '<div class="placeholder">' + ui('empty') + '</div>';
  }

  /* ---------- 论文页：按 已发表 / 在投 / 撰写中 分组，组内年份倒序 ---------- */
  function renderPublications() {
    Core.setTitle(ui('publications'));
    $('page-desc').textContent = t(PUBLICATIONS.intro) || '';
    var all = (PUBLICATIONS.items || []).slice().sort(byGroupThenYear);
    var html = PUB_GROUPS.map(function (g) {
      var items = all.filter(function (p) { return pubStatus(p) === g.status; });
      return items.length ? '<h2 class="sub-title">' + esc(ui(g.labelKey)) + '</h2><ol class="pub-list">' + items.map(pubHtml).join('') + '</ol>' : '';
    }).join('');
    $('pub-sections').innerHTML = html || '<div class="placeholder">' + ui('empty') + '</div>';
  }

  /* ---------- 思考列表页（标签筛选） ---------- */
  function renderThinking() {
    Core.setTitle(ui('thinking'));
    $('page-desc').textContent = t(THINKING.intro) || '';
    var posts = THINKING.posts || [], tags = THINKING.tags || [];
    var bar = $('filter-bar'), desc = $('filter-desc'), list = $('thread-list');
    var current = (/#tag=([^&]*)/.exec(location.hash) || [])[1];
    current = current ? decodeURIComponent(current) : '';

    function draw() {
      var shown = current ? posts.filter(function (p) { return (p.tags || []).indexOf(current) >= 0; }) : posts;
      bar.innerHTML = '<span class="filter-label">' + esc(ui('topic')) + '</span>' +
        '<button class="chip' + (current ? '' : ' active') + '" data-tag="">' + esc(ui('all')) + '<span class="count">' + posts.length + '</span></button>' +
        tags.map(function (tg) {
          var n = posts.filter(function (p) { return (p.tags || []).indexOf(tg.id) >= 0; }).length;
          return '<button class="chip' + (tg.id === current ? ' active' : '') + '" data-tag="' + esc(tg.id) + '">' + esc(t(tg.label)) + '<span class="count">' + n + '</span></button>';
        }).join('');
      desc.textContent = current ? tagDef(current).desc : '';
      list.innerHTML = shown.length ? shown.map(threadHtml).join('') : '<div class="placeholder">' + ui('noPostsInTopic') + '</div>';
    }
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      current = b.getAttribute('data-tag') || '';
      history.replaceState(null, '', location.pathname + location.search + (current ? '#tag=' + encodeURIComponent(current) : ''));
      draw();
    });
    draw();
  }

  /* ---------- 文章页 ---------- */
  function renderPost() {
    var slug = Core.queryParam('id');
    var p = ((window.THINKING && THINKING.posts) || []).filter(function (x) { return x.slug === slug; })[0];
    if (!p || !/^[a-z0-9-]+$/.test(slug)) {            // slug 只允许小写字母/数字/短横线，避免拼出奇怪的文件路径
      Core.setTitle(ui('postNotFound'));
      $('page-title').textContent = ui('postNotFound');
      $('prose').innerHTML = '<div class="notice">' + ui('postNotFoundBody', { id: esc(slug) }) +
        ' <a href="' + page('thinking') + '">' + esc(ui('backLink')) + '</a></div>';
      return;
    }
    var title = t(p.title);
    Core.setTitle(title);
    $('page-tags').innerHTML = (p.draft ? Core.tagHtml(ui('draft'), 'amber') : '') +
      (p.tags || []).map(function (id) { return Core.tagHtml(tagDef(id).label, 'blue', page('thinking', '#tag=' + encodeURIComponent(id))); }).join('');
    $('page-title').textContent = title;
    $('page-desc').textContent = t(p.summary) || '';
    $('post-meta').textContent = Core.fmtDate(p.date);
    $('feedback').innerHTML = Core.feedbackHtml(title);
    // 英文版读 <slug>.en.md，没有就退回中文 <slug>.md 并提示
    var base = 'content/posts/' + slug;
    Core.renderMarkdownFile(Core.lang === 'en' ? base + '.en.md' : base + '.md', $('prose'), Core.lang === 'en' ? base + '.md' : '');
  }

  var kind = document.body.getAttribute('data-page');
  ({ home: renderHome, products: renderProducts, publications: renderPublications, thinking: renderThinking, post: renderPost }[kind] || function () {})();
})();
