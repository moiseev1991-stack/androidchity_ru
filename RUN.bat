@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Освобождаю порт 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do taskkill /F /PID %%a 2>nul
timeout /t 2 /nobreak >nul
echo Запускаю сервер. Через 2 сек откроется браузер.
start /min cmd /c "timeout /t 2 /nobreak >nul && start http://127.0.0.1:8080/"
node server.js
pause
