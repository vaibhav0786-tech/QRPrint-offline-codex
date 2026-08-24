# QRPrint Merchant One-Command Installation

Repository: `https://github.com/vaibhav0786-tech/QRPrint-offline-codex.git`  
Default branch: `codex`  
Installed app folder: `QRPrint-offline-codex`

## Recommended merchant command for Windows

Open **PowerShell as a normal user** and run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -Command "iwr -useb https://raw.githubusercontent.com/vaibhav0786-tech/QRPrint-offline-codex/codex/scripts/install-merchant.ps1 | iex"
```

The installer automatically:

1. Checks for Node.js, npm, and Git.
2. Clones `vaibhav0786-tech/QRPrint-offline-codex.git`.
3. Checks out the `codex` branch.
4. Installs all workspace dependencies.
5. Creates `merchant-app/.env` with merchant-friendly defaults.
6. Builds shared TypeScript contracts and the merchant server.
7. Starts the QRPrint merchant server on `http://localhost:8787`.
8. Prints the settings file location and verification URL.

## macOS/Linux developer command

Windows is the merchant MVP target, but this command is useful for development testing:

```bash
curl -fsSL https://raw.githubusercontent.com/vaibhav0786-tech/QRPrint-offline-codex/codex/scripts/install-merchant.sh | bash
```

## Minimal prerequisites

### Windows merchant PC

Install these before running the command:

- Node.js LTS from `https://nodejs.org/`.
- Git for Windows from `https://git-scm.com/download/win`.
- A working Windows printer driver.

Docker is not required for the MVP installer. The local printer bridge needs direct access to Windows printers, so Node.js is the preferred merchant prerequisite.

## Default settings created by the installer

The installer creates `merchant-app/.env` only if it does not already exist. Defaults include:

```env
QRPRINT_MERCHANT_ID=local-demo-shop
QRPRINT_BUSINESS_NAME=QRPrint Merchant
QRPRINT_PORT=8787
QRPRINT_PUBLIC_BASE_URL=http://<detected-lan-ip>:8787
QRPRINT_DATA_DIR=.qrprint-data
QRPRINT_LOCAL_API_TOKEN=<generated-token>
QRPRINT_DASHBOARD_PIN=1234
QRPRINT_AUTO_PRINT=false
QRPRINT_DELETE_AFTER_PRINT=true
```

Before real shop use, change:

- `QRPRINT_BUSINESS_NAME` to the merchant shop name.
- `QRPRINT_MERCHANT_ID` to a stable shop slug, for example `sharma-print-zone`.
- `QRPRINT_DASHBOARD_PIN` from `1234` to a private PIN.
- `QRPRINT_RAZORPAY_WEBHOOK_SECRET` after Razorpay setup.
- `QRPRINT_DEFAULT_PRINTER` after checking printer discovery.

## Verification steps

After installation succeeds:

1. Open `http://localhost:8787/health` on the merchant PC.
2. Confirm the page returns JSON with `"ok": true`.
3. Open `http://localhost:8787/api/merchant/qr` with the configured `x-qrprint-token` header if `QRPRINT_LOCAL_API_TOKEN` is set.
4. Confirm the response includes a customer URL and a QR code data URL.
5. Run a printer test from the merchant dashboard or call the test-print endpoint once the UI is wired.

## Merchant-friendly troubleshooting

| Problem | What it means | Fix |
| --- | --- | --- |
| `Node.js was not found` | Node is not installed or not in PATH. | Install Node.js LTS, restart PowerShell, rerun the command. |
| `Git was not found` | Git is not installed or not in PATH. | Install Git for Windows, restart PowerShell, rerun the command. |
| Port `8787` already in use | Another app is using QRPrint's default port. | Edit `merchant-app/.env` and set `QRPRINT_PORT=8788`, then restart. |
| Customer phone cannot open QR URL | Phone cannot reach merchant PC LAN address. | Put phone and merchant PC on the same Wi-Fi, allow the port in Windows Firewall, or add tunnel fallback later. |
| Printer test fails | Windows cannot print from the selected device. | Confirm the printer works from Windows first, reinstall the driver, then retry QRPrint. |

## Current MVP limitations

- Windows `.exe` packaging is still a later step; this script is the first one-command bootstrap path.
- The MVP accepts PDF files only.
- Customers and merchant PC should be on the same LAN until tunnel fallback is implemented.
- Razorpay is the online payment provider; document files remain local to the merchant machine.
