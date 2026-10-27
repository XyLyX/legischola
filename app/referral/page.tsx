import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refer a Friend | LegiSchola",
  description: "Learn about the LegiSchola founding student referral programme.",
};

export default function ReferralPage() {
  return <main className="shell" style={{paddingTop:52,paddingBottom:80,maxWidth:950}}>
    <div className="eyebrow">LegiSchola · Student community</div>
    <h1 style={{marginBottom:12}}>Study together. Grow together.</h1>
    <p className="muted" style={{fontSize:"1.12rem",maxWidth:720}}>Invite fellow law students to discover syllabus-guided learning, Socratic practice and thoughtful revision with LegiSchola.</p>
    <section className="card" style={{marginTop:28}}>
      <div className="eyebrow">Founding referral programme</div>
      <h2>Referral rewards</h2>
      <p>Our proposed founding-student programme recognises successful paid referrals. The founding tester reward is ₹50 per eligible paid referral, with monthly payout once accrued rewards reach ₹500. Other student referrals are planned to earn ₹25 in platform credits per eligible paid referral.</p>
      <p className="muted" style={{fontSize:14}}>These are planned programme terms, not a live earning offer. Eligibility, tracking, reward issuance and final terms must be activated and published before referrals qualify.</p>
    </section>
    <div className="feature-grid" style={{marginTop:24,marginBottom:24}}>
      <article className="card"><span className="feature-icon">1</span><h3>Join LegiSchola</h3><p className="muted">Set up your student account and academic profile.</p></article>
      <article className="card"><span className="feature-icon">2</span><h3>Invite a classmate</h3><p className="muted">When referral links are enabled, share your unique link with other law students.</p></article>
      <article className="card"><span className="feature-icon">3</span><h3>Earn when eligible</h3><p className="muted">Rewards will be tracked only for qualifying paid referrals under the published terms.</p></article>
    </div>
    <div className="card" style={{background:"var(--teal-soft)"}}>
      <h2 style={{marginTop:0}}>Referral links are coming soon</h2>
      <p>We're preparing secure referral attribution and a student rewards dashboard. You can join LegiSchola now; no referral reward is recorded until the programme launches.</p>
      <div className="actions"><Link className="btn btn-primary" href="/onboarding">Join LegiSchola →</Link><Link className="btn btn-secondary" href="/">Back to home</Link></div>
    </div>
  </main>;
}
