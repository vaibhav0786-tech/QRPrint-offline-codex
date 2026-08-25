# PrintSpool Local — Project Context

> **Document ID:** PSD-CONTEXT · **Version:** 1.0.0 · **Status:** Living onboarding record · **Last updated:** 2026-08-25 · **Owner:** Engineering · **Update rule:** revise with every material product, architecture, environment, or operational decision.

## 1. Project overview

PrintSpool Local is a merchant-customer print-ordering system. The customer-facing React portal is intended for Vercel; the merchant dashboard is intended to run only on a shop PC. A public order API routes orders by a non-secret `shopId`, while an authenticated local daemon polls, claims, prints through IPP/IPPS, and updates status. The guiding boundary is **public order capture, private local print control**.

## 2. Current implementation status

| Area | Status | Notes |
| --- | --- | --- |
| Customer UI | Implemented reference UI | Upload/preferences/pricing/checkout/tracker are client-side demo flows backed by React context. |
| Merchant UI | Implemented reference UI | Queue, printer, pricing, analytics, audit-oriented views, and local access gate are present. |
| Surface selection | Implemented | `VITE_APP_SURFACE=customer|merchant`; merchant startup script forces merchant mode and loopback bind. |
| Shop identity | Implemented UI/config baseline | `MerchantSettings.shopId` defaults to `metroprint-downtown`; it is surfaced in UI. |
| Vercel config | Implemented | `vercel.json` builds Vite and provides SPA rewrite. |
| Public API | Not implemented in repository | Contract, security rules, and state machine are specified in PSD-03. |
| Local daemon / IPP adapter | Not implemented in repository | Required production dependency; specification and operations plan are documented. |
| Automated runtime tests | Not implemented | Type check/build exist; target test suite is defined in PSD-05. |

## 3. Key decisions and rationale

1. **Static Vercel customer portal:** avoids exposing merchant infrastructure and allows a mobile-friendly public surface.
2. **Loopback merchant console:** physical printer operations happen on a shop-managed host; localhost is not a security boundary by itself, so daemon authentication remains required.
3. **Cloud pull, not cloud push:** a daemon outbound-polls the API, avoiding inbound NAT/tunnel exposure and enabling claim leases.
4. **IPP/IPPS as printer protocol:** it supports network print submission and job/status semantics; raw customer requests never choose a printer URL.
5. **Shop ID is routing only:** actual authorization requires a per-shop daemon credential or mTLS and server-side checks.
6. **Idempotency and event history:** prevent duplicate orders/prints and allow reconciliation after crashes, retries, and payment events.

## 4. Architectural assumptions

- A production HTTPS API can persist metadata, secure document references, status events, and payment state.
- The shop has a stable local PC, IPP/IPPS-capable printer path, outbound internet, and an operator who handles physical exceptions.
- Documents are uploaded/scanned/validated in a compliant production service before local printing.
- Merchant UI/daemon services can be configured on `127.0.0.1` and are protected by OS/firewall controls.
- Payment, privacy, data retention, notifications, and printer-driver requirements are reviewed for the target jurisdiction before launch.

## 5. Known issues, limitations, and next actions

| Priority | Item | Recommended next action |
| --- | --- | --- |
| P0 | UI currently simulates order creation/queue updates in browser state. | Implement authenticated API, durable order/event storage, and typed API client. |
| P0 | No daemon, printer adapter, or true polling exists. | Build a least-privilege local service with daemon auth, lease claims, IPPS adapter, bounded retries, and local audit store. |
| P0 | Merchant access gate uses session storage/demo passcode behavior. | Replace/augment with daemon-backed local session validation; use OS/IdP controls for operators. |
| P1 | No automated component/integration/E2E tests. | Add the test stack and execute PSD-05 test cases in CI. |
| P1 | The Vite output currently has a large JavaScript chunk. | Measure and code-split non-critical dashboard/documentation views. |
| P1 | Documentation describes production security but does not make it real. | Threat model, security review, secret management, upload scanning, and operational pilot are required before production. |

## 6. Environment details

- **Repository:** `QRPrint-offline-codex`
- **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS 4, Lucide React; additional UI/data dependencies are declared in `package.json`.
- **Development command:** `npm run dev`; merchant command: `./scripts/start-merchant.sh`.
- **Quality checks:** `npm run lint`, `npm run build`, `git diff --check`.
- **Public configuration:** Vercel plus `VITE_ORDER_API_URL`.
- **Local configuration:** `VITE_APP_SURFACE=merchant`, loopback daemon URL, daemon-only shop ID/credential and printer URI.

## 7. Documentation and knowledge-transfer index

| ID | Document | Use it for |
| --- | --- | --- |
| PSD-README | [README](README.md) | Initial setup, commands, configuration, contribution. |
| PSD-01 | [Proposal and Feasibility](docs/01-project-proposal-feasibility.md) | Why the project exists, scope, stakeholders, risks. |
| PSD-02 | [Requirements Specification](docs/02-requirements-specification.md) | What to build and acceptance criteria. |
| PSD-03 | [System Design](docs/03-system-design.md) | Components, data model, API, state machine, security architecture. |
| PSD-04 | [Development Standards](docs/04-development-coding-standards.md) | Engineering and code-review expectations. |
| PSD-05 | [Test Plan](docs/05-test-plan-test-cases.md) | Test cases, traceability, quality gates, UAT. |
| PSD-06 | [Deployment and Maintenance](docs/06-deployment-maintenance-plan.md) | Release, rollback, monitoring, support. |
| PSD-CONTEXT | This document | Current reality, decisions, assumptions, limitations, onboarding. |

## 8. Onboarding path

New contributors should read this context document, README, PSD-02, and PSD-03 before editing behavior; read PSD-04 before coding; use PSD-05 to plan tests; and read PSD-06 before touching deployment or daemon-related configuration. If source and documents disagree, record the discrepancy here, raise it in review, and update the controlled document set in the same change where practical.
