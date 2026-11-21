/* ============================================================
   content/profile.js —— 首页个人信息（中英双语）
   ------------------------------------------------------------
   ★ 这个文件会被推到公开的 GitHub 仓库，任何人都看得到，包括历史版本。
     所以：不要写电话、身份证、家庭住址、证件照；邮箱只写你愿意公开的那个。
   写法：{ zh: '中文', en: 'English' } 两种语言各写一份；两种语言一样的写普通字符串即可。
   bio 里可以写 HTML，例如 <strong>粗体</strong>、<a href="...">链接</a>。
   ============================================================ */
var PROFILE = {

  name: { zh: '鲁一恒', en: 'Yiheng Lu' },

  /* 论文作者列表里你的署名写法，用于在「论文」页自动加粗，可写多种 */
  authorNames: ['鲁一恒', 'Yiheng Lu', 'Lu, Y.', 'Y. Lu'],

  role: { zh: '经济学博士研究生 · 数量经济学', en: 'Ph.D. Student in Economics · Quantitative Economics' },

  /* 所在单位：大学和研究所是并列的两个机构，所以各占一行，不写成上下级 */
  affiliation: [
    { zh: '中国社会科学院大学',                   en: 'University of Chinese Academy of Social Sciences' },
    { zh: '中国社会科学院数量经济与技术经济研究所', en: 'Institute of Quantitative and Technological Economics, Chinese Academy of Social Sciences' }
  ],

  /* 照片：留空 '' 则显示姓名首字的占位头像。放照片：把图片放到 assets/images/，这里写 'assets/images/photo.jpg'。
     ★ 公开仓库里的照片等于公开，想清楚再放。 */
  photo: 'assets/images/photo.jpg',

  /* 公开邮箱：留空 '' 则页脚和每篇「思考」末尾的「欢迎来信」都不显示。 */
  email: 'luheng334266@gmail.com',

  /* 联系方式 / 外部链接按钮。icon 可选：email / github / scholar / orcid / link。不需要的删掉。 */
  links: [
    { label: { zh: '邮箱', en: 'Email' }, icon: 'email', url: 'mailto:luheng334266@gmail.com' },
    { label: 'GitHub', icon: 'github', url: 'https://github.com/luheng33' }
  ],

  /* 关于（每个元素一段，第一段用大字） */
  bio: {
    zh: [
      '<strong>研究兴趣：</strong>数字经济、人工智能、测算评价体系、产业组织、AI 智能体。',
      '我也喜欢把研究中反复出现的环节做成工具，比如帮我检索候选文献的「顶刊助手」。'
    ],
    en: [
      '<strong>Research interests:</strong> digital economy, artificial intelligence, measurement and evaluation systems, industrial organization, and AI agents.',
      'I also like to turn recurring parts of my research into tools, such as Top-Journal Assistant, which helps me search for candidate literature.'
    ]
  },

  /* 教育经历（最新在前） */
  education: [
    {
      period: { zh: '2024.9 – 至今', en: '2024.9 – present' },
      degree: { zh: '经济学博士（数量经济学）', en: 'Ph.D. in Economics (Quantitative Economics)' },
      detail: { zh: '中国社会科学院大学 · 中国社会科学院数量经济与技术经济研究所',
                en: 'University of Chinese Academy of Social Sciences · Institute of Quantitative and Technological Economics, CASS' }
    },
    {
      period: { zh: '2021.9 – 2024.6', en: '2021.9 – 2024.6' },
      degree: { zh: '经济学硕士（政治经济学）', en: 'Master of Economics (Political Economy)' },
      detail: { zh: '广东省社会科学院 经济学部', en: 'Department of Economics, Guangdong Academy of Social Sciences' }
    },
    {
      period: { zh: '2017.9 – 2021.6', en: '2017.9 – 2021.6' },
      degree: { zh: '经济学学士、理学学士（数学与经济学双学位）', en: 'Bachelor of Economics and Bachelor of Science (double degree in Mathematics and Economics)' },
      detail: { zh: '中国人民大学 信息学院', en: 'School of Information, Renmin University of China' }
    }
  ]
};
