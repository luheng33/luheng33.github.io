/* ============================================================
   content/thinking.js —— 「思考」栏目：分组定义 + 文章索引
   ------------------------------------------------------------
   ★ 新增一篇文章只需两步：
     1. 在 posts 数组【最前面】插入一个对象（最新在前）；
     2. 新建 content/posts/<slug>.md，写正文（Markdown）。
   slug 只用小写字母、数字、短横线，且与 .md 文件名一致。发布后不要再改 slug（链接会失效）。

   字段：
     slug     唯一标识 = 网址 = 正文文件名
     title    标题
     summary  一两句摘要（列表里显示）
     date     发布日期 'YYYY-MM-DD'（手写，没有自动日期）
     tags     分组 id 列表（必须在下方 tags 里定义）
     draft    （可选）true = 还在写，列表和文章页会多一个「写作中」标签；写完把这一行删掉
   ============================================================ */
var THINKING = {

  intro: '一些还在想的问题和不成熟的想法，按主题分组。',

  /* 分组（标签）：id 用于筛选和网址，label 为显示文字，desc 为选中时显示的一句话 */
  tags: [
    { id: 'ai-economics', label: 'AI 与经济学', desc: '人工智能如何改变就业、分配与研究本身。' },
    { id: 'methods',      label: '测度与方法',  desc: '怎么测量、怎么提取，以及研究设计里容易出问题的地方。' }
  ],

  /* 文章索引（最新在前；日期相同时按这里的先后） */
  posts: [
    {
      slug:    'hoi',
      title:   'HOI',
      summary: 'HOI 的测算结果与讨论。',
      date:    '2026-11-16',
      tags:    ['ai-economics'],
      draft:   true
    },
    {
      slug:    'ai-measurement-system',
      title:   '人工智能水平的测算评价体系',
      summary: '人工智能的发展水平该怎么测、怎么评：测算评价体系的设计思路。',
      date:    '2026-11-16',
      tags:    ['methods', 'ai-economics'],
      draft:   true
    },
    {
      slug:    'composition-fallacy',
      title:   'AI 带来的劳动分配的合成谬误',
      summary: '对个体成立的结论，放到整个经济里未必成立——这在 AI 与劳动分配上意味着什么。',
      date:    '2026-11-16',
      tags:    ['ai-economics'],
      draft:   true
    },
    {
      slug:    'generative-ai-cocoon',
      title:   '生成式 AI 与研究的信息茧房',
      summary: '人们谈论和研究的“AI”，大多其实是生成式 AI，两者没有被区分开；在这个前提下得出的结论值得怀疑。',
      date:    '2026-11-16',
      tags:    ['methods', 'ai-economics'],
      draft:   true
    },
    {
      slug:    'text-measurement-prompt',
      title:   '文本测度与 prompt 提取',
      summary: '用文本做测度、用 prompt 从文本里提取信息：方法与注意事项。',
      date:    '2026-11-16',
      tags:    ['methods'],
      draft:   true
    }
  ]
};
