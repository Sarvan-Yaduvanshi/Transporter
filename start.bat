@echo off
title TransporterOps - Full Stack
echo ============================================
echo   TransporterOps - Starting Full Stack
echo ============================================
echo.

:: Start backend
echo [1/2] Starting Backend (port 5000)...
cd /d "%~dp0backend"
start "TransporterOps-Backend" cmd /k "npm run dev"

:: Start frontend
echo [2/2] Starting Frontend (port 5173)...
cd /d "%~dp0frontend"
start "TransporterOps-Frontend" cmd /k "npm run dev"

echo.
echo ============================================
echo   Both servers launched in separate windows
echo   Backend:  http://localhost:5000/api/health
echo   Frontend: http://localhost:5173
echo ============================================
pause
