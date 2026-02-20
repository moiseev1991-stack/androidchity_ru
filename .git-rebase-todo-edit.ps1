param($path)
(Get-Content $path -Raw) -replace '^pick ', 'reword ' | Set-Content $path -NoNewline
