@echo off
setlocal EnableDelayedExpansion

if "%DEMO_IMAGE%"=="" (
  set "IMAGE=ghcr.io/amrabdelhalim-labs/desktop-todolist-e1:v1.0.1"
) else (
  set "IMAGE=%DEMO_IMAGE%"
)

if "%DEMO_PORT%"=="" (
  set "PORT=6080"
) else (
  set "PORT=%DEMO_PORT%"
)

set "CONTAINER_PORT=6080"
set "READY_PATH=/vnc_lite.html"
set "PREVIEW_PATH=/vnc_lite.html?autoconnect=true&resize=scale"
set /a LAST_PORT=PORT+100

where docker >nul 2>nul || (
  echo Docker is required but was not found.
  exit /b 1
)

docker image inspect "%IMAGE%" >nul 2>nul
if errorlevel 1 (
  echo Pulling %IMAGE%...
  docker pull "%IMAGE%" || exit /b 1
)

:try_port
if !PORT! GTR !LAST_PORT! (
  echo Unable to start the demo on an available local port.
  exit /b 1
)

set "CONTAINER_NAME=desktop-todolist-e1-demo-!PORT!-!RANDOM!"
for /f "usebackq delims=" %%I in (`docker run -d --name "!CONTAINER_NAME!" -p "127.0.0.1:!PORT!:%CONTAINER_PORT%" "%IMAGE%" 2^>nul`) do set "CONTAINER_ID=%%I"
if not defined CONTAINER_ID (
  docker rm -f "!CONTAINER_NAME!" >nul 2>nul
  set /a PORT+=1
  goto try_port
)

set "READY_URL=http://127.0.0.1:!PORT!%READY_PATH%"
set "PREVIEW_URL=http://127.0.0.1:!PORT!%PREVIEW_PATH%"
set /a ATTEMPT=0

:wait_ready
set /a ATTEMPT+=1
powershell -NoProfile -Command "try { $r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 3 '!READY_URL!'; if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 400) { exit 0 } } catch {}; exit 1" >nul 2>nul
if not errorlevel 1 goto ready
if !ATTEMPT! GEQ 120 (
  echo The demo did not become ready within 120 seconds.
  docker logs "!CONTAINER_ID!"
  docker rm -f "!CONTAINER_ID!" >nul 2>nul
  exit /b 1
)
timeout /t 1 /nobreak >nul
goto wait_ready

:ready
echo CONTAINER_NAME=!CONTAINER_NAME!
echo PREVIEW_URL=!PREVIEW_URL!
echo STOP_COMMAND=docker rm -f !CONTAINER_NAME!
start "" "!PREVIEW_URL!"
