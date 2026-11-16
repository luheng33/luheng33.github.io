/* ============================================================
   assets/js/pages.js —— 各页面的内容渲染
   ------------------------------------------------------------
   日常补内容不用改。每个 HTML 页面是一个"壳"，<body data-page="..."> 标明类型：
     home → index.html            products → pages/products.html
     publications → pages/publications.html
     thinking → pages/thinking.html     post → pages/post.html?id=<slug>
   依赖 core.js。
   ============================================================ */
(function () {
  'use strict';
  var esc = Core.esc, url = Core.url, page = Core.page;
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- 共用片段 ---------- */
  function tagDef(id) {
    var list = (window.THINKING && THINKING.tags) || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return { id: id, label: id };
  }
  // 一篇思考 = 一行：左边日期，右边标题 + 摘要 + 标签。首页和思考页共用。draft: true 的会多一个「写作中」标签
  function postTagsHtml(p) {
    return (p.draft ? [Core.tagHtml('写作中', 'amber')] : [])
      .concat((p.tags || []).map(function (id) { return Core.tagHtml(tagDef(id).label); })).join('');
  }
  function threadHtml(p) {
    return '<a class="thread" href="' + page('post', '?id=' + encodeURIComponent(p.slug)) + '">' +
      '<span class="thread-date">' + esc(Core.fmtDateShort(p.date)) + '</span>' +
      '<div class="thread-main"><h3 class="thread-title">' + esc(p.title) + '</h3><p class="thread-desc">' + esc(p.summary) + '</p>' +
      '<div class="thread-tags">' + postTagsHtml(p) + '</div></div></a>';
  }

  var STATUS = { 'live': ['已上线', 'green'], 'soon': ['即将开放', 'amber'], 'private': ['自用', 'slate'] };
  function productCardHtml(p) {
    var st = STATUS[p.status] || STATUS.soon;
    var link = p.url && p.status !== 'private';
    var tag = link ? 'a' : 'div';
    var href = link ? ' href="' + esc(p.url) + '" target="_blank" rel="noopener"' : '';
    return '<' + tag + ' class="card"' + href + '>' +
      '<div class="card-top">' + Core.tagHtml(st[0], st[1]) +
        (p.tags || []).slice(0, 1).map(function (t) { return Core.tagHtml(t, 'slate'); }).join('') + '</div>' +
      '<h3>' + esc(p.title) + '</h3><p class="card-desc">' + esc(p.summary) + '</p>' +
      (p.note ? '<p class="card-note">' + esc(p.note) + '</p>' : '') +
      (link ? '<div class="card-foot">打开 →</div>' : '') + '</' + tag + '>';
  }

  function boldOwnName(s) {
    ((window.PROFILE && PROFILE.authorNames) || []).forEach(function (n) {
      var e = esc(n).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      s = s.replace(new RegExp(e, 'g'), '<strong>' + esc(n) + '</strong>');
    });
    return s;
  }
  var PUB_GROUPS = [
    { status: 'published', label: '已发表', tag: ['已发表', 'green'] },
    { status: 'submitted', label: '在投',   tag: ['在投', 'amber'] },
    { status: 'in-prep',   label: '撰写中', tag: ['撰写中', 'slate'] }
  ];
  function pubStatus(p) { return p.status || 'published'; }
  function groupOf(p) { return PUB_GROUPS.filter(function (g) { return g.status === pubStatus(p); })[0] || PUB_GROUPS[0]; }
  function pubHtml(p) {
    var venue = [p.venue ? '<em>' + esc(p.venue) + '</em>' : '', p.volume ? esc(p.volume) : ''].filter(Boolean).join('，');
    if (p.venue && !p.volume && p.year) venue += '（' + esc(p.year) + '）';
    var href = p.doi ? 'https://doi.org/' + esc(p.doi) : (p.link ? esc(p.link) : '');
    var title = href
      ? '<a class="pub-title" href="' + href + '" target="_blank" rel="noopener">' + esc(p.title) + '</a>'
      : '<span class="pub-title">' + esc(p.title) + '</span>';
    var st = groupOf(p).tag;
    return '<li class="pub"><div class="pub-main">' + title +
      '<p class="pub-authors">' + boldOwnName(esc(p.authors)) + '</p>' +
      (venue ? '<p class="pub-venue">' + venue + '</p>' : '') +
      (p.summary ? '<p class="pub-summary">' + esc(p.summary) + '</p>' : '') +
      '</div><span class="pub-status">' + Core.tagHtml(st[0], st[1]) + '</span></li>';
  }
  function byGroupThenYear(a, b) {
    return PUB_GROUPS.indexOf(groupOf(a)) - PUB_GROUPS.indexOf(groupOf(b)) || (b.year || 0) - (a.year || 0);
  }

  /* ---------- 首页：顶部 / 关于 / 论文 / 思考 / 产品 ---------- */
  function renderHome() {
    var P = PROFILE;
    Core.setTitle(P.name + ' | ' + P.role);
    $('hero').innerHTML =
      '<div class="hero-photo">' + (P.photo
        ? '<img src="' + url(P.photo) + '" alt="' + esc(P.name) + '的照片">'
        : '<div class="avatar" aria-hidden="true">' + esc(P.name.charAt(0)) + '</div>') + '</div>' +
      '<div class="hero-text">' +
        '<h1>' + esc(P.name) + (P.nameEn ? '<span class="hero-en">' + esc(P.nameEn) + '</span>' : '') + '</h1>' +
        '<p class="hero-role">' + esc(P.role) + '</p>' +
        '<p class="hero-affil">' + esc(P.affiliation) + '</p>' +
        '<p class="hero-tagline">' + esc(P.tagline) + '</p>' +
        '<div class="hero-links">' + (P.links || []).map(function (l) {
          var ext = /^https?:/i.test(l.url) ? ' target="_blank" rel="noopener"' : '';
          return '<a class="hero-link" href="' + esc(l.url) + '"' + ext + '>' + Core.icon(l.icon) + '<span>' + esc(l.label) + '</span></a>';
        }).join('') + '</div></div>';

    $('bio').innerHTML = (P.bio || []).map(function (t, i) { return '<p' + (i === 0 ? ' class="lead"' : '') + '>' + t + '</p>'; }).join('');
    $('education').innerHTML = (P.education || []).map(function (e) {
      return '<div class="edu-item"><div class="edu-date">' + esc(e.period) + '</div>' +
        '<div class="edu-body"><strong>' + esc(e.degree) + '</strong><p>' + esc(e.detail) + '</p></div></div>';
    }).join('');

    // 论文：首页放已发表 + 在投（撰写中的只在论文页），已发表在前
    var pubs = ((window.PUBLICATIONS && PUBLICATIONS.items) || []).filter(function (p) {
      return pubStatus(p) !== 'in-prep';
    }).sort(byGroupThenYear).slice(0, SITE.homePubCount || 5);
    $('pub-preview').innerHTML = pubs.length ? pubs.map(pubHtml).join('') : '<li class="placeholder">暂无。</li>';

    // 思考：最新 N 篇
    var posts = ((window.THINKING && THINKING.posts) || []).slice(0, SITE.homeThinkingCount || 6);
    $('thinking-list').innerHTML = posts.length ? posts.map(threadHtml).join('') : '<div class="placeholder">还没有文章。</div>';

    // 产品：全部显示
    var prods = (window.PRODUCTS && PRODUCTS.items) || [];
    $('product-cards').innerHTML = prods.length ? prods.map(productCardHtml).join('') : '<div class="placeholder">暂无。</div>';
  }

  /* ---------- 产品页 ---------- */
  function renderProducts() {
    Core.setTitle('产品');
    $('page-desc').textContent = PRODUCTS.intro || '';
    $('product-cards').innerHTML = (PRODUCTS.items || []).map(productCardHtml).join('') || '<div class="placeholder">暂无。</div>';
  }

  /* ---------- 论文页：按 已发表 / 在投 / 撰写中 分组，组内年份倒序 ---------- */
  function renderPublications() {
    Core.setTitle('论文');
    $('page-desc').textContent = PUBLICATIONS.intro || '';
    var all = (PUBLICATIONS.items || []).slice().sort(byGroupThenYear);
    var html = PUB_GROUPS.map(function (g) {
      var items = all.filter(function (p) { return pubStatus(p) === g.status; });
      return items.length ? '<h2 class="sub-title">' + esc(g.label) + '</h2><ol class="pub-list">' + items.map(pubHtml).join('') + '</ol>' : '';
    }).join('');
    $('pub-sections').innerHTML = html || '<div class="placeholder">暂无。</div>';
  }

  /* ---------- 思考列表页（标签筛选） ---------- */
  function renderThinking() {
    Core.setTitle('思考');
    $('page-desc').textContent = THINKING.intro || '';
    var posts = THINKING.posts || [], tags = THINKING.tags || [];
    var bar = $('filter-bar'), desc = $('filter-desc'), list = $('thread-list');
    var current = (/#tag=([^&]*)/.exec(location.hash) || [])[1];
    current = current ? decodeURIComponent(current) : '';

    function draw() {
      var shown = current ? posts.filter(function (p) { return (p.tags || []).indexOf(current) >= 0; }) : posts;
      bar.innerHTML = '<span class="filter-label">主题</span>' +
        '<button class="chip' + (current ? '' : ' active') + '" data-tag="">全部<span class="count">' + posts.length + '</span></button>' +
        tags.map(function (t) {
          var n = posts.filter(function (p) { return (p.tags || []).indexOf(t.id) >= 0; }).length;
          return '<button class="chip' + (t.id === current ? ' active' : '') + '" data-tag="' + esc(t.id) + '">' + esc(t.label) + '<span class="count">' + n + '</span></button>';
        }).join('');
      desc.textContent = current ? (tagDef(current).desc || '') : '';
      list.innerHTML = shown.length ? shown.map(threadHtml).join('') : '<div class="placeholder">这个主题下还没有文章。</div>';
    }
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      current = b.getAttribute('data-tag') || '';
      history.replaceState(null, '', current ? '#tag=' + encodeURIComponent(current) : location.pathname + location.search);
      draw();
    });
    draw();
  }

  /* ---------- 文章页 ---------- */
  function renderPost() {
    var slug = Core.queryParam('id');
    var p = ((window.THINKING && THINKING.posts) || []).filter(function (x) { return x.slug === slug; })[0];
    if (!p || !/^[a-z0-9-]+$/.test(slug)) {            // slug 只允许小写字母/数字/短横线，避免拼出奇怪的文件路径
      Core.setTitle('没有找到这篇文章');
      $('page-title').textContent = '没有找到这篇文章';
      $('prose').innerHTML = '<div class="notice">没有 id 为 <code>' + esc(slug) + '</code> 的文章。<a href="' + page('thinking') + '">回到思考列表</a></div>';
      return;
    }
    Core.setTitle(p.title);
    $('page-tags').innerHTML = (p.draft ? Core.tagHtml('写作中', 'amber') : '') +
      (p.tags || []).map(function (id) { return Core.tagHtml(tagDef(id).label, 'blue', page('thinking', '#tag=' + encodeURIComponent(id))); }).join('');
    $('page-title').textContent = p.title;
    $('page-desc').textContent = p.summary || '';
    $('post-meta').textContent = Core.fmtDate(p.date);
    $('feedback').innerHTML = Core.feedbackHtml(p.title);
    Core.renderMarkdownFile('content/posts/' + slug + '.md', $('prose'));
  }

  var kind = document.body.getAttribute('data-page');
  ({ home: renderHome, products: renderProducts, publications: renderPublications, thinking: renderThinking, post: renderPost }[kind] || function () {})();
})();
