@echo off
setlocal
call "F:\ide\VisualStudio2022\VC\Auxiliary\Build\vcvars32.bat"
set "PATH=f:\project\SAPatcher\tools\glslang\bin;%PATH%"
cd /d f:\project\SAPatcher\SAPatch-DXVK
if exist build_x86 rmdir /s /q build_x86
meson setup build_x86 --backend ninja
