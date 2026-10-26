"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
export default function Login(){
 const [mode,setMode]=useState<"signup"|"signin">("signup"),[fullName,setFullName]=useState(""),[email,setEmail]=useState(""),[message,setMessage]=useState(""),[loading,setLoading]=useState(false);
 async function submit(e:React.FormEvent){e.preventDefault();if(!supabase){setMessage("Authentication is not configured yet.");return;}
 const name=fullName.trim().replace(/\s+/g," ");if(mode==="signup"&&name.length<3){setMessage("Enter your full name as shown on your student ID card.");return;}
 setLoading(true);setMessage("");
 const {error}=await supabase.auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:window.location.origin+"/onboarding",shouldCreateUser:mode==="signup",...(mode==="signup"?{data:{full_name:name}}:{})}});
 setMessage(error?.message??"Check your email for your secure confirmation link. Once confirmed, complete your academic profile.");setLoading(false);
 }
 return <main className="form-shell"><div className="eyebrow">Your legal education begins here</div><h1 style={{fontSize:"2.5rem"}}>{mode==="signup"?"Create your student account":"Welcome back"}</h1><p className="muted">{mode==="signup"?"Enter your name exactly as it appears on your student ID card. We will email you a confirmation link.":"Sign in with your registered email address."}</p><div className="studio-actions"><button type="button" aria-pressed={mode==="signup"} onClick={()=>{setMode("signup");setMessage("")}}>New student · Sign up</button><button type="button" aria-pressed={mode==="signin"} onClick={()=>{setMode("signin");setMessage("")}}>Already registered · Sign in</button></div>
 <form onSubmit={submit}>{mode==="signup"&&<label htmlFor="legal-name">Full name (as on student ID card)<input id="legal-name" required minLength={3} maxLength={120} autoComplete="name" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Your full name"/></label>}<label htmlFor="student-email">Email address<input id="student-email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><div className="actions"><button className="btn btn-primary" disabled={loading} type="submit">{loading?"Sending…":mode==="signup"?"Send confirmation link":"Send sign-in link"}</button></div></form><p role="status" aria-live="polite">{message}</p><p className="muted" style={{fontSize:13}}>Already signed in without a name? <Link href="/onboarding">Complete your academic profile</Link>.</p></main>;
}