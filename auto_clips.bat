@echo off
chcp 65001 >nul
cd /d "%~dp0"
where py >nul 2>nul && (set PY=py) || (set PY=python)
set /p NICHE=Niche (Thai or English, Enter = default): 
set /p COUNT=How many clips (1-6): 
%PY% -m engine.run auto --niche "%NICHE%" --count "%COUNT%"
pause
