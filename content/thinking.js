/* ============================================================
   content/thinking.js —— 「思考」栏目：分组定义 + 文章索引（中英双语）
   ------------------------------------------------------------
   ★ 新增一篇文章只需三步：
     1. 在 posts 数组【最前面】插入一个对象（最新在前）；
     2. 新建 content/posts/<slug>.md，写中文正文（Markdown）；
     3. 新建 content/posts/<slug>.en.md，写英文正文（没有的话，英文版会显示中文原文并提示）。
   slug 只用小写字母、数字、短横线，且与 .md 文件名一致。发布后不要再改 slug（链接会失效）。

   字段（title / summary 可以写成 { zh: '…', en: '…' }）：
     slug     唯一标识 = 网址 = 正文文件名
     title    标题
     summary  一两句摘要（列表里显示）
     date     发布日期 'YYYY-MM-DD'（手写，没有自动日期）
     tags     分组 id 列表（必须在下方 tags 里定义）
     draft    （可选）true = 还在写，列表和文章页会多一个「写作中」标签；写完把这一行删掉
   ============================================================ */
var THINKING = {

  intro: { zh: '一些还在想的问题和不成熟的想法，按主题分组。',
           en: 'Questions I am still working through, and half-formed ideas, grouped by topic.' },

  /* 分组（标签）：id 用于筛选和网址，label 为显示文字，desc 为选中时显示的一句话 */
  tags: [
    { id: 'ai-economics',
      label: { zh: 'AI 与经济学', en: 'AI & Economics' },
      desc:  { zh: '人工智能如何改变就业、分配与研究本身。', en: 'How AI changes employment, distribution, and research itself.' } },
    { id: 'methods',
      label: { zh: '测度与方法', en: 'Measurement & Methods' },
      desc:  { zh: '怎么测量、怎么提取，以及研究设计里容易出问题的地方。', en: 'How to measure, how to extract, and where research designs tend to go wrong.' } }
  ],

  /* 文章索引（最新在前；日期相同时按这里的先后） */
  posts: [
    {
      slug:    'hoi',
      title:   'HOI',
      summary: { zh: 'HOI 的测算结果与讨论。', en: 'The HOI results, and a discussion of them.' },
      date:    '2026-11-16',
      tags:    ['ai-economics'],
      draft:   true
    },
    {
      slug:    'ai-measurement-system',
      title:   { zh: '人工智能水平的测算评价体系', en: 'Measuring and Evaluating the Level of Artificial Intelligence' },
      summary: { zh: '人工智能的发展水平该怎么测、怎么评：测算评价体系的设计思路。',
                 en: 'How should the level of AI development be measured and evaluated? Design notes for a measurement and evaluation system.' },
      date:    '2026-11-16',
      tags:    ['methods', 'ai-economics'],
      draft:   true
    },
    {
      slug:    'composition-fallacy',
      title:   { zh: 'AI 带来的劳动分配的合成谬误', en: 'AI and the Fallacy of Composition in Labor Allocation' },
      summary: { zh: '对个体成立的结论，放到整个经济里未必成立——这在 AI 与劳动分配上意味着什么。',
                 en: 'What holds for each individual need not hold for the economy as a whole. What does that mean for AI and the allocation of labor?' },
      date:    '2026-11-16',
      tags:    ['ai-economics'],
      draft:   true
    },
    {
      slug:    'generative-ai-cocoon',
      title:   { zh: '生成式 AI 与研究的信息茧房', en: 'Generative AI and the Information Cocoon in Research' },
      summary: { zh: '人们谈论和研究的“AI”，大多其实是生成式 AI，两者没有被区分开；在这个前提下得出的结论值得怀疑。',
                 en: 'Much of what people, and economists, call “AI” is really generative AI, and the two are rarely told apart. Conclusions drawn on that basis are open to doubt.' },
      date:    '2026-11-16',
      tags:    ['methods', 'ai-economics'],
      draft:   true
    },
    {
      slug:    'text-measurement-prompt',
      title:   { zh: '文本测度与 prompt 提取', en: 'Text-Based Measurement and Prompt-Based Extraction' },
      summary: { zh: '用文本做测度、用 prompt 从文本里提取信息：方法与注意事项。',
                 en: 'Using text to measure variables, and prompts to extract information from text: methods and caveats.' },
      date:    '2026-11-16',
      tags:    ['methods'],
      draft:   true
    }
  ]
};
