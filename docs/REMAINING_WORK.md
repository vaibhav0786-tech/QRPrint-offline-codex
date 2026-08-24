# QRPrint Remaining Work Breakdown

This document tracks what remains to turn the current QRPrint scaffold into the agreed MVP: LAN-first merchant install, PDF-only customer upload, Razorpay payment, manual merchant print, delete-after-print, SQLite persistence, Windows 10/11 support, Vercel customer deployment, and Material 3-inspired dark UI.

## Current build status

The repository currently contains the monorepo scaffold, shared TypeScript contracts, a basic merchant Express server, PDF-only MVP limits, local API-token middleware, printer helper stubs, one-command install scripts, a customer web scaffold, and planning/install/testing documentation.

The product is not yet production-ready. The main blockers are SQLite persistence, real customer-to-merchant upload wiring, Razorpay order/webhook verification, merchant dashboard screens, packaged Windows installer, and full test coverage.

## Priority scale

- **Critical**: Required before a real merchant can run an MVP safely.
- **High**: Required for a usable beta or reliable field testing.
- **Medium**: Important after the MVP workflow is proven.
- **Low**: Nice-to-have, polish, or later-scale capability.

## Core Features

| Item | Priority | Estimated effort | Blockers / dependencies | Responsible owner |
| --- | --- | --- | --- | --- |
| Replace in-memory merchant job storage with SQLite-backed persistence for jobs, files, payments, settings, printers, and audit logs. | Critical | 2-3 days | Final schema choices; migration approach; SQLite package install/build validation on Windows. | Backend / merchant app developer |
| Implement a real merchant dashboard with splash/startup checks, metrics, job queue, QR panel, printer panel, settings/profile, and manual print controls. | Critical | 4-6 days | SQLite APIs; UI component direction; printer discovery endpoint reliability. | Frontend + merchant app developer |
| Wire the customer page to submit jobs and PDFs to the merchant LAN endpoint instead of remaining a static scaffold. | Critical | 2-4 days | Merchant API contract; CORS/security behavior; LAN URL/token strategy. | Customer web developer |
| Implement collection PIN generation and display across merchant queue and customer confirmation page. | Critical | 0.5-1 day | Job persistence schema; status tracking page. | Backend + frontend developer |
| Add manual print workflow from merchant UI: paid job approval, selected printer, status transition, result reporting, retry on failure. | Critical | 2-3 days | Printer API; dashboard; reliable job persistence. | Merchant app developer |
| Delete uploaded PDF files after successful print and persist deletion state in the database. | Critical | 1-2 days | SQLite file records; print success/failure handling. | Backend / merchant app developer |
| Add unpaid-job cleanup after 30 minutes while keeping failed print files available for retry. | High | 1 day | SQLite timestamps; background worker design. | Backend developer |
| Add configurable pricing settings for B/W ₹2/page, color ₹10/page, copies multiplier, and future duplex settings. | High | 1-2 days | Settings schema; dashboard settings UI. | Backend + frontend developer |
| Add customer in-browser job status screen using polling or WebSocket updates. | High | 2-3 days | Job status endpoint; customer token or job lookup token. | Customer web developer |
| Add proper cancellation and delete-file actions for merchant-controlled jobs. | High | 1-2 days | Authorization rules; file lifecycle model. | Merchant app developer |
| Add PDF page-count extraction so pricing is based on actual pages rather than user-entered placeholder values. | High | 1-2 days | PDF parser choice; server-side validation. | Backend developer |
| Add reprint support with explicit merchant action and audit trail. | Medium | 1-2 days | File retention policy; completed job metadata. | Merchant app developer |
| Add later support for DOCX/JPG/PNG conversion-to-PDF pipeline. | Medium | 4-7 days | LibreOffice install strategy; image-to-PDF tooling; page count validation. | Backend / printer pipeline developer |
| Add auto-print setting after manual print is proven reliable. | Medium | 1-2 days | Stable print queue and retries. | Merchant app developer |
| Add tunnel fallback using cloudflared/ngrok after LAN-first MVP is stable. | Medium | 2-4 days | Tunnel provider decision; security review; merchant UX. | Infrastructure + backend developer |

