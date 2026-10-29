"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {supabase} from "../../lib/supabase";

type Case={id:string;case_type:string;status:string;summary:string;created_at:string};
export default function AcademicReview(){
 const [cases,setCases]=useState<Case[]>([]);
 const [summary,setSummary]=useState("");
 const [kind,setKind]=useState("syllabus_upload");
 const [message,setMessage]=useState("");
 const [busy,setBusy]=useState(false);
 const [signedIn,setSignedIn]=useState<boolean|null>(null);
 async function load(){
  if(!supabase)return;
  const {data:{user}}=await supabase.auth.getUser();
  setSignedIn(Boolean(user));
  if(!user)return;
  const {data,error}=await supabase.from("academic_review_cases").select("id,case_type,status,summary,created_at").eq("student_user_id",user.id).order("created_at",{ascending:false}).limit(30);
  if(error)setMessage("Unable to load academic requests: "+error.message);
  else setCases(data||[]);
 }
 useEffect(()=>{void load()},[]);
 async function submit(e:React.FormEvent){
  e.preventDefault();
  if(!supabase||busy)return;
  setBusy(true);setMessage("");
  const {data:{user}}=await supabase.auth.getUser();
  if(!user){setMessage("Please sign in.");setBusy(false);return;}
  const {error}=await supabase.from("academic_review_cases").insert({student_user_id:user.id,case_type:kind,summary:summary.trim(),evidence:{}});
  if(error)setMessage("Request could not be submitted: "+error.message);
  else {setSummary("");setMessage("Your academic request was recorded. It is pending review; this does not mean the syllabus has been verified.");await load();}
  setBusy(false);
 }
 if(signedIn===null)return <main style={{padding:24}}>Checking sign-in…</main>;
 if(!signedIn)return <main style={{padding:24}}><h1>Academic review</h1><Link href="/login">Sign in to submit an academic request</Link></main>;
 return <main style={{maxWidth:760,margin:"36px auto",padding:24}}>
 <h1>Academic review</h1>
 <p>Tell the academic team about an incorrect syllabus, missing subject or curriculum mismatch. Your request stays private to your account. Upload processing and automated academic-agent decisions are not yet enabled.</p>
 <form onSubmit={submit}>
 <label htmlFor="case-kind">Issue type</label>
 <select id="case-kind" value={kind} onChange={e=>setKind(e.target.value)} style={{display:"block",padding:12,width:"100%",margin:"8px 0 18px"}}>
 <option value="syllabus_upload">I have a syllabus to share</option>
 <option value="curriculum_conflict">My syllabus differs from the listed curriculum</option>
 <option value="missing_unit">A subject or unit is missing</option>
 <option value="version_mismatch">My batch or semester is incorrect</option>
 <option value="other">Other academic issue</option>
 </select>
 <label htmlFor="case-summary">Describe the issue</label>
 <textarea id="case-summary" required minLength={8} maxLength={2000} rows={5} value={summary} onChange={e=>setSummary(e.target.value)} placeholder="Include your university, programme, batch, semester and the specific subject or unit." style={{display:"block",width:"100%",padding:12,boxSizing:"border-box",margin:"8px 0 18px"}}/>
 <button disabled={busy} type="submit" style={{background:"#243c75",color:"white",border:0,borderRadius:8,padding:"12px 18px"}}>{busy?"Submitting…":"Submit for academic review"}</button>
 </form>
 <p role="status">{message}</p>
 <h2>Your requests</h2>
 {cases.length===0?<p>No requests recorded yet.</p>:<ul>{cases.map(c=><li key={c.id} style={{padding:"12px 0"}}><strong>{c.case_type.replaceAll("_"," ")}</strong> — {c.status.replaceAll("_"," ")}<p>{c.summary}</p><small>{new Date(c.created_at).toLocaleDateString()}</small></li>)}</ul>}
 <Link href="/onboarding">Back to academic profile</Link>
 </main>;
}
