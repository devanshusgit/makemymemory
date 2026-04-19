Get-ChildItem -Path "app","components" -Recurse -Include "*.tsx","*.ts" | ForEach-Object {
  $content = Get-Content $_.FullName -Raw
  $content = $content -replace "bg-stone-900", "bg-hero"
  Set-Content $_.FullName $content -NoNewline
}
Write-Host "Done replacing bg-stone-900 with bg-hero"
