// 渲染测试：用真实的 Edge（无头，经 Chrome DevTools 协议驱动）逐页打开本地预览，
// 检查：页面真的渲染出内容、没有 JS 报错、没有横向溢出、各栏目数量对得上。
// 用法：node scripts/渲染测试.js     需要装有 Edge；会临时起一个本地小服务器，结束自动关闭。
// 为什么不用 --dump-dom：它配合 --virtual-time-budget 时在本机会一直不退出，什么也拿不到。
const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const root = path.resolve(__dirname, "..");
const EDGE = ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find(fs.existsSync);
if (!EDGE) { console.log("找不到 Edge，跳过渲染测试"); process.exit(0); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- 本地静态服务器（只服务仓库目录，越界路径 404） ----
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".md": "text/markdown; charset=utf-8" };
const server = http.createServer((req, res) => {
  const p = path.resolve(root, decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "") || "index.html");
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end("not found"); }
  res.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" });
  res.end(fs.readFileSync(p));
});
const getJson = (u) => new Promise((res, rej) => http.get(u, (r) => { let s = ""; r.on("data", (c) => (s += c)); r.on("end", () => { try { res(JSON.parse(s)); } catch (e) { rej(e); } }); }).on("error", rej));

const PROBE = `(() => { const de = document.documentElement, q = s => document.querySelector(s);
  return JSON.stringify({ innerWidth, scrollWidth: de.scrollWidth, overflowX: de.scrollWidth > innerWidth + 1,
    title: document.title, htmlLang: document.documentElement.lang,
    switchText: (q("#lang-switch")||{}).textContent || "", switchHref: (q("#lang-switch")||{}).getAttribute ? (q("#lang-switch")||{getAttribute(){return ""}}).getAttribute("href") : "",
    navText: [...document.querySelectorAll(".nav-link")].map(x => x.textContent), affils: document.querySelectorAll(".hero-affil").length,
    advisors: [...document.querySelectorAll(".edu-body p")].filter(x => /指导老师|Advisors/.test(x.textContent)).map(x => x.textContent),
    heroEn: (q(".hero-en")||{}).textContent || "", postMeta: (q("#post-meta")||{}).textContent || "", chipText: [...document.querySelectorAll(".chip")].map(x => x.firstChild.textContent),
    pubStatuses: [...document.querySelectorAll(".pub-status")].map(x => x.textContent), bioText: (q("#bio")||{}).textContent || "", navLinks: document.querySelectorAll(".nav-link").length, h1: (q("h1")||{}).textContent || "",
    bodyTextLen: document.body.innerText.length, sections: [...document.querySelectorAll(".section-title")].map(x => x.textContent),
    cards: document.querySelectorAll(".card").length, pubs: document.querySelectorAll(".pub").length,
    subTitles: [...document.querySelectorAll(".sub-title")].map(x => x.textContent), drafts: document.querySelectorAll(".tag-amber").length,
    threads: document.querySelectorAll(".thread").length, chips: document.querySelectorAll(".chip").length,
    prose: (q(".prose")||{}).innerText ? q(".prose").innerText.slice(0, 40) : "", notice: (q(".notice")||{}).textContent || "",
    feedbackShown: !!q(".feedback"),
    // 临时给 PROFILE 设个邮箱，检查「欢迎来信」生成的链接（测完还原，不影响页面）
    feedback: (typeof Core !== "undefined") ? (e => { const old = PROFILE.email; PROFILE.email = "you@example.com"; const on = Core.feedbackHtml("T 题"); PROFILE.email = ""; const off = Core.feedbackHtml("T"); PROFILE.email = old; return { on, off }; })() : null,
    avatar: !!q(".avatar"), photoOk: !!q(".hero-photo img") && q(".hero-photo img").complete && q(".hero-photo img").naturalWidth > 0, tables: document.querySelectorAll(".prose table").length, lis: document.querySelectorAll(".prose ol li").length,
    quotes: document.querySelectorAll(".prose blockquote").length,
    md: (typeof Core !== "undefined") ? (h => ({ tables: (h.match(/<table/g) || []).length, lis: (h.match(/<li>/g) || []).length, quotes: (h.match(/<blockquote/g) || []).length, bold: (h.match(/<strong>/g) || []).length }))(Core.markdown(["| a | b |", "| --- | --- |", "| 1 | 2 |", "", "1. x", "2. y", "3. z", "", "> q", "", "**b**"].join(String.fromCharCode(10)))) : null }); })()`;

