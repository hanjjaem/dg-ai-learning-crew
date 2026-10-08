@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title KorDoc AI - 원클릭 통합 설치 및 실행 도구

rem ====================================================================
rem  KorDoc AI 올인원 통합 런처 (Node.js + KorDoc AI 데스크톱 앱)
rem
rem  [동작 순서]
rem   1. 관리자 권한 확인 (없으면 자동으로 [예] 확인창 띄움)
rem   2. 문서 변환 엔진 (Node.js LTS) 점검 및 자동 설치
rem   3. KorDoc AI 최신 데스크톱 앱 점검 및 자동 설치 (v1.5.1 지원)
rem   4. 재부팅 없이 즉시 쓸 수 있도록 환경변수(PATH) 연결
rem   5. KorDoc AI 자동 실행 및 정상 구동 자가 진단
rem
rem  [배포 안내]
rem   - 인터넷 가능 PC: 이 bat 파일 하나만 실행해도 둘 다 자동 설치
rem   - 폐쇄망/인터넷 제한 PC: 같은 폴더에 node-*.msi, KorDoc*.msi 를 두면 
rem     인터넷 연결 없이 100% 오프라인 자동 설치
rem ====================================================================

rem ── 1. 관리자 권한 확인 및 자가 승격 ──
net session >nul 2>&1
if errorlevel 1 (
    cls
    echo ====================================================================
    echo   [알림] 설치를 위해 '관리자 권한'이 필요합니다.
    echo   잠시 후 화면에 뜨는 창에서 [예] 버튼을 눌러주세요.
    echo ====================================================================
    powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs" >nul 2>&1
    exit /b
)

cd /d "%~dp0"

rem ── 2. 로그 파일 준비 ──
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd_HHmm"') do set "TS=%%i"
set "LOG=%USERPROFILE%\Desktop\KorDoc_통합설치기록_%TS%.txt"
set "KD_DIR=%ProgramFiles%\KorDoc AI"
set "KD_EXE=%KD_DIR%\kordoc-ai.exe"

>"%LOG%" echo ==================== KorDoc AI 통합 설치 기록 ====================
call :log "[실행 시각] %DATE% %TIME%"
call :log "[사용자] %USERNAME%"
call :log "[컴퓨터] %COMPUTERNAME%"
call :log ""

cls
echo ====================================================================
echo             🚀 KorDoc AI 원클릭 통합 설치를 시작합니다
echo ====================================================================
echo.
echo   설치가 완료될 때까지 창을 닫지 마시고 잠시만 기다려주세요 (약 1~2분 소요)
echo.
echo --------------------------------------------------------------------

rem ====================================================================
rem  [1/4 단계] 문서 변환 엔진 (Node.js) 점검 및 설치
rem ====================================================================
echo.
echo  [1/4 단계] 문서 변환 엔진(Node.js) 점검 중...
call :log "==================== [1/4] Node.js 엔진 점검 ===================="

call :findnode
if defined NODEEXE (
    echo   -> [확인] Node.js 엔진이 이미 설치되어 있습니다. (건너뜀)
    call :log "[Node.js 상태] 이미 설치됨: %NODEEXE%"
    goto :step2
)

echo   -> Node.js 가 설치되어 있지 않아 자동 설치를 진행합니다...
call :log "[Node.js 상태] 미설치 -> 자동 설치 진행"

rem 1순위: 같은 폴더의 node-v*.msi (오프라인/폐쇄망 지원)
set "NODE_MSI="
for %%m in ("%~dp0node-v*.msi") do if not defined NODE_MSI set "NODE_MSI=%%~fm"
if defined NODE_MSI (
    echo   -> 오프라인 설치 파일(!NODE_MSI!)로 설치 중...
    call :log "[Node.js 설치] 로컬 MSI 설치 시도: !NODE_MSI!"
    msiexec /i "!NODE_MSI!" /qn /norestart INSTALLDIR="%ProgramFiles%\nodejs\" >>"%LOG%" 2>&1
    if not errorlevel 1 goto :after_node_install
)

rem 2순위: winget 온라인 설치
where winget >nul 2>&1
if not errorlevel 1 (
    echo   -> 온라인 자동 설치(winget) 진행 중... (1~2분 소요)
    call :log "[Node.js 설치] winget 설치 시도"
    winget install --id OpenJS.NodeJS.LTS --exact --silent --accept-package-agreements --accept-source-agreements >>"%LOG%" 2>&1
    if not errorlevel 1 goto :after_node_install
)

