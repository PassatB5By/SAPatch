@echo off
setlocal
call "F:\ide\VisualStudio2022\VC\Auxiliary\Build\vcvars32.bat"
set "PATH=f:\project\SAPatcher\tools\glslang\bin;%PATH%"
cd /d f:\project\SAPatcher\SAPatch-DXVK\build_x86
ninja src/d3d9/d3d9.dll
