@echo off
setlocal enabledelayedexpansion
title QRPrint Offline First-Time Setup Wizard

set "LOG_DIR=%TEMP%\qrprint-install-logs"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%" >nul 2>nul
set "LAST_OUTPUT_FILE="

goto :main

:pause_before_exit
echo.
echo Press any key to continue...
REM pause handles interactive consoles and redirected stdin; timeout is a fallback for hosts where pause cannot read a key.
pause >nul 2>nul
if errorlevel 1 timeout /t 3 /nobreak >nul 2>nul
exit /b 0

:fail_install
set "STEP=%~1"
set "EXIT_CODE=%~2"
echo.
echo ERROR: QRPrint Offline setup failed during: %STEP% 1>&2
echo Exit code: %EXIT_CODE% 1>&2
if defined LAST_OUTPUT_FILE if exist "!LAST_OUTPUT_FILE!" (
  for %%A in ("!LAST_OUTPUT_FILE!") do if %%~zA gtr 0 (
    echo. 1>&2
    echo Failure details captured from command output: 1>&2
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-Content -Path $env:LAST_OUTPUT_FILE -Tail 40" 1>&2
    echo. 1>&2
    echo Full log: !LAST_OUTPUT_FILE! 1>&2
    call :pause_before_exit
    exit /b %EXIT_CODE%
  )
)
echo. 1>&2
echo No command output was captured. This may be a silent failure; verify permissions, disk space, Node.js/npm installation, and network access. 1>&2
call :pause_before_exit
exit /b %EXIT_CODE%

:run_cmd
set "STEP=%~1"
shift /1
set "SAFE_STEP=%STEP: =_%"
set "SAFE_STEP=%SAFE_STEP:/=_%"
set "LAST_OUTPUT_FILE=%LOG_DIR%\%DATE:/=-%_%TIME::=-%_%SAFE_STEP%.log"
set "LAST_OUTPUT_FILE=%LAST_OUTPUT_FILE: =0%"
echo.
echo ^>^> %STEP%
echo Command: %* > "!LAST_OUTPUT_FILE!"
%* >> "!LAST_OUTPUT_FILE!" 2>&1
set "CMD_EXIT=!ERRORLEVEL!"
type "!LAST_OUTPUT_FILE!"
if not "!CMD_EXIT!"=="0" call :fail_install "%STEP%" "!CMD_EXIT!" & exit /b !CMD_EXIT!
exit /b 0

:require_cmd
where %~1 >nul 2>nul
if errorlevel 1 (
  echo.
  echo ERROR: %~2 1>&2
  call :pause_before_exit
  exit /b 127
)
exit /b 0

:main
echo ===============================================
echo   QRPrint Offline - Windows Setup Wizard
echo ===============================================
echo.
call :require_cmd node "Node.js 20+ is required. Install it from https://nodejs.org/ and rerun this installer." || exit /b 127
call :require_cmd npm "npm was not found. Reinstall Node.js with npm enabled and rerun this installer." || exit /b 127

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

call :run_cmd "Create data directory" cmd /c if not exist data mkdir data
set "PROFILE_PS=$profile=[ordered]@{shopName='%SHOP_NAME%';ownerName='%OWNER_NAME%';staffNames='%STAFF_NAMES%'.Split(',').Trim();staffCount=[int]'%STAFF_COUNT%';printerCount=[int]'%PRINTER_COUNT%';defaultPrinter='%DEFAULT_PRINTER%';address='%SHOP_ADDRESS%';mobile='%MOBILE%';email='%EMAIL%';port=[int]'%PORT%';addFrontPage=[bool]::Parse('%FRONT_PAGE%')}; $profile ^| ConvertTo-Json -Depth 5 ^| Set-Content data\merchant-profile.json -Encoding UTF8"
call :run_cmd "Write merchant profile" powershell -NoProfile -ExecutionPolicy Bypass -Command "%PROFILE_PS%"
call :run_cmd "Install npm dependencies" npm install
call :run_cmd "Build QRPrint Offline" npm run build

echo.
echo Setup complete. Merchant profile saved to data\merchant-profile.json
echo Launch with: npm run dev -- --port %PORT% --host 127.0.0.1
echo Local URL: http://127.0.0.1:%PORT%
call :pause_before_exit
exit /b 0
