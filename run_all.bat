@echo off
echo ==============================================
echo   BlogCMS: Starting PHP Backend and Next.js
echo ==============================================

echo [1/2] Starting PHP Backend API on Port 8000...
start cmd /k "C:\xampp\php\php.exe -S 127.0.0.1:8000 -t backend"

echo [2/2] Starting Next.js Frontend on Port 3000...
cd frontend
start cmd /k "npm run dev"

echo.
echo All servers started!
echo Frontend is available at: http://localhost:3000
echo Admin Panel is available at: http://localhost:3000/admin
echo.
pause
