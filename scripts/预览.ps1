# 本地预览主页：启动一个只绑定本机的小服务器，在浏览器打开。
# 为什么不能直接双击 index.html：文章正文是用 fetch 读取 .md 文件的，浏览器不允许 file:// 下这样读取。
# 用法：右键 → 使用 PowerShell 运行；关闭窗口即停止预览。

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$port = 8765
$url  = "http://127.0.0.1:$port/"

$py = (Get-Command python -ErrorAction SilentlyContinue)
if (-not $py) { Write-Host "找不到 python。请先安装 Python，或把 python 加入 PATH。" -ForegroundColor Red; Read-Host "按回车退出"; exit 1 }

Write-Host "预览地址：$url   （只有这台电脑能访问；关掉这个窗口就停止）" -ForegroundColor Green
Start-Process $url
Set-Location $root
& python -m http.server $port --bind 127.0.0.1
