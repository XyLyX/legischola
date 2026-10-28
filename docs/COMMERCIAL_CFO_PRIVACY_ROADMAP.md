# LegiSchola commercial, usage and privacy implementation — staged release
Status: staged branch; NOT deployed; no payment collection enabled.
## Decision register
- Seven-day trial, 100 total credits, 25 daily; permanent free tier 20 monthly credits.
- Monthly plans: Founding ₹149 / 150 credits; Plus ₹299 / 400; Pro ₹499 / 900.
- Annual: Founding ₹1,349; Plus ₹2,699; Pro ₹4,499. Annual allowance resets monthly.
- Packs: ₹49/50, ₹99/120, ₹199/270, ₹399/600; bonuses 0/5/10/15% for Free/Founding/Plus/Pro.
- Purchased credits expire after 12 months, consumed after subscription credits, no automatic top-ups.
- All prices provisional; payment, tax, refund, chargeback and Indian consumer disclosure review before go-live.
## Mandatory pre-launch technical work
1. Audit EVERY AI-consuming route, including tutor, research, study, mock exams, guardian functions and background jobs. No route may bypass the server-side usage gateway.
2. Entitlements are server-owned; no authorization from user-editable JWT metadata. Authenticate every request. Reserve credits atomically with idempotency key; reconcile actual consumption; refund reservations on failure. Prevent parallel overspend.
3. Append-only event/ledger with: request_id, user_id (restricted), feature, plan/version, entitlement source, trial cohort, request time, model/provider/version, prompt/completion/cache tokens, input/output price snapshot and currency, exchange-rate snapshot, cost estimate and final cost, latency, response status, retries, source route, correlation_id, credits reserved/settled/refunded, revenue transaction reference, provider invoice reconciliation state.
4. Billing: verified webhook signatures, deduplication, subscription lifecycle, invoice/receipt, refund and chargeback handling, GST/tax review, clear renewal and cancellation disclosures. Never credit a wallet from a client-side payment success screen.
5. Usage and learning events: privacy-minimised session_start, feature_open, tutor_ask, notes_created, assessment_attempt, mock_completed, credit_low, topup_intent, checkout_completed, return_visit, trial_conversion; track retention by cohort and subject. No raw student prompts in analytics events.
6. CFO daily: reconcile model costs against provider dashboards and infrastructure spend (Netlify, Supabase, storage, messaging, payments, refunds, support, analytics). Forecast 7/14/30-day burn, anomaly thresholds, marginal cost per feature, cost per WAU/paid user, trial subsidy, credit liability, gross and contribution margin, MRR, churn, LTV and sensitivity. Do not misrepresent estimates as invoices.
7. Hard spending controls: per-user/day, per-plan/month, global/day and per-model; fail closed on unavailable ledger; rate limits and max tokens; model routing, caching and context compression; notify founder at 50/70/85/95% of budgets.
8. CFO recommendations require approval; agents never change prices, entitlements, privacy retention or production settings autonomously.
9. Run 7–14 days of shadow metering first, then evaluate p50/p95 cost per operation, token consumption, failures, unit economics and budget forecasts. Shadow metering alone is NOT hard cost control.
## Data governance / India DPDP and other compliance review
- Verify DPDP Act 2023 and DPDP Rules 2025 staged commencement, current obligations and effective dates with Indian counsel. Do not assume all provisions are in force simultaneously.
- Complete legal data fiduciary entity, address, DPO/grievance contact if applicable, purposes, lawful basis/consent, multilingual clear notice, withdrawal process, children's age/parent verification, breach workflow, retention/deletion and backup lifecycle, cross-border transfer/subprocessor list, data principal rights, nomination and complaint handling.
- Assess IT Act / IT Rules, consumer protection/e-commerce rules, GST invoicing and automatic renewal, payment processor requirements, accessibility and marketing consent.
- Deletion: authenticated request, identity verification, scope preview, cooling/confirmation if justified, queue, provider deletion where possible, deletion of learning records/storage, statutory finance retention exception, backup expiry, audit evidence, closure notification. Never delete financial audit records without retention analysis.
- Avoid storing student answers in cost telemetry. Aggregate analytics with small-cohort suppression and access controls.
## Later / explicitly not shipped yet
- Checkout, real wallet, atomic credits, webhook-based subscriptions, agent dashboards, automated data deletion, consent center, age/guardian verification, invoices and financial reconciliation.
- More precise pricing and per-feature credit weights after measured provider costs.
- Video reel and original rendered artwork only after explicit approval.
## Release gate
No merge to main or Netlify deployment without user approval, validated migrations/RLS, real provider-cost reconciliation, legal review, test purchases/refunds and browser QA.

## India DPDP commencement — verified against official Gazette, 29 October 2026
The official 13 November 2025 notifications G.S.R. 843(E) and 846(E) phase commencement. Key notice, consent, data principal rights, security and children's data provisions are scheduled for 18 months after publication (May 2027), with certain consent-manager provisions at 12 months (November 2026). Other sections/rules took effect upon publication. Do not describe all DPDP rights as already commenced or delay sensible privacy safeguards until 2027. Legal review must also assess current IT Act / SPDI and other applicable obligations.
Official sources:
- https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf
- https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf
## Release blocking evidence
- Images currently in a conversation ZIP, not committed to GitHub; original SVGs remain in code. GitHub binary asset transfer must be performed and confirmed.
- Pricing page is informational; no wallet or paid checkout is active.
- No end-to-end test signup, password reset or AI response completed on legischola.com.
- Legal data fiduciary and grievance contact details remain unspecified.
- No verified 7–14-day provider-cost baseline; actual model invoices and complete backend expenses not reconciled.
- Do not merge/deploy until all blockers are cleared. One final Netlify build after validation.
