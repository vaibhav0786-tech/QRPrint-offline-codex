# PrintSpool Local

PrintSpool Local is a single source repository with two intentionally separate deployment targets:

| Surface | Audience | Deployment |
| --- | --- | --- |
| **Customer portal** | Customers scanning a shop QR code | Vercel static/Vite deployment |
| **Merchant console** | Staff operating one physical shop | Localhost only (`127.0.0.1`) |

## Quick start

```sh
npm install
npm run dev                 # customer portal on http://localhost:3000
./scripts/start-merchant.sh # merchant console, bound to 127.0.0.1
```

Copy `.env.example` to `.env.local`. For the customer build set `VITE_ORDER_API_URL` to the public order API. For the merchant installation set `VITE_APP_SURFACE=merchant`, `VITE_LOCAL_DAEMON_URL`, and a private `SHOP_ID` in the daemon environment. Do not put a daemon token in a `VITE_` variable.

## Vercel customer deployment

1. Import this repository into Vercel and use the project root as the Root Directory.
2. Vercel detects Vite. Use `npm run build` and `dist` (the included `vercel.json` also configures SPA fallback).
3. Add `VITE_ORDER_API_URL=https://api.your-domain.example/v1` under Production environment variables.
4. Deploy. Give each shop a QR URL such as `https://print.example/s/metroprint-downtown`; the page passes that shop ID in its order payload.

The customer bundle contains no merchant credential and must never contact a raw LAN printer.

## Local merchant installation

1. Install Node 20+ and the printer driver on the shop PC.
2. Clone the repository, run `npm ci`, then create `.env.local` with `VITE_APP_SURFACE=merchant`.
3. Start the local daemon (your production service) on `127.0.0.1:8787`, configured with its `SHOP_ID`, `DAEMON_TOKEN`, polling interval, and the target **IPP network printer** URI.
4. Run `./scripts/start-merchant.sh` and unlock the dashboard with the local Shop ID. The browser session unlock is a UI gate; production authorization belongs in the loopback daemon.

### Printer method

This implementation is designed for **IPP** (`ipp://printer.lan/ipp/print` or `ipps://…`) because it supports network discovery, job IDs, and status polling. The daemon should submit the validated PDF to IPP after it claims the job, record the returned printer job ID, and report `failed` with a retryable reason if IPP rejects it. USB support should be added inside the daemon, not the customer web app.

## Order routing contract

The public API persists a small order envelope and associates it with a Shop ID. The local daemon pulls only its own work; Vercel never makes a direct request to a customer’s localhost.

```http
POST /v1/orders
Authorization: Bearer <customer-payment-session>
Content-Type: application/json

{
  "shopId": "metroprint-downtown",
  "idempotencyKey": "uuid-v4",
  "customer": { "name": "Ari", "phone": "+15551234567", "notifyVia": "sms" },
  "files": [{ "uploadUrl": "https://…", "sha256": "…", "pages": 4 }],
  "preferences": { "colorMode": "bw", "paperSize": "A4", "copies": 1 }
}
```

Response: `202 { "orderId": "ord_…", "status": "queued_remote" }`. The daemon then polls `GET /v1/merchant/orders?shopId=metroprint-downtown` with `Authorization: Bearer <daemon-token>`, claims with `POST /v1/merchant/orders/:id/claim`, prints via IPP, and updates `POST /v1/merchant/orders/:id/status`. Both creation and status updates use idempotency keys.

### Offline and failure behavior

* A shop without a daemon remains `queued_remote`; customer tracking must show “shop connection pending,” not “printing.”
* Claim leases expire so a crashed daemon cannot permanently lock an order. The daemon retries temporary network/IPP failures with exponential backoff and surfaces them in the local queue.
* Never automatically charge twice: payment capture and order creation must share the same idempotency key.
* Keep document download URLs short-lived, encrypted, and delete local spool files after a confirmed print according to the operator’s retention policy.

## Security checklist

* Bind the merchant web app and daemon to `127.0.0.1`; firewall their ports and use a distinct OS account.
* Do **not** expose localhost with an unauthenticated tunnel. If remote support is needed, use an authenticated, TLS tunnel with device identity, IP allowlisting, audit logs, and short expiry.
* Treat `shopId` as a routing label, not authentication. Authenticate daemon calls with rotating per-shop tokens or mTLS and authorize every resource by shop ID server-side.
* Verify uploaded file type, size, hash, virus scan result, payment state, and IPP destination before printing. Apply rate limits and CORS allowlists to the public API.
