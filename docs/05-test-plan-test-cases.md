# Test Plan and Test Cases

> **Document ID:** PSD-05 · **Version:** 1.0.0 · **Status:** Active baseline · **Last updated:** 2026-08-25 · **Owner:** QA and Engineering · **Related documents:** PSD-02, PSD-03, PSD-06.

## 1. Purpose, scope, and approach

This plan verifies the customer portal, merchant console, production API/daemon integration target, IPP print workflow, security controls, and operational recovery. The current repository has TypeScript/build checks but no automated runtime test framework; the target release must add unit and integration automation before production. Tests run in isolated test shop/printer environments with synthetic files and non-production payment credentials.

## 2. Test levels

| Level | Focus | Owner | Target automation |
| --- | --- | --- | --- |
| Unit | Pricing, state mapping, input validation, retry/idempotency utilities | Developer | Vitest or equivalent |
| Component | React forms, access gate, accessibility, validation feedback | Developer/QA | React Testing Library |
| Integration | Portal ↔ API ↔ daemon, auth, claims, status, IPP adapter | QA/Engineering | API tests + mock IPP server |
| System/E2E | Full mobile/desktop ordering and local queue behavior | QA | Playwright/Cypress + test shop |
| UAT | Operator/customer workflow and support readiness | Product/shop operator | Scripted pilot sessions |
| Security/performance | AuthZ, uploads, CORS, dependency scan, load/poll behavior | Security/SRE | DAST/SAST/load suite |

## 3. Test environments and data

| Environment | Purpose | Controls |
| --- | --- | --- |
| Local dev | UI/unit feedback | Demo data only, no live payment/printer |
| CI | Repeatable quality gates | Ephemeral DB, mocked object store/IPP, secrets from CI vault |
| Integration | API/daemon contract | Dedicated test shop IDs/tokens and stub payment service |
| Staging/pilot | Operational confidence | Isolated printer/VLAN, synthetic documents, monitored rollback |

Use harmless PDF/image fixtures: one page, multi-page, corrupt, unsupported type, oversized file, malware-test placeholder only where policy permits. Never use real customer files.

## 4. Detailed test cases

| ID | Requirement(s) | Level | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC-01 | FR-01, NFR-05 | Component/E2E | Customer portal available | View at 320px and 1440px; keyboard-tab controls | No horizontal overflow; labels/focus visible; usable navigation. |
| TC-02 | FR-02 | Unit/Component | Upload fixture set | Add valid file, remove it, change copies/color | Validation messages are clear; quote and total pages update deterministically. |
| TC-03 | FR-03 | Integration | Valid payment stub/shop | POST order twice with same idempotency key | First is accepted; second returns same logical order, not duplicate. |
| TC-04 | FR-03, FR-07, NFR-01 | Integration/Security | Two shops and credentials | Try create/claim/read cross-shop order | Unauthorized cross-shop action is denied and audited. |
| TC-05 | FR-04 | E2E | Order state fixture | Open tracking link through every state | Customer sees redacted, accurate queued/printing/ready/failure message. |
| TC-06 | FR-05 | Component/System | Merchant surface enabled | Submit wrong then correct shop ID; enable passcode mode | Wrong value blocks access; correct configured values open session; daemon endpoint remains protected independently. |
| TC-07 | FR-06, FR-09 | Component/E2E | Multiple demo/seed jobs | Search, filter, reassign, cancel/hold a job | Only matching jobs show; permitted action changes queue/audit state. |
| TC-08 | FR-07 | Integration | Claimable order | Two daemon workers claim concurrently | Exactly one successful claim; other receives conflict; lease expires after simulated crash. |
| TC-09 | FR-08 | Integration/System | Mock IPP server | Submit valid PDF; return timeout/reject/success | Success persists job ID; timeout retries within bounds; rejection requires visible intervention. |
| TC-10 | FR-10, NFR-04 | Integration | Event-producing flow | Inspect event/audit records and application logs | Events contain IDs/time/actor and omit file content, secrets, and unnecessary PII. |
| TC-11 | NFR-02 | System | API temporarily unavailable | Stop API during daemon poll then restore | Existing local queue remains visible; daemon backs off and resumes without duplicate print. |
| TC-12 | NFR-03, NFR-06 | CI/Performance | Release candidate | Run type check, build, bundle/performance budget | Checks pass; performance regression is reviewed before release. |

## 5. Requirements traceability matrix

| Requirement | Test case(s) | Release evidence |
| --- | --- | --- |
| FR-01 | TC-01 | Responsive E2E report |
| FR-02 | TC-02 | Unit/component results |
| FR-03 | TC-03, TC-04 | API contract results |
| FR-04 | TC-05 | Tracking E2E report |
| FR-05 | TC-06 | Component/system result |
| FR-06, FR-09 | TC-07 | Merchant E2E report |
| FR-07 | TC-04, TC-08 | Auth/claim integration result |
| FR-08 | TC-09, TC-11 | IPP and recovery report |
| FR-10 | TC-10 | Audit review |
| NFR-01..07 | TC-01, TC-04, TC-10, TC-11, TC-12 | Security/performance/CI evidence |

## 6. Entry, exit, defect, and UAT criteria

**Entry:** requirements/design baselined, test environment available, test data approved, build deployable. **Exit:** all Must requirements pass; no unresolved Critical/High security or data-loss defects; all targeted automated suites pass; rollback has been rehearsed; product and shop operator approve UAT.

Defects include reproducible steps, expected/actual result, environment/build, evidence, severity, requirement ID, owner, and retest status. Critical defects stop release. UAT scripts cover UC-01 to UC-03: customer order/tracking, operator print/ready state, and offline/printer recovery. The shop owner signs acceptance only after successful pilot runs with synthetic data.
