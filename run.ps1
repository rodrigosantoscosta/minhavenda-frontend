# PowerShell — run from E:\code\minhavenda-frontend
$files = Get-ChildItem src/pages/admin/*.jsx
foreach ($f in $files) {
  (Get-Content $f) `
    -replace 'const \{ showToast \} = useToast\(\)', 'const toast = useToast()' `
    -replace "showToast\((.+?), 'success'\)", 'toast.success($1)' `
    -replace "showToast\((.+?), 'error'\)", 'toast.error($1)' `
    -replace "showToast\((.+?), 'warning'\)", 'toast.warning($1)' |
  Set-Content $f
}
