@echo off

REM Тип файлов
set FILE_TYPE=jpg

setlocal enabledelayedexpansion
set COUNT=1

for /f "tokens=*" %%f in ('dir /b /on *.%FILE_TYPE%') do (
    ren "%%f" "temp_!COUNT!.%FILE_TYPE%"
	set /a COUNT+=1
)

set COUNT=1
for /f "tokens=*" %%f in ('dir /b /on temp_*.%FILE_TYPE%') do (
    ren "%%f" "!COUNT!.%FILE_TYPE%"
    set /a COUNT+=1
)

echo Ready!
pause
