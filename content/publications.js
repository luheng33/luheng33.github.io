/* ============================================================
   content/publications.js —— 论文栏目（中英双语）
   ------------------------------------------------------------
   新增一篇：复制一个 { ... } 粘进 items 数组即可（位置无所谓，页面按 已发表/在投/撰写中 分组、年份倒序）。
   字段（title / authors / venue / volume / summary 都可以写成 { zh: '…', en: '…' }）：
     title    标题
     authors  作者，逗号分隔（你的署名会自动加粗，依据 profile.js 的 authorNames）
     venue    期刊 / 状态说明
     volume   期号 / 卷页（可选）
     year     年份（数字，用于排序；在投/撰写中的可写预计年份）
     doi      （可选）DOI，有则标题变成链接
     link     （可选）其他链接
     status   'published'（已发表）| 'submitted'（在投）| 'in-prep'（撰写中）
     summary  一句话介绍（可选）

   ★ 未发表的工作论文不要写在这里：这个文件会推到公开仓库，源码里谁都读得到。
     想展示时，只放你愿意公开的部分（建议只放标题和状态）。
   ★ 英文标题、期刊英文名、合作者的英文名，我先按常规译法/拼音写的，请对照期刊官方写法核对。
   ============================================================ */
var PUBLICATIONS = {

  intro: { zh: '已发表和在投的论文。', en: 'Published papers and papers under review.' },


  items: [

    /* ---------------- 已发表 ---------------- */
    {
      title:   { zh: '面向“十五五”的中国数字经济发展回顾与展望',
                 en: 'China’s Digital Economy: Review and Outlook for the 15th Five-Year Plan Period' },
      authors: { zh: '蔡跃洲, 鲁一恒, 赵相坤', en: 'Yuezhou Cai, Yiheng Lu, Xiangkun Zhao' },
      venue:   { zh: '经济纵横', en: 'Economic Review Journal (in Chinese)' },
      volume:  { zh: '2026 年第 10 期，第 51–65 页', en: 'No. 10, 2026, pp. 51–65' },
      year:    2026,
      status:  'published'
    },

    /* ---------------- 在投（只放标题和作者，不放摘要） ---------------- */
    {
      title:   { zh: '四大优势与中国人工智能发展', en: 'Four Advantages and the Development of Artificial Intelligence in China' },
      authors: { zh: '蔡跃洲, 鲁一恒, 钟洲', en: 'Yuezhou Cai, Yiheng Lu, Zhou Zhong' },
      year:    2026,
      status:  'submitted'
    }
  ]
};
