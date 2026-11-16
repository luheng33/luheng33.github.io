/* ============================================================
   content/products.js —— 产品栏目（中英双语）
   ------------------------------------------------------------
   新增一个产品：复制一个 { ... } 粘进 items 数组最前面（最新在前）即可。
   字段（title / summary / tags / note 都可以写成 { zh: '…', en: '…' }）：
     id       唯一标识，小写字母/数字/短横线
     title    名称
     summary  一两句介绍
     url      打开地址（没上线就留空 ''）
     status   'live'（已上线）| 'soon'（即将开放）| 'private'（仅自用，不放链接）
     tags     标签文字列表（自由写）
     note     （可选）一行补充说明，例如"需要访问密码"
   ============================================================ */
var PRODUCTS = {

  intro: { zh: '我做的一些研究小工具。', en: 'Small tools I have built for research.' },

  items: [
    {
      id:      'search',
      title:   { zh: '顶刊助手', en: 'Top-Journal Assistant' },
      summary: { zh: '输入一个研究话题，在经济学、管理学文献里检索候选文献清单，开始前会先估算费用。',
                 en: 'Enter a research topic and get a candidate reading list from economics and management journals. It shows a cost estimate before it starts.' },
      url:     'https://search.digitalsunfish.com',
      status:  'live',
      tags:    [{ zh: '文献检索', en: 'Literature search' }, { zh: 'AI 辅助', en: 'AI-assisted' }],
      note:    { zh: '需要访问密码，或使用你自己的 DeepSeek key。', en: 'Requires an access password, or your own DeepSeek key.' }
    }
  ]
};
