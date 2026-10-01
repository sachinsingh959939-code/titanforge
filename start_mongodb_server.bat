@echo off
cd /d "%~dp0"
title TITAN FORGE - MONGODB BACKEND SERVER

echo ===================================================
echo     TITAN FORGE - MONGODB BACKEND & API SERVER
echo ===================================================
echo.
echo [1] Checking MongoDB Configuration (mongo_config.json)...
echo [2] Starting REST API Server on port 8000...
echo.
if not defined GOOGLE_CLIENT_ID set /p "GOOGLE_CLIENT_ID=Paste Google Client ID: "
if not defined GOOGLE_CLIENT_SECRET set /p "GOOGLE_CLIENT_SECRET=Paste Google Client Secret: "
if not defined GOOGLE_CLIENT_ID (
	echo Google Client ID is required.
	pause
	exit /b 1
)
if not defined GOOGLE_CLIENT_SECRET (
	echo Google Client Secret is required.
	pause
	exit /b 1
)
echo Website URL:  http://localhost:8000
echo Admin Panel:  http://localhost:8000/admin.html
echo.
echo Opening Admin Dashboard & Main Website in your browser...
start "" http://localhost:8000/admin.html
start "" http://localhost:8000

echo.
echo [SERVER CONSOLE LOGS - Press Ctrl+C to stop]:
py -3 server.py 2>nul || python server.py
pause

