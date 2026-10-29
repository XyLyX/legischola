"use client";
import {useEffect,useState,type FormEvent} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {supabase} from "../../lib/supabase";
import {passwordConfirmationProblem} from "../../lib/password-policy";

type Mode="signup"|"signin";
type Method="password"|"email_link";

export default function Login(){
 const router=useRouter();
 const [referral,setReferral]=useState("");
 const [mode,setMode]=useState<Mode>("signup");
 const [method,setMethod]=useState<Method>("password");
 const [fullName,setFullName]=useState("");
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [confirmPassword,setConfirmPassword]=useState("");
 const [showPassword,setShowPassword]=useState(false);
 const [message,setMessage]=useState("");
 const [loading,setLoading]=useState(false);

 useEffect(()=>{
  const code=new URLSearchParams(window.location.search).get("ref");
  if(new URLSearchParams(window.location.search).get("password")==="updated"){setMode("signin");setMethod("password");setMessage("Password updated. Sign in with your new password.");}
  if(code){
   const normalised=code.trim().toUpperCase().slice(0,32);
   setReferral(normalised);
   sessionStorage.setItem("legischola_referral",normalised);
  }else{
   const saved=sessionStorage.getItem("legischola_referral");
   if(saved)setReferral(saved);
  }
 },[]);

 async function submit(e:FormEvent){
  e.preventDefault();
  if(!supabase){setMessage("Authentication is temporarily unavailable.");return;}
  const address=email.trim().toLowerCase();
  const name=fullName.trim().replace(/\s+/g," ");
  if(mode==="signup"&&(name.length<3||name.length>120)){
   setMessage("Enter your full name as shown on your student ID card.");return;
  }
  if(mode==="signup"){
   const problem=passwordConfirmationProblem(password,confirmPassword);
   if(problem){setMessage(problem);return;}
  }else if(method==="password"&&!password){
   setMessage("Enter your password or choose Sign in with email link.");return;
  }
  setLoading(true);setMessage("");
  try{
   if(mode==="signup"){
    // Retain the existing confirmed-signup redirect and referral attribution.
    const {data,error}=await supabase.auth.signUp({
     email:address,password,
     options:{emailRedirectTo:window.location.origin+"/onboarding"+
      (referral.trim()?"?ref="+encodeURIComponent(referral.trim()):""),
      data:{full_name:name}},
    });
    if(error){
     setMessage("Account creation could not be completed. Check the email address and password requirements, or use account recovery if you previously registered.");
    }else if(data.session){
     setPassword("");setConfirmPassword("");
     router.replace("/onboarding"+(referral.trim()?"?ref="+encodeURIComponent(referral.trim()):""));
     router.refresh();
    }else{
     setPassword("");setConfirmPassword("");
     setMessage("If this registration is eligible, a confirmation link will arrive by email. Verify the email before signing in. Already registered? Use the Sign in tab instead.");
    }
   }else if(method==="email_link"){
    const {error}=await supabase.auth.signInWithOtp({
     email:address,
     options:{emailRedirectTo:window.location.origin+"/onboarding",shouldCreateUser:false},
    });
    setMessage(error?"Unable to request the sign-in link. Please check the email address and retry.":
     "If this email has a LegiSchola account, a secure sign-in link will arrive shortly. After signing in, you can set a password in Account Security.");
   }else{
    // Existing passwords can predate the stronger signup policy;
    // only Supabase decides whether the credentials are valid.
    const {data,error}=await supabase.auth.signInWithPassword({email:address,password});
    if(error||!data.user){
     setMessage("Sign-in failed. Check your email and password, or choose an email link if you originally registered without a password.");
    }else{
     setPassword("");setConfirmPassword("");
     // This is navigation only, never a substitute for server-side role checks.
     const destination=data.user.app_metadata?.legischola_role==="founder"?"/admin":"/onboarding";
     router.replace(destination);
     router.refresh();
    }
   }
  }catch{
   setMessage("The authentication service could not be reached. Please retry.");
  }finally{setLoading(false);}
 }

 const signup=mode==="signup";
 return <main className="form-shell">
  <div className="eyebrow">LEGISCHOLA · SECURE ACCESS</div>
  <h1 style={{fontSize:"2.5rem"}}>{signup?"Create your student account":"Welcome back"}</h1>
  <p className="muted">{signup?
   "Sign up using your email address and a strong password. Email verification protects your account before learning features are activated.":
   "Sign in using your password or an email link. This also works for registered founders and administrators."}</p>

  <div className="studio-actions" role="group" aria-label="Account access">
   <button type="button" aria-pressed={signup} onClick={()=>{setMode("signup");setMethod("password");setPassword("");setConfirmPassword("");setMessage("")}}>New student · Sign up</button>
   <button type="button" aria-pressed={!signup} onClick={()=>{setMode("signin");setPassword("");setConfirmPassword("");setMessage("")}}>Already registered · Sign in</button>
  </div>

  {!signup&&<div className="auth-methods" role="group" aria-label="Sign-in method">
   <button type="button" className={method==="password"?"selected":""} aria-pressed={method==="password"}
    onClick={()=>{setMethod("password");setMessage("");setPassword("")}}>Password</button>
   <button type="button" className={method==="email_link"?"selected":""} aria-pressed={method==="email_link"}
    onClick={()=>{setMethod("email_link");setMessage("");setPassword("")}}>Email sign-in link</button>
  </div>}

  <form onSubmit={e=>void submit(e)}>
   {signup&&<label htmlFor="legal-name">Full name (as on student ID card)
    <input id="legal-name" type="text" required minLength={3} maxLength={120} autoComplete="name"
     value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Your full name"/>
   </label>}
   <label htmlFor="student-email">Email address
    <input id="student-email" type="email" autoComplete="email" required maxLength={254}
     value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>
   </label>
   {(signup||method==="password")&&<>
    <label htmlFor="account-password">{signup?"Create password":"Password"}
     <input id="account-password" type={showPassword?"text":"password"} autoComplete={signup?"new-password":"current-password"}
      required minLength={signup?12:undefined} maxLength={128}
      value={password} onChange={e=>setPassword(e.target.value)} placeholder={signup?"Use a unique passphrase of 12+ characters":"Enter your password"}/>
    </label>
    <label className="password-visibility">
     <input type="checkbox" checked={showPassword} onChange={e=>setShowPassword(e.target.checked)}/>
     Show password
    </label>
    {signup&&<><p className="muted" style={{fontSize:13,margin:"6px 0"}}>
      Choose a unique password or passphrase of at least 12 characters (maximum 72 UTF-8 bytes). Avoid reusing passwords from other websites.
     </p>
     <label htmlFor="confirm-password">Confirm password
      <input id="confirm-password" type={showPassword?"text":"password"} required autoComplete="new-password"
       value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Re-enter your password"/>
     </label></>}
   </>}
   {signup&&<label htmlFor="referral-code">Referral code (optional)
    <input id="referral-code" type="text" autoComplete="off" maxLength={32} value={referral}
     onChange={e=>{const code=e.target.value.toUpperCase();setReferral(code);sessionStorage.setItem("legischola_referral",code)}}
     placeholder="Enter a classmate's referral code"/>
    <small>If this is a valid invitation, a one-time ₹25 platform welcome credit may become eligible only after a verified qualifying paid subscription. No rewards are issued during the payment-free beta.</small>
   </label>}
   <div className="actions">
    <button className="btn btn-primary" disabled={loading} type="submit">
     {loading?"Processing…":signup?"Create account & verify email":method==="password"?"Sign in securely":"Email me a sign-in link"}
    </button>
   </div>
  </form>
  <p role="status" aria-live="polite">{message}</p>
  <div className="auth-help-links">
   {!signup&&<Link href="/account/forgot-password">Forgot password?</Link>}
   <Link href="/account/security">Already signed in? Set or change password</Link>
  </div>
  <p className="muted" style={{fontSize:13}}>Your password is handled by Supabase Auth and is not stored in LegiSchola's own student or administrator tables. <Link href="/privacy">Privacy Notice</Link>.</p>
 </main>;
}
