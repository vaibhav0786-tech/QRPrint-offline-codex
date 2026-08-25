# Project Proposal and Feasibility Study

> **Document ID:** PSD-01 · **Version:** 1.0.0 · **Status:** Approved baseline · **Last updated:** 2026-08-25 · **Owner:** Product and Engineering · **Change control:** Update through reviewed pull requests.

## 1. Executive summary

PrintSpool Local enables a customer to submit a paid print order from a public web portal while a designated physical shop receives, validates, prints, and fulfills that order through a private local console. The product separates public browsing/order capture from shop hardware control. The intended market includes copy shops, campuses, and retail print counters that need mobile ordering without exposing a printer controller to the internet.

## 2. Business problem and opportunity

Customers need a low-friction mobile workflow for uploading documents, choosing print options, paying, and tracking pickup. Shop operators need a reliable queue, inventory/printer visibility, and failure recovery. Existing direct-LAN workflows expose devices or require the customer to be on the shop network; fully cloud-hosted workflows can make local print operations dependent on externally reachable workstation ports. This project uses cloud-mediated order routing and a local pull daemon so the cloud never calls a shop's localhost endpoint.

## 3. Objectives and success measures

| Objective | Measurable success criterion |
| --- | --- |
| Improve customer ordering | A customer can create an order, obtain an order ID, and view status on mobile and desktop. |
| Protect shop control plane | Merchant UI and daemon bind to loopback; no raw printer endpoint is public. |
| Route correctly | Every order is scoped and authorized to one `shopId`; cross-shop access is rejected. |
| Support shop operations | Operators can see queue state, printers, pricing, basic analytics, and print failures. |
| Operate resiliently | Offline/failed work remains retryable with idempotent order and status operations. |

## 4. Scope

### In scope

- Responsive React customer portal and local merchant dashboard.
- Shop-ID based order routing contract, polling/claim lifecycle, IPP/IPPS print integration specification.
- Shop queue, printer/inventory views, order status presentation, and operator-oriented controls.
- Vercel deployment guidance and localhost installation/run scripts.
- SDLC governance, testing, security, operational, and support documentation.

### Out of scope for this repository baseline

- A production payment processor, API implementation, object storage, identity provider, or daemon service.
- Native USB printer driver integration and a certified print-driver matrix.
- Tax compliance, PCI attestation, accounting integration, and multi-tenant administrator portal.
- Guaranteed secure deletion claims on SSDs; retention/sanitization require platform-specific operational controls.

## 5. Stakeholder analysis

| Stakeholder | Interest | Responsibilities | Engagement |
| --- | --- | --- | --- |
| Customer | Fast, clear, private ordering and tracking | Supplies accurate files/contact details | Usability testing and support feedback |
| Shop operator | Correct, recoverable queue and printer control | Reviews exceptions, fulfills pickup | UAT and release sign-off |
| Shop owner | Revenue, availability, security | Owns equipment, pricing, local installation | Scope and risk approval |
| Engineering | Maintainable, testable system | Build, review, deploy, respond to incidents | Design/implementation/release |
| API/daemon operator | Secure routing and processing | Token rotation, monitoring, backups | Operational readiness review |
| Payment provider | Authorized payment capture | Payment tokenization/webhooks | Contract and integration validation |

## 6. Feasibility assessment

| Dimension | Assessment | Decision/rationale |
| --- | --- | --- |
| Technical | Feasible | Vite/React supports the customer bundle and local view; an authenticated daemon can poll a conventional HTTPS API and submit PDFs through IPP. |
| Operational | Feasible with controls | Each shop requires a managed PC, printer driver, reliable network, documented recovery, and trained operator. |
| Economic | Feasible for pilot | Static customer hosting is low cost; main costs are local hardware, API/storage, payment fees, support, and observability. |
| Schedule | Incremental | UI baseline exists; API/daemon, tests, payment, and pilot hardening must be delivered as staged releases. |
| Legal/privacy | Conditional | Requires retention policy, consent, data-processing review, payment provider compliance, and regional privacy review before production. |

## 7. Risks and mitigations

| Risk | Likelihood / impact | Mitigation | Owner |
| --- | --- | --- | --- |
| Shop PC offline | Medium / High | Remote queue state, lease expiry, retry/backoff, customer pending state, operator alerts | Operations |
| Incorrect shop routing | Low / High | Server-side shop authorization, per-shop daemon tokens/mTLS, contract tests | API engineering |
| Printer rejects job | Medium / Medium | IPP status mapping, retry policy, manual reassign/reprint workflow | Merchant operations |
| Customer document exposure | Medium / High | TLS, short-lived URLs, encryption, least privilege, retention controls, audit logs | Security |
| Duplicate charge/order | Medium / High | Idempotency keys spanning payment/order creation and reconciled webhooks | Payments engineering |
| Local console exposure | Low / High | Loopback bind, firewall, no unauthenticated tunnels, OS hardening | Shop IT |

## 8. Delivery approach and governance

Deliver in four gates: (1) validated UI/documentation baseline, (2) secured API and daemon integration, (3) automated test/security readiness, and (4) limited shop pilot with measured operational acceptance. The product owner approves scope changes; engineering approves design changes; the shop owner accepts pilot deployment. Requirements use identifiers from `FR-*`/`NFR-*`; changes must update the traceability matrix in PSD-05.
