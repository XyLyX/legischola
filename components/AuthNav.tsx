"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
export default function AuthNav(){
 const router=useRouter();
 const [name,setName]=useState<string|null>(null);
 const [signedIn,setSignedIn]=useState(false);
 const [earnedPaise,setEarnedPaise]=useState(0);
 useEffect(()=>{const client=supabase;if(!client)return;
 let active=true;
 const sync=async()=>{const {data:{user}}=await client.auth.getUser();if(!active)return;setSignedIn(Boolean(user));setName(typeof user?.user_metadata?.full_name==="string"?user.user_metadata.full_name.trim():null);
 if(!user)setEarnedPaise(0);
 if(user){const {data:rewards,error:rewardError}=await client.from("reward_ledger").select("amount_paise,currency,status,reward_kind").eq("beneficiary_user_id",user.id).in("status",["approved","paid"]);if(active)setEarnedPaise(rewardError?0:(rewards||[]).filter(r=>r.currency?.trim()==="INR"&&r.reward_kind==="platform_credit").reduce((n,r)=>n+Number(r.amount_paise||0),0));const {data}=await client.from("student_profiles").select("display_name").eq("user_id",user.id).maybeSingle();if(active&&data?.display_name)setName(data.display_name);}
 };
 void sync();
 const {data:{subscription}}=client.auth.onAuthStateChange(()=>{void sync()});
 return()=>{active=false;subscription.unsubscribe()};
 },[]);
 async function signOut(){if(!supabase)return;await supabase.auth.signOut();setSignedIn(false);setName(null);router.push("/");router.refresh();}
 return <nav className="header-links" aria-label="Main navigation"><Link href="/dashboard">Dashboard</Link><Link href="/tutor">AI Tutor</Link><Link href="/practice-studios">Practice Studios</Link>{signedIn?<><Link href="/rewards" className="reward-header-link" title="View your referral earnings" aria-label={"Referral earnings ₹"+(earnedPaise/100).toFixed(2)}>{new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(earnedPaise/100)}</Link><Link href="/onboarding" className="account-name" title="Edit academic profile">{name||"Complete profile"}</Link><button className="btn btn-secondary" type="button" onClick={signOut}>Sign out</button></>:<Link href="/login" className="btn btn-secondary">Sign up / Sign in</Link>}</nav>;
}