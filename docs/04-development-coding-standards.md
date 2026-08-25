# Development and Coding Standards

> **Document ID:** PSD-04 · **Version:** 1.0.0 · **Status:** Active · **Last updated:** 2026-08-25 · **Owner:** Engineering · **Applies to:** all source, tests, scripts, and documentation.

## 1. Core principles

Build small, reviewable, accessible, secure changes. Prefer explicit types and deterministic behavior over implicit side effects. Treat customer documents, credentials, payment references, and printer locations as sensitive. Documentation is part of the definition of done.

## 2. Repository and code structure

- `src/components/customer`: public customer presentation and interaction components.
- `src/components/merchant`: local merchant screens and controls.
- `src/context`: shared React state/services; production I/O belongs behind typed adapters.
- `src/data`: demo/seed data only; never production credentials or customer content.
- `src/types.ts`: shared domain types.
- `src/utils`: pure utilities with unit tests.
- `docs`: versioned SDLC documentation; `context.md` is the onboarding index.
- `scripts`: executable development/operational helpers using `set -eu` where compatible.

Use one primary component per file; use named exports for reusable components; avoid import-side-effect patterns. Do not wrap imports in `try/catch`.

## 3. TypeScript, React, and naming rules

| Element | Convention | Example |
| --- | --- | --- |
| Components/types | PascalCase | `MerchantAccessGate`, `PrintJob` |
| functions/variables | camelCase | `createOrder`, `queueFilter` |
| constants | UPPER_SNAKE_CASE when module-level immutable | `DEFAULT_PRICING` |
| booleans | `is`/`has`/`should` prefix | `isAuthenticated` |
| event handlers | `handle` prefix | `handlePaymentSuccess` |
| IDs | explicit suffix | `shopId`, `orderId` |
| files | PascalCase components; camelCase utilities | `CustomerView.tsx`, `pricingCalculator.ts` |

- Enable/maintain strict TypeScript-compatible patterns; avoid `any`, untyped JSON, and non-null assertions unless justified.
- Define discriminated unions for state/error domains and validate untrusted API payloads at the boundary.
- Use semantic HTML, labels, `button` types, keyboard focus, meaningful errors, and responsive layouts.
- Keep render functions readable: extract repeated UI/complex logic into components/hooks.

## 4. API, data, and security rules

1. Browser code may use only public configuration. Never put tokens, private URLs, or credentials in `VITE_*` variables.
2. Validate requests on the server; client validation is usability only. Authorize every object by canonical shop and actor identity.
3. Use parameterized queries/ORM protections, output encoding, CSRF strategy where cookie auth is used, rate limiting, and secure headers.
4. Store document references rather than bodies in logs; redact phone/email/payment references and never log tokens.
5. Enforce HTTPS publicly and loopback-only merchant services. Use rotating per-shop credentials or mTLS for daemon calls.
6. Treat `shopId` as an identifier, not a secret; allowlist local printer destinations.
7. Add a threat-model/security review for authentication, uploads, payment, printing, and tunneling changes.

## 5. Version control and review

- Branch names: `feature/<topic>`, `fix/<topic>`, `docs/<topic>`, `chore/<topic>`.
- Commit style: Conventional Commits, imperative and scoped where useful, e.g. `feat(merchant): add retry status`.
- One logical change per commit. Do not commit `.env.local`, tokens, customer documents, runtime databases, or generated distributions.
- Pull requests must state purpose, requirement IDs, design impact, test evidence, migration/rollback notes, and screenshots for perceptible UI changes.
- Require at least one reviewer; security-sensitive changes require security/operations review. Resolve comments before merge.

## 6. Quality gates and definition of done

Before review: run `npm run lint`, `npm run build`, and `git diff --check`; add/modify tests; update requirement traceability and relevant docs; review accessibility and error states. Before release: pass PSD-05 exit criteria, scan dependencies, validate environment configuration, and obtain product/operations approval.
