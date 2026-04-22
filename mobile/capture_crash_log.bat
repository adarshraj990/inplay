@echo off
setlocal enabledelayedexpansion

:: ============================================================
::  INDIPLAY CRASH LOG CAPTURE TOOL
::  Usage: Double-click this file OR run from PowerShell
::  Output: crash_log_<timestamp>.txt (in same folder)
:: ============================================================

:: ── 1. ADB PATH SETUP ────────────────────────────────────────
set ADB=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe

if not exist "%ADB%" (
    echo.
    echo [ERROR] ADB not found at: %ADB%
    echo Please verify your Android SDK installation path.
    echo Common alternative: C:\Android\Sdk\platform-tools\adb.exe
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   INDIPLAY CRASH LOG CAPTURE - Project Indiplay
echo ============================================================
echo.
echo [1/5] ADB found at: %ADB%
echo.

:: ── 2. RESET ADB SERVER ──────────────────────────────────────
echo [2/5] Resetting ADB server...
"%ADB%" kill-server > nul 2>&1
timeout /t 2 /nobreak > nul
"%ADB%" start-server > nul 2>&1
echo       ADB server restarted. OK
echo.

:: ── 3. WAIT FOR DEVICE ───────────────────────────────────────
echo [3/5] Waiting for device...
echo       ACTION: Connect your phone via USB now.
echo       (Make sure USB Debugging is ON in Developer Options)
echo.

:WAIT_LOOP
"%ADB%" devices 2>&1 | findstr /v "List of" | findstr /v "^$" | findstr "device" > nul 2>&1
if errorlevel 1 (
    set /p "=." < nul
    timeout /t 2 /nobreak > nul
    goto WAIT_LOOP
)

echo.
echo       Device connected! OK
echo.

:: ── 4. SHOW CONNECTED DEVICE INFO ────────────────────────────
echo ---- Connected Device ----
"%ADB%" devices
echo --------------------------
echo.

:: ── 5. CLEAR OLD LOGS ────────────────────────────────────────
echo [4/5] Clearing old logcat buffer...
"%ADB%" logcat -c
timeout /t 1 /nobreak > nul
echo       Old logs cleared. OK
echo.

:: ── 6. SET OUTPUT FILE WITH TIMESTAMP ────────────────────────
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%-%datetime:~10,2%-%datetime:~12,2%
set LOGFILE=%~dp0crash_log_%TIMESTAMP%.txt

:: ── 7. INSTRUCT USER ─────────────────────────────────────────
echo ============================================================
echo   [5/5] READY TO CAPTURE
echo ============================================================
echo.
echo   OUTPUT FILE: crash_log_%TIMESTAMP%.txt
echo.
echo   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
echo   !! ACTION REQUIRED:                                   !!
echo   !!   1. WAIT 3 seconds after pressing Enter           !!
echo   !!   2. IMMEDIATELY open the Indiplay app on phone    !!
echo   !!   3. Wait for it to crash (2-3 seconds)            !!
echo   !!   4. Come back here and press Ctrl+C to STOP       !!
echo   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
echo.
pause

echo.
echo Capturing logs... Open the app NOW!
echo (Press Ctrl+C when app has crashed to stop capture)
echo.

:: ── 8. CAPTURE LOGS ──────────────────────────────────────────
:: Capture ALL logs (unfiltered) - we filter during analysis
"%ADB%" logcat -v threadtime *:D > "%LOGFILE%" 2>&1

:: ── 9. DONE ──────────────────────────────────────────────────
echo.
echo ============================================================
echo   CAPTURE COMPLETE
echo ============================================================
echo.
echo   Log saved to:
echo   %LOGFILE%
echo.
echo   Now run the ANALYSIS section below OR share this file.
echo.

:: ── 10. AUTO-ANALYZE (extract crash info) ────────────────────
echo ============================================================
echo   AUTO-ANALYSIS: Searching for crash signatures...
echo ============================================================
echo.

set FOUND=0

:: Check for FATAL EXCEPTION
findstr /i "FATAL EXCEPTION" "%LOGFILE%" > nul 2>&1
if not errorlevel 1 (
    echo [CRASH FOUND] FATAL EXCEPTION detected:
    echo.
    findstr /i /n "FATAL EXCEPTION\|AndroidRuntime\|com.adarshk8.indplaymonorepo" "%LOGFILE%"
    set FOUND=1
    echo.
)

:: Check for Resource errors
findstr /i "NotFoundException\|Resources" "%LOGFILE%" > nul 2>&1
if not errorlevel 1 (
    echo [WARNING] Resource errors detected:
    findstr /i /n "NotFoundException\|Resources" "%LOGFILE%"
    echo.
    set FOUND=1
)

:: Check for JS bundle errors
findstr /i "Unable to load\|Module not found\|bundle\|hermes" "%LOGFILE%" > nul 2>&1
if not errorlevel 1 (
    echo [WARNING] JS Bundle or Hermes errors detected:
    findstr /i /n "Unable to load\|Module not found\|bundle\|hermes" "%LOGFILE%"
    echo.
    set FOUND=1
)

:: Check for NoClassDefFound (ProGuard stripping)
findstr /i "NoClassDefFoundError\|ClassNotFoundException" "%LOGFILE%" > nul 2>&1
if not errorlevel 1 (
    echo [CRITICAL] ProGuard/R8 stripping detected - class missing at runtime:
    findstr /i /n "NoClassDefFoundError\|ClassNotFoundException" "%LOGFILE%"
    echo.
    set FOUND=1
)

if !FOUND!==0 (
    echo   No standard crash signatures found in log.
    echo   The app may not have been opened during capture.
    echo   Please run this script again and try opening the app.
)

echo.
echo ============================================================
echo   Share the file below with your AI assistant for analysis:
echo   %LOGFILE%
echo ============================================================
echo.
pause

