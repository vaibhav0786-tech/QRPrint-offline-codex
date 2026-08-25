#!/usr/bin/env bash
set -euo pipefail
printf '===============================================\n  QRPrint Offline - Linux Setup Wizard\n===============================================\n\n'
command -v node >/dev/null || { echo 'Node.js 20+ is required. Install node and rerun.'; exit 1; }
command -v npm >/dev/null || { echo 'npm was not found. Install npm and rerun.'; exit 1; }
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
mkdir -p data
STAFF_JOINED=$(printf '%s\037' "${STAFF_NAMES[@]}")
SHOP_NAME="$SHOP_NAME" OWNER_NAME="$OWNER_NAME" STAFF_JOINED="$STAFF_JOINED" STAFF_COUNT="$STAFF_COUNT" PRINTER_COUNT="$PRINTER_COUNT" DEFAULT_PRINTER="$DEFAULT_PRINTER" SHOP_ADDRESS="$SHOP_ADDRESS" MOBILE="$MOBILE" EMAIL="$EMAIL" PORT="$PORT" FRONT_PAGE="$FRONT_PAGE" node <<'NODE'
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
npm install
npm run build
printf '\nSetup complete. Merchant profile saved to data/merchant-profile.json\n'
printf 'Launch with: npm run dev -- --port %s --host 127.0.0.1\n' "$PORT"
printf 'Local URL: http://127.0.0.1:%s\n' "$PORT"
