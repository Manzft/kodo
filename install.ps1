#Requires -Version 5.1
Write-Host "==> Instalando backend..." -ForegroundColor Cyan

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location "$root\backend"

python -m venv venv
& ".\venv\Scripts\pip.exe" install -r requirements.txt

Write-Host ""
Write-Host "==> Instalando frontend..." -ForegroundColor Cyan
Set-Location "$root\frontend"
npm install

Write-Host ""
Write-Host "==> Todo listo. Ejecuta .\start.ps1 para iniciar Kodo." -ForegroundColor Green
