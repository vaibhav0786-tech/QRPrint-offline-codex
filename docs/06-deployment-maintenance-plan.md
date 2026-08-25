# Deployment and Maintenance Plan

> **Document ID:** PSD-06 · **Version:** 1.0.0 · **Status:** Approved baseline · **Last updated:** 2026-08-25 · **Owner:** Release Engineering and Operations · **Related documents:** PSD-03, PSD-05.

## 1. Release model

Use environment progression: local → CI → integration → staging/pilot → production. Tag approved releases as `vMAJOR.MINOR.PATCH`; keep a changelog, release owner, build artifact identity, migration notes, risk assessment, and rollback decision. Customer Vercel and merchant local/daemon releases are independently deployable but must remain compatible with the versioned API contract.

## 2. Pre-release checklist

1. Approved PRs and traceability updates are complete.
2. `npm run lint`, `npm run build`, automated tests, dependency scan, and `git diff --check` pass.
3. API schema/state transition compatibility reviewed; migrations tested and backed up.
4. Required Vercel and daemon secret/configuration values are present in managed secret stores.
5. Staging demonstrates order creation, claim, IPP success, printer failure, offline recovery, and customer status tracking.
6. Monitoring dashboards/alerts, on-call owner, release window, support notification, and rollback artifact are ready.

## 3. Customer portal deployment (Vercel)

1. Import the repository/project root in Vercel.
2. Configure build command `npm run build`, output directory `dist`, and production Node version matching supported LTS.
3. Set `VITE_ORDER_API_URL` to the production HTTPS API. Do not add `DAEMON_TOKEN` or other secrets as `VITE_*` values.
4. Deploy a preview, execute smoke tests, then promote/merge to production according to branch policy.
5. Validate Vercel route fallback from `vercel.json`, public URL/QR routing, TLS, security headers, and API CORS allowlist.

## 4. Merchant local installation and release

1. Provision a supported shop PC with Node 20 LTS+, managed OS updates, printer driver, endpoint protection, and a restricted service account.
2. Install the merchant console artifact/repository and run `npm ci`; create a protected daemon configuration outside browser environment.
3. Configure `VITE_APP_SURFACE=merchant` for UI, and daemon-only `SHOP_ID`, `DAEMON_TOKEN`/mTLS, polling interval, API URL, retention policy, and allowlisted `ipps://` printer URI.
4. Bind UI/daemon to `127.0.0.1`; firewall all management ports; prohibit unauthenticated tunnels.
5. Start the daemon as a managed service, then run `./scripts/start-merchant.sh` during development or serve a built local artifact in production.
6. Execute smoke test: authenticate console, daemon health, poll, claim test order, IPP test page, status update, audit event, and customer tracking.

## 5. Rollback and disaster recovery

### Customer rollback

Use Vercel's prior immutable deployment to instant-rollback the public bundle. If an API incompatibility exists, disable affected feature via server-side flag or revert the API while preserving backward compatibility. Verify customer order status after rollback.

### Merchant/daemon rollback

Stop the new daemon gracefully so it does not claim more jobs; retain current local queue/audit database; restore the prior signed artifact/configuration; start it and verify health. Claim leases must expire or be explicitly released before another worker retries. Never delete spool/audit data as a rollback shortcut.

### Data recovery

Back up encrypted API data and local operational configuration according to retention policy; test restoration regularly. Preserve forensic logs for incidents while minimizing customer file retention. Reconcile payment/order/print states using immutable order events and IPP job IDs.

## 6. Monitoring and alerting

| Signal | Alert condition | Response |
| --- | --- | --- |
| API availability/latency | Availability below SLO or p95 threshold breach | On-call investigates API/dependency; communicate customer impact. |
| Daemon heartbeat | No heartbeat/poll beyond configured interval | Contact shop/operator; inspect local service/network. |
| Queue age | Claimable/claimed job exceeds SLA | Alert operator; investigate offline/printer/payment state. |
| IPP failures | Repeated rejection/timeout or printer offline | Pause/reassign queue, check printer supplies/network, retry safely. |
| Security | Auth failures spike, token misuse, tunnel exposure | Revoke credential, isolate host, investigate/audit, rotate secrets. |
| Storage/retention | Capacity/cleanup failure | Stop accepting unsafe work if needed; remediate with approved procedure. |

Use structured, redacted logs with correlation IDs (`orderId`, event ID, daemon ID) and metrics/traces that never include document contents or credentials.

## 7. Support and maintenance workflow

- **L1 shop operator:** check dashboard, printer/paper/network, retry permitted job, notify customer using approved status language.
- **L2 operations:** inspect daemon heartbeat, queue lease, API status, configuration and audit trail; rotate/restart per runbook.
- **L3 engineering/security:** diagnose defects, deploy hotfix, perform incident review, revise tests/docs/threat model.
- Classify incidents by impact/severity, maintain timestamps and customer communications, and conduct a blameless post-incident review for significant incidents.

Monthly: patch dependencies/OS, review access/token rotation, validate backups, test print/recovery, review queue/failure trends, and update runbooks. Quarterly: re-test disaster recovery, permissions, vulnerability posture, and requirements/design assumptions.
