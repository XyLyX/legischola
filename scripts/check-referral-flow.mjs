// Beta referral release checks: executable reward-policy tests + mandatory
// source-level guards. These complement but do not replace authenticated E2E.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const read=p=>fs.readFileSync(new URL("../"+p,import.meta.url),"utf8");
const policySource=read("lib/referral-policy.ts");
const transpiled=ts.transpileModule(policySource,{compilerOptions:{
 module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022
}}).outputText;
const exportsObj={};
vm.runInNewContext(transpiled,{exports:exportsObj}, {timeout:2000});
const policy=exportsObj.referralPolicy;
assert.equal(policy.foundingReferrerCashPaise,5000);
assert.equal(policy.standardReferrerCreditPaise,2500);
assert.equal(policy.referredStudentWelcomeCreditPaise,2500);
assert.equal(policy.foundingCashPayoutThresholdPaise,50000);
assert.equal(exportsObj.eligibleMonthlyCashPayoutPaise(0),0);
assert.equal(exportsObj.eligibleMonthlyCashPayoutPaise(49999),0);
assert.equal(exportsObj.eligibleMonthlyCashPayoutPaise(50000),50000);
assert.equal(exportsObj.eligibleMonthlyCashPayoutPaise(72500),72500);
assert.throws(()=>exportsObj.eligibleMonthlyCashPayoutPaise(-1));
assert.throws(()=>exportsObj.eligibleMonthlyCashPayoutPaise(12.75));
assert.equal(exportsObj.isReferralCode("JIYA001"),true);
assert.equal(exportsObj.isReferralCode("LS"+("A".repeat(14))),true);
assert.equal(exportsObj.isReferralCode("JIYA002"),false);
assert.equal(exportsObj.isReferralCode("LS123"),false);
assert.equal(exportsObj.referralLink("JIYA001"),
 "https://legischola.com/invite/JIYA001");
const code=read("app/api/referral-code/route.ts");
const claim=read("app/api/referral-claim/route.ts");
const header=read("components/AuthNav.tsx");
const onboarding=read("app/onboarding/page.tsx");
const login=read("app/login/page.tsx");
const share=read("app/share-referral/page.tsx");
const rewards=read("app/rewards/page.tsx");
const invitation=read("app/invite/[code]/page.tsx");
const redirect=read("app/invite/[code]/InvitationRedirect.tsx");
const oldCode=read("netlify/functions/referral-code.mjs");
const oldClaim=read("netlify/functions/referral-claim.mjs");
const webhook=read("netlify/functions/razorpay-webhook.mjs");
const migration=read("supabase/migrations/20261029_referral_rewards_multi_party_idempotency.sql");
assert.match(code,/email_confirmed_at/,"Code must require confirmed email");
assert.match(code,/hasFoundingTesterAccess/,"Founder status must be server-verified");
assert.match(code,/foundingTesterCode/,"Founding tester gets dedicated code");
assert.match(code,/crypto|randomBytes/,"Ordinary student gets random code");
assert.match(code,/from\("referral_codes"\)/);
assert(!code.includes('from("payment_events")'),
 "Code issuance MUST NOT require a payment");
assert(!code.includes('from("reward_ledger")'),
 "Code issuance MUST NOT create a reward");
assert.match(claim,/email_confirmed_at/);
assert.match(claim,/ref\.owner_user_id===user\.id/,"Reject self referral");
assert.match(claim,/referred_user_id.*user\.id/,"One attribution per student");
assert.match(claim,/eq\("referred_user_id",user\.id\)/,"Avoid overwriting attribution");
assert(!claim.includes('from("reward_ledger")'),
 "Signup attribution MUST NOT create a reward");
assert(!claim.includes('from("payment_events")'),
 "Signup attribution MUST NOT depend on payment");
assert.match(header,/signedIn\?<></);
assert.match(header,/<Link href="\/share-referral" className="header-referral-link"/,
 "Refer & Earn must remain visible, even without a generated code");
assert.match(header,/<Link href="\/rewards" className="reward-header-link"/);
assert.match(header,/r\.reward_kind===rewardKind/,"Founder cash and ordinary credit totals must be distinct");
assert.match(onboarding,/sessionStorage\.getItem\("legischola_referral"\)/);
assert.match(onboarding,/fetch\("\/api\/referral-claim"/);
assert.match(onboarding,/referralStatus/);
assert.match(login,/emailRedirectTo:window\.location\.origin\+"\/onboarding"/);
assert.match(login,/sessionStorage\.setItem\("legischola_referral"/);
assert.match(share,/openShare\("whatsapp"\)/);
assert.match(share,/openShare\("facebook"\)/);
assert.match(share,/openShare\("linkedin"\)/);
assert.match(share,/openShare\("x"\)/);
assert.match(share,/openShare\("email"\)/);
assert.match(share,/navigator\.share/);
assert.match(share,/navigator\.clipboard\.writeText/);
assert.match(rewards,/eligibleMonthlyCashPayoutPaise/);
assert.match(rewards,/referred_welcome/);
assert.match(invitation,/generateMetadata/);
assert.match(invitation,/openGraph:/);
assert.match(redirect,/window\.location\.replace\(href\)/);
assert.match(oldCode,/\/api\/referral-code/);
assert.match(oldClaim,/\/api\/referral-claim/);
assert.match(webhook,/createHmac/,"Provider events must verify their signatures");
assert(!webhook.includes('from("reward_ledger")'),
 "Unreconciled provider events MUST NOT award credits");
assert.match(migration,/drop index if exists public\.referral_one_reward_per_referred/);
assert.match(migration,/drop index if exists public\.reward_one_per_payment/);
assert.match(migration,/reward_unique_attribution_programme/);
assert.match(migration,/reward_unique_payment_recipient_programme/);
console.log("LegiSchola referral policy arithmetic, header/share, attribution and payment-gating checks passed.");
