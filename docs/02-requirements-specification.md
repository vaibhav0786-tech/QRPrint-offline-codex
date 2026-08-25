# Requirements Specification

> **Document ID:** PSD-02 · **Version:** 1.0.0 · **Status:** Approved baseline · **Last updated:** 2026-08-25 · **Owner:** Product · **Related documents:** PSD-01, PSD-03, PSD-05.

## 1. Product boundary

The system consists of a public customer portal, public HTTPS order API, local merchant console, local daemon, and an IPP/IPPS printer. This repository implements the portal and console reference UI. Requirements marked **Target** require the production API/daemon integration described in PSD-03.

## 2. Functional requirements

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-01 | Customer can browse shop information and available print options on responsive layouts. | Must | At 320px and desktop widths, shop name, address, options, and price quote are visible without horizontal page overflow. |
| FR-02 | Customer can upload supported documents and set print preferences. | Must | UI validates type/size, supports file removal, and recalculates page/copy/pricing selections. |
| FR-03 | Customer can submit a paid order to the selected shop. **Target** | Must | `POST /v1/orders` includes `shopId` and idempotency key; a duplicate key does not create a second order. |
| FR-04 | Customer can track order state. **Target** | Must | Status shows queued, claimed/printing, ready, completed, cancelled, or failed without exposing internal daemon details. |
| FR-05 | Merchant operator can authenticate to the local console. | Must | Merchant surface starts at the access gate; mismatched shop ID is rejected; production daemon separately authenticates requests. |
| FR-06 | Merchant can view/filter/search incoming and historical jobs. | Must | Queue filters and search update the visible jobs; each record shows state, customer, file, printer, and pickup data appropriate to role. |
| FR-07 | Daemon pulls and claims only its shop's orders. **Target** | Must | Requests with another shop's ID/token receive 403/404; claim is atomic and leased. |
| FR-08 | Daemon submits validated jobs to a configured IPP/IPPS printer and reports result. **Target** | Must | Successful submission records printer job ID; transient failure is retryable; permanent failure is surfaced to operator. |
| FR-09 | Merchant can manage printer, inventory, pricing, and queue exceptions. | Should | Operator can view device health, adjust allowed settings, reassign/cancel/hold jobs, and see audit activity. |
| FR-10 | System records operational audit events. **Target** | Should | Claim, status change, print submission, failure, retry, and operator override include actor/time/order identifiers. |

## 3. Non-functional requirements

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| NFR-01 | Security | HTTPS for public APIs; loopback merchant bind; token/mTLS daemon auth; server-side shop authorization; no browser-exposed secrets. |
| NFR-02 | Availability | API target 99.9% monthly availability; local offline states remain visible and recoverable after reconnection. |
| NFR-03 | Performance | Customer first meaningful UI target under 3 seconds on representative 4G; queue poll target 10 seconds configurable; API p95 target under 500ms excluding upload. |
| NFR-04 | Privacy | Data minimization, short-lived document URLs, access/audit logs, configurable retention, and no customer file contents in logs. |
| NFR-05 | Accessibility | Keyboard-operable controls, visible focus, semantic labels/error messages, and WCAG 2.1 AA target for new views. |
| NFR-06 | Maintainability | TypeScript check, reviewed pull request, requirement/test traceability, and documented environment variables for each release. |
| NFR-07 | Compatibility | Latest two major versions of Chrome, Edge, Firefox, Safari; Node 20 LTS+ for local setup. |

## 4. Use cases

### UC-01: Place an order

**Actor:** Customer. **Preconditions:** Shop is active; customer has a supported file and completed payment authorization. **Main flow:** (1) Customer opens shop URL/QR. (2) Selects files and preferences. (3) Reviews quote and payment. (4) Portal creates idempotent order with shop ID. (5) API returns `202` and order ID. (6) Portal shows queued status. **Alternates:** API unavailable → preserve draft and explain retry; payment failure → do not create printable order; unsupported file → block before submission. **Postcondition:** One remote queued order exists for one shop.

### UC-02: Receive and print an order

**Actor:** Local daemon/operator. **Preconditions:** Daemon is authenticated for the shop; target printer is configured. **Main flow:** (1) Daemon polls scoped orders. (2) Atomically claims an order. (3) Downloads/validates document. (4) Submits via IPPS/IPP. (5) Updates status and printer job ID. (6) Console/customer see ready-for-pickup. **Alternates:** Printer offline → retryable failure/hold; daemon crash → claim lease expires; hash mismatch → permanent failure and operator alert. **Postcondition:** Order is completed, failed, or awaiting manual intervention.

### UC-03: Recover an exception

**Actor:** Merchant operator. **Main flow:** Operator filters failed/held jobs, reviews reason and printer status, fixes paper/printer/configuration, retries or reassigns, and documents override. **Postcondition:** Audit entry exists and customer is notified when status changes.

## 5. Business rules

1. `shopId` routes work but is not an authentication factor.
2. The cloud service must never open a connection to a merchant's localhost address.
3. Only a paid/approved order may be claimed for printing.
4. Order creation, claim, and status updates require idempotency/conditional handling.
5. Raw documents and daemon tokens must not be logged or placed in `VITE_*` variables.
6. A terminal failure must be visible to an operator; automatic retries are bounded and delayed.
