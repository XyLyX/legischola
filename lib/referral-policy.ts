/**
 * LegiSchola referral programme. Integer paise only.
 *
 * A referral code and registered attribution NEVER trigger a reward.
 * The future payment-reconciliation service must independently confirm the
 * referred student's FIRST eligible successful subscription payment and
 * observe refund/chargeback holds before writing any reward ledger row.
 * No payment gateway, credit issuance or payout is enabled by this module.
 */
export const referralPolicy = {
  currency: "INR",
  foundingTesterCode: "JIYA001",
  foundingReferrerCashPaise: 5000, // ₹50 per unique qualifying paid referral
  standardReferrerCreditPaise: 2500, // ₹25 non-withdrawable credit
  referredStudentWelcomeCreditPaise: 2500, // ₹25, only after their first eligible paid subscription
  foundingCashPayoutThresholdPaise: 50000, // ₹500 approved unpaid, monthly
  claimWindowDays: 30,
  maxInviteCodeLength: 32,
} as const;

export type ReferralProgramme = "founding_tester" | "platform_credit";

export function isReferralCode(code: string): boolean {
  return /^(?:JIYA001|LS[A-F0-9]{14})$/.test(code);
}

export function referralLink(code: string): string {
  return "https://legischola.com/login?ref=" + encodeURIComponent(code);
}

export function eligibleMonthlyCashPayoutPaise(approvedUnpaidCashPaise: number): number {
  if (!Number.isSafeInteger(approvedUnpaidCashPaise) || approvedUnpaidCashPaise < 0) {
    throw new Error("Expected non-negative integer paise");
  }
  // Release FULL carried-forward balance once approved earnings reach ₹500.
  return approvedUnpaidCashPaise >= referralPolicy.foundingCashPayoutThresholdPaise
    ? approvedUnpaidCashPaise
    : 0;
}
