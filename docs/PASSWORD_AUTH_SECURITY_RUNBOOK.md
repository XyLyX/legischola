# LegiSchola password and founder security — production access contract

## Purpose
All students, including founding testers, and the verified Founder/Admin account can use **email + password** for normal sign-in. Existing magic-link users keep access. They can add a password to their **existing** account at `/account/security` without creating a second identity.

## Implemented endpoints and pages
- `/login`: default new-account email/password signup; existing-user password sign-in; optional email sign-in link for existing email-link/OTP accounts. Signup includes required full name, password confirmation, email verification and optional referral code.
- `/account/security`: an email-verified, currently authenticated user sets or changes their account password with `supabase.auth.updateUser({password})`. Optional email challenge via `auth.reauthenticate()` plus `nonce` if the provider requires recent verification.
- `/account/forgot-password`: send a neutral recovery email with `supabase.auth.resetPasswordForEmail()`; never reveal whether an email is registered.
- `/account/reset-password`: browser handles time-limited Supabase recovery session; set password and sign out to require fresh password sign-in. `AuthNav` redirects a `PASSWORD_RECOVERY` event arriving at the site URL to this page if the redirect allowlist falls back to root.
- Signed-in header: **Security** link for password management.

## Password security and non-goals
- The password is sent exclusively from the browser to **Supabase Auth**, over HTTPS, via Supabase client. No application table, server route, referral ledger or admin database ever stores or logs the plaintext password. Supabase Auth provides server-managed salted password hash and verification.
- UI minimum: 12 characters, maximum 72 UTF-8 bytes (avoid bcrypt truncation), confirmation required. Existing password sign-in intentionally does not retrospectively reject older credentials based on the new-password strength rule. Further strength and leaked-password settings belong to the managed Supabase Auth provider.
- No one (including administrators) can view another student's password in LegiSchola. Administrators cannot set someone else's password through a public application panel.
- No existing account is overwritten, migrated or re-created; no user-facing temporary passwords are generated.
- Email-link sign-in remains available to maintain access for beta users who originally registered without a password. Do not interpret the availability of password sign-in as MFA.
- Founder routes continue to require fresh server-verified `user.app_metadata.legischola_role === "founder"` and email confirmation. A password alone never grants administrative authority.
- Existing invitation codes remain in `sessionStorage` across email confirmation and remain attributed only after a qualifying verified signup. Password signup also redirects to `/onboarding?ref=CODE` where applicable. Payments remain disabled in beta.

## Supabase Auth configuration (operator review)
1. Ensure **Email** provider is enabled, email/password signup works, and **Confirm email** is enabled in Authentication → Providers.
2. Site URL: `https://legischola.com`. In Authentication → URL Configuration, permit `https://legischola.com/onboarding` and `https://legischola.com/account/reset-password` (plus approved preview URLs if deliberately tested). The app includes a Site URL recovery fallback for legacy settings.
3. In Authentication → Providers → Email, align the managed **minimum password length ≥12**, require recently authenticated users to reauthenticate for password changes, and enable leaked-password protection if the current Supabase plan supports it.
4. The Supabase security advisor previously reported **Leaked Password Protection Disabled**. The Auth-provider setting must be enabled by the operator where supported; the browser cannot reliably claim server-side enforcement.
5. Restrict authorized redirect origins; keep password-reset templates clearly branded, avoid logging tokens and disable anonymous-admin access. Optional MFA for founders is a future security enhancement rather than a property of password sign-in.

## Release validation
- `scripts/check-password-auth.mjs`: password policy arithmetic, signup/signin, legacy OTP, account security, reset, header recovery route and privacy.
- GitHub release gate: lint, TypeScript, Next build and HTTP smoke tests.
- After deployment, founder signs in as `admin@legischola.com`, opens `/account/security`, creates password, **signs out** and signs in using email/password; opens `/admin`. Verify separate student password signup with a consented test student and confirmation email. Confirm reset link reaches the dedicated recovery page or the Site URL recovery fallback.
- A frontend compile/smoke pass does not constitute a tested real-password login, email recovery delivery, or backend password policy configuration. Never insert test passwords into chat, GitHub, logs or SQL.
