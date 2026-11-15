// 公开前检查：node scripts/检查.js
// 这个仓库会推到公开的 GitHub，所以每次发布前自动检查三类问题：
//   A. 不该公开的内容（手机号、身份证号、证件照、密钥、助手服务器 IP、私库名）
//   B. 数据完整性（thinking.js 里每篇文章都有对应 .md，slug 合法，标签都已定义）
//   C. 结构完整性（每个 HTML 引用的本地脚本/样式文件都存在）
// 有任何一项失败就以非零退出码结束，发布脚本据此拒绝推送。
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const problems = [];
const warnings = [];
const fail = (m) => problems.push(m);

// 收集仓库里将被公开的文本文件（排除 .git、本脚本自己、node_modules）
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === ".git" || e.name === "node_modules") continue;
    // 私人笔记/ 只留本机、不会公开，里面可以写任何私人内容，不应让检查误报而挡住发布。
    // 代价是它成了检查盲区，所以下面有一条硬检查：.gitignore 必须排除它，否则直接失败。
    if (dir === root && e.name === "私人笔记") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
const all = walk(root);
const rel = (p) => path.relative(root, p).replace(/\\/g, "/");
const TEXT = /\.(html|css|js|md|json|txt|ps1|yml|yaml)$/i;
const IMG = /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i;

