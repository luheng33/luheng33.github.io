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
    title: document.title, navLinks: document.querySelectorAll(".nav-link").length, h1: (q("h1")||{}).textContent || "",
    bodyTextLen: document.body.innerText.length, sections: [...document.querySelectorAll(".section-title")].map(x => x.textContent),
    cards: document.querySelectorAll(".slide-card").length, pubs: document.querySelectorAll(".pub").length,
    threads: document.querySelectorAll(".thread").length, chips: document.querySelectorAll(".chip").length,
    prose: (q(".prose")||{}).innerText ? q(".prose").innerText.slice(0, 40) : "", notice: (q(".notice")||{}).textContent || "",
    avatar: !!q(".avatar"), tables: document.querySelectorAll(".prose table").length, lis: document.querySelectorAll(".prose ol li").length,
    quotes: document.querySelectorAll(".prose blockquote").length }); })()`;

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

    async function inspect(p, width) {
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
      ["/pages/thinking.html", "思考列表页"], ["/pages/post.html?id=welcome", "文章页"], ["/pages/post.html?id=no-such-post", "不存在的文章"],
    ];
    for (const width of [1200, 390]) {
      console.log(`\n== 宽度 ${width}px ==`);
      for (const [p, label] of pages) {
        const i = await inspect(p, width);
        check(`${label}：没有 JS 报错`, i.errors.length === 0, i.errors.join("; "));
        check(`${label}：没有横向溢出`, !i.overflowX, `视口 ${i.innerWidth}，文档宽 ${i.scrollWidth}`);
        // "不存在的文章"本来就只有标题 + 一句提示 + 页脚（手机宽度下导航还收进了汉堡菜单），不适用字数门槛；
        // 它有自己的断言（下面：友好提示、不白屏）。其他页面的门槛不变。
        if (label !== "不存在的文章") check(`${label}：有内容（文字 > 70 字）`, i.bodyTextLen > 70, `只有 ${i.bodyTextLen} 字`);
        if (label === "首页") {
          check("首页：关于 / 产品 / 论文 / 思考 四个区块都在，且思考在最后", JSON.stringify(i.sections) === JSON.stringify(["关于", "产品", "论文", "思考"]), JSON.stringify(i.sections));
          check("首页：没有照片时显示占位头像", i.avatar);
          check("首页：产品卡 + 思考卡共 2 张", i.cards === 2, `cards=${i.cards}`);
          check("首页：论文预览 2 篇（工作论文默认不公开）", i.pubs === 2, `pubs=${i.pubs}`);
          check("首页：导航 3 项", i.navLinks === 3, `navLinks=${i.navLinks}`);
        }
        if (label === "论文页") check("论文页：只显示 2 篇已发表", i.pubs === 2, `pubs=${i.pubs}`);
        if (label === "思考列表页") check("思考页：1 篇文章 + 筛选条（全部 + 2 个主题）", i.threads === 1 && i.chips === 3, `threads=${i.threads} chips=${i.chips}`);
        if (label === "文章页") check("文章页：Markdown 正文渲染出来（有表格、列表、引用，没有报错提示框）", i.tables === 1 && i.lis === 3 && i.quotes === 1 && !i.notice, JSON.stringify({ t: i.tables, l: i.lis, q: i.quotes, n: i.notice }));
        if (label === "不存在的文章") check("不存在的文章：友好提示，不白屏", /没有找到/.test(i.h1) && !!i.notice, i.h1);
      }
    }
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