## Infrastructure & Architecture

| Item | Priority | Estimated effort | Blockers / dependencies | Responsible owner |
| --- | --- | --- | --- | --- |
| Design and implement SQLite schema and migrations. | Critical | 1-2 days | Final MVP data model; migration library decision. | Backend developer |
| Add repository-level dependency lockfile and verify install reproducibility. | Critical | 0.5-1 day | Registry access; Node/npm version policy. | DevOps / backend developer |
| Split merchant backend into modules for config, database, jobs, files, payments, printers, and sockets. | High | 2-3 days | SQLite implementation; API contract stabilization. | Backend developer |
| Add typed API contracts shared between merchant and customer apps. | High | 1-2 days | Shared type expansion; route naming. | Backend + frontend developer |
| Add local file spool manager with lifecycle states: uploaded, queued, printed, delete_pending, deleted, delete_failed. | High | 1-2 days | SQLite file table; cleanup worker. | Backend developer |
| Add LAN IP discovery and safer public-base-url selection in the merchant app. | High | 1 day | Windows network testing; multi-adapter behavior. | Merchant app developer |
| Build the Electron shell around the merchant server and dashboard. | High | 3-5 days | Dashboard readiness; packaging strategy. | Desktop app developer |
| Add Windows `.exe` installer packaging. | High | 2-4 days | Electron app structure; signing decision; installer tooling. | Desktop / DevOps developer |
| Add Vercel deployment configuration and environment checklist for customer web. | High | 1 day | Customer API routes and payment flow. | Customer web / DevOps developer |
| Add optional background start-on-boot support. | Medium | 1-2 days | Windows installer; merchant setting UI. | Desktop app developer |
| Add future cloud sync boundary for metadata only, not document bytes. | Low | 5+ days | Product decision; compliance review; cloud account. | Platform developer |

## Integrations

| Item | Priority | Estimated effort | Blockers / dependencies | Responsible owner |
| --- | --- | --- | --- | --- |
| Razorpay order creation API on customer web backend. | Critical | 1-2 days | Razorpay test account and keys. | Payments developer |
| Razorpay webhook route with raw-body signature verification. | Critical | 1-2 days | Webhook secret; Vercel route design. | Payments developer |
| Merchant payment-confirmation callback from trusted backend only. | Critical | 1-2 days | Merchant API token strategy; LAN/tunnel reachability. | Backend + payments developer |
| Payment amount validation against server-side price calculation. | Critical | 1 day | Pricing service; PDF page count. | Backend / payments developer |
| Idempotency for payment events and duplicate webhook delivery. | Critical | 1 day | Payment event table. | Payments developer |
| Windows printer discovery and selected-printer persistence. | High | 1-2 days | Real Windows printer test machine. | Merchant app developer |
| Windows test print using selected printer. | High | 1 day | Printer driver availability. | Merchant app developer |
| PDF print options for copies, page range, color preference, duplex flag, and page size. | High | 2-4 days | Capabilities of `pdf-to-printer`; Windows driver behavior. | Printer pipeline developer |
| UPI QR fallback. | Medium | 1-2 days | Product decision for manual confirmation; UPI payload format. | Payments + frontend developer |
| Cloud tunnel fallback. | Medium | 2-4 days | Provider choice; security model; merchant consent. | Infrastructure developer |
| WhatsApp/SMS/email notifications. | Low | 3-5 days | Provider accounts; customer consent; costs. | Integrations developer |

## Testing & Quality Assurance

