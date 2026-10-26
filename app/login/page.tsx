"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
export default function Login(){
 const [email,setEmail]=useState("");const [message,setMessage]=useState("");const [loading,setLoading]=useState(false);
 async function signIn(e:React.FormEvent){e.preventDefault();if(!supabase){setMessage("Authentication is not configured yet.");return;}
 setLoading(true);const {error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:window.location.origin+"/onboarding"}});setMessage(error?.message??"Check your inbox for a secure sign-in link.");setLoading(false);}
 return <main style={{maxWidth:480,margin:"80px auto",padding:24}}><h1>Sign in to LegiSchola</h1><p>We will email you a secure sign-in link.</p><form onSubmit={signIn}><label>Email address<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} style={{display:"block",width:"100%",padding:12,margin:"12px 0",boxSizing:"border-box"}} /></label><button disabled={loading} type="submit">{loading?"Sending…":"Send sign-in link"}</button></form><p role="status">{message}</p></main>
}
