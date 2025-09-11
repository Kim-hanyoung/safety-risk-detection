# 1) ngrok 없으면 백그라운드에서 띄우기
try {
  $tunnels = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -ErrorAction Stop
} catch {
  Write-Host "Starting ngrok on :5173 ..."
  Start-Process -WindowStyle Minimized ngrok "http 5173"
  Start-Sleep -Seconds 2
  $ok = $false
  for ($i=0; $i -lt 20; $i++) {
    try { $tunnels = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -ErrorAction Stop; $ok = $true; break } catch { Start-Sleep -Milliseconds 500 }
  }
  if (-not $ok) { Write-Error "ngrok API(4040)에 접속 실패. ngrok가 켜졌는지 확인하세요."; exit 1 }
}

# 2) https 터널 주소 추출 → NGROK_HOST 환경변수 세팅
$https = ($tunnels.tunnels | Where-Object { $_.public_url -like "https*" } | Select-Object -First 1 -ExpandProperty public_url)
if (-not $https) { Write-Error "https 터널을 찾지 못했습니다. 'ngrok http 5173' 확인"; exit 1 }
$uri = [System.Uri]$https
$env:NGROK_HOST = $uri.Host
Write-Host "NGROK_HOST=$($env:NGROK_HOST)"

# 3) Vite 실행 (npm.ps1 정책 회피를 위해 npm.cmd 사용 권장)
cd $PSScriptRoot\..   # frontend 폴더로 이동
npm.cmd run dev