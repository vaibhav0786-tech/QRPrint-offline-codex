@echo off
setlocal enabledelayedexpansion
title QRPrint Offline First-Time Setup Wizard

echo ===============================================
echo   QRPrint Offline - Windows Setup Wizard
echo ===============================================
echo.
where node >nul 2>nul || (echo Node.js 20+ is required. Install it from https://nodejs.org/ and rerun this file.& pause & exit /b 1)
where npm >nul 2>nul || (echo npm was not found. Reinstall Node.js with npm enabled.& pause & exit /b 1)

set /p SHOP_NAME=Shop name: 
set /p OWNER_NAME=Owner name: 
set /p STAFF_COUNT=Total number of staff members: 
set STAFF_NAMES=
for /l %%i in (1,1,%STAFF_COUNT%) do (
  set /p STAFF_%%i=Staff %%i name: 
  if "!STAFF_NAMES!"=="" (set STAFF_NAMES=!STAFF_%%i!) else (set STAFF_NAMES=!STAFF_NAMES!, !STAFF_%%i!)
)
set /p PRINTER_COUNT=Number of printers to connect: 
set /p DEFAULT_PRINTER=Default printer selection/name: 
set /p SHOP_ADDRESS=Shop address: 
set /p MOBILE=Mobile number: 
set /p EMAIL=Email address: 
set /p PORT=Local web port [3000]: 
if "%PORT%"=="" set PORT=3000
choice /m "Do you want to add a front page to print jobs"
if errorlevel 2 (set FRONT_PAGE=false) else (set FRONT_PAGE=true)

if not exist data mkdir data
powershell -NoProfile -ExecutionPolicy Bypass -Command "$profile=[ordered]@{shopName='%SHOP_NAME%';ownerName='%OWNER_NAME%';staffNames='%STAFF_NAMES%'.Split(',').Trim();staffCount=[int]'%STAFF_COUNT%';printerCount=[int]'%PRINTER_COUNT%';defaultPrinter='%DEFAULT_PRINTER%';address='%SHOP_ADDRESS%';mobile='%MOBILE%';email='%EMAIL%';port=[int]'%PORT%';addFrontPage=[bool]::Parse('%FRONT_PAGE%')}; $profile ^| ConvertTo-Json -Depth 5 ^| Set-Content data\merchant-profile.json -Encoding UTF8"

echo Installing dependencies...
call npm install || exit /b 1
echo Building QRPrint Offline...
call npm run build || exit /b 1

echo.
echo Setup complete. Merchant profile saved to data\merchant-profile.json
echo Launch with: npm run dev -- --port %PORT% --host 127.0.0.1
echo Local URL: http://127.0.0.1:%PORT%
pause
