# 发布主页：检查 → 提交 → 推送到 GitHub。推送后 GitHub Pages 会在一两分钟内自动更新线上页面。
# 用法：右键 → 使用 PowerShell 运行。带说明：  .\发布.ps1 -Message "加了一篇思考"
#
# 做的事（按顺序，任何一步失败就停，不会推送）：
#   1. node scripts/检查.js         —— 检查有没有把手机号/密钥/助手服务器信息等写进公开仓库，以及数据是否完整
#   2. 显示这次改了哪些文件          —— 让你确认
#   3. git add / commit / push      —— 推送到 GitHub（走 ssh.github.com:443，本网络只有这条路通）
# 这个仓库是【公开】的：推上去的每个文件、每个历史版本，所有人都看得到。
param([string]$Message = "")

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Set-Location (Split-Path -Parent $PSScriptRoot)

function Stop-Here($text) { Write-Host $text -ForegroundColor Red; Read-Host "按回车退出"; exit 1 }

# 1) 检查
Write-Host "`n[1/3] 公开前检查…" -ForegroundColor Cyan
node scripts/检查.js
if ($LASTEXITCODE -ne 0) { Stop-Here "检查没通过，已停止，没有推送任何东西。请按上面「失败」的提示修改后重试。" }

# 仓库还没建立（第一次）时给出明确提示，而不是让 git 报一堆看不懂的错
if (-not (Test-Path ".git")) { Stop-Here "这个文件夹还不是 git 仓库。第一次发布需要先让 Claude 帮你初始化并关联 GitHub 仓库。" }
$remote = git remote get-url origin 2>$null
if (-not $remote) { Stop-Here "还没有关联 GitHub 仓库（git remote）。请先让 Claude 帮你关联。" }

# 2) 看改动
Write-Host "`n[2/3] 这次的改动：" -ForegroundColor Cyan
git status --short
$changes = git status --porcelain
if (-not $changes) { Write-Host "没有任何改动，不需要发布。" -ForegroundColor Yellow; Read-Host "按回车退出"; exit 0 }

$ans = Read-Host "`n确认把以上改动公开发布到 GitHub？输入 y 回车确认，其他任意键取消"
if ($ans -ne "y") { Write-Host "已取消，没有推送。"; exit 0 }

# 3) 提交并推送
if (-not $Message) { $Message = "更新主页 " + (Get-Date -Format "yyyy-MM-dd HH:mm") }
Write-Host "`n[3/3] 提交并推送…" -ForegroundColor Cyan
git add -A
git commit -m $Message
git push
if ($LASTEXITCODE -ne 0) { Stop-Here "推送失败。常见原因：网络不通（本网络只能走 ssh.github.com:443，已在 ~/.ssh/config 配好）。把上面的报错发给 Claude。" }

Write-Host "`n已推送。GitHub Pages 通常 1~2 分钟内更新线上页面。" -ForegroundColor Green
Write-Host "线上地址：https://digitalsunfish.com （如果域名 DNS 还没配好，先看 https://luheng33.github.io ）"
Read-Host "按回车退出"
