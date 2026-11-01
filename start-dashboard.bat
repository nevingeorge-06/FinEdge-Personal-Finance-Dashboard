@echo off
echo =========================================================================
echo  FinEdge - Smarter Spending, Better Living
echo =========================================================================
echo.
echo Starting Vite Development Server at http://localhost:5173 ...
echo.

set PATH=C:\Users\nevin\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.20.0-win-x64;%PATH%
call pnpm dev

pause
