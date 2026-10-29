"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {supabase} from "../../lib/supabase";
import {eligibleMonthlyCashPayoutPaise,referralPolicy,referralLink} from "../../lib/referral-policy";

type Reward={
 id:string;amount_paise:number;currency:string;
 reward_kind:"cash"|"platform_credit";
 reward_programme:"founder_cash"|"standard_referrer"|"referred_welcome"|null;
 status:"pending"|"approved"|"paid"|"reversed";created_at:string;
};
type Programme="founding_tester"|"platform_credit";
const money=(p:number)=>new Intl.NumberFormat("en-IN",{
 style:"currency",currency:"INR",maximumFractionDigits:2
}).format(p/100);
const labels:Record<string,string>={
 founder_cash:"Founding referral cash",
 standard_referrer:"Referring-student credit",
 referred_welcome:"New-student welcome credit",
};
export default function RewardsPage(){
 const [rows,setRows]=useState<Reward[]>([]);
 const [loading,setLoading]=useState(true);
 const [signedIn,setSignedIn]=useState(false);
 const [error,setError]=useState("");
 const [code,setCode]=useState("");
 const [codeStatus,setCodeStatus]=useState("");
 const [programme,setProgramme]=useState<Programme>("platform_credit");
 const [referrals,setReferrals]=useState<number|null>(null);
 useEffect(()=>{
  let active=true;
  async function load(){
   if(!supabase){setError("Rewards service is unavailable.");setLoading(false);return}
   const {data:{user}}=await supabase.auth.getUser();
   if(!active)return;
   if(!user){setLoading(false);return;}
   setSignedIn(true);
   const [ledger,claims,sessionResult]=await Promise.all([
    supabase.from("reward_ledger")
     .select("id,amount_paise,currency,reward_kind,reward_programme,status,created_at")
     .eq("beneficiary_user_id",user.id).order("created_at",{ascending:false}).limit(200),
    supabase.from("referral_attributions")
     .select("id",{head:true,count:"exact"}).eq("referrer_user_id",user.id),
    supabase.auth.getSession(),
   ]);
   if(!active)return;
   if(ledger.error)setError("Unable to load your rewards. Please try again.");
   else setRows((ledger.data||[]) as Reward[]);
   setReferrals(claims.error?null:claims.count);
   const session=sessionResult.data.session;
   if(session){
    try{
     const res=await fetch("/api/referral-code",{
      headers:{Authorization:"Bearer "+session.access_token},cache:"no-store"
     });
     const body=await res.json();
     if(active){
      if(res.ok&&body.code){
       setCode(body.code);
       setProgramme(body.programme==="founding_tester"?"founding_tester":"platform_credit");
      }else setCodeStatus(body.error||"Your referral invitation is not available yet.");
     }
    }catch{if(active)setCodeStatus("Could not retrieve your referral code. Try the sharing page.")}
   }
   if(active)setLoading(false);
  }
  void load();
  return()=>{active=false};
 },[]);
 const sum=(kind:"cash"|"platform_credit",statuses:string[])=>
  rows.filter(r=>r.reward_kind===kind&&r.currency.trim()==="INR"&&statuses.includes(r.status))
   .reduce((n,r)=>n+Number(r.amount_paise||0),0);
 const cash=programme==="founding_tester";
 const kind=cash?"cash":"platform_credit";
 const approved=sum(kind,["approved"]);
 const pending=sum(kind,["pending"]);
 const settled=sum(kind,["paid"]);
 const earned=approved+settled;
 const payout=cash?eligibleMonthlyCashPayoutPaise(Math.max(0,approved)):0;
 return <main className="shell" style={{maxWidth:980,paddingTop:36,paddingBottom:76}}>
  <div className="eyebrow">LEGISCHOLA · REFERRALS</div>
  <h1>Your referral programme</h1>
  <p className="muted">Invite classmates during public beta. Tracking starts with a registered invitation; any credit or cash reward requires a qualifying verified first subscription payment, and cash payout requires a separate authorised settlement.</p>
  {loading?<p role="status">Loading referral details…</p>
  :!signedIn?<section className="card"><p>Sign in to access your referral invitation and private reward statement.</p><Link className="btn btn-primary" href="/login">Sign in</Link></section>
  :error?<p role="alert">{error}</p>:<>
   <section className="card" style={{marginTop:20,marginBottom:20}}>
    <div className="eyebrow">Your invitation</div>
    {code?<><h2 style={{fontSize:30,letterSpacing:".04em"}}>{code}</h2>
      <p className="muted">Your unique link: <code style={{wordBreak:"break-all"}}>{referralLink(code)}</code></p>
      <div className="actions">
       <Link className="btn btn-primary" href="/share-referral">Copy &amp; share with friends</Link>
       <button type="button" className="btn btn-secondary" onClick={async()=>{try{await navigator.clipboard.writeText(referralLink(code));setCodeStatus("Referral link copied.")}catch{setCodeStatus("Use the sharing page to copy your link.")}}}>Copy link</button>
      </div></>
    :<><p>{codeStatus||"Confirm your email to create your unique code."}</p><Link className="btn btn-primary" href="/share-referral">Get my invitation code</Link></>}
    <p role="status">{codeStatus}</p>
    <p><strong>{referrals===null?"—":referrals}</strong> registered invitation{referrals===1?"":"s"} tracked so far.</p>
   </section>
   <section className="feature-grid" style={{marginBottom:24}}>
    <div className="card"><div className="eyebrow">{cash?"Cash earned":"Credits earned"}</div>
     <h2 style={{fontSize:30}}>{money(earned)}</h2><p className="muted">Approved and settled, excluding reversed entries</p></div>
    <div className="card"><div className="eyebrow">{cash?"Approved unpaid":"Available credits"}</div>
     <h2 style={{fontSize:30}}>{money(approved)}</h2><p className="muted">{cash?"Eligible toward a future authorised monthly payout":"Not withdrawable or transferable"}</p></div>
    <div className="card"><div className="eyebrow">Pending / under review</div>
     <h2 style={{fontSize:30}}>{money(pending)}</h2><p className="muted">Not earned until approved</p></div>
   </section>
   <section className="card" style={{marginBottom:20}}>
    <h2>{cash?"Founding Tester #001 — referral cash":"Student referral credits"}</h2>
    <p><strong>{money(cash?referralPolicy.foundingReferrerCashPaise:referralPolicy.standardReferrerCreditPaise)}</strong> {cash?"cash":"non-withdrawable credit"} per eligible first paid referral. The referred new student may also receive a separate one-time <strong>{money(referralPolicy.referredStudentWelcomeCreditPaise)}</strong> welcome platform credit after their own first verified eligible subscription payment.</p>
    {cash&&<><p>Founding cash is reviewed monthly. The threshold is <strong>{money(referralPolicy.foundingCashPayoutThresholdPaise)}</strong> of approved unpaid earnings. Smaller amounts carry forward without forfeiture. When reached, the <em>entire eligible balance</em> is prepared for review, not just ₹500.</p>
     <p><strong>Eligible for a payout review now: {money(payout)}.</strong> Finance authorisation and payout verification are required before any settlement. No automated payouts are enabled in beta.</p></>}
    {!cash&&<p>Platform credits are for eligible future LegiSchola subscription charges; they cannot be withdrawn or transferred. No redemption is possible until payments and credit redemption are enabled.</p>}
    <p className="muted">No first verified qualifying payment means no reward entry. Sharing a code or signing up alone never creates a cash or credit reward. Beta checkout remains disabled.</p>
   </section>
   <section className="card">
    <h2>Reward statement</h2>
    {rows.length===0?<p className="muted">No paid-conversion rewards have been recorded yet. This is expected during the payment-free beta.</p>
    :<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",textAlign:"left"}}>
     <thead><tr><th style={{padding:10}}>Date</th><th style={{padding:10}}>Programme</th><th style={{padding:10}}>Status</th><th style={{padding:10,textAlign:"right"}}>Amount</th></tr></thead>
     <tbody>{rows.map(r=><tr key={r.id} style={{borderTop:"1px solid var(--line)"}}>
      <td style={{padding:10}}>{new Date(r.created_at).toLocaleDateString("en-IN")}</td>
      <td style={{padding:10}}>{labels[r.reward_programme||""]|| (r.reward_kind==="cash"?"Founding cash":"Platform credit")}</td>
      <td style={{padding:10,textTransform:"capitalize"}}>{r.status}</td>
      <td style={{padding:10,textAlign:"right"}}>{money(Number(r.amount_paise))}</td>
     </tr>)}</tbody></table></div>}
   </section>
   <p style={{marginTop:22}}><Link href="/referral">Referral policy and explanation →</Link></p>
  </>}
 </main>;
}
