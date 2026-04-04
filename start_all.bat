@echo off
REM ============================================================
REM  start_all.bat — GigShield Full Stack Launcher
REM  Local mode only (no containers).
REM  Starts: 4 backend services + API Gateway + 2 React frontends
REM
REM  Usage:
REM    start_all.bat          — Local dev mode (default)
REM    start_all.bat dev      — Local dev mode (explicit)
REM    start_all.bat check    — Validate required local tools
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
if /i "%~1"=="check" goto :check_prereqs
if /i "%~1"=="dev"   goto :dev_mode

goto :dev_mode

REM ══════════════════════════════════════════════
REM  PREREQ CHECK
REM ══════════════════════════════════════════════
:check_prereqs
echo %GREEN%Checking local toolchain...%RESET%
where python >nul 2>&1 || (echo %RED%Missing: python%RESET% & set ERR=1)
where npm >nul 2>&1 || (echo %RED%Missing: npm%RESET% & set ERR=1)

if defined ERR (
    echo.
    echo %RED%Install missing tools and run again.%RESET%
    pause
    exit /b 1
)

echo %GREEN%Toolchain check passed.%RESET%
echo.
echo %YELLOW%Ensure these local infra services are already running:%RESET%
echo   PostgreSQL  localhost:5432
echo   Redis       localhost:6379
echo.
pause
exit /b 0

REM ══════════════════════════════════════════════
REM  DEV MODE  — hot-reload for active development
REM  Local-only: uvicorn (Python) and vite (React) in new windows
REM ══════════════════════════════════════════════
:dev_mode
echo %YELLOW%  LOCAL DEV MODE — services run with hot-reload (uvicorn + vite)%RESET%
echo.

where python >nul 2>&1 || (echo %RED%ERROR: python not found in PATH.%RESET% & pause & exit /b 1)
where npm >nul 2>&1 || (echo %RED%ERROR: npm not found in PATH.%RESET% & pause & exit /b 1)

echo %GREEN%[1/5]%RESET% Verifying local infrastructure...
echo       Expecting: Postgres@5432, Redis@6379, RabbitMQ@5672
echo       Start them manually before using full features.

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
start "GigShield - api-gateway" cmd /k "set PYTHONPATH=%BASE%;%%PYTHONPATH%% && cd /d %SERVICES%\api-gateway && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo %GREEN%[3/5]%RESET% Starting backend services (ports 8001-8004)...
start "GigShield - identity-service"     cmd /k "set PYTHONPATH=%BASE%;%%PYTHONPATH%% && cd /d %SERVICES%\identity-service     && python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload"
start "GigShield - insurance-core"       cmd /k "set PYTHONPATH=%BASE%;%%PYTHONPATH%% && cd /d %SERVICES%\insurance-core        && python -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload"
start "GigShield - intelligence-service" cmd /k "set PYTHONPATH=%BASE%;%%PYTHONPATH%% && cd /d %SERVICES%\intelligence-service && python -m uvicorn main:app --host 0.0.0.0 --port 8003 --reload"
start "GigShield - platform-service"     cmd /k "set PYTHONPATH=%BASE%;%%PYTHONPATH%% && cd /d %SERVICES%\platform-service     && python -m uvicorn main:app --host 0.0.0.0 --port 8004 --reload"

REM ── Step 4: Start frontends with Vite ──
echo.
echo %GREEN%[4/5]%RESET% Starting Worker App (port 3000)...
start "GigShield - worker-app"      cmd /k "cd /d %FRONTEND%\worker-app      && npm install && npm run dev -- --port 3000"

echo %GREEN%[5/5]%RESET% Starting Admin Dashboard (port 3001)...
start "GigShield - admin-dashboard" cmd /k "cd /d %FRONTEND%\admin-dashboard && npm install && npm run dev -- --port 3001"

goto :print_urls

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
echo    PostgreSQL        localhost:5432
echo    Redis             localhost:6379
echo.
echo %YELLOW%  Press Ctrl+C in each service window to stop it.%RESET%
echo.

REM Open browser tabs (comment these out if not wanted)
timeout /t 5 /nobreak >nul
start "" "http://localhost:3000"
start "" "http://localhost:3001"

pause
exit /b 0