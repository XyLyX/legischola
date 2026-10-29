# LegiSchola founder administration — beta operating contract

## Delivered screens and APIs
- **`/admin`** — restricted founder dashboard: registered accounts, actual tier classification, daily signups, active study sessions, AI usage/non-success, referral registrations, open enquiries and audit.
- **`/contact`** — public and student contact form. Stores consent-based enquiries with sender, subject, message and reference ID.
- **`/api/admin/overview`** — server-verified founder-only operational counts, tier roster (50 users/page), recent digest and audit status. Never returns private lesson text.
- **`/api/admin/inbox`** — founder-only unified view: public/student support, academic-review cases, and institution requests; click item for details and conversation. Support/institution replies use Zoho and are recorded. Academic cases use the existing human academic-review decision endpoint.
- **`/.netlify/functions/admin-daily`** — 04:00 UTC / 08:00 GST (Dubai) daily operational digest. Only registered, confirmed Auth accounts with **`raw_app_meta_data.legischola_role = founder`** receive email. Idempotent per Dubai date and founder ID. Delivery ambiguities enter manual review; no automatic resend.

## Tier classification and integrity
1. A user's email is unconfirmed → **Email unverified**.
2. Email matches active founding tester entitlement → **Founding Tester**.
3. Auth user has `subscription_entitlements.plan = lifetime_complimentary` → **Lifetime Complimentary**.
4. Verified, current `student_subscriptions.status = active` with a non-expired period → **Verified Paid · plan unspecified**.
5. Otherwise → **Free / Public Beta**.

`student_subscriptions` has **no canonical plan field**. Do not display Founding Student, Plus or Pro membership totals until a trusted invoice/subscription mapping is added and independently verified. Do not infer paid subscriptions from displayed proposed pricing. No payment collection or rewards are activated by this admin feature.

## Reply boundaries
- **Support:** Case and first message created atomically in the public server handler (if message write fails, the empty case is deleted). Anonymous visitors have no read permission. Responses are sent to the recorded verified contact destination, not a caller-supplied target; email sent and audited. Administrators may mark cases Open, In Progress, Waiting for Sender or Resolved.
- **Academic review:** Existing review logic and student-visible case messages remain canonical. Human academic decisions remain separate from syllabus publication.
- **Institution request:** Only the verified registered student's Auth email is used for replies. An acknowledgement may move Pending → Reviewing; emailing is not verification/approval of a college.
- **Email transport:** Uses the existing Zoho integration. When no mail credentials exist, the reply API refuses sending. Each attempt has a unique request key; ambiguous errors are flagged for manual review and never blindly retried.
- **User privacy:** Neither `anon` nor `authenticated` has direct SQL access to the five admin inbox/notification tables. Only narrowly scoped, authenticated server endpoints use service-role access. Never show private Cornell notes, AI tutor prompts or PDF evidence in operational summaries.

## Founder activation (NOT yet done)
The live Supabase project has no confirmed account with the `founder` app role. User-provided email or editable `user_metadata` is not enough. Founder should:
1. Sign up and confirm the intended separate administrator account.
2. Verify ownership of the account.
3. Assign `legischola_role = founder` through Supabase Auth Admin API **server-side**, with documented approval. Do not grant it to a student or guess based on a matching email.
4. Refresh the founder's Auth session and sign in again. Only then should the global header expose **Admin** and `/admin` return private data.
5. Verify Zoho mail sender is working. Confirm the scheduled daily function appears in Netlify Functions and that its next 8 AM GST run writes a `sent` digest row.
6. Run a consented end-to-end public enquiry submission, open inbox, send reply, and confirm the recipient received the email.
7. Test an academic request and an institution request; verify escalation and student messages; do not publish syllabi automatically.

## Known non-goals
- No direct Zoho **incoming mailbox ingestion** yet. Messages sent to `support@legischola.com` outside the new web form remain in that mailbox, not in this dashboard. Inbox covers the new web form, existing academic-review submissions and institution requests.
- No automated email retry after uncertain delivery.
- No exports of student private records.
- No changes to payment checkout.
- No release claim that replies or daily notification emails actually reached a real recipient until an authorised founder account and working Zoho mail have been tested.
- Account totals are capped at 5,000 and table-activity samples at 5,000 in the current beta API; the UI flags truncated account totals. For scale, replace them with a secure aggregated reporting pipeline.

## Release gates
Run GitHub CI including `scripts/check-admin-operations.mjs`, Next production build and `scripts/check-social-render.mjs`. Inspect Netlify preview. Confirm Supabase migration applied and RLS checked before merging.
