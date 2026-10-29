"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {supabase} from "../lib/supabase";

const money=(paise:number)=>new Intl.NumberFormat("en-IN",{
 style:"currency",currency:"INR",maximumFractionDigits:2
}).format(paise/100);
type Programme="founding_tester"|"platform_credit";

export default function AuthNav(){
 const router=useRouter();
 const [name,setName]=useState<string|null>(null);
 const [signedIn,setSignedIn]=useState(false);
 const [adminAccess,setAdminAccess]=useState(false);
 const [earnedPaise,setEarnedPaise]=useState(0);
 const [referralCode,setReferralCode]=useState<string|null>(null);
 const [programme,setProgramme]=useState<Programme>("platform_credit");
 useEffect(()=>{
  const client=supabase;
  if(!client)return;
  let active=true;
  const sync=async()=>{
   const {data:{user}}=await client.auth.getUser();
   if(!active)return;
   setSignedIn(Boolean(user));
   setName(typeof user?.user_metadata?.full_name==="string"?
    user.user_metadata.full_name.trim():null);
   if(!user){
    setEarnedPaise(0);setReferralCode(null);setProgramme("platform_credit");setAdminAccess(false);
    return;
   }
   const {data:{session}}=await client.auth.getSession();
   let kind:Programme="platform_credit";
   if(session){
    // Never use editable client metadata to reveal administration.
    try{const access=await fetch("/api/admin/access",{headers:{Authorization:"Bearer "+session.access_token},cache:"no-store"});if(active)setAdminAccess(access.ok);}catch{if(active)setAdminAccess(false)}
    try{
     const res=await fetch("/api/referral-code",{
      headers:{Authorization:"Bearer "+session.access_token},cache:"no-store"
     });
     const body=await res.json();
     if(!active)return;
     setReferralCode(res.ok&&typeof body.code==="string"?body.code:null);
     kind=res.ok&&body.programme==="founding_tester"?
      "founding_tester":"platform_credit";
     setProgramme(kind);
    }catch{
     if(active)setReferralCode(null);
    }
   }
   const {data:rewards,error:rewardError}=await client.from("reward_ledger")
    .select("amount_paise,currency,status,reward_kind")
    .eq("beneficiary_user_id",user.id).in("status",["approved","paid"]);
   if(active){
    const rewardKind=kind==="founding_tester"?"cash":"platform_credit";
    setEarnedPaise(rewardError?0:(rewards||[])
     .filter(r=>r.currency?.trim()==="INR"&&r.reward_kind===rewardKind)
     .reduce((sum,r)=>sum+Number(r.amount_paise||0),0));
   }
   const {data}=await client.from("student_profiles")
    .select("display_name").eq("user_id",user.id).maybeSingle();
   if(active&&data?.display_name)setName(data.display_name);
  };
  void sync();
  const {data:{subscription}}=client.auth.onAuthStateChange(()=>{
   // Defer network calls until the Supabase auth callback has completed.
   queueMicrotask(()=>{if(active)void sync();});
  });
  return()=>{active=false;subscription.unsubscribe()};
 },[]);
 async function signOut(){
  if(!supabase)return;
  await supabase.auth.signOut();
  setSignedIn(false);setName(null);setReferralCode(null);setEarnedPaise(0);setAdminAccess(false);
  router.push("/");router.refresh();
 }
 return <nav className="header-links" aria-label="Main navigation">
  <Link href="/dashboard">Dashboard</Link>
  <Link href="/tutor">AI Tutor</Link>
  <Link href="/practice-studios">Practice Studios</Link>
  <Link href="/revision">Revision</Link>
  {signedIn?<>
   <Link href="/share-referral" className="header-referral-link"
    title={referralCode?"Share your LegiSchola referral code "+referralCode:"Create and share your referral invitation"}>
    <span>Refer &amp; Earn</span>
    {referralCode&&<span className="header-referral-code"> · {referralCode}</span>}
   </Link>
   <Link href="/rewards" className="reward-header-link"
    title={programme==="founding_tester"?"Founding tester referral cash earned":"Your earned referral platform credits"}
    aria-label={(programme==="founding_tester"?"Referral cash earned ":"Referral credits earned ")+money(earnedPaise)}>
    {money(earnedPaise)}
   </Link>
   {adminAccess&&<Link href="/admin" className="btn btn-secondary" title="Restricted founder operations">Admin</Link>}
   <Link href="/onboarding" className="account-name" title="Edit academic profile">{name||"Complete profile"}</Link>
   <button className="btn btn-secondary" type="button" onClick={signOut}>Sign out</button>
  </>:<Link href="/login" className="btn btn-secondary">Sign up / Sign in</Link>}
 </nav>;
}