// ---- A. 隐私与密钥 ------------------------------------------------------------
const rules = [
  // 手机号有多种写法：连写、空格分隔、横线分隔、点分隔、带括号和国家码……
  // 做法：先把数字之间的空格、横线、点、括号去掉，再找 11 位手机号，这样不管怎么分隔都能抓到。
  // （这里不举任何具体号码作例子：本脚本会随仓库公开，注释里写了真号码就等于泄露。）
  { name: "手机号（任意分隔写法）",      test: (t) => /(?<![0-9])1[3-9][0-9]{9}(?![0-9])/.test(t.replace(/(?<=[0-9])[\s.\-－–—()（）]+(?=[0-9])/g, "")) },
  { name: "带区号的手机号",              re: /\+?\(?\+?86\)?[\s-]*1[3-9][0-9]/ },
  { name: "身份证号（18 位）",           re: /(?<![0-9])[1-9][0-9]{5}(19|20)[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[0-9]{3}[0-9Xx](?![0-9A-Za-z])/ },
  { name: "DeepSeek / OpenAI 类 key",    re: /\bsk-[A-Za-z0-9_-]{16,}/ },
  { name: "GitHub token",                re: /\bgh[pousr]_[A-Za-z0-9]{20,}/ },
  { name: "私钥",                        re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  // 下面三条的字面量拆开写，只是为了让检查器不会在扫描自己时报警；这不是隐藏——读到脚本的人
  // 一眼就能拼回来。能这样处理，是因为这三项本身不敏感：服务器 IP 已经通过域名解析公开，
  // 私库靠访问权限保护（知道名字也进不去），密码文件名只是一个本地路径。
  // 真正敏感的个人信息（手机号、身份证、密钥）用的是"格式规则"，脚本里没有任何真实值。
  // 扫描时不豁免本脚本自己：它若不小心写进了真实信息，下一次检查就会报出来。
  { name: "助手服务器的 IP",             re: new RegExp(["34", "96", "246", "56"].join("\\.")) },
  { name: "助手私库名",                  re: new RegExp(["dingkan", "zhushou"].join("-")) },
  { name: "助手访问密码文件",            re: new RegExp(["dingkan", "cloud", "password"].join("_")) },
];
for (const f of all) {
  if (!TEXT.test(f)) continue;
  const text = fs.readFileSync(f, "utf8");
  for (const r of rules) {
    if (r.test) { if (r.test(text)) fail(`[隐私] ${rel(f)} 含有「${r.name}」`); continue; }
    const m = r.re.exec(text);
    if (m) fail(`[隐私] ${rel(f)} 含有「${r.name}」：${m[0].slice(0, 12)}…`);
  }
}
// 邮箱：不一定是错，但每个都要让用户知道（公开仓库里的邮箱会被爬虫抓走）
for (const f of all) {
  if (!TEXT.test(f)) continue;
  const text = fs.readFileSync(f, "utf8");
  const found = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || [];
  for (const e of new Set(found)) {
    if (/^(you|your-address)@example\.com$/.test(e)) continue; // 注释里的示例
    warnings.push(`[邮箱] ${rel(f)} 出现 ${e}（会公开；确认这是你愿意公开的）`);
  }
}
// 照片：提醒一下，不拦截（用户可能就是要放）
for (const f of all) if (IMG.test(f) && !/favicon/i.test(f)) warnings.push(`[图片] ${rel(f)}（${(fs.statSync(f).size / 1024).toFixed(0)} KB）会公开；确认这是你愿意公开的`);
// 不该出现在仓库里的文件
for (const f of all) {
  if (/(^|\/)(\.env|.*\.pem|.*\.key|id_ed25519.*|.*password.*)$/i.test(rel(f))) fail(`[隐私] 不该出现的文件：${rel(f)}`);
}

// 未发表论文：从 私人笔记/未发表论文条目.js 里读出标题，若出现在任何公开文件里就失败。
// （页面不显示不等于看不到——公开仓库的源码谁都读得到。想公开某篇，就把它从笔记里删掉再放进数据文件。）
const wipFile = path.join(root, "私人笔记", "未发表论文条目.js");
if (fs.existsSync(wipFile)) {
  const titles = [...fs.readFileSync(wipFile, "utf8").matchAll(/title:\s*'([^']{6,})'/g)].map((m) => m[1]);
  for (const f of all) {
    if (!TEXT.test(f)) continue;
    const text = fs.readFileSync(f, "utf8");
    for (const t of titles) if (text.includes(t)) fail(`[隐私] ${rel(f)} 含有未发表论文的标题：${t.slice(0, 16)}…`);
  }
}

// ---- B. 数据完整性 ------------------------------------------------------------
function load(file, globalName) {
  const ctx = { window: {}, module: undefined };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8") + `\n;this.__out = typeof ${globalName} !== "undefined" ? ${globalName} : undefined;`, ctx, { filename: file });
  return ctx.__out;
}
let THINKING, PROFILE, PRODUCTS, PUBLICATIONS;
try { THINKING = load("content/thinking.js", "THINKING"); } catch (e) { fail(`[数据] content/thinking.js 无法解析：${e.message}`); }
try { PROFILE = load("content/profile.js", "PROFILE"); } catch (e) { fail(`[数据] content/profile.js 无法解析：${e.message}`); }
try { PRODUCTS = load("content/products.js", "PRODUCTS"); } catch (e) { fail(`[数据] content/products.js 无法解析：${e.message}`); }
try { PUBLICATIONS = load("content/publications.js", "PUBLICATIONS"); } catch (e) { fail(`[数据] content/publications.js 无法解析：${e.message}`); }
try { load("content/site.js", "SITE"); } catch (e) { fail(`[数据] content/site.js 无法解析：${e.message}`); }

if (THINKING) {
  const tagIds = new Set((THINKING.tags || []).map((t) => t.id));
  const seen = new Set();
  for (const p of THINKING.posts || []) {
    if (!/^[a-z0-9-]+$/.test(p.slug || "")) fail(`[文章] slug「${p.slug}」不合法（只能用小写字母、数字、短横线）`);
    if (seen.has(p.slug)) fail(`[文章] slug 重复：${p.slug}`);
    seen.add(p.slug);
    if (!fs.existsSync(path.join(root, "content/posts", `${p.slug}.md`))) fail(`[文章] 缺少正文文件 content/posts/${p.slug}.md`);
    if (!p.title) fail(`[文章] ${p.slug} 没有标题`);
    if (p.date && !/^\d{4}-\d{2}-\d{2}$/.test(p.date)) fail(`[文章] ${p.slug} 的日期格式应为 YYYY-MM-DD：${p.date}`);
    for (const t of p.tags || []) if (!tagIds.has(t)) fail(`[文章] ${p.slug} 用了未定义的标签「${t}」`);
  }
  // 反向：有 .md 但没登记的
  const dir = path.join(root, "content/posts");
  if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir)) if (f.endsWith(".md") && !seen.has(f.slice(0, -3))) warnings.push(`[文章] content/posts/${f} 没有在 thinking.js 里登记，不会显示`);
}
if (PRODUCTS) for (const p of PRODUCTS.items || []) {
  if (!/^[a-z0-9-]+$/.test(p.id || "")) fail(`[产品] id「${p.id}」不合法`);
  if (p.status === "live" && !/^https:\/\//.test(p.url || "")) fail(`[产品] ${p.id} 状态是 live 但 url 不是 https 地址`);
}
if (PUBLICATIONS) for (const p of PUBLICATIONS.items || []) {
  if (!p.title || !p.authors) fail(`[论文] 有一项缺标题或作者：${JSON.stringify(p).slice(0, 60)}`);
  if (!["published", "submitted", "in-prep", undefined].includes(p.status)) fail(`[论文] 「${p.title}」的 status 不合法：${p.status}`);
}
if (PROFILE && PROFILE.photo && !fs.existsSync(path.join(root, PROFILE.photo))) fail(`[数据] profile.js 的 photo 指向不存在的文件：${PROFILE.photo}`);

// ---- C. 结构完整性 ------------------------------------------------------------
for (const f of all.filter((p) => p.endsWith(".html"))) {
  const html = fs.readFileSync(f, "utf8");
  for (const m of html.matchAll(/(?:src|href)="([^"#?]+)"/g)) {
    const ref = m[1];
    if (/^(https?:|mailto:|data:|\/\/)/i.test(ref)) continue;
    const target = path.resolve(path.dirname(f), ref);
    if (!fs.existsSync(target)) fail(`[结构] ${rel(f)} 引用了不存在的文件：${ref}`);
  }
  if (/<script[^>]+src="https?:/i.test(html)) fail(`[结构] ${rel(f)} 引用了外部脚本；本站不依赖外部 CDN（访问者在国内，外部脚本可能加载失败）`);
}
if (fs.existsSync(path.join(root, "私人笔记"))) {
  const ig = fs.existsSync(path.join(root, ".gitignore")) ? fs.readFileSync(path.join(root, ".gitignore"), "utf8") : "";
  if (!/^私人笔记\/?\s*$/m.test(ig)) fail("[隐私] 存在 私人笔记/ 文件夹，但 .gitignore 没有排除它：发布时会被 git add -A 一起推到公开仓库");
}
if (!fs.existsSync(path.join(root, "CNAME"))) fail("[结构] 缺少 CNAME 文件（GitHub Pages 绑定域名要用）");
else if (fs.readFileSync(path.join(root, "CNAME"), "utf8").trim() !== "digitalsunfish.com") fail("[结构] CNAME 内容不是 digitalsunfish.com");

// ---- 报告 ---------------------------------------------------------------------
for (const w of warnings) console.log("提醒  " + w);
for (const p of problems) console.log("失败  " + p);
console.log(`\n${problems.length ? "检查未通过" : "检查通过"}：${problems.length} 项失败，${warnings.length} 项提醒，共扫描 ${all.length} 个文件`);
process.exit(problems.length ? 1 : 0);
