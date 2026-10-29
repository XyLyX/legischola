"use client";
import {useEffect,useState,type FormEvent} from "react";
import Link from "next/link";
import {supabase} from "../../../lib/supabase";
import {passwordConfirmationProblem} from "../../../lib/password-policy";
import CanonicalHostNotice from "../../../components/CanonicalHostNotice";

export default function AccountSecurity(){
 const [loadingIdentity,setLoadingIdentity]=useState(true);
 const [email,setEmail]=useState<string|null>(null);
 const [emailVerified,setEmailVerified]=useState(false);
 const [isAdmin,setIsAdmin]=useState(false);
 const [password,setPassword]=useState("");
 const [confirmPassword,setConfirmPassword]=useState("");
 const [nonce,setNonce]=useState("");
 const [showPassword,setShowPassword]=useState(false);
 const [busy,setBusy]=useState(false);
 const [verificationBusy,setVerificationBusy]=useState(false);
 const [needsVerification,setNeedsVerification]=useState(false);
 const [verificationRequested,setVerificationRequested]=useState(false);
 const [message,setMessage]=useState("");
 const [saved,setSaved]=useState(false);

 useEffect(()=>{
  const client=supabase;
  if(!client){setLoadingIdentity(false);return;}
  let active=true;
  const sync=async()=>{
   const {data:{user},error}=await client.auth.getUser();
   if(!active)return;
   setEmail(error?null:(user?.email||null));
   setEmailVerified(Boolean(user?.email_confirmed_at));
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
  if(!supabase||!email||!needsVerification)return;
  setVerificationBusy(true);setMessage("");
  try{
   const {error}=await supabase.auth.reauthenticate();
   if(error){
    setMessage("Additional email verification could not be requested. Use Password Recovery if no code arrives, or sign in again to renew your session.");
   }else{
    setVerificationRequested(true);
    setMessage("A verification request was accepted. Check the inbox and spam folder for your registered email. Enter the security code below and select Save password again.");
   }
  }catch{setMessage("Unable to request an additional verification code. Use Password Recovery instead.")}
  finally{setVerificationBusy(false);}
 }

 async function submit(e:FormEvent){
  e.preventDefault();
  if(!supabase||!email||!emailVerified||busy)return;
  const problem=passwordConfirmationProblem(password,confirmPassword);
  if(problem){setMessage(problem);return;}
  if(needsVerification&&!nonce.trim()){
   setMessage("Enter the security code only if Supabase requested one, or choose Password Recovery.");
   return;
  }
  setBusy(true);setMessage("");setSaved(false);
  try{
   const {error}=await supabase.auth.updateUser({
    password,
    ...(nonce.trim()?{nonce:nonce.trim()}:{}),
   });
   if(!error){
    setPassword("");setConfirmPassword("");setNonce("");
    setNeedsVerification(false);setVerificationRequested(false);
    setSaved(true);
    setMessage("Password saved successfully. You can now sign in using your existing email and this password. Your Founder/Admin access is unchanged.");
   }else{
    const reason=(error.code||"").toLowerCase()+" "+(error.message||"").toLowerCase();
    if(/reauthenticat|nonce|security code/.test(reason)){
     setNeedsVerification(true);
     setMessage("Supabase requires an additional email security code before it can save your password. No password change was made. Use Send security code below, or Password Recovery if email delivery is unavailable.");
    }else if(/session|jwt|token|not authenticated/.test(reason)){
     setMessage("Your sign-in session has expired. Sign in with an email link, then return here to save your password.");
    }else if(/weak|password|length|different/.test(reason)){
     setMessage("Supabase rejected this password. Choose a different, unique 12+ character passphrase and retry. No password was changed.");
    }else{
     setMessage("Password was not saved. Supabase could not complete the request. Please use the recovery option or contact support.");
    }
   }
  }catch{setMessage("The password could not be saved due to a connection problem. Please retry.")}
  finally{setBusy(false);}
 }

 return <main className="form-shell">
  <div className="eyebrow">LEGISCHOLA · ACCOUNT SECURITY</div>
  <h1>Set or change your password</h1>
  <CanonicalHostNotice/>
  {loadingIdentity?<p role="status">Checking which account is signed in…</p>
  :!email?<section className="card">
   <h2>Sign in first — do not register again</h2>
   <p>There is no active LegiSchola sign-in session on this website address. Your existing account is preserved. If you were signed in on another address, this browser session will not transfer between domains.</p>
   <p>Choose <strong>Already registered → Email sign-in link</strong> to access your existing account. Then return to this page to save a password. The system will not ask you to create a second account.</p>
   <Link href="/login?mode=signin&method=email_link" className="btn btn-primary">Sign in to existing account</Link>
   <p><Link href="/account/forgot-password">Or request password recovery</Link></p>
  </section>
  :!emailVerified?<section className="card">
   <h2>Email confirmation still required</h2>
   <p>The currently signed-in account has not yet confirmed its email. Confirm it through the original registration email, then sign back in. Password updates are unavailable until verification is complete.</p>
   <Link href="/login?mode=signin&method=email_link" className="btn btn-primary">Sign in with verified email</Link>
  </section>
  :<>
   <section className="card" style={{marginBottom:16}}>
    <p><strong>Verified account:</strong> {email}</p>
    {isAdmin&&<p><strong>Founder/Admin:</strong> Your administrative role is already active and does not depend on using a password.</p>}
    <p className="muted" style={{marginBottom:0}}>Your email has already been verified. <strong>You do not need to register or verify your account again.</strong> Choose your password below and save it. An additional email code is needed only if Supabase specifically requests it.</p>
   </section>
   <form onSubmit={e=>void submit(e)} className="card" style={{display:"grid",gap:9}}>
    <h2 style={{margin:"0 0 4px"}}>1. Choose your password</h2>
    <label htmlFor="secure-password">New password or passphrase
     <input id="secure-password" required minLength={12} maxLength={128}
      type={showPassword?"text":"password"} autoComplete="new-password" value={password}
      onChange={e=>setPassword(e.target.value)} placeholder="At least 12 characters"/>
    </label>
    <label htmlFor="secure-confirm">Confirm new password
     <input id="secure-confirm" required type={showPassword?"text":"password"}
      autoComplete="new-password" value={confirmPassword}
      onChange={e=>setConfirmPassword(e.target.value)}/>
    </label>
    <label className="password-visibility">
     <input type="checkbox" checked={showPassword} onChange={e=>setShowPassword(e.target.checked)}/>
     Show passwords
    </label>
    <p className="muted" style={{fontSize:13,margin:0}}>Use a unique password of at least 12 characters and no more than 72 UTF-8 bytes. A password manager is recommended.</p>

    {needsVerification&&<section className="card" style={{background:"#fffbeb",padding:15,marginTop:10,borderColor:"#e9cb80"}}>
     <h3 style={{fontSize:"1.12rem",margin:"0 0 9px"}}>Extra verification required by Supabase</h3>
     <p>Only this password-change request requires a one-time email security code. Your original email address is already verified.</p>
     <button className="btn btn-secondary" type="button" disabled={verificationBusy||busy}
      onClick={()=>void requestVerification()}>{verificationBusy?"Requesting…":"Send security code"}</button>
     {verificationRequested&&<p className="muted">Request accepted. Delivery depends on Supabase's configured mail provider.</p>}
     <label htmlFor="password-nonce">Security code from email
      <input id="password-nonce" autoComplete="one-time-code" inputMode="numeric" maxLength={32}
       value={nonce} onChange={e=>setNonce(e.target.value)} placeholder="Enter one-time code"/>
     </label>
     <p><Link href="/account/forgot-password">No email arrived? Try account recovery</Link></p>
    </section>}

    <div className="actions" style={{marginTop:16}}>
     <button id="save-password" className="btn btn-primary" style={{minWidth:210}} type="submit"
      disabled={busy||!password||!confirmPassword||(needsVerification&&!nonce.trim())}>
      {busy?"Saving securely…":"Save password"}
     </button>
     <Link href="/account/forgot-password" className="btn btn-secondary">Forgot password?</Link>
    </div>
    <p role={saved?"status":"alert"} aria-live="polite" style={{margin:"8px 0 0"}}>{message}</p>
   </form>
   <p className="muted" style={{fontSize:13}}>Password verification and storage are handled by Supabase Auth; LegiSchola's student and admin tables never store or display your password.</p>
  </>}
  {!email&&<p role="status" aria-live="polite">{message}</p>}
  <p><Link href={isAdmin?"/admin":"/dashboard"}>{isAdmin?"Return to admin dashboard":"Return to student dashboard"}</Link></p>
 </main>;
}
