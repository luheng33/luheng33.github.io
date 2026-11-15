/* ============================================================
   content/site.js —— 全站配置（很少改）
   个人信息请改 content/profile.js；各栏目请改 content/*.js。
   ============================================================ */
var SITE = {

  /* 浏览器标签页标题后缀："页面名 · 鲁一恒" */
  titleSuffix: '鲁一恒',

  /* 顶部导航：label 为显示文字，page 对应 pages/ 下的文件名（不含 .html）。调整顺序就是调整数组顺序 */
  nav: [
    { label: '产品',     page: 'products' },
    { label: '论文',     page: 'publications' },
    { label: '思考',     page: 'thinking' }
  ],

  /* 首页「思考」区块最多显示几篇最新文章 */
  homeThinkingCount: 6
};
