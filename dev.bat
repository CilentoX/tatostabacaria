@echo off
echo ========================================
echo   Tatos Tabacaria - Dev Environment
echo ========================================
echo.

echo [1/2] Starting BACK-END (port 4000)...
start "Tatos API" cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Starting FRONT-END (port 3000)...
start "Tatos Web" cmd /k "npm run dev"

echo.
echo Both servers are starting in separate windows.
echo   Back-end:  http://localhost:4000
echo   Front-end: http://localhost:3000
echo.
pause
