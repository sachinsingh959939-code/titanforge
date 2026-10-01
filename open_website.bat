@echo off
cd /d "%~dp0"
title TITAN FORGE - WEBSITE

netstat -ano | findstr ":8000" >nul
if %errorlevel% neq 0 (
    echo Starting Titan Forge server on port 8000...
    start "TITAN FORGE SERVER" /min cmd /c "py -3 server.py 2>nul || python server.py"
    timeout /t 2 /nobreak >nul
)

start "" http://localhost:8000
