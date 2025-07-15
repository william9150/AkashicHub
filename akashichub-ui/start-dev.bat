@echo off
echo =====================================
echo  AkashicHub Development Server
echo =====================================
echo.

REM 檢查 Node.js 是否安裝
echo [1/6] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js is installed

REM 檢查 npm 版本
echo [2/6] Checking npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: npm is not available
    pause
    exit /b 1
)
echo ✅ npm is available

REM 檢查依賴是否安裝
echo [3/6] Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Error: Failed to install dependencies
        pause
        exit /b 1
    )
)
echo ✅ Dependencies are installed

REM 檢查環境配置文件
echo [4/6] Checking environment configuration...
if not exist ".env" (
    echo Creating .env file from example...
    copy .env.example .env
    echo ⚠️  Please review and update .env file with your configuration
)
echo ✅ Environment configuration is ready

REM 運行診斷
echo [5/6] Running network diagnostics...
npm run diagnose
echo.

REM 檢查端口是否被佔用
echo [6/6] Checking port availability...
netstat -ano | findstr :5173 >nul 2>&1
if not errorlevel 1 (
    echo ⚠️  Port 5173 is already in use
    echo Please close the application using port 5173 or use a different port
    echo To find and kill the process:
    echo   netstat -ano | findstr :5173
    echo   taskkill /PID [PID] /F
    echo.
    set /p choice="Continue anyway? (y/n): "
    if not "%choice%"=="y" if not "%choice%"=="Y" (
        echo Cancelled by user
        pause
        exit /b 1
    )
)

echo.
echo =====================================
echo  Starting Development Server
echo =====================================
echo.
echo The application will be available at:
echo   - Local:   http://localhost:5173/
echo   - Test:    http://localhost:5173/test.html
echo   - Network: Check the output below for IP addresses
echo.
echo Press Ctrl+C to stop the server
echo.

REM 啟動開發服務器
npm run dev:windows

echo.
echo =====================================
echo  Server Stopped
echo =====================================
echo.
echo If you had issues accessing the application:
echo 1. Check the network addresses shown above
echo 2. Try http://127.0.0.1:5173/
echo 3. Try http://localhost:5173/test.html for diagnostics
echo 4. Check Windows Firewall settings
echo 5. Run 'npm run diagnose' for more information
echo.

pause