rem 3순위: Node.js 공식 msi 다운로드 폴백
echo   -> Node.js 설치 파일을 내려받는 중입니다...
call :log "[Node.js 설치] 웹 다운로드 폴백 시도"
set "TEMP_NODE_MSI=%TEMP%\node_lts_setup.msi"
powershell -NoProfile -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('https://nodejs.org/dist/v24.14.0/node-v24.14.0-x64.msi', '%TEMP_NODE_MSI%')" >>"%LOG%" 2>&1
if exist "%TEMP_NODE_MSI%" (
    msiexec /i "%TEMP_NODE_MSI%" /qn /norestart INSTALLDIR="%ProgramFiles%\nodejs\" >>"%LOG%" 2>&1
    del /f /q "%TEMP_NODE_MSI%" >nul 2>&1
)

:after_node_install
set "NODEEXE="
call :findnode
if defined NODEEXE (
    echo   -> [성공] 변환 엔진(Node.js) 설치 완료!
    call :log "[Node.js 완료] 정상 확인: %NODEEXE%"
) else (
    echo   -> [경고] Node.js 자동 설치에 실패했습니다. (기록 파일 참조)
    call :log "[Node.js 실패] node.exe 를 찾을 수 없습니다."
)

:step2
rem ====================================================================
rem  [2/4 단계] KorDoc AI 프로그램 점검 및 설치
rem ====================================================================
echo.
echo  [2/4 단계] KorDoc AI 데스크톱 프로그램 확인 중...
call :log ""
call :log "==================== [2/4] KorDoc AI 앱 점검 ===================="

if exist "%KD_EXE%" (
    echo   -> [확인] KorDoc AI 앱이 이미 설치되어 있습니다. (건너뜀)
    call :log "[KorDoc AI 상태] 이미 설치됨: %KD_EXE%"
    goto :step3
)

echo   -> KorDoc AI 앱이 설치되어 있지 않습니다. 자동 설치를 시작합니다...
call :log "[KorDoc AI 상태] 미설치 -> 설치 진행"

rem 1순위: 같은 폴더의 KorDoc*.msi 파일 확인 (오프라인 지원)
set "KD_MSI="
for %%k in ("%~dp0KorDoc*.msi") do if not defined KD_MSI set "KD_MSI=%%~fk"

if defined KD_MSI (
    echo   -> 오프라인 설치 파일(!KD_MSI!)로 설치 중...
    call :log "[KorDoc AI 설치] 로컬 MSI 로 설치: !KD_MSI!"
    msiexec /i "!KD_MSI!" /qn /norestart >>"%LOG%" 2>&1
    goto :after_kd_install
)

rem 2순위: GitHub 최신 릴리스 v1.5.1 다운로드 및 설치
echo   -> 공식 배포처에서 최신 버전(v1.5.1)을 내려받는 중입니다... (약 15MB)
call :log "[KorDoc AI 설치] GitHub v1.5.1 온라인 다운로드 시도"
set "TEMP_KD_MSI=%TEMP%\KorDoc_Setup_v1.5.1.msi"

where curl.exe >nul 2>&1
if not errorlevel 1 (
    curl.exe -L -s -o "%TEMP_KD_MSI%" "https://github.com/chrisryugj/kordoc-ai/releases/download/v1.5.1/KorDoc.AI_1.5.1_x64_ko-KR.msi" >>"%LOG%" 2>&1
) else (
    powershell -NoProfile -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('https://github.com/chrisryugj/kordoc-ai/releases/download/v1.5.1/KorDoc.AI_1.5.1_x64_ko-KR.msi', '%TEMP_KD_MSI%')" >>"%LOG%" 2>&1
)

if exist "%TEMP_KD_MSI%" (
    echo   -> 다운로드 완료. 무인 자동 설치 중...
    call :log "[KorDoc AI 설치] 다운로드 완료, msiexec 실행"
    msiexec /i "%TEMP_KD_MSI%" /qn /norestart >>"%LOG%" 2>&1
    del /f /q "%TEMP_KD_MSI%" >nul 2>&1
) else (
    echo   -> [오류] 설치 파일을 내려받지 못했습니다. 인터넷 연결을 확인해주세요.
    call :log "[KorDoc AI 설치] 다운로드 실패"
)