const results = [];
function check(name, ok, detail) { results.push(ok); console.log(`${ok ? "通过" : "失败"}  ${name}${ok ? "" : "   <-- " + (detail || "")}`); }

async function run(port) {
  const base = `http://127.0.0.1:${port}`;
  const dbg = 9300 + Math.floor(Math.random() * 500);
  const ud = fs.mkdtempSync(path.join(os.tmpdir(), "edge_ud_"));
  const edge = spawn(EDGE, ["--headless=new", "--disable-gpu", `--remote-debugging-port=${dbg}`, `--user-data-dir=${ud}`, "--no-first-run", "about:blank"], { stdio: "ignore" });
  try {
    let tabs;
    for (let i = 0; i < 40; i++) { try { tabs = await getJson(`http://127.0.0.1:${dbg}/json`); if (tabs.length) break; } catch (e) { /* 等 Edge 起来 */ } await sleep(250); }
    const ws = new WebSocket(tabs.find((t) => t.type === "page").webSocketDebuggerUrl);
    await new Promise((r) => (ws.onopen = r));
    let id = 0; const pend = new Map(); const events = [];
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } else events.push(d); };
    const send = (method, params = {}) => new Promise((res) => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
    await send("Runtime.enable"); await send("Page.enable"); await send("Log.enable");

    async function inspect(p, width, lang) {
      if (lang) p += (p.includes("?") ? "&" : "?") + "lang=" + lang;
      events.length = 0;
      await send("Emulation.setDeviceMetricsOverride", { width, height: 1400, deviceScaleFactor: 1, mobile: width < 500 });
      await send("Page.navigate", { url: base + p });
      for (let i = 0; i < 60; i++) { await sleep(150); if (events.some((e) => e.method === "Page.loadEventFired")) break; }
      await sleep(500);
      const r = await send("Runtime.evaluate", { expression: PROBE, returnByValue: true });
      const info = JSON.parse(r.result.result.value);
      info.errors = events.filter((e) => e.method === "Runtime.exceptionThrown" || (e.method === "Log.entryAdded" && e.params.entry.level === "error" && !/favicon/.test(e.params.entry.text + (e.params.entry.url || ""))))
        .map((e) => e.method === "Runtime.exceptionThrown" ? e.params.exceptionDetails.text : e.params.entry.text + " " + (e.params.entry.url || ""));
      return info;
    }

    const pages = [
      ["/index.html", "首页"], ["/pages/products.html", "产品页"], ["/pages/publications.html", "论文页"],
      ["/pages/thinking.html", "思考列表页"], ["/pages/post.html?id=generative-ai-cocoon", "文章页"], ["/pages/post.html?id=no-such-post", "不存在的文章"],
    ];
    for (const width of [1200, 390]) {
      console.log(`\n== 宽度 ${width}px ==`);
      for (const [p, label] of pages) {
        const i = await inspect(p, width, "zh");
        check(`${label}：没有 JS 报错`, i.errors.length === 0, i.errors.join("; "));
        check(`${label}：没有横向溢出`, !i.overflowX, `视口 ${i.innerWidth}，文档宽 ${i.scrollWidth}`);
        // "不存在的文章"本来就只有标题 + 一句提示 + 页脚（手机宽度下导航还收进了汉堡菜单），不适用字数门槛；
        // 它有自己的断言（下面：友好提示、不白屏）。其他页面的门槛不变。
        if (label !== "不存在的文章") check(`${label}：有内容（文字 > 70 字）`, i.bodyTextLen > 70, `只有 ${i.bodyTextLen} 字`);
        if (label === "首页") {
          check("首页：关于 / 论文 / 思考 / 产品 四个区块按这个顺序", JSON.stringify(i.sections) === JSON.stringify(["关于", "论文", "思考", "产品"]), JSON.stringify(i.sections));
          check("首页：照片真的加载出来了（不是占位头像、不是裂图）", i.photoOk && !i.avatar, JSON.stringify({ photoOk: i.photoOk, avatar: i.avatar }));
          check("首页：产品 1 张卡、思考 5 篇", i.cards === 1 && i.threads === 5, `cards=${i.cards} threads=${i.threads}`);
          check("首页：论文预览 2 篇（1 已发表 + 1 在投）", i.pubs === 2, `pubs=${i.pubs}`);
          check("首页：导航 3 项", i.navLinks === 3, `navLinks=${i.navLinks}`);
        }
        if (label === "论文页") check("论文页：2 篇，分成「已发表」「在投」两组", i.pubs === 2 && JSON.stringify(i.subTitles) === JSON.stringify(["已发表", "在投"]), JSON.stringify({ p: i.pubs, g: i.subTitles }));
        if (label === "思考列表页") check("思考页：5 篇文章 + 筛选条（全部 + 2 个主题）", i.threads === 5 && i.chips === 3, `threads=${i.threads} chips=${i.chips}`);
        if (label === "文章页") {
          check("文章页：正文真的读到并渲染出来（有引用块和粗体，没有报错提示框）", i.quotes === 1 && !i.notice && /问题/.test(i.prose), JSON.stringify({ q: i.quotes, n: i.notice, prose: i.prose }));
          check("文章页：草稿显示「写作中」标签", i.drafts >= 1, `drafts=${i.drafts}`);
          check("文章页：设了公开邮箱就显示「欢迎来信」；清空邮箱则不显示；链接带文章标题", i.feedbackShown && i.feedback.off === "" && i.feedback.on.includes("mailto:you@example.com?subject=") && i.feedback.on.includes(encodeURIComponent("T 题")), JSON.stringify(i.feedback));
          // 内置 Markdown 渲染器的回归检查：表格 / 有序列表 / 引用 / 粗体
          check("Markdown 渲染器：表格、列表、引用、粗体都能渲染", i.md && i.md.tables === 1 && i.md.lis === 3 && i.md.quotes === 1 && i.md.bold === 1, JSON.stringify(i.md));
        }
        if (label === "不存在的文章") check("不存在的文章：友好提示，不白屏", /没有找到/.test(i.h1) && !!i.notice, i.h1);
      }
    }

    // ---- 英文版 / 语言切换 / 记住选择 ----
    console.log("\n== 英文版与语言切换 ==");
    const zh = await inspect("/index.html", 1200, "zh");
    check("中文首页：html lang=zh-CN，按钮显示 EN 且指向 ?lang=en", zh.htmlLang === "zh-CN" && zh.switchText === "EN" && /lang=en/.test(zh.switchHref), JSON.stringify([zh.htmlLang, zh.switchText, zh.switchHref]));
    check("中文首页：单位两行并列；三段学历都有「指导老师：」", zh.affils === 2 && zh.advisors.length === 3 && zh.advisors.every((x) => /^指导老师：/.test(x)), JSON.stringify([zh.affils, zh.advisors]));
    check("中文首页：关于里是研究兴趣，不再有旧的那段自我介绍", /研究兴趣：/.test(zh.bioText) && !/关注 AI 如何影响/.test(zh.bioText), zh.bioText.slice(0, 60));
    const en = await inspect("/index.html", 1200, "en");
    check("英文首页：没有 JS 报错", en.errors.length === 0, en.errors.join("; "));
    check("英文首页：html lang=en，按钮显示「中文」且指向 ?lang=zh", en.htmlLang === "en" && en.switchText === "中文" && /lang=zh/.test(en.switchHref), JSON.stringify([en.htmlLang, en.switchText, en.switchHref]));
    check("英文首页：区块标题是英文，且英文版没有多余的英文小标题", JSON.stringify(en.sections) === JSON.stringify(["About", "Publications", "Thinking", "Tools"]), JSON.stringify(en.sections));
    check("英文首页：大标题 Yiheng Lu，下面小字是中文名", /^Yiheng Lu/.test(en.h1) && en.heroEn === "鲁一恒", JSON.stringify([en.h1, en.heroEn]));
    check("英文首页：导航是英文；单位两行；指导老师是 Advisors:", JSON.stringify(en.navText) === JSON.stringify(["Publications", "Thinking", "Tools"]) && en.affils === 2 && en.advisors.length === 3 && en.advisors.every((x) => /^Advisors:/.test(x)), JSON.stringify([en.navText, en.affils, en.advisors]));
    check("英文首页：论文状态是 Published / Under review", JSON.stringify(en.pubStatuses) === JSON.stringify(["Published", "Under review"]), JSON.stringify(en.pubStatuses));
    check("英文首页：没有横向溢出", !en.overflowX, `文档宽 ${en.scrollWidth}`);
    check("英文首页：标签页标题是英文", /Yiheng Lu | Ph.D./.test(en.title), en.title);
    const mem = await inspect("/index.html", 1200);   // 不带 ?lang：应沿用刚才选的英文
    check("记住选择：之前选了英文，再打开不带参数的网址仍是英文", mem.htmlLang === "en", mem.htmlLang);
    const enPost = await inspect("/pages/post.html?id=generative-ai-cocoon", 1200, "en");
    check("英文文章页：读到英文正文，没有提示框；日期是英文写法；草稿标签是 Draft", /problem/i.test(enPost.prose) && !enPost.notice && enPost.postMeta === "Nov 16, 2026" && enPost.drafts >= 1, JSON.stringify([enPost.prose, enPost.notice, enPost.postMeta, enPost.drafts]));
    check("英文文章页：没有 JS 报错、没有溢出", enPost.errors.length === 0 && !enPost.overflowX, enPost.errors.join("; "));
    const enThink = await inspect("/pages/thinking.html", 1200, "en");
    check("英文思考页：5 篇，筛选条是 All / AI & Economics / Measurement & Methods", enThink.threads === 5 && JSON.stringify(enThink.chipText) === JSON.stringify(["All", "AI & Economics", "Measurement & Methods"]), JSON.stringify([enThink.threads, enThink.chipText]));
    const enMobile = await inspect("/index.html", 390, "en");
    check("英文首页（手机 390px）：没有横向溢出、没有 JS 报错", !enMobile.overflowX && enMobile.errors.length === 0, JSON.stringify([enMobile.scrollWidth, enMobile.errors]));
    // 没有英文正文时：退回中文原文并提示
    const fb = await send("Runtime.evaluate", { awaitPromise: true, returnByValue: true, expression: `(async () => { const d = document.createElement("div"); await Core.renderMarkdownFile("content/posts/no-such.en.md", d, "content/posts/hoi.md"); return JSON.stringify({ notice: !!d.querySelector(".notice"), zh: /HOI/.test(d.textContent) }); })()` });
    const fbi = JSON.parse(fb.result.result.value);
    check("缺英文正文时：显示中文原文，并有「暂无英文版」提示", fbi.notice && fbi.zh, JSON.stringify(fbi));
    await inspect("/index.html", 1200, "zh");   // 还原语言选择，不留痕迹
    ws.close();
  } finally { edge.kill(); await sleep(300); try { fs.rmSync(ud, { recursive: true, force: true }); } catch (e) { /* 临时目录清不掉不影响结果 */ } }
}

server.listen(0, "127.0.0.1", async () => {
  try { await run(server.address().port); } catch (e) { check("测试脚本自身运行正常", false, String(e)); }
  server.close();
  const bad = results.filter((x) => !x).length;
  console.log(`\n${results.length - bad}/${results.length} 通过`);
  process.exit(bad ? 1 : 0);
});
