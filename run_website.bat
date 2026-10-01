@echo off
cd /d "%~dp0"
title TITAN FORGE LAUNCHER

echo ===================================================
echo              TITAN FORGE FITNESS
echo ===================================================
echo.
echo Starting local web server...
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

:: Start Python server with MongoDB API support
start "" http://localhost:8000
py -3 server.py 2>nul || python server.py

:: Fallback if python server is closed
start "" "%~dp0index.html"

