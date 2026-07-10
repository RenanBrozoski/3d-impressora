@echo off
cd /d "%~dp0"

echo Sistema de Gestao - Impressao 3D
echo.

if not exist "node_modules" (
    echo Instalando dependencias, aguarde...
    call npm install
    if errorlevel 1 goto erro
)

if not exist "dev.db" (
    echo Preparando banco de dados...
    call npx prisma migrate deploy
    call npx prisma db seed
)

if not exist ".next" (
    echo Gerando build de producao, aguarde...
    call npm run build
    if errorlevel 1 goto erro
)

echo.
echo Iniciando o sistema em http://localhost:3000
echo Feche esta janela para encerrar o servidor.
echo.
call npm run start
goto fim

:erro
echo.
echo Ocorreu um erro. Verifique as mensagens acima.
pause

:fim
pause
