# LegiSchola beta — consolidated release requirements

Status: agreed requirements; implementation and release verification remain separate. Updated 29 October 2026.

## Original generated artwork
Use the six previously generated and reviewed images from the LegiSchola beta rendered assets staging archive, **not** SVG placeholders or temporary gradient panels. Intended placements: hero-book-pillar.webp (homepage hero); one-student-one-ai-tutor.webp (AI Tutor feature); brand-book-pillar-logo.webp (brand/About); dashboard-background.webp (subtle dashboard); institutional-network.webp (About/institutional partnerships); legal-reasoning-tree.webp (reasoning/exams). Do not mark imagery complete until the actual files are in the repository and visible in a successful deploy preview.

## Recovered decisions and release checks

| Area | Agreed decision | Release verification |
|---|---|---|
| Jiya's account | Lifetime complimentary access, all features, no individual AI caps | Entitlement configured; account activation and authenticated testing outstanding |
| Referral eligibility | Jiya participates without purchasing a subscription | Founding-tester referral issuance after verified account; test |
| Every confirmed student | `Refer & Earn` always visible on signed-in header. Personal code and copy/share link available after email verification; no payment required to invite | Verify email-confirmed session, unique stable code and share links |
| Referral rewards | Standard referrer ₹25 non-cash platform credit; referred new paying student a separate one-time ₹25 platform welcome credit; Jiya ₹50 cash per qualifying first paid referral | Never post a reward before independently verified eligible payment; idempotency, refunds and ledger reversals pending payment integration |
| Annual subscription | Twelve months access for the price of ten | Confirm public pricing and actual billing configuration before checkout |
| University onboarding | Institution, programme, admission batch, semester; request missing institution | Test complete signup/onboarding flow |
| Academic accuracy | DME BA LL.B. Semester 1 pilot; do not claim unverified 2026 syllabus is official | Official curriculum verification gate |
| Guardian reporting | Explicit student consent and guardian confirmation; never default access | Test consent, revocation and report delivery |
| Founder identity | Publicly Navvin S Bhalla — Founder | Do not expose private address or proprietor/business-structure details unless legally required |
| Beta monitoring | Reliability, usage, AI cost, learning engagement; no private prompts or answers | Test event logging, permissions and consent |

## Settled referral cash and credit calculation
**Jiya, Founding Tester #001:** ₹50 cash per first qualifying paid referral. Approved unpaid cash is reviewed at the end of each month; at ₹500 or above, the **entire approved unpaid amount** becomes eligible for a separately authorised cash payout. Under ₹500, every rupee carries forward without forfeiture. **Other referring students:** ₹25 non-withdrawable platform credit for each first qualifying paid referral. **Invited new student:** a separate one-time ₹25 non-withdrawable welcome credit after their own first eligible verified subscription payment. This is not a signup award. A subscription payment must be verified, matured after the refund hold and independently reconciled before a reward can be approved. No automatic settlement or credit redemption during beta.

## Beta commercial scope (decision 29 October 2026)
Beta does not require live checkout or payment collection. **Referral code generation, visible header placement, share links, signup capture and attribution are fully active for every email-verified student without a subscription payment.** The payment boundary applies only to entitlement to a reward, ledger posting, credit redemption and cash payout: no independently verified eligible first subscription payment means no reward. The special founding-tester `JIYA001` code is reserved for the verified existing entitlement, with any already-issued code retained. Other students get stable, server-generated `LS...` codes. Do not invent payment events, award credits on signup, enable cash payout, or turn on checkout. An inviter may see registered invitations and an earned balance of ₹0 during beta. Payment gateway integration and real-payment testing are not beta launch blockers.

## Release gate
Do not merge or deploy solely because a build succeeds. Confirm actual rendered imagery, responsive design, authentication, onboarding, syllabus safety, AI tutor/research behavior, unmetered founding access, **header referral code for every confirmed student, WhatsApp/copy/social sharing, OTP signup attribution with zero reward prior to payment**, guardian consent, privacy disclosures and monitoring. Record each check as passed/failed/blocked with evidence. Payment-dependent features must remain unavailable during beta; never simulate completed payments.
