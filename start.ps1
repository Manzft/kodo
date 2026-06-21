#Requires -Version 5.1
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host "==> Iniciando backend..." -ForegroundColor Cyan
$backend = Start-Process -NoNewWindow -PassThru `
    -FilePath "$root\backend\venv\Scripts\python.exe" `
    -ArgumentList "server.py" `
    -WorkingDirectory "$root\backend"

Write-Host "==> Iniciando frontend..." -ForegroundColor Cyan
$frontend = Start-Process -NoNewWindow -PassThru `
    -FilePath "npx" `
    -ArgumentList "vite", "--host", "127.0.0.1" `
    -WorkingDirectory "$root\frontend"

Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "  Kodo corriendo en http://localhost:5173" -ForegroundColor Green
Write-Host "  Presiona Ctrl+C para detener." -ForegroundColor Yellow
Write-Host ""

try {
    Wait-Process -Id $backend.Id, $frontend.Id
} finally {
    if (!$backend.HasExited) { $backend.Kill() }
    if (!$frontend.HasExited) { $frontend.Kill() }
}