:after_kd_install
if exist "%KD_EXE%" (
    echo   -> [성공] KorDoc AI 앱 설치 완료!
    call :log "[KorDoc AI 완료] 정상 설치 확인됨: %KD_EXE%"
) else (
    echo   -> [실패] KorDoc AI 설치를 완료하지 못했습니다.
    call :log "[KorDoc AI 실패] %KD_EXE% 미발견"
    goto :verdict
)

:step3
rem ====================================================================
rem  [3/4 단계] 실행 환경(PATH) 자동 연결
rem ====================================================================
echo.
echo  [3/4 단계] 프로그램 실행 환경 연결 중...
call :log ""
call :log "==================== [3/4] 환경변수 PATH 보정 ===================="

if defined NODEEXE (
    for %%d in ("%NODEEXE%") do set "NODEDIR=%%~dpd"
    set "PATH=%PATH%;!NODEDIR!"
    call :log "[PATH 주입] !NODEDIR!"
)

:step4
rem ====================================================================
rem  [4/4 단계] KorDoc AI 자동 실행 및 점검
rem ====================================================================
echo.
echo  [4/4 단계] KorDoc AI 를 실행하고 상태를 점검합니다...
call :log ""
call :log "==================== [4/4] 앱 기동 및 상태 점검 ===================="

taskkill /im kordoc-ai.exe /f >nul 2>&1
start "" "%KD_EXE%"
echo   -> 앱이 실행되었습니다. 변환 엔진 연동 확인 중... (약 10초 대기)
ping -n 11 127.0.0.1 >nul

tasklist /fi "imagename eq kordoc-ai.exe" | findstr /i kordoc >nul 2>&1
if errorlevel 1 (
    echo   -> [경고] 프로그램 창이 바로 뜨지 않았습니다.
    call :log "[결과] kordoc-ai.exe 프로세스 없음"
) else (
    echo   -> [성공] KorDoc AI 가 정상적으로 실행되었습니다!
    call :log "[결과] kordoc-ai.exe 실행 확인됨"
)

rem Sidecar(node.exe) 자식 프로세스 검사
powershell -NoProfile -Command ^
 "$app=Get-CimInstance Win32_Process -Filter \"Name='kordoc-ai.exe'\";" ^
 "$kids=@(Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { $_.ParentProcessId -in $app.ProcessId });" ^
 "if($kids){ '[sidecar] 정상 작동 중 - ' + $kids.Count + ' 개 (PID ' + ($kids.ProcessId -join ',') + ')' } else { '[sidecar] 대기 중 (문서 변환 시 자동 기동)' }" >>"%LOG%" 2>&1

:verdict
call :log ""
call :log "[종료 시각] %DATE% %TIME%"
call :log "[기록 저장] %LOG%"

cls
echo ====================================================================
echo             🎉 KorDoc AI 설치 및 실행이 완료되었습니다!
echo ====================================================================
echo.
echo   [사용 방법 안내]
echo   1. 화면에 방금 뜬 'KorDoc AI' 창을 그대로 실습에 사용하시면 됩니다.
echo   2. [중요] 오늘 업무를 마치신 뒤(퇴근 전) 컴퓨터를 1회 재부팅해주시면,
echo      내일부터는 바탕화면의 KorDoc AI 아이콘으로도 완벽하게 작동합니다.
echo.
echo   * 설치 상세 기록이 바탕화면에 저장되었습니다:
echo     %LOG%
echo ====================================================================
echo.
echo  확인 후 아무 키나 누르시면 창이 닫힙니다.
pause >nul
exit /b 0

rem ── 서브루틴: 로그 기록 ──
:log
if "%~1"=="" (>>"%LOG%" echo.) else (>>"%LOG%" echo %~1)
goto :eof

rem ── 서브루틴: Node.js 경로 탐색 ──
:findnode
set "NODEEXE="
for /f "delims=" %%p in ('where node 2^>nul') do if not defined NODEEXE set "NODEEXE=%%p"
if not defined NODEEXE if exist "%ProgramFiles%\nodejs\node.exe" set "NODEEXE=%ProgramFiles%\nodejs\node.exe"
if not defined NODEEXE if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "NODEEXE=%ProgramFiles(x86)%\nodejs\node.exe"
if not defined NODEEXE if exist "%LOCALAPPDATA%\nodejs\node.exe" set "NODEEXE=%LOCALAPPDATA%\nodejs\node.exe"
goto :eof
