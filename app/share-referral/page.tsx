"use client";
import {useCallback,useEffect,useState} from "react";
import Link from "next/link";
import {supabase} from "../../lib/supabase";
import {referralPolicy} from "../../lib/referral-policy";

type Programme="founding_tester"|"platform_credit";
const money=(value:number)=>new Intl.NumberFormat("en-IN",{
 style:"currency",currency:"INR",maximumFractionDigits:0
}).format(value/100);
export default function ShareReferral(){
 const [code,setCode]=useState("");
 const [programme,setProgramme]=useState<Programme>("platform_credit");
 const [loading,setLoading]=useState(true);
 const [status,setStatus]=useState("");
 const [link,setLink]=useState("");
 const [invites,setInvites]=useState<number|null>(null);
 const load=useCallback(async()=>{
  setLoading(true);setStatus("");
  try{
   if(!supabase)throw Error("Referral service is unavailable.");
   const {data:{session}}=await supabase.auth.getSession();
   if(!session)throw Error("Sign in to create your invitation.");
   const res=await fetch("/api/referral-code",{
    headers:{Authorization:"Bearer "+session.access_token},cache:"no-store"
   });
   const body=await res.json();
   if(!res.ok||!body.code)throw Error(body.error||"Could not load your referral invitation.");
   setCode(body.code);
   setLink(body.shareUrl||"https://legischola.com/invite/"+encodeURIComponent(body.code));
   setProgramme(body.programme==="founding_tester"?"founding_tester":"platform_credit");
   const {count}=await supabase.from("referral_attributions")
    .select("id",{count:"exact",head:true})
    .eq("referrer_user_id",session.user.id);
   setInvites(count??null);
  }catch(e){setStatus(e instanceof Error?e.message:"Referral service unavailable.")}
  finally{setLoading(false)}
 },[]);
 useEffect(()=>{void load()},[load]);
 const reward=programme==="founding_tester"
  ?referralPolicy.foundingReferrerCashPaise
  :referralPolicy.standardReferrerCreditPaise;
 const invitation=code
  ?"I'm studying with LegiSchola — syllabus-based law learning, AI Professor, Cornell notes, practice and revision. Join me using my referral link: "+link+
   "\n\nInvitation code: "+code+
   "\n\nReferral rewards are only available after an eligible verified first subscription payment. No payments or rewards are active during beta."
  :"";
 async function copy(value:string,kind:string){
  try{await navigator.clipboard.writeText(value);setStatus(kind+" copied.")}
  catch{setStatus("Copy is blocked by your browser. Select the link or message and copy it manually.")}
 }
 function openShare(channel:"whatsapp"|"facebook"|"linkedin"|"x"|"email"){
  if(!link)return;
  const text=encodeURIComponent("Join me on LegiSchola using my referral invitation: "+link+" (code "+code+").");
  const shareLink=encodeURIComponent(link);
  const urls={
   whatsapp:"https://wa.me/?text="+text,
   facebook:"https://www.facebook.com/sharer/sharer.php?u="+shareLink,
   linkedin:"https://www.linkedin.com/sharing/share-offsite/?url="+shareLink,
   x:"https://twitter.com/intent/tweet?text="+text,
   email:"mailto:?subject="+encodeURIComponent("LegiSchola invitation")+"&body="+encodeURIComponent(invitation),
  };
  if(channel==="email"){window.location.href=urls.email;return;}
  window.open(urls[channel],"_blank","noopener,noreferrer");
 }
 async function nativeShare(){
  if(!link)return;
  try{
   if(navigator.share)await navigator.share({
    title:"Join me on LegiSchola",
    text:"I'm learning law with LegiSchola. Use invitation code "+code,
    url:link,
   });
   else await copy(invitation,"Invite message");
  }catch(e){
   if(e instanceof Error&&e.name==="AbortError")return;
   setStatus("Sharing was unavailable; use Copy link or one of the social share options.");
  }
 }
 return <main className="shell" style={{maxWidth:850,paddingTop:36,paddingBottom:72}}>
  <div className="eyebrow">LEGISCHOLA · STUDENT INVITATIONS</div>
  <h1>Invite a fellow law student</h1>
  <p>Share your unique code or invitation link with friends. Registration and referral tracking work during beta; rewards require a later verified eligible subscription payment.</p>
  {loading?<p role="status">Preparing your referral invitation…</p>:code?<>
   <section className="card" style={{marginTop:22}}>
    <div className="eyebrow">Your personal referral code</div>
    <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
     <strong style={{fontSize:"clamp(1.5rem,4vw,2.3rem)",letterSpacing:".07em"}}>{code}</strong>
     <button className="btn btn-secondary" type="button" onClick={()=>void copy(code,"Code")}>Copy code</button>
    </div>
    <label htmlFor="personal-referral-link" style={{display:"block",marginTop:22}}>Your invitation link</label>
    <input id="personal-referral-link" type="text" value={link} readOnly
     onFocus={e=>e.currentTarget.select()} style={{width:"100%",padding:12,marginTop:8,border:"1px solid #cbd5e1",borderRadius:10}} />
    <div className="actions" style={{marginTop:14}}>
     <button type="button" className="btn btn-primary" onClick={()=>void copy(link,"Referral link")}>Copy invitation link</button>
     <button type="button" className="btn btn-secondary" onClick={()=>void nativeShare()}>Share invitation</button>
    </div>
    <p role="status" aria-live="polite">{status}</p>
   </section>
   <section className="card" style={{marginTop:20}}>
    <h2>Share with your classmates</h2>
    <div className="actions">
     <button type="button" className="btn btn-secondary" onClick={()=>openShare("whatsapp")}>WhatsApp</button>
     <button type="button" className="btn btn-secondary" onClick={()=>openShare("facebook")}>Facebook</button>
     <button type="button" className="btn btn-secondary" onClick={()=>openShare("linkedin")}>LinkedIn</button>
     <button type="button" className="btn btn-secondary" onClick={()=>openShare("x")}>X</button>
     <button type="button" className="btn btn-secondary" onClick={()=>openShare("email")}>Email</button>
    </div>
    <label htmlFor="referral-message" style={{display:"block",marginTop:20}}>Ready-to-send message</label>
    <textarea id="referral-message" readOnly value={invitation} rows={6}
     style={{width:"100%",padding:14,margin:"8px 0",boxSizing:"border-box"}}/>
    <button className="btn btn-secondary" type="button" onClick={()=>void copy(invitation,"Message")}>Copy message</button>
   </section>
   <section className="card" style={{marginTop:20}}>
    <h2>How your referral is counted</h2>
    <p><strong>{invites===null?"—":invites}</strong> registered invitation{invites===1?"":"s"} attributed to your code.</p>
    <p><strong>{money(reward)} {programme==="founding_tester"?"cash":"non-withdrawable platform credit"}</strong> is the reward per qualifying first paid referral for your programme. The invited student may separately become eligible for a one-time {money(referralPolicy.referredStudentWelcomeCreditPaise)} welcome credit after their own first verified qualifying subscription payment.</p>
    {programme==="founding_tester"&&<p>Founding Tester #001: cash rewards settle monthly only after the approved unpaid amount reaches {money(referralPolicy.foundingCashPayoutThresholdPaise)}. Amounts below the threshold carry forward; when reached, the entire eligible balance is considered for authorised settlement.</p>}
    <p className="muted">An invitation registration does not mean a payment, an earned reward or a payout. No cash or platform credit is issued during the payment-free beta.</p>
    <Link href="/rewards">View my referral earnings and reward history →</Link>
   </section>
  </>:<section className="card" style={{marginTop:22}}>
   <p role="alert">{status||"Your invitation could not be loaded."}</p>
   <p>A confirmed student account is required, but no subscription payment is required to create your referral code.</p>
   <div className="actions"><button className="btn btn-secondary" type="button" onClick={()=>void load()}>Try again</button><Link href="/login" className="btn btn-primary">Sign in or verify email</Link></div>
  </section>}
 </main>;
}
