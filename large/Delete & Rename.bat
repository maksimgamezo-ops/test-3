@echo off

REM Исходное количество кадров
set TOTAL_FRAMES=100

REM Желаемое количество кадров
set TARGET_FRAMES=80

REM Тип файлов
set FILE_TYPE=jpg


set /a STEP=TOTAL_FRAMES * 1000 / (TOTAL_FRAMES - TARGET_FRAMES)
setlocal enabledelayedexpansion
set COUNT=1
set FR=1000

for /f "tokens=*" %%f in ('dir /b /on *.%FILE_TYPE%') do (
    set /a MOD=FR %% STEP
    if !MOD! lss 1000 (
        del "%%f"
		set /a FR+=1000
    ) else (
        ren "%%f" "temp_!COUNT!.%FILE_TYPE%"
		set /a COUNT+=1
		set /a FR+=1000
    )
)

set COUNT=1
for /f "tokens=*" %%f in ('dir /b /on temp_*.%FILE_TYPE%') do (
    ren "%%f" "!COUNT!.%FILE_TYPE%"
    set /a COUNT+=1
)

echo Ready!
pause
