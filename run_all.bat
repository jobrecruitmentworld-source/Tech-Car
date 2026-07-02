@echo off
echo Starting PHP Backend Server on port 8000...
start "PHP Backend" cmd /k "cd backend && C:\xampp\php\php.exe -S 127.0.0.1:8000"

echo Starting Next.js Frontend Server...
start "Next.js Frontend" cmd /k "cd frontend && npm run dev"

echo Both servers are starting! You can close this window.
