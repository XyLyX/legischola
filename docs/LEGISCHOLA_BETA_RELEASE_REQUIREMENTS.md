# LegiSchola beta — consolidated release requirements

Status: agreed requirements; implementation and release verification remain separate. Updated 29 October 2026.

## Original generated artwork
Use the six previously generated and reviewed images from the LegiSchola beta rendered assets staging archive, **not** SVG placeholders or temporary gradient panels. Intended placements: hero-book-pillar.webp (homepage hero); one-student-one-ai-tutor.webp (AI Tutor feature); brand-book-pillar-logo.webp (brand/About); dashboard-background.webp (subtle dashboard); institutional-network.webp (About/institutional partnerships); legal-reasoning-tree.webp (reasoning/exams). Do not mark imagery complete until the actual files are in the repository and visible in a successful deploy preview.

## Recovered decisions and release checks

| Area | Agreed decision | Release verification |
|---|---|---|
| Jiya's account | Lifetime complimentary access, all features, no individual AI caps | Entitlement configured; account activation and authenticated testing outstanding |
| Referral eligibility | Jiya participates without purchasing a subscription | Founding-tester referral issuance after verified account; test |
| Ordinary subscribers | After verified payment, referral code shown in header; click opens shareable, copyable invitation | Payment event verification and header/share journey must pass |
| Referral rewards | Referred student receives a one-time ₹25 non-cash credit following eligible verified payment | Award, deduplication, refund reversal and redemption must be tested |
| Annual subscription | Twelve months access for the price of ten | Confirm public pricing and actual billing configuration before checkout |
| University onboarding | Institution, programme, admission batch, semester; request missing institution | Test complete signup/onboarding flow |
| Academic accuracy | DME BA LL.B. Semester 1 pilot; do not claim unverified 2026 syllabus is official | Official curriculum verification gate |
| Guardian reporting | Explicit student consent and guardian confirmation; never default access | Test consent, revocation and report delivery |
| Founder identity | Publicly Navvin S Bhalla — Founder | Do not expose private address or proprietor/business-structure details unless legally required |
| Beta monitoring | Reliability, usage, AI cost, learning engagement; no private prompts or answers | Test event logging, permissions and consent |

## Referral reward distinction requiring resolution
An earlier blueprint proposed ₹50 cash per qualified referral for Jiya with a ₹500 monthly payout threshold. Later discussions clarified that no reward is granted merely for founding-tester status. These are not necessarily contradictory: preserve Jiya's eligibility and require a qualifying paid referral. **Do not enable cash payout or publish a definitive cash-reward promise until the policy, payout compliance and implementation are confirmed.**

## Release gate
Do not merge or deploy solely because a build succeeds. Confirm actual rendered imagery, responsive design, authentication, onboarding, syllabus safety, AI tutor/research behavior, unmetered founding access, referral payment integrity, guardian consent, privacy disclosures and monitoring. Record each check as passed/failed/blocked with evidence. Payment-dependent features may remain clearly marked unavailable during beta; never simulate completed payments.
