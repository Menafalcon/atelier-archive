@echo off
setlocal EnableExtensions
title Atelier Archive - launcher
cd /d "%~dp0"

rem Usage:  start-offline.bat            (default browser)
rem         start-offline.bat --edge     (Microsoft Edge)
rem         start-offline.bat --chrome   (Google Chrome)

set "BROWSER=default"
if /i "%~1"=="--edge" set "BROWSER=edge"
if /i "%~1"=="--chrome" set "BROWSER=chrome"

echo.
echo   ATELIER ARCHIVE
echo   ----------------------------------------
echo   browser: %BROWSER%
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo   Node.js was not found on this machine.
  echo.
  echo   Install it once from https://nodejs.org  ^(LTS build^),
  echo   then double-click this file again. No other setup is needed.
  echo.
  pause
  exit /b 1
)

if not exist "server.js" (
  echo   server.js is missing.
  echo   Keep this file inside the project folder and try again.
  echo.
  pause
  exit /b 1
)

rem --- already running? just open the browser ------------------------------
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "try { $r = Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 'http://127.0.0.1:4173/health'; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
if not errorlevel 1 (
  echo   The archive is already running on port 4173.
  call :open
  ping -n 2 127.0.0.1 >nul
  exit /b 0
)

rem --- start the server in its own window, then open the browser -----------
echo   Starting the server on http://127.0.0.1:4173
echo   Leave the server window open while you browse. Close it to stop.
echo.
start "Atelier Archive - server" cmd /k "node server.js --port 4173 --host 127.0.0.1"

rem give node a moment to bind the port
for /l %%i in (1,1,20) do (
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "try { $r = Invoke-WebRequest -UseBasicParsing -TimeoutSec 1 'http://127.0.0.1:4173/health'; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
  if not errorlevel 1 goto ready
  ping -n 2 127.0.0.1 >nul
)

echo   The server did not answer in time.
echo   Check the server window for an error message, then run this file again.
echo.
pause
exit /b 1

:ready
call :open
echo   Ready. If the browser did not open, visit http://127.0.0.1:4173
echo.
ping -n 3 127.0.0.1 >nul
exit /b 0

rem ----------------------------------------------------------------------
:open
if /i "%BROWSER%"=="edge" (
  start "" msedge "http://127.0.0.1:4173"
  exit /b 0
)
if /i "%BROWSER%"=="chrome" (
  start "" chrome "http://127.0.0.1:4173"
  exit /b 0
)
start "" "http://127.0.0.1:4173"
exit /b 0
