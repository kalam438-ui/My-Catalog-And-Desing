@echo off
title START_APP_HERE -MY CATALOG ALL DESING
echo ==========================================
echo    MY CATALOG ALL DESING - Laptop Start
echo ==========================================
echo.
echo 1. Checking if app is ready...
echo.

if not exist node_modules (
    echo [INFO] First time setup: Installing app parts...
    echo [INFO] This will take 1-2 minutes. Please wait...
    call npm install
)

echo.
echo 2. Starting the application...
echo.
echo [SUCCESS] App is starting! 
echo [INFO] Your browser will open automatically.
echo [INFO] If it doesn't, go to: http://localhost:3000
echo.
echo Keep this window open while using the app.
echo.

start http://localhost:3000
call npm run dev

pause
