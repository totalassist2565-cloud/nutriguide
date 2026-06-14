@echo off
chcp 65001 > nul
echo NutriGuide を起動しています...

:: Python を探す（複数のパスを試す）
set PYTHON=
if exist "C:\Users\Rika\AppData\Local\Programs\Python\python-3.11.4-embed-amd64\python.exe" (
  set PYTHON=C:\Users\Rika\AppData\Local\Programs\Python\python-3.11.4-embed-amd64\python.exe
) else if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
  set PYTHON=%LOCALAPPDATA%\Programs\Python\Python311\python.exe
) else if exist "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" (
  set PYTHON=%LOCALAPPDATA%\Programs\Python\Python313\python.exe
) else (
  where python >nul 2>&1 && set PYTHON=python
)

if "%PYTHON%"=="" (
  echo.
  echo エラー: Python が見つかりませんでした。
  echo 以下のURLからPythonをインストールしてください:
  echo https://www.python.org/downloads/
  pause
  exit /b 1
)

echo Python: %PYTHON%
echo ブラウザで http://localhost:8080 が開きます
echo 終了するには このウィンドウを閉じるか Ctrl+C を押してください
echo.

cd /d "%~dp0"
"%PYTHON%" serve.py

pause
