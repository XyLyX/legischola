"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
type Institution={id:string;name:string};
type Programme={id:string;name:string};
export default function Onboarding(){
 const [institutions,setInstitutions]=useState<Institution[]>([]),[programmes,setProgrammes]=useState<Programme[]>([]);
 const [fullName,setFullName]=useState("");
 const [signedIn,setSignedIn]=useState<boolean|null>(null);
 useEffect(()=>{if(!supabase){setSignedIn(false);return;}supabase.auth.getUser().then(({data})=>{setSignedIn(Boolean(data.user));if(data.user){const n=data.user.user_metadata?.full_name;if(typeof n==="string")setFullName(n);supabase.from("student_profiles").select("display_name").eq("user_id",data.user.id).maybeSingle().then(({data:profile})=>{if(profile?.display_name)setFullName(profile.display_name);});}});const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>setSignedIn(Boolean(session?.user)));return()=>subscription.unsubscribe();},[]);
 const [search,setSearch]=useState(""),[college,setCollege]=useState(""),[programme,setProgramme]=useState(""),[year,setYear]=useState("2026"),[semester,setSemester]=useState("1"),[message,setMessage]=useState("");
 useEffect(()=>{if(!supabase)return;supabase.from("institutions").select("id,name").eq("status","verified").order("name").then(({data})=>setInstitutions(data??[]));},[]);
 useEffect(()=>{setProgramme("");setProgrammes([]);if(!supabase||!college)return;supabase.from("programmes").select("id,name").eq("institution_id",college).order("name").then(({data})=>setProgrammes(data??[]));},[college]);
 async function save(e:React.FormEvent){e.preventDefault();if(!supabase){setMessage("Database connection is not configured.");return;}if(!college||!programme){setMessage("Select a verified institution and programme. If yours is missing, request its addition.");return;}
 const {data:{user}}=await supabase.auth.getUser();if(!user){setMessage("Please sign in before saving your academic profile.");return;}
 if(fullName.trim().length<3){setMessage("Enter your full name as shown on your student ID card.");return;}
 const {error}=await supabase.from("student_profiles").upsert({user_id:user.id,display_name:fullName.trim(),college_id:college,programme_id:programme,admission_year:Number(year),semester:Number(semester)},{onConflict:"user_id"});
 setMessage(error?.message??"Academic profile saved. Syllabus verification is required before personalized tutoring starts.");}
 const filtered=institutions.filter(x=>x.name.toLowerCase().includes(search.toLowerCase()));
 if(signedIn===null)return <main style={{padding:32}}>Checking your sign-in session…</main>;
 if(!signedIn)return <main style={{maxWidth:640,margin:"48px auto",padding:24}}><h1>Sign in to continue</h1><p>Your academic profile is private. Sign in before selecting your institution.</p><Link href="/login">Sign in securely →</Link></main>;
 return <main style={{maxWidth:640,margin:"48px auto",padding:24}}><h1>Personalize your law school</h1><p>Select your verified college or university. We only assign curricula supported by evidence.</p><form onSubmit={save}><label>Full name (as on student ID card)<input required minLength={3} maxLength={120} autoComplete="name" value={fullName} onChange={e=>setFullName(e.target.value)} style={{display:"block",width:"100%",padding:12,margin:"8px 0 20px",boxSizing:"border-box"}} /></label>
 <label>Find your college or university<input value={search} onChange={e=>{setSearch(e.target.value);setCollege("")}} placeholder="Type college or university name" style={{display:"block",width:"100%",padding:12,margin:"8px 0",boxSizing:"border-box"}} /></label>
 <select required value={college} onChange={e=>setCollege(e.target.value)} style={{width:"100%",padding:12,marginBottom:20}}><option value="">Select a verified institution</option>{filtered.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>
 {filtered.length===0&&<p>No verified match yet. <a href="mailto:academic@legischola.com?subject=Institution%20request">Request your institution</a>.</p>}
 <label>Degree programme<select required value={programme} onChange={e=>setProgramme(e.target.value)} style={{display:"block",width:"100%",padding:12,margin:"8px 0 20px"}}><option value="">Select programme</option>{programmes.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
 <label>Admission year<input type="number" required min="1990" max="2100" value={year} onChange={e=>setYear(e.target.value)} style={{display:"block",padding:12,margin:"8px 0 20px"}} /></label>
 <label>Semester<select value={semester} onChange={e=>setSemester(e.target.value)} style={{display:"block",padding:12,margin:"8px 0 20px"}}>{Array.from({length:10},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}</select></label>
 <button type="submit" style={{background:"#243c75",color:"white",border:0,padding:"14px 20px",borderRadius:8}}>Save academic profile</button></form><p role="status">{message}</p><Link href="/login">Sign in</Link> · <Link href="/dashboard">Dashboard</Link></main>
}
