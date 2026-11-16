/* ============================================================
   content/site.js —— 全站配置 + 界面文字（很少改）
   个人信息请改 content/profile.js；各栏目请改 content/*.js。

   ★ 中英文：站里所有文字都可以写成两种形式——
       '普通字符串'                  两种语言显示一样（如网址、人名缩写）
       { zh: '中文', en: 'English' }  按访客选的语言显示
     访客点导航栏右上角的 EN / 中文 切换；网址加 ?lang=en 可直接打开英文版。
   ============================================================ */
var SITE = {

  /* 浏览器标签页标题后缀："页面名 · 鲁一恒" */
  titleSuffix: { zh: '鲁一恒', en: 'Yiheng Lu' },

  /* 顶部导航：label 为显示文字，page 对应 pages/ 下的文件名（不含 .html）。调整顺序就是调整数组顺序 */
  nav: [
    { label: { zh: '论文', en: 'Publications' }, page: 'publications' },
    { label: { zh: '思考', en: 'Thinking' },     page: 'thinking' },
    { label: { zh: '产品', en: 'Tools' },        page: 'products' }
  ],

  /* 首页「论文」「思考」区块最多各显示几条 */
  homePubCount: 5,
  homeThinkingCount: 6,

  /* 界面文字（按钮、小标题、提示语）。HTML 里的 data-i18n="键名" 和 pages.js 都从这里取 */
  ui: {
    about:           { zh: '关于',     en: 'About' },
    publications:    { zh: '论文',     en: 'Publications' },
    thinking:        { zh: '思考',     en: 'Thinking' },
    products:        { zh: '产品',     en: 'Tools' },
    /* 区块标题下面的小字：中文版配英文，英文版不需要 */
    subAbout:        { zh: 'About',        en: '' },
    subPublications: { zh: 'Publications', en: '' },
    subThinking:     { zh: 'Thinking',     en: '' },
    subProducts:     { zh: 'Tools',        en: '' },

    education:       { zh: '教育经历', en: 'Education' },
    advisors:        { zh: '指导老师：', en: 'Advisors: ' },
    viewAll:         { zh: '全部 →',   en: 'All →' },
    loading:         { zh: '加载中…',  en: 'Loading…' },
    backLink:        { zh: '← 回到思考列表', en: '← Back to Thinking' },
    empty:           { zh: '暂无。',   en: 'Nothing here yet.' },
    noPosts:         { zh: '还没有文章。', en: 'No posts yet.' },
    noPostsInTopic:  { zh: '这个主题下还没有文章。', en: 'No posts under this topic yet.' },
    topic:           { zh: '主题',     en: 'Topic' },
    all:             { zh: '全部',     en: 'All' },
    draft:           { zh: '写作中',   en: 'Draft' },
    open:            { zh: '打开 →',   en: 'Open →' },

    statusLive:      { zh: '已上线',   en: 'Live' },
    statusSoon:      { zh: '即将开放', en: 'Coming soon' },
    statusPrivate:   { zh: '自用',     en: 'Personal use' },
    pubPublished:    { zh: '已发表',   en: 'Published' },
    pubSubmitted:    { zh: '在投',     en: 'Under review' },
    pubInPrep:       { zh: '撰写中',   en: 'In preparation' },

    switchLang:      { zh: '切换到英文版', en: 'Switch to Chinese' },
    navOpen:         { zh: '展开导航', en: 'Open menu' },
    photoAlt:        { zh: '{name}的照片', en: 'Photo of {name}' },

    postNotFound:     { zh: '没有找到这篇文章', en: 'Post not found' },
    postNotFoundBody: { zh: '没有 id 为 <code>{id}</code> 的文章。', en: 'There is no post with id <code>{id}</code>.' },
    noEnglish:        { zh: '这篇文章暂无英文版，下面显示中文原文。', en: 'This post is not available in English yet; the Chinese original is shown below.' },
    feedback:         { zh: '这篇还在想，欢迎来信讨论、指出问题。', en: 'Still thinking about this one. Comments and corrections are welcome by email.' },
    feedbackSubject:  { zh: '关于《{title}》', en: 'Re: {title}' },
    mdFileProtocol:   { zh: '文章正文是从 Markdown 文件读取的，浏览器不允许直接双击打开本地网页时读取它。请用 <code>预览.ps1</code> 启动本地预览。上线到 GitHub Pages 后不受影响。',
                        en: 'Post bodies are loaded from Markdown files, which browsers block when a page is opened locally by double-clicking. Start the local preview with <code>预览.ps1</code>. This does not affect the live site.' },
    mdReadFail:       { zh: '读不到 <code>{path}</code>（{err}），请检查文件是否存在、名字是否与 slug 一致。',
                        en: 'Cannot read <code>{path}</code> ({err}). Check that the file exists and that its name matches the slug.' }
  }
};
