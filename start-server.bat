@echo off
echo Starting Balance Ball Game Server...
echo.
echo Choose your preferred method:
echo 1. Python 3 (recommended)
echo 2. Node.js http-server
echo 3. PHP built-in server
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo Starting Python server on http://localhost:8000
    echo Press Ctrl+C to stop the server
    echo.
    python -m http.server 8000
) else if "%choice%"=="2" (
    echo Starting Node.js server on http://localhost:8080
    echo Press Ctrl+C to stop the server
    echo.
    npx http-server -p 8080
) else if "%choice%"=="3" (
    echo Starting PHP server on http://localhost:8000
    echo Press Ctrl+C to stop the server
    echo.
    php -S localhost:8000
) else (
    echo Invalid choice. Please run the script again.
    pause
)

pause