| Item | Priority | Estimated effort | Blockers / dependencies | Responsible owner |
| --- | --- | --- | --- | --- |
| Unit tests for pricing, job state transitions, API-token middleware, file lifecycle, and payment signature verification. | Critical | 2-3 days | Test framework selection; modularized services. | QA + backend developer |
| Integration tests for merchant API job create, list, payment confirm, print, fail, retry, and delete paths. | Critical | 2-3 days | SQLite test DB; mock printer adapter. | QA + backend developer |
| End-to-end test for customer upload → price → Razorpay sandbox → merchant queue → manual print → delete. | Critical | 3-5 days | Working customer flow; Razorpay sandbox; printer mock or real device. | QA engineer |
| Windows 10 and Windows 11 printer compatibility matrix. | Critical | 2-4 days | Physical Windows machines and printers. | QA + merchant app developer |
| Installer tests for clean install, update existing install, missing Node, missing Git, port conflict, and restart. | High | 2-3 days | Windows test environments. | QA / DevOps developer |
| Responsive UI tests across mobile, tablet, and desktop breakpoints. | High | 1-2 days | Customer and merchant UI completion. | Frontend QA |
| Accessibility checks: keyboard navigation, focus states, labels, contrast, reduced motion. | High | 1-2 days | UI completion and design tokens. | Frontend developer + QA |
| Security tests for file type spoofing, upload limits, token-protected routes, webhook spoofing, and path traversal. | High | 2-3 days | API implementation; upload handling. | Security / backend developer |
| Performance tests for 25 MB PDF uploads and five-file jobs over shop Wi-Fi. | Medium | 1-2 days | Real LAN environment. | QA engineer |
| Long-running soak test for merchant server stability over a full shop day. | Medium | 1-2 days | Persistent DB and logging. | QA + operations |

## Documentation

| Item | Priority | Estimated effort | Blockers / dependencies | Responsible owner |
| --- | --- | --- | --- | --- |
| Merchant quick-start guide with screenshots for Windows install, first launch, settings, QR display, and printer test. | Critical | 1-2 days | Dashboard UI; installer final behavior. | Technical writer / product |
| Customer workflow guide for scanning QR, uploading PDF, paying, and collecting print. | High | 0.5-1 day | Customer UI final screens. | Technical writer |
| API documentation for merchant endpoints, auth headers, request/response models, and WebSocket events. | High | 1-2 days | API stabilization. | Backend developer |
| Database schema documentation and migration guide. | High | 0.5-1 day | SQLite schema completion. | Backend developer |
| Razorpay setup guide with sandbox keys, webhook URL, test cards/UPI, and production checklist. | High | 1 day | Payment flow implementation. | Payments developer / technical writer |
| Printer troubleshooting runbook for common Windows driver, firewall, and print queue problems. | High | 1 day | Windows testing findings. | QA + technical writer |
| Vercel deployment guide for customer web environment variables and deployment verification. | High | 0.5-1 day | Customer web deployment config. | DevOps developer |
| Privacy/deletion policy wording for merchant and customer screens. | High | 0.5-1 day | Legal/product review. | Product owner |
| Release checklist and rollback procedure. | Medium | 0.5-1 day | CI/CD and packaging. | DevOps developer |

## UI/UX Components

| Item | Priority | Estimated effort | Blockers / dependencies | Responsible owner |
| --- | --- | --- | --- | --- |
| Material 3-inspired design tokens for dark mode, with optional light mode later. | Critical | 1 day | Brand color approval; component approach. | UI designer / frontend developer |
| Merchant splash screen with startup progress: server, database, printer discovery, QR, payment config. | High | 1-2 days | Electron shell and health checks. | Frontend / desktop developer |
| Merchant dashboard metrics cards: jobs today, pending, completed, failed, revenue, printer status. | High | 2 days | SQLite metrics endpoints. | Frontend developer |
| Merchant job queue with status timeline and actions: print, reprint, cancel, mark paid, mark completed, delete file. | Critical | 3-4 days | Job APIs; state-transition rules. | Frontend + backend developer |
| Merchant settings/profile screen for business name, PIN, API token, default printer, pricing, local server URL. | High | 2-3 days | Settings persistence. | Frontend + backend developer |
| QR display/download/print poster UI for customer LAN URL. | High | 1-2 days | QR endpoint; LAN IP detection. | Frontend developer |
| Customer upload form with validation, name + phone, PDF limits, and error states. | Critical | 2-3 days | Upload API and security rules. | Customer web developer |
| Customer print specification selector for B/W/color, copies, page range, and A4. | Critical | 1-2 days | Pricing service and PDF page count. | Customer web developer |
| Customer price summary and Razorpay checkout screen. | Critical | 2-3 days | Razorpay integration. | Customer web + payments developer |
| Customer confirmation/status page with collection PIN and wait-time estimate. | High | 1-2 days | Job status API; collection PIN. | Customer web developer |
| Empty/loading/error states for both merchant and customer flows. | High | 1-2 days | Core UI screens. | Frontend developer |
| Accessibility and mobile-first polish. | High | 1-2 days | Design system and completed screens. | Frontend developer |

