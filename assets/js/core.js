/* ============================================================
   assets/js/core.js —— 全站公共逻辑
   ------------------------------------------------------------
   日常补内容不用改。职责：
     1. 路径：根据 <body data-root> 把以仓库根为基准的路径转成当前页可用的路径
     2. 注入导航栏与页脚
     3. 工具：HTML 转义、日期、图标、标签
     4. 一个够用的小型 Markdown 渲染器（不依赖任何外部库）
   不引用任何外部 CDN：访问者在国内，外部脚本可能加载失败，页面不应因此坏掉。
   ============================================================ */
(function () {
  'use strict';
  var Core = window.Core = {};

  /* 1. 路径 ---------------------------------------------------- */
  var ROOT = document.body.getAttribute('data-root') || '';
  Core.root = ROOT;
  Core.url = function (p) {
    if (!p) return '';
    return /^(https?:|mailto:|tel:|data:|#|\/)/i.test(p) ? p : ROOT + p;
  };
  Core.page = function (name, query) {
    return (ROOT ? '' : 'pages/') + name + '.html' + (query || '');
  };
  Core.queryParam = function (key) {
    var m = new RegExp('[?&]' + key + '=([^&#]*)').exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
  };

  /* 2. 语言 ----------------------------------------------------
     选哪种语言，按优先级：网址 ?lang=en / ?lang=zh → 上次的选择（localStorage）→ 浏览器语言（zh 开头用中文，其他用英文）。
     内容文件里的文字可以写成 { zh: '…', en: '…' }，Core.t() 取出当前语言那一份。 */
  function storedLang() { try { return localStorage.getItem('lang') || ''; } catch (e) { return ''; } }
  function storeLang(l) { try { localStorage.setItem('lang', l); } catch (e) { /* 隐私模式等：不记住也不影响使用 */ } }
  var LANG = (function () {
    var q = Core.queryParam('lang');
    if (q === 'zh' || q === 'en') { storeLang(q); return q; }
    var s = storedLang();
    if (s === 'zh' || s === 'en') return s;
    return /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
  })();
  Core.lang = LANG;
  document.documentElement.lang = LANG === 'en' ? 'en' : 'zh-CN';

  // {zh, en} → 当前语言那份（缺的一边退回另一边）；普通字符串、数组等原样返回
  Core.t = function (v) {
    if (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || 'en' in v)) {
      var x = v[LANG];
      return x != null ? x : (v[LANG === 'zh' ? 'en' : 'zh'] != null ? v[LANG === 'zh' ? 'en' : 'zh'] : '');
    }
    return v;
  };
  // 界面文字：Core.ui('键名', { 占位符: 值 })。值由调用方负责转义
  Core.ui = function (key, vars) {
    var def = window.SITE && SITE.ui && SITE.ui[key];
    return String(def == null ? '' : Core.t(def)).replace(/\{(\w+)\}/g, function (m, k) { return vars && k in vars ? vars[k] : m; });
  };
  // 把静态 HTML 里带 data-i18n="键名" 的元素填上当前语言的界面文字
  Core.applyI18n = function () {
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function (el) {
      var key = el.getAttribute('data-i18n');
      if (window.SITE && SITE.ui && SITE.ui[key] != null) el.textContent = Core.ui(key);
    });
  };
  // 当前页换成另一种语言的网址（保留其他参数和 # 部分），例如 "?id=hoi&lang=en#x"
  Core.langUrl = function (l) {
    var u = new URL(window.location.href);
    u.searchParams.set('lang', l);
    return u.search + u.hash;
  };

  /* 3. 工具 ---------------------------------------------------- */
  Core.esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };
  // '2026-11-16' → '2026 年 11 月 16 日'（英文：'Nov 16, 2026'）；'2026-11' → '2026 年 11 月'（'Nov 2026'）
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  Core.fmtDate = function (s) {
    var m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(String(s || ''));
    if (!m) return s ? String(s) : '';
    if (LANG === 'en') return (MONTHS[parseInt(m[2], 10) - 1] || m[2]) + (m[3] ? ' ' + parseInt(m[3], 10) + ',' : '') + ' ' + m[1];
    return m[1] + ' 年 ' + parseInt(m[2], 10) + ' 月' + (m[3] ? ' ' + parseInt(m[3], 10) + ' 日' : '');
  };
  // 列表里用的紧凑写法：'2026-11-16' → '2026.11.16'
  Core.fmtDateShort = function (s) {
    var m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(String(s || ''));
    return m ? m[1] + '.' + m[2] + (m[3] ? '.' + m[3] : '') : (s ? String(s) : '');
  };

  var ICONS = {
    email:  '<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>',
    github: '<path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.17c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.66.41.35.77 1.05.77 2.12v3.14c0 .31.21.68.8.56A10.5 10.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/>',
    scholar:'<path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3zm-7 9.9V17c0 2.21 3.13 4 7 4s7-1.79 7-4v-4.1l-7 3.82-7-3.82z"/>',
    orcid:  '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM8.5 7.2a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm.8 3.3h-1.6v6.8h1.6v-6.8zm2.2 0h3.1c2.6 0 3.9 1.6 3.9 3.4 0 1.9-1.4 3.4-3.9 3.4h-3.1v-6.8zm1.6 1.4v4h1.4c1.8 0 2.4-1 2.4-2s-.7-2-2.4-2h-1.4z"/>',
    link:   '<path d="M3.9 12a5 5 0 0 1 5-5h4v2h-4a3 3 0 1 0 0 6h4v2h-4a5 5 0 0 1-5-5zm6.1 1h4v-2h-4v2zm5-6h-4V7h4a5 5 0 0 1 0 10h-4v-2h4a3 3 0 1 0 0-6z"/>'
  };
  Core.icon = function (name) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || ICONS.link) + '</svg>';
  };
  Core.tagHtml = function (label, style, href) {
    var cls = 'tag' + (style && style !== 'blue' ? ' tag-' + style : '');
    return href
      ? '<a class="' + cls + '" href="' + Core.esc(href) + '">' + Core.esc(label) + '</a>'
      : '<span class="' + cls + '">' + Core.esc(label) + '</span>';
  };
  // 文章末尾的「欢迎来信」：没有设置公开邮箱（profile.js 的 email 为空）就什么都不显示。邮件主题自动带上文章标题
  Core.feedbackHtml = function (postTitle) {
    var email = (window.PROFILE && PROFILE.email) || '';
    if (!email) return '';
    var href = 'mailto:' + email + '?subject=' + encodeURIComponent(Core.ui('feedbackSubject', { title: postTitle }));
    return '<aside class="feedback"><p>' + Core.ui('feedback') + '</p>' +
      '<p><a href="' + Core.esc(href) + '">' + Core.esc(email) + '</a></p></aside>';
  };
  Core.setTitle = function (name) {
    var suffix = Core.t(window.SITE && SITE.titleSuffix) || '';
    document.title = name ? name + (suffix ? ' · ' + suffix : '') : suffix;
  };

  /* 2. 导航栏与页脚 -------------------------------------------- */
  var NAV_GROUP = { products: 'products', publications: 'publications', thinking: 'thinking', post: 'thinking' };

  function renderHeader() {
    var el = document.getElementById('site-header');
    if (!el || !window.SITE) return;
    var current = NAV_GROUP[document.body.getAttribute('data-page') || ''] || '';
    var brand = Core.t(window.PROFILE && PROFILE.name) || Core.t(SITE.titleSuffix) || '';
    var links = SITE.nav.map(function (item) {
      return '<a class="nav-link' + (item.page === current ? ' active' : '') + '" href="' + Core.page(item.page) + '">' + Core.esc(Core.t(item.label)) + '</a>';
    }).join('');
    var other = LANG === 'en' ? 'zh' : 'en';
    el.innerHTML =
      '<header class="nav"><div class="container nav-inner">' +
        '<a class="nav-brand" href="' + (ROOT || './') + 'index.html">' + Core.esc(brand) + '</a>' +
        '<div class="nav-right">' +
          '<nav class="nav-menu" id="nav-menu">' + links + '</nav>' +
          '<a class="lang-switch" id="lang-switch" href="' + Core.esc(Core.langUrl(other)) + '" hreflang="' + (other === 'en' ? 'en' : 'zh-CN') + '" title="' + Core.esc(Core.ui('switchLang')) + '">' + (other === 'en' ? 'EN' : '中文') + '</a>' +
          '<button class="nav-toggle" id="nav-toggle" aria-label="' + Core.esc(Core.ui('navOpen')) + '" aria-expanded="false"><span></span><span></span><span></span></button>' +
        '</div>' +
      '</div></header>';
    var toggle = document.getElementById('nav-toggle'), menu = document.getElementById('nav-menu');
    toggle.addEventListener('click', function () {
      toggle.setAttribute('aria-expanded', menu.classList.toggle('open'));
    });
    // 点击时记住选择，并按「此刻」的网址重算链接（思考页筛选主题后 # 部分会变）
    var sw = document.getElementById('lang-switch');
    sw.addEventListener('click', function () { storeLang(other); sw.setAttribute('href', Core.langUrl(other)); });
  }

  function renderFooter() {
    var el = document.getElementById('site-footer');
    if (!el) return;
    var name = Core.t(window.PROFILE && PROFILE.name) || '';
    var email = (window.PROFILE && PROFILE.email) || '';
    el.innerHTML = '<footer class="footer"><div class="container"><p>© ' + new Date().getFullYear() + ' ' + Core.esc(name) +
      (email ? ' · <a href="mailto:' + Core.esc(email) + '">' + Core.esc(email) + '</a>' : '') + '</p></div></footer>';
  }

  /* 4. 小型 Markdown 渲染 --------------------------------------
     支持：# ## ### 标题、段落、有序/无序列表、> 引用、``` 代码块、| 表格 |、---、
           **粗体** *斜体* `代码` [链接](url) ![图片](url)。
     先整体转义再还原语法，所以正文里的 < > 不会被当成 HTML（文章内容是纯 Markdown，不允许内嵌 HTML）。 */
  function inline(s) {
    s = Core.esc(s);
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function (_, alt, u) { return '<img alt="' + alt + '" src="' + safeUrl(u) + '">'; });
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, t, u) { return '<a href="' + safeUrl(u) + '">' + t + '</a>'; });
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
    return s;
  }
  // 只放行 http(s)/mailto/相对路径/锚点；javascript: 等一律丢弃
  function safeUrl(u) {
    u = u.replace(/&amp;/g, '&');
    if (/^\s*(javascript|data|vbscript):/i.test(u)) return '#';
    return Core.esc(/^(https?:|mailto:|#|\/)/i.test(u) ? u : Core.url(u));
  }
  Core.markdown = function (md) {
    var lines = String(md).replace(/\r\n?/g, '\n').split('\n');
    var out = [], i = 0;
    function para(buf) { if (buf.length) out.push('<p>' + inline(buf.join(' ')) + '</p>'); }
    while (i < lines.length) {
      var ln = lines[i], m;
      if (/^\s*$/.test(ln)) { i++; continue; }
      if (/^```/.test(ln)) {                                   // 代码块
        var code = []; i++;
        while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
        i++; out.push('<pre><code>' + Core.esc(code.join('\n')) + '</code></pre>'); continue;
      }
      if ((m = /^(#{1,4})\s+(.*)$/.exec(ln))) {                // 标题（正文里 # 当 h2，避免和页面标题冲突）
        var lv = Math.min(m[1].length + 1, 4);
        out.push('<h' + lv + '>' + inline(m[2]) + '</h' + lv + '>'); i++; continue;
      }
      if (/^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/.test(ln)) { out.push('<hr>'); i++; continue; }
      if (/^>\s?/.test(ln)) {                                   // 引用
        var q = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, ''));
        out.push('<blockquote>' + Core.markdown(q.join('\n')) + '</blockquote>'); continue;
      }
      if (/^\s*\|.*\|\s*$/.test(ln) && i + 1 < lines.length && /^\s*\|?[\s:\-|]+\|?\s*$/.test(lines[i + 1]) && /-/.test(lines[i + 1])) {
        var cells = function (r) { return r.trim().replace(/^\||\|$/g, '').split('|').map(function (c) { return c.trim(); }); };
        var head = cells(ln); i += 2; var rows = [];
        while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) rows.push(cells(lines[i++]));
        out.push('<table><thead><tr>' + head.map(function (c) { return '<th>' + inline(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
          rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + inline(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>');
        continue;
      }
      if (/^\s*([-*+]|\d+\.)\s+/.test(ln)) {                    // 列表
        var ordered = /^\s*\d+\./.test(ln), items = [];
        while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*([-*+]|\d+\.)\s+/, ''));
        var tag = ordered ? 'ol' : 'ul';
        out.push('<' + tag + '>' + items.map(function (t) { return '<li>' + inline(t) + '</li>'; }).join('') + '</' + tag + '>'); continue;
      }
      var buf = [];                                              // 段落
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(```|#{1,4}\s|>|\s*([-*+]|\d+\.)\s)/.test(lines[i]) && !/^\s*\|.*\|\s*$/.test(lines[i])) buf.push(lines[i++]);
      if (!buf.length) { buf.push(lines[i++]); }
      para(buf);
    }
    return out.join('\n');
  };

  function fetchText(path) {
    return fetch(ROOT + path, { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); });
  }
  // 读一个 .md 渲染进 el。fallbackPath（可选）：path 读不到时改读它，并在正文前加一句「暂无英文版」的提示
  Core.renderMarkdownFile = function (path, el, fallbackPath) {
    var notice = '';
    return fetchText(path)
      .catch(function (err) {
        if (!fallbackPath) throw err;
        path = fallbackPath;
        notice = '<div class="notice">' + Core.ui('noEnglish') + '</div>';
        return fetchText(fallbackPath);
      })
      .then(function (md) { el.innerHTML = notice + Core.markdown(md); })
      .catch(function (err) {
        var isFile = window.location.protocol === 'file:';
        el.innerHTML = '<div class="notice">' + (isFile
          ? Core.ui('mdFileProtocol')
          : Core.ui('mdReadFail', { path: Core.esc(path), err: Core.esc(err.message) })) + '</div>';
      });
  };

  renderHeader();
  renderFooter();
  Core.applyI18n();
})();
