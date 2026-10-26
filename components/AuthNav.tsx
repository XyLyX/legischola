"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
export default function AuthNav(){
 const router=useRouter();
 const [name,setName]=useState<string|null>(null);
 const [signedIn,setSignedIn]=useState(false);
 useEffect(()=>{if(!supabase)return;
 let active=true;
 const sync=async()=>{const {data:{user}}=await supabase.auth.getUser();if(!active)return;setSignedIn(Boolean(user));setName(typeof user?.user_metadata?.full_name==="string"?user.user_metadata.full_name.trim():null);
 if(user){const {data}=await supabase.from("student_profiles").select("display_name").eq("user_id",user.id).maybeSingle();if(active&&data?.display_name)setName(data.display_name);}
 };
 void sync();
 const {data:{subscription}}=supabase.auth.onAuthStateChange(()=>{void sync()});
 return()=>{active=false;subscription.unsubscribe()};
 },[]);
 async function signOut(){if(!supabase)return;await supabase.auth.signOut();setSignedIn(false);setName(null);router.push("/");router.refresh();}
 return <nav className="header-links" aria-label="Main navigation"><Link href="/dashboard">Dashboard</Link><Link href="/tutor">AI Tutor</Link>{signedIn?<><Link href="/onboarding" className="account-name" title="Edit academic profile">{name||"Complete profile"}</Link><button className="btn btn-secondary" type="button" onClick={signOut}>Sign out</button></>:<Link href="/login" className="btn btn-secondary">Sign up / Sign in</Link>}</nav>;
}