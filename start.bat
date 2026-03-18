@echo off
chcp 65001 >nul

:: ============================================================
:: JoyMate 一键启动脚本
:: ============================================================
:: 使用方法：
::   双击运行 start.bat 即可启动项目
::   脚本会自动检测端口占用并启动服务
::
:: 注意事项：
::   - 需要提前安装 Node.js 和 npm
::   - 需要提前执行过 npm install 安装依赖
:: ============================================================

set "PROJECT_DIR=d:\JoyMate"
set "PORT=3000"
set "PROJECT_URL=http://localhost:%PORT%"

echo.
echo ============================================================
echo   JoyMate 一键启动脚本
echo ============================================================
echo.

:: 切换到项目目录
echo [步骤 1/4] 切换到项目目录...
cd /d "%PROJECT_DIR%"
echo [成功] 当前目录: %cd%
echo.

:: 检查依赖
echo [步骤 2/4] 检查项目依赖...
if not exist "node_modules" (
    echo [提示] 正在安装依赖...
    call npm install
) else (
    echo [成功] 依赖已存在
)
echo.

:: 自动清理端口占用（静默处理）
echo [步骤 3/4] 检查端口 %PORT%...
for /f "tokens=5" %%p in ('netstat -ano 2^>nul ^| findstr ":%PORT% " ^| findstr "LISTENING"') do (
    echo [提示] 发现端口占用，正在清理...
    taskkill /F /PID %%p >nul 2>&1
)
echo [成功] 端口已就绪
echo.

:: 启动服务
echo [步骤 4/4] 启动服务...
echo.

:: 在新窗口启动服务
start "JoyMate Server" cmd /k "cd /d %PROJECT_DIR% && npm run dev:3000"

echo [等待] 服务启动中，请稍候 15 秒...
echo.

:: 等待 15 秒（每次 ping 约 1 秒）
ping -n 16 127.0.0.1 >nul

echo [成功] 等待完成！
echo.

:: 打开浏览器
echo [提示] 正在打开浏览器: %PROJECT_URL%
start "" "%PROJECT_URL%"

echo [成功] 浏览器已打开！
echo.
echo ============================================================
echo   启动完成！
echo ============================================================
echo.
echo   项目地址: %PROJECT_URL%
echo   服务窗口: JoyMate Server
echo.
echo   关闭服务窗口即可停止服务
echo ============================================================
echo.
pause
