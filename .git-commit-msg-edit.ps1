param($path)
$msg1 = "Подготовка под Plesk: относительные ссылки, .htaccess 404, DEPLOY_PLESK.md"
$msg2 = "Инструкция по загрузке uploads: fix отсутствующих изображений на проде"
$countFile = "$env:TEMP\git_reword_count.txt"
if (-not (Test-Path $countFile)) { 1 | Out-File $countFile }
$n = [int](Get-Content $countFile)
if ($n -eq 1) { Set-Content $path $msg1 -Encoding UTF8 -NoNewline }
else { Set-Content $path $msg2 -Encoding UTF8 -NoNewline }
($n + 1) | Out-File $countFile
exit 0
