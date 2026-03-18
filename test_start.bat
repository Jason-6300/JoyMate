@echo off
chcp 65001 >nul
echo 测试脚本开始...
echo.

echo [1] 测试 start 命令打开浏览器...
start "" "http://localhost:3000"
echo 浏览器命令已执行
echo.

echo [2] 测试完成
pause
