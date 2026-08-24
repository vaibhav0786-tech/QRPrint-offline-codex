#!/usr/bin/env bash
# QRPrint merchant one-command installer for macOS/Linux development testing.
# Recommended command:
# curl -fsSL https://raw.githubusercontent.com/vaibhav0786-tech/QRPrint-offline-codex/codex/scripts/install-merchant.sh | bash

set -Eeuo pipefail
REPO_URL="https://github.com/vaibhav0786-tech/QRPrint-offline-codex.git"
BRANCH="codex"
INSTALL_ROOT="${QRPRINT_INSTALL_ROOT:-$HOME/.qrprint}"
APP_DIR="$INSTALL_ROOT/QRPrint-offline-codex"
MERCHANT_ENV="$APP_DIR/merchant-app/.env"
DEFAULT_PORT="8787"

say() { printf '\033[36m[QRPrint]\033[0m %s\n' "$1"; }
fail() { printf '\033[31m[QRPrint]\033[0m %s\n' "$1" >&2; printf '\033[33m[QRPrint]\033[0m Install Node.js LTS, npm, and Git, then run this command again.\n' >&2; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || fail "$2 was not found."; }

trap 'fail "Installation stopped unexpectedly on line $LINENO."' ERR

say "Checking prerequisites..."
need node "Node.js"
need npm "npm"
need git "Git"
mkdir -p "$INSTALL_ROOT"

if [ -d "$APP_DIR/.git" ]; then
  say "Existing QRPrint folder found. Updating the codex branch..."
  git -C "$APP_DIR" fetch origin "$BRANCH"
  git -C "$APP_DIR" checkout "$BRANCH"
  git -C "$APP_DIR" pull --ff-only origin "$BRANCH"
else
  say "Downloading QRPrint from GitHub..."
  git clone --branch "$BRANCH" --single-branch "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"
say "Installing QRPrint dependencies. This can take a few minutes..."
npm install

if [ ! -f "$MERCHANT_ENV" ]; then
  say "Creating merchant default settings..."
  LAN_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
  LAN_IP="${LAN_IP:-localhost}"
  TOKEN="$(node -e "console.log(require('crypto').randomUUID().replace(/-/g,''))")"
  cat > "$MERCHANT_ENV" <<ENV
QRPRINT_MERCHANT_ID=local-demo-shop
QRPRINT_BUSINESS_NAME=QRPrint Merchant
QRPRINT_PORT=$DEFAULT_PORT
QRPRINT_PUBLIC_BASE_URL=http://$LAN_IP:$DEFAULT_PORT
QRPRINT_DATA_DIR=.qrprint-data
QRPRINT_LOCAL_API_TOKEN=$TOKEN
QRPRINT_DASHBOARD_PIN=1234
QRPRINT_DEFAULT_PRINTER=
QRPRINT_AUTO_PRINT=false
QRPRINT_DELETE_AFTER_PRINT=true
QRPRINT_RAZORPAY_WEBHOOK_SECRET=replace-with-razorpay-webhook-secret
ENV
fi

say "Building shared contracts and merchant server..."
npm run types:build
npm --workspace merchant-app run build

say "Starting QRPrint Merchant on http://localhost:$DEFAULT_PORT ..."
(npm --workspace merchant-app run start > "$APP_DIR/qrprint-merchant.log" 2>&1 &)
say "Installation complete. Open http://localhost:$DEFAULT_PORT/health to verify QRPrint is running."
say "Logs: $APP_DIR/qrprint-merchant.log"
say "Settings: $MERCHANT_ENV"
