import Link from "next/link";
import {publicPageMetadata} from "../../lib/site-metadata";
import {referralPolicy} from "../../lib/referral-policy";

export const metadata = publicPageMetadata(
 "Refer a Friend",
 "Get your unique LegiSchola invitation code, share it with classmates and learn how future referral rewards work.",
 "/referral"
);
export default function ReferralPage(){
 return <main className="shell" style={{paddingTop:44,paddingBottom:80,maxWidth:930}}>
  <div className="eyebrow">LEGISCHOLA · STUDENT COMMUNITY</div>
  <h1>Study together. Grow together.</h1>
  <p className="muted" style={{fontSize:"1.1rem"}}>Invite your classmates to discover syllabus-guided law study, an AI Professor, Cornell notes, mock exams and adaptive revision.</p>
  <section className="card" style={{marginTop:22}}>
   <h2>Get and share your code — even during beta</h2>
   <p>Every verified LegiSchola student can get a unique referral code. Open <strong>Refer &amp; Earn</strong> in the header, copy your invitation link, or send it using WhatsApp, Facebook, LinkedIn, X or email. The link opens signup with your code already filled in.</p>
   <div className="actions"><Link className="btn btn-primary" href="/share-referral">Get my invitation link →</Link><Link className="btn btn-secondary" href="/rewards">My referral earnings</Link></div>
  </section>
  <section className="card" style={{marginTop:20}}>
   <h2>Who receives what?</h2>
   <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",textAlign:"left"}}>
    <thead><tr><th style={{padding:12}}>Student</th><th style={{padding:12}}>Reward after first qualifying paid referral</th></tr></thead>
    <tbody>
     <tr><td style={{padding:12,borderTop:"1px solid #ddd"}}>Ordinary referring student</td><td style={{padding:12,borderTop:"1px solid #ddd"}}>₹{referralPolicy.standardReferrerCreditPaise/100} non-withdrawable LegiSchola platform credit</td></tr>
     <tr><td style={{padding:12,borderTop:"1px solid #ddd"}}>New student who registers using a code</td><td style={{padding:12,borderTop:"1px solid #ddd"}}>Separate, one-time ₹{referralPolicy.referredStudentWelcomeCreditPaise/100} platform welcome credit following their own qualifying first paid subscription</td></tr>
     <tr><td style={{padding:12,borderTop:"1px solid #ddd"}}>Jiya — Founding Tester #001</td><td style={{padding:12,borderTop:"1px solid #ddd"}}>₹{referralPolicy.foundingReferrerCashPaise/100} cash per qualifying first paid referral under her individual founding policy</td></tr>
    </tbody></table></div>
   <p>Jiya's approved unpaid cash commissions are reviewed monthly once they reach ₹{referralPolicy.foundingCashPayoutThresholdPaise/100}. Smaller balances carry forward; reaching the threshold makes the entire approved unpaid balance eligible for authorised settlement.</p>
  </section>
  <section className="card" style={{marginTop:20}}>
   <h2>How invitations are recorded</h2>
   <ol>
    <li>Verify your email and get your code. No payment is needed to share it.</li>
    <li>Send the personal link. The new student sees your code during signup.</li>
    <li>After email confirmation, LegiSchola records the unique first referral against the new account and prevents self-referrals and duplicate attribution.</li>
    <li>Any reward is considered only after the invited student's first independently verified qualifying subscription payment, applicable refund checks and approval. Not for signup, renewal or unverified payments.</li>
   </ol>
   <p className="muted"><strong>Beta status:</strong> Subscription checkout, credit redemption and cash payouts are not enabled. Invitation links, code capture and referral attribution work without them. Neither a registered invitation nor a displayed ₹0 balance means that a payment has occurred.</p>
  </section>
 </main>;
}
