# PrintSpool Local

> **Document ID:** PSD-README · **Version:** 1.0.0 · **Status:** Active · **Last updated:** 2026-08-25 · **Owner:** Engineering

PrintSpool Local is a two-surface print-ordering product:

- **Customer portal:** a responsive Vite/React web app intended for Vercel deployment.
- **Merchant console:** a local-only dashboard for receiving orders, managing the queue and printers, and operating a physical print shop.

The repository currently provides the front-end reference implementation, merchant queue simulation, local access gate, and the SDLC/documentation baseline. A production order API and local daemon are integration dependencies described in the design documents; they are not included in this repository.

## Quick start

### Prerequisites

- Node.js **20 LTS or later**
- npm **10 or later**
- A modern Chromium-, Firefox-, or Safari-based browser

```sh
git clone <repository-url>
cd QRPrint-offline-codex
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The normal development entry point opens the customer portal.

### Merchant console (localhost only)

```sh
./scripts/start-merchant.sh
```

The script sets `VITE_APP_SURFACE=merchant` and binds Vite to `127.0.0.1`. Open `http://127.0.0.1:3000`, enter the configured shop ID (`metroprint-downtown` in the demo data), and continue to the local dashboard. The UI gate is a usability safeguard; a production daemon must enforce authentication independently.

## Configuration

Create `.env.local` from `.env.example`. Variables prefixed with `VITE_` are compiled into browser code, so they **must not contain secrets**.

| Variable | Used by | Required | Purpose |
| --- | --- | --- | --- |
| `VITE_APP_SURFACE` | React app | No | `customer` (default) or `merchant`. |
| `VITE_ORDER_API_URL` | Customer build | Production | Public order API base URL. |
| `VITE_LOCAL_DAEMON_URL` | Merchant build | Production | Loopback daemon base URL, for example `http://127.0.0.1:8787`. |
| `SHOP_ID` | Local daemon only | Production | Per-shop routing key; never rely on it as a secret. |
| `DAEMON_TOKEN` | Local daemon only | Production | Private credential used by the daemon to claim and update orders. Do not prefix with `VITE_`. |

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start customer-oriented Vite development server. |
| `./scripts/start-merchant.sh` | Start merchant-oriented server on loopback only. |
| `npm run lint` | Run TypeScript checking without emitting files. |
| `npm run build` | Create the production customer bundle in `dist/`. |
| `npm run preview` | Serve the built bundle locally. |

## Deployment overview

Deploy the customer surface to Vercel with build command `npm run build` and output directory `dist`. Set `VITE_ORDER_API_URL` in Vercel Production environment variables. The included `vercel.json` supplies SPA fallback. Do not deploy the merchant mode to Vercel.

Install the merchant console and daemon on a shop-owned PC. Bind both to loopback, configure the daemon with a per-shop token and an IPP/IPPS printer URI, and run it under a least-privilege OS account. Full instructions and operational procedures are in [Deployment and Maintenance Plan](docs/06-deployment-maintenance-plan.md).

## Documentation map

| Document | Purpose |
| --- | --- |
| [Project Proposal and Feasibility Study](docs/01-project-proposal-feasibility.md) | Scope, objectives, feasibility, stakeholders, and risks. |
| [Requirements Specification](docs/02-requirements-specification.md) | Requirements, use cases, and acceptance criteria. |
| [System Design](docs/03-system-design.md) | Architecture, schemas, API contracts, and components. |
| [Development and Coding Standards](docs/04-development-coding-standards.md) | Engineering, security, review, and Git rules. |
| [Test Plan and Test Cases](docs/05-test-plan-test-cases.md) | Test strategy, cases, traceability, and exit criteria. |
| [Deployment and Maintenance Plan](docs/06-deployment-maintenance-plan.md) | Release, rollback, operations, support, and monitoring. |
| [Project Context](context.md) | Current-state briefing, assumptions, constraints, and onboarding index. |

## Contributing

1. Create a focused branch from the current integration branch.
2. Keep changes aligned with [coding standards](docs/04-development-coding-standards.md).
3. Update relevant requirements, design, tests, and this README when behavior changes.
4. Run `npm run lint`, `npm run build`, and `git diff --check` before opening a pull request.
5. Use conventional commit messages, request review, and do not commit credentials, customer data, or generated `dist/` assets.

## License and support

See the repository license if supplied. Report security concerns privately to the project owner; do not include exploit details in public issues.
