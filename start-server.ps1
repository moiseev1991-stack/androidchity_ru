# Освобождаем порты 8080–8082 (старые экземпляры сервера), затем запускаем один новый
$ports = 8080, 8081, 8082
foreach ($p in $ports) {
  Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
  }
}
Start-Sleep -Seconds 2
$port = 8080
$url = "http://127.0.0.1:$port/"
Set-Location $PSScriptRoot
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node server.js"
Start-Sleep -Seconds 2
Start-Process $url
Write-Host "Браузер открыт: $url"
Write-Host "Сервер запущен в отдельном окне. Закройте то окно, чтобы остановить сервер."
