# QRPrint Implementation Guide

QRPrint is an offline-first print management SaaS shell: documents stay on the merchant Windows PC and are deleted after printing; only online payment authorization uses Razorpay/UPI.

## Monorepo
- `merchant-app`: Electron/Express local server, printer bridge, SQLite-ready persistence, QR generation, file deletion after print.
- `customer-web`: Next.js/Vercel mobile customer flow.
- `shared-types`: shared job, file, payment, and print-spec contracts.
- `docs`: build phases, deployment notes, and operational runbooks.

## Phases
1. Run `npm install`, copy `merchant-app/.env.example`, start `npm run merchant:dev`, validate `/health` and printer discovery.
2. Build Material 3 dark merchant dashboard: splash, metrics, profile, QR, UPI config, print queue, status timeline.
3. Build Material 3 dark customer flow: upload PDF/DOCX/JPG/PNG, specs, calculator, collection instructions.
4. Add Razorpay sandbox order creation and webhook signature verification; display static UPI QR fallback from configured UPI ID.
5. Wire job status pipeline: `pending_payment` → `payment_successful` → `queued_for_printing` → `completed`/`failed` → `deleted`.
6. Package `qrprint-merchant` CLI and Electron installer for Windows.
7. Deploy `customer-web` to Vercel; keep documents posted directly to LAN/tunnel merchant endpoint, not Vercel storage.

## Offline-first rule
Do not persist document bytes in cloud storage. Vercel hosts UI and payment webhook only. The merchant PC receives files, prints them, then deletes temp files after success.
