# QRPrint merchant one-command installer for Windows PowerShell.
# Recommended command:
# powershell -NoProfile -ExecutionPolicy Bypass -Command "iwr -useb https://raw.githubusercontent.com/vaibhav0786-tech/QRPrint-offline-codex/codex/scripts/install-merchant.ps1 | iex"

$ErrorActionPreference = "Stop"
$RepoUrl = "https://github.com/vaibhav0786-tech/QRPrint-offline-codex.git"
$Branch = "codex"
$InstallRoot = Join-Path $env:LOCALAPPDATA "QRPrint"
$AppDir = Join-Path $InstallRoot "QRPrint-offline-codex"
$MerchantEnv = Join-Path $AppDir "merchant-app\.env"
$DefaultPort = "8787"

function Say($Message) { Write-Host "[QRPrint] $Message" -ForegroundColor Cyan }
function Fail($Message) {
  Write-Host "[QRPrint] $Message" -ForegroundColor Red
  Write-Host "[QRPrint] Please install Node.js LTS and Git, then run this command again." -ForegroundColor Yellow
  exit 1
}
function Need($Command, $FriendlyName) {
  if (-not (Get-Command $Command -ErrorAction SilentlyContinue)) { Fail "$FriendlyName was not found." }
}

try {
  Say "Checking prerequisites..."
  Need "node" "Node.js"
  Need "npm" "npm"
  Need "git" "Git"

  New-Item -ItemType Directory -Force -Path $InstallRoot | Out-Null

  if (Test-Path $AppDir) {
    Say "Existing QRPrint folder found. Updating the codex branch..."
    Push-Location $AppDir
    git fetch origin $Branch
    git checkout $Branch
    git pull --ff-only origin $Branch
    Pop-Location
  } else {
    Say "Downloading QRPrint from GitHub..."
    git clone --branch $Branch --single-branch $RepoUrl $AppDir
  }

  Push-Location $AppDir
  Say "Installing QRPrint dependencies. This can take a few minutes..."
  npm install

  if (-not (Test-Path $MerchantEnv)) {
    Say "Creating merchant default settings..."
    $MachineIp = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
      Where-Object { $_.IPAddress -notlike "127.*" -and $_.PrefixOrigin -ne "WellKnown" } |
      Select-Object -First 1 -ExpandProperty IPAddress)
    if (-not $MachineIp) { $MachineIp = "localhost" }
    $Token = [Guid]::NewGuid().ToString("N")
    @"
QRPRINT_MERCHANT_ID=local-demo-shop
QRPRINT_BUSINESS_NAME=QRPrint Merchant
QRPRINT_PORT=$DefaultPort
QRPRINT_PUBLIC_BASE_URL=http://$MachineIp`:$DefaultPort
QRPRINT_DATA_DIR=.qrprint-data
QRPRINT_LOCAL_API_TOKEN=$Token
QRPRINT_DASHBOARD_PIN=1234
QRPRINT_DEFAULT_PRINTER=
QRPRINT_AUTO_PRINT=false
QRPRINT_DELETE_AFTER_PRINT=true
QRPRINT_RAZORPAY_WEBHOOK_SECRET=replace-with-razorpay-webhook-secret
"@ | Set-Content -Encoding UTF8 $MerchantEnv
  }

  Say "Building shared contracts and merchant server..."
  npm run types:build
  npm --workspace merchant-app run build

  Say "Starting QRPrint Merchant on http://localhost:$DefaultPort ..."
  Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$AppDir'; npm --workspace merchant-app run start"

  Say "Installation complete. Open http://localhost:$DefaultPort/health to verify QRPrint is running."
  Say "Your settings file is: $MerchantEnv"
  Pop-Location
} catch {
  Fail $_.Exception.Message
}
