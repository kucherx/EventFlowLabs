@echo off
setlocal

cd /d "%~dp0"
set PORT=8080
set PYTHON_CMD=

where python >nul 2>nul
if %errorlevel%==0 set PYTHON_CMD=python

if "%PYTHON_CMD%"=="" (
    where py >nul 2>nul
    if %errorlevel%==0 set PYTHON_CMD=py
)

if "%PYTHON_CMD%"=="" (
    echo Python not found. Opening index.html directly.
    start "" "%cd%\index.html"
    pause
    exit /b
)

echo EventFlow Manager is starting...
echo URL: http://localhost:%PORT%/
start "" "http://localhost:%PORT%/"
%PYTHON_CMD% -m http.server %PORT%

endlocal
