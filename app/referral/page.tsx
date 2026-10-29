import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refer a Friend | LegiSchola",
  description: "Learn how LegiSchola referral credits work.",
};

export default function ReferralPage() {
  return <main className="shell" style={{paddingTop:52,paddingBottom:80,maxWidth:950}}>
    <div className="eyebrow">LegiSchola · Student community</div>
    <h1 style={{marginBottom:12}}>Study together. Grow together.</h1>
    <p className="muted" style={{fontSize:"1.12rem",maxWidth:720}}>Invite fellow law students to discover syllabus-guided learning, Socratic practice and thoughtful revision with LegiSchola.</p>
    <section className="card" style={{marginTop:28}}>
      <div className="eyebrow">Student referral programme</div>
      <h2>Referral rewards</h2>
      <p>Students can refer classmates using their unique referral codes. After a qualifying new student completes their first verified subscription payment, the referrer (not the new subscriber) is eligible for ₹25 in non-cash cashback credits. Founding Tester #001 has a separate agreement: ₹50 in cash for each qualifying paid referral, settled monthly when approved unpaid earnings reach at least ₹500; smaller balances roll forward. These rewards are not earned or payable while beta checkout is disabled.</p>
      <p className="muted" style={{fontSize:14}}>Referral code capture is being introduced. Automatic credit issuance and redemption will activate only after payment verification is connected and tested. No credits are awarded for signup alone.</p>
    </section>
    <div className="feature-grid" style={{marginTop:24,marginBottom:24}}>
      <article className="card"><span className="feature-icon">1</span><h3>Join LegiSchola</h3><p className="muted">Set up your student account and academic profile.</p></article>
      <article className="card"><span className="feature-icon">2</span><h3>Invite a classmate</h3><p className="muted">Share your unique referral code or link with a new student.</p></article>
      <article className="card"><span className="feature-icon">3</span><h3>Receive a credit after payment</h3><p className="muted">The referring student becomes eligible for ₹25 cashback credit once the new student's qualifying payment is verified. Founding Tester #001 follows the separate approved cash policy.</p></article>
    </div>
    <div className="card" style={{background:"var(--teal-soft)"}}>
      <h2 style={{marginTop:0}}>Referral tracking and rewards</h2>
      <p>Student codes and signup attribution are being rolled out. Credit or cash rewards require independently verified qualifying payments and are disabled while beta checkout is excluded. Referral attribution alone does not earn a reward.</p>
      <div className="actions"><Link className="btn btn-primary" href="/onboarding">Join LegiSchola →</Link><Link className="btn btn-secondary" href="/">Back to home</Link></div>
    </div>
  </main>;
}
