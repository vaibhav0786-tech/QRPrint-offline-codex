#!/usr/bin/env bash
set -uo pipefail

LOG_DIR="${TMPDIR:-/tmp}/qrprint-install-logs"
mkdir -p "$LOG_DIR"
LAST_OUTPUT_FILE=""

pause_before_exit() {
  printf '\nPress any key to continue...'
  if [ -r /dev/tty ]; then
    IFS= read -r -n 1 _ </dev/tty || true
    printf '\n'
  else
    # Non-interactive/scripted execution has no keyboard to read from; still pause visibly.
    sleep 3
    printf '\n'
  fi
}

fail_install() {
  local step="$1"
  local exit_code="$2"
  printf '\nERROR: QRPrint Offline setup failed during: %s\n' "$step" >&2
  printf 'Exit code: %s\n' "$exit_code" >&2
  if [ -n "$LAST_OUTPUT_FILE" ] && [ -s "$LAST_OUTPUT_FILE" ]; then
    printf '\nFailure details captured from command output:\n' >&2
    tail -n 40 "$LAST_OUTPUT_FILE" >&2
    printf '\nFull log: %s\n' "$LAST_OUTPUT_FILE" >&2
  else
    printf '\nNo command output was captured. This may be a silent failure; verify permissions, disk space, Node.js/npm installation, and network access.\n' >&2
  fi
  pause_before_exit
  exit "$exit_code"
}

run_cmd() {
  local step="$1"
  shift
  LAST_OUTPUT_FILE="$LOG_DIR/$(date +%Y%m%d-%H%M%S)-$(echo "$step" | tr ' /' '__').log"
  printf '\n>> %s\n' "$step"
  printf '$ %q' "$@" | tee "$LAST_OUTPUT_FILE"
  printf '\n' | tee -a "$LAST_OUTPUT_FILE"
  "$@" 2>&1 | tee -a "$LAST_OUTPUT_FILE"
  local status=${PIPESTATUS[0]}
  if [ "$status" -ne 0 ]; then
    fail_install "$step" "$status"
  fi
}

require_cmd() {
  local binary="$1"
  local message="$2"
  LAST_OUTPUT_FILE=""
  if ! command -v "$binary" >/dev/null 2>&1; then
    printf '\nERROR: %s\n' "$message" >&2
    pause_before_exit
    exit 127
  fi
}

printf '===============================================\n  QRPrint Offline - Linux Setup Wizard\n===============================================\n\n'
require_cmd node 'Node.js 20+ is required. Install node and rerun this installer.'
require_cmd npm 'npm was not found. Install npm and rerun this installer.'

read -rp 'Shop name: ' SHOP_NAME
read -rp 'Owner name: ' OWNER_NAME
read -rp 'Total number of staff members: ' STAFF_COUNT
STAFF_NAMES=()
for ((i=1;i<=STAFF_COUNT;i++)); do read -rp "Staff $i name: " name; STAFF_NAMES+=("$name"); done
read -rp 'Number of printers to connect: ' PRINTER_COUNT
read -rp 'Default printer selection/name: ' DEFAULT_PRINTER
read -rp 'Shop address: ' SHOP_ADDRESS
read -rp 'Mobile number: ' MOBILE
read -rp 'Email address: ' EMAIL
read -rp 'Local web port [3000]: ' PORT; PORT=${PORT:-3000}
read -rp 'Do you want to add a front page to print jobs? [Y/n]: ' FRONT; FRONT=${FRONT:-Y}
[[ "$FRONT" =~ ^[Yy] ]] && FRONT_PAGE=true || FRONT_PAGE=false

run_cmd 'Create data directory' mkdir -p data
STAFF_JOINED=$(printf '%s\037' "${STAFF_NAMES[@]}")
export SHOP_NAME OWNER_NAME STAFF_JOINED STAFF_COUNT PRINTER_COUNT DEFAULT_PRINTER SHOP_ADDRESS MOBILE EMAIL PORT FRONT_PAGE
run_cmd 'Write merchant profile' node <<'NODE'
const fs = require('fs');
const profile = {
  shopName: process.env.SHOP_NAME,
  ownerName: process.env.OWNER_NAME,
  staffNames: (process.env.STAFF_JOINED || '').split('\037').filter(Boolean),
  staffCount: Number(process.env.STAFF_COUNT),
  printerCount: Number(process.env.PRINTER_COUNT),
  defaultPrinter: process.env.DEFAULT_PRINTER,
  address: process.env.SHOP_ADDRESS,
  mobile: process.env.MOBILE,
  email: process.env.EMAIL,
  port: Number(process.env.PORT),
  addFrontPage: process.env.FRONT_PAGE === 'true'
};
fs.writeFileSync('data/merchant-profile.json', JSON.stringify(profile, null, 2));
NODE
run_cmd 'Install npm dependencies' npm install
run_cmd 'Build QRPrint Offline' npm run build
printf '\nSetup complete. Merchant profile saved to data/merchant-profile.json\n'
printf 'Launch with: npm run dev -- --port %s --host 127.0.0.1\n' "$PORT"
printf 'Local URL: http://127.0.0.1:%s\n' "$PORT"
pause_before_exit
