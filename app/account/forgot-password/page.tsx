"use client";
import {useState,type FormEvent} from "react";
import Link from "next/link";
import {supabase} from "../../../lib/supabase";

export default function ForgotPassword(){
 const [email,setEmail]=useState("");
 const [loading,setLoading]=useState(false);
 const [message,setMessage]=useState("");
 async function submit(e:FormEvent){
  e.preventDefault();
  if(!supabase){setMessage("Authentication is temporarily unavailable.");return;}
  setLoading(true);setMessage("");
  try{
   const {error}=await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(),{
    redirectTo:window.location.origin+"/account/reset-password",
   });
   if(error){
    setMessage("We could not process the request right now. Please retry later or contact LegiSchola support.");
   }else{
    setMessage("If this email has a LegiSchola account, password recovery instructions will arrive shortly. Check spam as well.");
   }
  }catch{setMessage("Password recovery is temporarily unavailable.")}
  finally{setLoading(false);}
 }
 return <main className="form-shell">
  <div className="eyebrow">LEGISCHOLA · ACCOUNT RECOVERY</div>
  <h1>Reset your password</h1>
  <p className="muted">Enter your registered email address. We will send a time-limited recovery link. You can also sign in using an email link if you have not yet set a password.</p>
  <form onSubmit={e=>void submit(e)}>
   <label htmlFor="recovery-email">Registered email
    <input id="recovery-email" type="email" autoComplete="email" required maxLength={254}
     value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>
   </label>
   <div className="actions"><button type="submit" disabled={loading} className="btn btn-primary">
    {loading?"Sending…":"Send password recovery link"}
   </button></div>
  </form>
  <p role="status" aria-live="polite">{message}</p>
  <p><Link href="/login">Return to sign in</Link></p>
 </main>;
}
