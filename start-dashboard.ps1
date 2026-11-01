# FinEdge - Personal Finance Dashboard Launcher
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host " FinEdge - Smarter Spending, Better Living" -ForegroundColor Green
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting Vite Development Server at http://localhost:5173 ..." -ForegroundColor Yellow

$env:PATH = "C:\Users\nevin\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.20.0-win-x64;" + $env:PATH
pnpm dev
