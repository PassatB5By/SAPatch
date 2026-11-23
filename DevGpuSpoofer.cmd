@echo off
chcp 65001 >nul
title SAPatcher - DEV Mode GPU Spoofer
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0DevGpuSpoofer.ps1"
echo.
pause

