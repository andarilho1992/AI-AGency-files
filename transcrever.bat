@echo off
:: Transcreve audio do WhatsApp via Whisper
:: Uso: arrasta o arquivo de audio em cima desse .bat
::      ou: transcrever.bat caminho\do\audio.ogg

if "%~1"=="" (
    echo.
    echo  Uso: arrasta o arquivo de audio em cima deste .bat
    echo       ou execute: transcrever.bat caminho\audio.ogg
    echo.
    pause
    exit /b
)

set AUDIO=%~1
set NOME=%~n1
set PASTA=%~dp1

echo.
echo  Transcrevendo: %~nx1
echo  Aguarde...
echo.

whisper "%AUDIO%" --language Portuguese --model small --output_format txt --output_dir "%PASTA%"

echo.
echo  Pronto! Arquivo salvo em: %PASTA%%NOME%.txt
echo.

:: Abre o txt automaticamente
start "" "%PASTA%%NOME%.txt"

pause
