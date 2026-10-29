"use client";
import {useEffect,useState,type FormEvent} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {supabase} from "../../../lib/supabase";
import {passwordConfirmationProblem} from "../../../lib/password-policy";

/** Recovery links are processed by Supabase Auth in the browser.
 * A valid recovery session is required; tokens are never copied into
 * query strings, logs, local application tables or API requests.
 */
export default function ResetPassword(){
 const router=useRouter();
 const [checking,setChecking]=useState(true);
 const [signedIn,setSignedIn]=useState(false);
 const [password,setPassword]=useState("");
 const [confirmation,setConfirmation]=useState("");
 const [visible,setVisible]=useState(false);
 const [busy,setBusy]=useState(false);
 const [status,setStatus]=useState("");
 useEffect(()=>{
  const client=supabase;
  if(!client){setChecking(false);return;}
  let active=true;
  const sync=async()=>{
   const {data:{user}}=await client.auth.getUser();
   if(active){setSignedIn(Boolean(user));setChecking(false);}
  };
  void sync();
  const {data:{subscription}}=client.auth.onAuthStateChange(()=>{
   queueMicrotask(()=>{if(active)void sync();});
  });
  return()=>{active=false;subscription.unsubscribe()};
 },[]);
 async function submit(e:FormEvent){
  e.preventDefault();
  if(!supabase||!signedIn)return;
  const problem=passwordConfirmationProblem(password,confirmation);
  if(problem){setStatus(problem);return;}
  setBusy(true);setStatus("");
  try{
   const {error}=await supabase.auth.updateUser({password});
   if(error){
    setStatus("Password could not be changed. Your recovery link may have expired or more verification may be required. Request a new recovery link.");
   }else{
    setPassword("");setConfirmation("");
    // Require the user to sign in with the newly chosen password.
    await supabase.auth.signOut();
    router.replace("/login?password=updated");
    router.refresh();
   }
  }catch{setStatus("Password recovery could not be completed. Please retry.")}
  finally{setBusy(false);}
 }
 return <main className="form-shell">
  <div className="eyebrow">LEGISCHOLA · PASSWORD RECOVERY</div>
  <h1>Choose a new password</h1>
  {checking?<p role="status">Verifying your recovery session…</p>
  :!signedIn?<section className="card">
   <p>A valid one-time recovery session is needed to set a new password. Open the link in your recovery email, or request a fresh link.</p>
   <Link className="btn btn-primary" href="/account/forgot-password">Request recovery email</Link>
  </section>
  :<form onSubmit={e=>void submit(e)}>
   <label htmlFor="new-recovery-password">New password
    <input id="new-recovery-password" type={visible?"text":"password"} required autoComplete="new-password"
     minLength={12} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)}
     placeholder="Use a unique passphrase of 12+ characters"/>
   </label>
   <label htmlFor="confirm-recovery-password">Confirm new password
    <input id="confirm-recovery-password" type={visible?"text":"password"} required autoComplete="new-password"
     value={confirmation} onChange={e=>setConfirmation(e.target.value)}/>
   </label>
   <label className="password-visibility"><input type="checkbox" checked={visible} onChange={e=>setVisible(e.target.checked)}/> Show passwords</label>
   <p className="muted" style={{fontSize:13}}>Use at least 12 characters and at most 72 UTF-8 bytes. After resetting, sign in with the new password.</p>
   <button className="btn btn-primary" type="submit" disabled={busy}>{busy?"Updating…":"Save new password"}</button>
  </form>}
  <p role="status" aria-live="polite">{status}</p>
  <p><Link href="/login">Return to sign in</Link></p>
 </main>;
}
