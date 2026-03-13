@echo off
echo =============================================
echo  GestaoRH-Web — Setup automatico
echo =============================================
echo.

cd /d "%~dp0"

echo [1/3] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado.
    echo Baixe em: https://nodejs.org
    pause
    exit /b 1
)
echo OK: Node.js encontrado.

echo.
echo [2/3] Instalando dependencias com yarn...
yarn install
if %errorlevel% neq 0 (
    echo.
    echo Tentando com npm...
    npm install
)

echo.
echo [3/3] Iniciando servidor de desenvolvimento...
echo Acesse: http://localhost:5173
echo Pressione Ctrl+C para parar.
echo.
yarn dev

pause
