@echo off
REM ============================================================
REM  start_all.bat — GigShield Full Stack Launcher
REM  Starts: infrastructure (Postgres, Redis, RabbitMQ)
REM          4 backend services + API Gateway
REM          2 React frontends (worker-app, admin-dashboard)
REM
REM  Usage:
REM    start_all.bat          — Docker mode  (default, recommended)
REM    start_all.bat dev      — Dev mode (uvicorn + vite, hot-reload)
REM    start_all.bat stop     — Stop and remove all containers
REM    start_all.bat logs     — Tail logs from all services
REM ============================================================

setlocal EnableDelayedExpansion

REM ── Paths ──
set BASE=%~dp0
set SERVICES=%BASE%services
set FRONTEND=%BASE%frontend

REM ── Colour helpers (works on Windows 10+) ──
set GREEN=[92m
set YELLOW=[93m
set RED=[91m
set CYAN=[96m
set RESET=[0m

echo.
echo %CYAN%  ██████╗ ██╗ ██████╗ ███████╗██╗  ██╗██╗███████╗██╗     ██████╗ %RESET%
echo %CYAN%  ██╔════╝██║██╔════╝ ██╔════╝██║  ██║██║██╔════╝██║     ██╔══██╗%RESET%
echo %CYAN%  ██║  ███╗██║██║  ███╗███████╗███████║██║█████╗  ██║     ██║  ██║%RESET%
echo %CYAN%  ██║   ██║██║██║   ██║╚════██║██╔══██║██║██╔══╝  ██║     ██║  ██║%RESET%
echo %CYAN%  ╚██████╔╝██║╚██████╔╝███████║██║  ██║██║███████╗███████╗██████╔╝%RESET%
echo %CYAN%   ╚═════╝ ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚═════╝ %RESET%
echo %YELLOW%  AI-Powered Parametric Income Insurance — Guidewire Hackathon 2025%RESET%
echo.

REM ── Route to sub-command ──
if /i "%~1"=="stop"  goto :stop_all
if /i "%~1"=="logs"  goto :show_logs
if /i "%~1"=="dev"   goto :dev_mode

REM ══════════════════════════════════════════════
REM  DOCKER MODE (default)
REM  Builds images and starts everything via docker compose
REM ══════════════════════════════════════════════
:docker_mode
echo %GREEN%[1/4]%RESET% Checking Docker is running...
docker info >nul 2>&1
if errorlevel 1 (
    echo %RED%  ERROR: Docker is not running. Please start Docker Desktop first.%RESET%
    pause
    exit /b 1
)
echo       Docker OK

echo.
echo %GREEN%[2/4]%RESET% Starting infrastructure (Postgres, Redis, RabbitMQ)...
docker compose -f "%BASE%docker-compose.yml" up -d --build postgres redis rabbitmq
if errorlevel 1 goto :error

echo.
echo %YELLOW%       Waiting 10s for infrastructure to be ready...%RESET%
timeout /t 10 /nobreak >nul

echo.
echo %GREEN%[3/4]%RESET% Starting backend services...
echo       Port map:
echo         8000  API Gateway
echo         8001  Identity Service     (auth, KYC, OTP)
echo         8002  Insurance Core       (policy, claims, payout)
echo         8003  Intelligence Service (fraud, risk, disruption)
echo         8004  Platform Service     (notifications, analytics)
echo.
docker compose -f "%BASE%docker-compose.yml" up -d --build ^
    api-gateway ^
    identity-service ^
    insurance-core ^
    intelligence-service ^
    platform-service
if errorlevel 1 goto :error

echo.
echo %GREEN%[4/4]%RESET% Starting frontends...
echo         3000  Worker App      (React PWA)
echo         3001  Admin Dashboard (React)
echo.
docker compose -f "%BASE%docker-compose.yml" up -d --build ^
    worker-app ^
    admin-dashboard
if errorlevel 1 goto :error

goto :print_urls

REM ══════════════════════════════════════════════
REM  DEV MODE  — hot-reload for active development
REM  Runs infrastructure via Docker, services via
REM  uvicorn (Python) and vite (React) in new windows
REM ══════════════════════════════════════════════
:dev_mode
echo %YELLOW%  DEV MODE — services run with hot-reload (uvicorn + vite)%RESET%
echo.

REM Check Docker
docker info >nul 2>&1
if errorlevel 1 (
    echo %RED%  ERROR: Docker is not running. Please start Docker Desktop first.%RESET%
    pause & exit /b 1
)

REM ── Step 1: Infrastructure via Docker ──
echo %GREEN%[1/5]%RESET% Starting infrastructure containers...
docker compose -f "%BASE%docker-compose.yml" up -d postgres redis rabbitmq
echo       Waiting 8s...
timeout /t 8 /nobreak >nul

REM ── Step 2: Copy .env.development to each service if .env missing ──
for %%S in (identity-service insurance-core intelligence-service platform-service api-gateway) do (
    if not exist "%SERVICES%\%%S\.env" (
        if exist "%SERVICES%\%%S\.env.example" (
            copy "%SERVICES%\%%S\.env.example" "%SERVICES%\%%S\.env" >nul
            echo       Created .env for %%S from .env.example
        )
    )
)

REM ── Step 3: Start each Python service in a new terminal window ──
echo.
echo %GREEN%[2/5]%RESET% Starting API Gateway (port 8000)...
start "GigShield — api-gateway" cmd /k "cd /d %SERVICES%\api-gateway && pip install -r requirements.txt -q && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo %GREEN%[3/5]%RESET% Starting backend services (ports 8001-8004)...
start "GigShield — identity-service"     cmd /k "cd /d %SERVICES%\identity-service     && pip install -r requirements.txt -q && uvicorn main:app --host 0.0.0.0 --port 8001 --reload"
start "GigShield — insurance-core"        cmd /k "cd /d %SERVICES%\insurance-core        && pip install -r requirements.txt -q && uvicorn main:app --host 0.0.0.0 --port 8002 --reload"
start "GigShield — intelligence-service" cmd /k "cd /d %SERVICES%\intelligence-service && pip install -r requirements.txt -q && uvicorn main:app --host 0.0.0.0 --port 8003 --reload"
start "GigShield — platform-service"     cmd /k "cd /d %SERVICES%\platform-service     && pip install -r requirements.txt -q && uvicorn main:app --host 0.0.0.0 --port 8004 --reload"

REM ── Step 4: Start frontends with Vite ──
echo.
echo %GREEN%[4/5]%RESET% Starting Worker App (port 3000)...
start "GigShield — worker-app"      cmd /k "cd /d %FRONTEND%\worker-app      && npm install && npm run dev -- --port 3000"

echo %GREEN%[5/5]%RESET% Starting Admin Dashboard (port 3001)...
start "GigShield — admin-dashboard" cmd /k "cd /d %FRONTEND%\admin-dashboard && npm install && npm run dev -- --port 3001"

goto :print_urls

REM ══════════════════════════════════════════════
REM  STOP — tear down everything
REM ══════════════════════════════════════════════
:stop_all
echo %YELLOW%  Stopping all GigShield containers...%RESET%
docker compose -f "%BASE%docker-compose.yml" down
if errorlevel 1 (
    echo %RED%  Failed. Check Docker is running.%RESET%
) else (
    echo %GREEN%  All containers stopped.%RESET%
)
pause
exit /b 0

REM ══════════════════════════════════════════════
REM  LOGS — tail logs from all services
REM ══════════════════════════════════════════════
:show_logs
echo %CYAN%  Tailing logs (Ctrl+C to exit)...%RESET%
docker compose -f "%BASE%docker-compose.yml" logs -f ^
    api-gateway identity-service insurance-core intelligence-service platform-service
exit /b 0

REM ══════════════════════════════════════════════
REM  URL SUMMARY
REM ══════════════════════════════════════════════
:print_urls
echo.
echo %GREEN%  ✓ GigShield is starting up!%RESET%
echo.
echo %CYAN%  ── Frontend URLs ────────────────────────────────%RESET%
echo    Worker App        http://localhost:3000
echo    Admin Dashboard   http://localhost:3001
echo.
echo %CYAN%  ── API Gateway ──────────────────────────────────%RESET%
echo    API Base URL      http://localhost:8000/api/v1
echo    Gateway Health    http://localhost:8000/health
echo.
echo %CYAN%  ── Service Swagger Docs (dev only) ──────────────%RESET%
echo    Identity Service     http://localhost:8001/docs
echo    Insurance Core       http://localhost:8002/docs
echo    Intelligence Service http://localhost:8003/docs
echo    Platform Service     http://localhost:8004/docs
echo.
echo %CYAN%  ── Infrastructure ───────────────────────────────%RESET%
echo    PostgreSQL        localhost:5432  (gigshield / secret)
echo    Redis             localhost:6379
echo    RabbitMQ UI       http://localhost:15672  (gigshield / secret)
echo.
echo %YELLOW%  Run  start_all.bat stop   to tear down all containers%RESET%
echo %YELLOW%  Run  start_all.bat logs   to tail service logs%RESET%
echo.

REM Open browser tabs (comment these out if not wanted)
timeout /t 5 /nobreak >nul
start "" "http://localhost:3000"
start "" "http://localhost:3001"
start "" "http://localhost:15672"

pause
exit /b 0

REM ══════════════════════════════════════════════
:error
echo.
echo %RED%  ERROR: Something went wrong. Check the output above.%RESET%
echo %YELLOW%  Try:  docker compose logs  to see error details%RESET%
pause
exit /b 1