## DevOps & Operations

| Item | Priority | Estimated effort | Blockers / dependencies | Responsible owner |
| --- | --- | --- | --- | --- |
| GitHub Actions CI for lint, typecheck, build shared types, build merchant, build customer, and run tests. | Critical | 1-2 days | Dependency install reliability; lockfile. | DevOps developer |
| Release workflow for Windows installer artifacts. | High | 2-3 days | Electron packaging; code signing decision. | DevOps / desktop developer |
| Vercel preview and production deployment pipeline for customer web. | High | 1 day | Vercel project; environment variables. | DevOps developer |
| Structured merchant logs with rotating files and user-friendly export for support. | High | 1-2 days | Logging library choice; data directory standard. | Backend / operations developer |
| Health endpoints for server, database, printer, payment config, and QR URL. | High | 1-2 days | Service modules. | Backend developer |
| Monitoring for customer web uptime and Razorpay webhook failures. | Medium | 1-2 days | Vercel integration; logging/alert provider. | DevOps developer |
| Merchant local backup/restore for SQLite metadata. | Medium | 2-3 days | DB schema; retention policy. | Backend / operations developer |
| Crash recovery and restart behavior for merchant app. | Medium | 2-3 days | Electron shell; background process manager. | Desktop developer |
| Update mechanism for later app versions. | Low | 3-5 days | Installer packaging; release server. | DevOps / desktop developer |

## Compliance & Security

| Item | Priority | Estimated effort | Blockers / dependencies | Responsible owner |
| --- | --- | --- | --- | --- |
| Enforce local API token on sensitive merchant APIs while allowing safe health/QR/customer routes as designed. | Critical | 1-2 days | Route classification; customer upload auth model. | Backend / security developer |
| Add secure upload tokens tied to merchant QR visits and job creation. | Critical | 2-3 days | QR generation model; token TTL; customer flow. | Backend developer |
| Verify Razorpay webhook signatures with raw request body and reject spoofed payment events. | Critical | 1 day | Razorpay secret; Next.js raw body implementation. | Payments / security developer |
| Validate uploaded files by extension, MIME type, PDF magic bytes, size, page count, and safe path handling. | Critical | 2-3 days | PDF parser; upload middleware. | Backend / security developer |
| Store sensitive settings safely and avoid exposing tokens in customer responses or browser storage. | Critical | 1-2 days | Settings service; UI review. | Security + frontend developer |
| Add audit logs for payment, print, delete, retry, cancel, and settings changes. | High | 1-2 days | SQLite audit table. | Backend developer |
| Add privacy notice and consent text explaining local storage and delete-after-print behavior. | High | 0.5-1 day | Product/legal wording. | Product owner / frontend developer |
| Add data retention enforcement for metadata after 30 days. | High | 1 day | Cleanup worker; SQLite timestamps. | Backend developer |
| Add antivirus scanning later for broader public file support. | Medium | 3-5 days | Scanner choice; OS integration; performance tradeoffs. | Security / platform developer |
| Add HTTPS/tunnel security review before enabling non-LAN access. | Medium | 1-2 days | Tunnel provider and threat model. | Security / infrastructure developer |
| Add dependency vulnerability scanning. | Medium | 0.5-1 day | CI pipeline. | DevOps / security developer |

## Recommended next implementation order

1. SQLite schema, migrations, and persistent merchant job/file/payment/settings storage.
2. Merchant API module cleanup and typed contracts.
3. Printer discovery/test-print endpoint verification on Windows.
4. Customer PDF upload wired to merchant LAN endpoint.
5. Razorpay order creation, webhook signature verification, and idempotent payment events.
6. Merchant dashboard job queue and manual print flow.
7. File deletion persistence and cleanup worker.
8. End-to-end MVP test on Windows 10/11 with a real printer.
9. Electron shell and Windows installer packaging.
10. Customer interface polish, Vercel deployment, and operational docs.
