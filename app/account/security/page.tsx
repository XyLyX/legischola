"use client";
import {useEffect,useState,type FormEvent} from "react";
import Link from "next/link";
import {supabase} from "../../../lib/supabase";
import {passwordConfirmationProblem} from "../../../lib/password-policy";

export default function AccountSecurity(){
 const [loadingIdentity,setLoadingIdentity]=useState(true);
 const [email,setEmail]=useState<string|null>(null);
 const [isAdmin,setIsAdmin]=useState(false);
 const [password,setPassword]=useState("");
 const [confirmPassword,setConfirmPassword]=useState("");
 const [nonce,setNonce]=useState("");
 const [showPassword,setShowPassword]=useState(false);
 const [busy,setBusy]=useState(false);
 const [verificationBusy,setVerificationBusy]=useState(false);
 const [message,setMessage]=useState("");

 useEffect(()=>{
  const client=supabase;
  if(!client){setLoadingIdentity(false);return}
  let active=true;
  const sync=async()=>{
   const {data:{user}}=await client.auth.getUser();
   if(!active)return;
   setEmail(user?.email&&user.email_confirmed_at?user.email:null);
   setIsAdmin(user?.app_metadata?.legischola_role==="founder");
   setLoadingIdentity(false);
  };
  void sync();
  const {data:{subscription}}=client.auth.onAuthStateChange(()=>{
   queueMicrotask(()=>{if(active)void sync();});
  });
  return()=>{active=false;subscription.unsubscribe()};
 },[]);

 async function requestVerification(){
  if(!supabase||!email)return;
  setVerificationBusy(true);setMessage("");
  try{
   const {error}=await supabase.auth.reauthenticate();
   setMessage(error?"Could not send verification code. Please sign in again using a secure email link and retry.":
    "A verification code was sent to your registered email. Enter it below when saving your password.");
  }catch{setMessage("Unable to request verification code. Please try later.")}
  finally{setVerificationBusy(false);}
 }

 async function submit(e:FormEvent){
  e.preventDefault();
  if(!supabase||!email)return;
  const problem=passwordConfirmationProblem(password,confirmPassword);
  if(problem){setMessage(problem);return}
  setBusy(true);setMessage("");
  try{
   const {error}=await supabase.auth.updateUser({
    password,
    ...(nonce.trim()?{nonce:nonce.trim()}:{}),
   });
   if(error){
    // Password updates may require a fresh email reauthentication nonce
    // depending on the Supabase project's secure-change settings.
    setMessage("The password was not changed. If additional verification is required, use Send verification code above, enter the emailed code and retry. If it still fails, use the Forgot Password recovery flow.");
   }else{
    setPassword("");setConfirmPassword("");setNonce("");
    setMessage("Your account password has been updated securely in Supabase Auth. You can now sign in using email and password.");
   }
  }catch{setMessage("The password could not be updated. Please try again.")}
  finally{setBusy(false);}
 }

 return <main className="form-shell">
  <div className="eyebrow">LEGISCHOLA · ACCOUNT SECURITY</div>
  <h1>Set or change your password</h1>
  {loadingIdentity?<p role="status">Checking your authenticated account…</p>
  :!email?<section className="card">
   <p>Sign in with your verified email account to set a password. If you joined using a secure email link, that same account can create its first password here.</p>
   <Link href="/login" className="btn btn-primary">Sign in to LegiSchola</Link>
  </section>
  :<>
   <section className="card" style={{marginBottom:16}}>
    <p><strong>Verified email:</strong> {email}</p>
    {isAdmin&&<p><strong>Founder/Admin:</strong> This password is for the same restricted account; the private admin dashboard still validates your founder role on every request.</p>}
    <p className="muted">Passwords are handled by Supabase Auth and never stored in LegiSchola's student profile or admin database. If you previously signed in through an email link, no new account is required.</p>
   </section>
   <form onSubmit={e=>void submit(e)}>
    <label htmlFor="secure-password">New password or passphrase
     <input id="secure-password" required minLength={12} maxLength={128}
      type={showPassword?"text":"password"} autoComplete="new-password" value={password}
      onChange={e=>setPassword(e.target.value)} placeholder="At least 12 characters"/>
    </label>
    <label htmlFor="secure-confirm">Confirm password
     <input id="secure-confirm" required type={showPassword?"text":"password"}
      autoComplete="new-password" value={confirmPassword}
      onChange={e=>setConfirmPassword(e.target.value)}/>
    </label>
    <label className="password-visibility">
     <input type="checkbox" checked={showPassword} onChange={e=>setShowPassword(e.target.checked)}/>
     Show passwords
    </label>
    <p className="muted" style={{fontSize:13}}>Use a unique passphrase of at least 12 characters (maximum 72 UTF-8 bytes). A password manager is recommended.</p>
    <section className="card" style={{background:"#f8fafc",padding:16,margin:"16px 0"}}>
     <h2 style={{fontSize:"1.1rem"}}>Additional email verification</h2>
     <p className="muted" style={{fontSize:14}}>Supabase may request a one-time security code before changing a password. If prompted, send a verification code and enter it here.</p>
     <button className="btn btn-secondary" type="button" disabled={verificationBusy}
      onClick={()=>void requestVerification()}>{verificationBusy?"Sending…":"Send verification code"}</button>
     <label htmlFor="password-nonce">Verification code (when requested)
      <input id="password-nonce" autoComplete="one-time-code" inputMode="numeric" maxLength={32}
       value={nonce} onChange={e=>setNonce(e.target.value)} placeholder="Code from your email"/>
     </label>
    </section>
    <div className="actions">
     <button className="btn btn-primary" type="submit" disabled={busy}>{busy?"Saving…":"Save password securely"}</button>
     <Link href="/account/forgot-password" className="btn btn-secondary">Forgot password?</Link>
    </div>
   </form>
  </>}
  <p role="status" aria-live="polite">{message}</p>
  <p><Link href={isAdmin?"/admin":"/dashboard"}>{isAdmin?"Return to admin dashboard":"Return to student dashboard"}</Link></p>
 </main>;
}
