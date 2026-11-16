@echo off
cd /d "%~dp0"
chcp 65001 >nul
echo === Shorts Factory setup ===
where py >nul 2>nul && (set PY=py) || (set PY=python)
%PY% -m pip install --upgrade pip
%PY% -m pip install -r requirements.txt
if not exist .env copy .env.example .env
echo.
echo Next: open .env in Notepad and paste your PIXABAY_API_KEY
%PY% -m engine.run doctor
pause
