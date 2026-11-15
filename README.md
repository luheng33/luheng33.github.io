# 个人主页（digitalsunfish.com）维护说明

这个文件夹是主页的**本地工作副本**，和 GitHub 上的公开仓库 `luheng33/luheng33.github.io` 一一对应：
你在这里改，运行 `scripts/发布.ps1`，线上就更新。**线上那份不要直接在 GitHub 网页上改**，不然两边会不一致。

> **这个仓库是公开的。** 推上去的每个文件、每个历史版本，所有人都看得到。
> 所以不要写：电话、身份证、家庭住址、证件照、密钥、助手服务器的 IP、助手私库的名字。
> `发布.ps1` 每次推送前会自动检查这些，查到就拒绝推送。

## 和另一个项目的关系

| | 本文件夹（个人主页） | 顶刊助手 |
|---|---|---|
| 仓库 | `luheng33/luheng33.github.io`，**公开** | 你 GitHub 账号下的一个**私有**仓库（名字不写在这里，因为本文件会公开） |
| 地址 | https://digitalsunfish.com | https://search.digitalsunfish.com |
| 跑在哪 | GitHub Pages（静态页面，免费） | 谷歌云虚拟机 |
| 本地文件夹 | 桌面 `主页维护` | `文献库\3-用途\助手` |

两者完全独立：主页只放网页文件；助手的代码、密钥、数据一概不进主页仓库。
主页的「产品」栏只是放一个指向 `search.digitalsunfish.com` 的链接。

## 日常怎么改

所有内容都在 `content/` 里，**改引号里的文字就行，不用碰 `assets/` 里的代码**。

| 想做什么 | 改哪里 |
|---|---|
| 改姓名、简介、教育经历、联系方式、照片 | `content/profile.js` |
| 加/改一个产品 | `content/products.js` |
| 加/改一篇论文 | `content/publications.js` |
| 写一篇「思考」 | ① `content/thinking.js` 的 `posts` **最前面**加一项；② 新建 `content/posts/<slug>.md` 写正文 |
| 加一个「思考」分组 | `content/thinking.js` 的 `tags` 里加一行 |
| 改顶部导航 | `content/site.js` 的 `nav` |
| 整体换配色 | `assets/css/style.css` 第 1 节 `:root` 的变量 |

写一篇思考的例子：

```js
// content/thinking.js，posts 数组最前面加
{ slug: 'ai-markup', title: '标题', summary: '一两句摘要', date: '2026-12-01', tags: ['ai-economics'] },
```
然后新建 `content/posts/ai-markup.md`，用 Markdown 写正文（支持标题、列表、引用、表格、代码、链接、图片）。
`slug` 只能用小写字母、数字、短横线，发布后不要再改（链接会失效）。

## 三个脚本（`scripts/`）

| 脚本 | 用途 |
|---|---|
| `预览.ps1` | 本地预览。起一个只有本机能访问的小服务器并打开浏览器。**不能直接双击 index.html**：文章正文是用 fetch 读 .md 的，浏览器不允许 file:// 下这样做 |
| `检查.js` | 公开前检查：隐私（手机号/身份证/密钥/服务器 IP/私库名…）、数据完整性、引用是否存在。`node scripts/检查.js` |
| `发布.ps1` | 检查 → 显示改动 → 你确认 → 提交 → 推送。任何一步失败就停 |
| `渲染测试.js` | 用真实 Edge 逐页检查渲染、JS 报错、溢出。改了 `assets/` 里的代码后跑一下：`node scripts/渲染测试.js` |

## 草稿期的两个开关

- 每个页面 `<head>` 里有 `<meta name="robots" content="noindex">`：让搜索引擎别收录。**想被搜到时再删**（5 个 html 文件各有一行）。
- **未发表的工作论文不放进这个仓库**：数据文件会公开，页面不显示不等于看不到。它们的底稿存在 `私人笔记/`（本机，不公开），想展示时只放标题和状态。

## 设计上的取舍

- **不依赖任何外部 CDN。** 访问者在国内，外部脚本可能加载失败，页面不应因此坏掉。所以 Markdown 渲染是自己写的小渲染器（`assets/js/core.js`），只支持常用语法，**不支持数学公式和内嵌 HTML**（内嵌 HTML 会被转义显示，防止文章里的内容变成脚本）。
- **没有评论区、没有自动日期。** 日期手写在 `thinking.js`。
- 深色模式跟随系统。
- 视觉风格参考了一个公开的学术个人主页（白底、深藏青标题、蓝色强调、圆角卡片、横向滑轨）；**代码是为本站重新写的**，没有复制对方的文件。

## 第一次上线的步骤（尚未完成）

1. 在 GitHub 上建**公开**空仓库 `luheng33.github.io`（不要勾初始化 README）。
2. 让 Claude 在本文件夹初始化 git、关联这个仓库、推送。
3. 仓库 Settings → Pages：Source 选 `main` 分支根目录；Custom domain 填 `digitalsunfish.com`，勾 Enforce HTTPS（证书签发要几分钟到一天）。
4. 在 Spaceship 的 DNS 里加记录（**先做第 3 步，再加记录**）：
   - 根域名 4 条 A：`185.199.108.153` `185.199.109.153` `185.199.110.153` `185.199.111.153`
   - `www` 一条 CNAME → `luheng33.github.io`
5. 等 DNS 生效后访问 https://digitalsunfish.com。
