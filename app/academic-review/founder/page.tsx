"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {supabase} from "../../../lib/supabase";
type AcademicMessage={id:string;sender_role:string;body:string;created_at:string};
type AcademicCase={id:string;status:string;case_type:string;summary:string;agent_recommendation:string|null;founder_decision:string|null;evidence:Record<string,unknown>|null;created_at:string};
const actions=[{value:"needs_student",label:"Request more evidence"},{value:"founder_review",label:"Keep under founder review"},{value:"resolved",label:"Close as resolved"},{value:"rejected",label:"Close as rejected"}];
export default function FounderAcademicReview(){
 const [cases,setCases]=useState<AcademicCase[]>([]),[message,setMessage]=useState("Checking founder permissions…"),[busy,setBusy]=useState(false);
 const [editing,setEditing]=useState<string|null>(null),[note,setNote]=useState(""),[action,setAction]=useState("needs_student");
 const [detailId,setDetailId]=useState<string|null>(null),[detailMessages,setDetailMessages]=useState<AcademicMessage[]>([]),[documentUrl,setDocumentUrl]=useState<string|null>(null);
 async function api(payload?:Record<string,unknown>){
  if(!supabase)throw Error("Database unavailable");
  const {data:{session}}=await supabase.auth.getSession();
  if(!session)throw Error("Please sign in");
  const r=await fetch("/api/academic-review/founder",{method:payload?"POST":"GET",headers:{"Authorization":"Bearer "+session.access_token,...(payload?{"Content-Type":"application/json"}:{})},body:payload?JSON.stringify(payload):undefined});
  const out=await r.json();if(!r.ok)throw Error(out.error||"Academic queue unavailable");return out;
 }
 async function load(){try{const data=await api();setCases(data.cases||[]);setMessage((data.cases||[]).length?"":"No academic review requests pending.")}catch(e){setMessage(e instanceof Error?e.message:"Founder sign-in required")}}
 async function inspect(caseId:string){
  if(detailId===caseId){setDetailId(null);setDocumentUrl(null);setDetailMessages([]);return;}
  setMessage("");
  try{
   if(!supabase)throw Error("Academic database unavailable");
   const {data:{session}}=await supabase.auth.getSession();if(!session)throw Error("Sign in");
   const response=await fetch("/api/academic-review/founder?caseId="+encodeURIComponent(caseId),{headers:{Authorization:"Bearer "+session.access_token}});
   const result=await response.json();if(!response.ok)throw Error(result.error||"Unable to load case");
   setDetailId(caseId);setDetailMessages(result.messages||[]);setDocumentUrl(result.documentUrl||null);
  }catch(e){setMessage(e instanceof Error?e.message:"Unable to inspect evidence")}
 }
 useEffect(()=>{void load()},[]);
 async function decide(caseId:string){
  setBusy(true);setMessage("");
  try{const result=await api({caseId,action,note});setEditing(null);setNote("");setMessage(result.warning||"Academic decision recorded. No syllabus was automatically published.");await load()}catch(e){setMessage(e instanceof Error?e.message:"Decision could not be saved")}finally{setBusy(false)}
 }
 return <main className="shell" style={{maxWidth:1080,paddingTop:24,paddingBottom:50}}>
 <h1>Academic Review · Founder</h1><p className="muted">Restricted to accounts with an administrator-assigned LegiSchola founder role. AI recommendations are preliminary; decisions and curriculum publication are separate actions.</p><p role="status">{message}</p>
 {cases.map(c=><section key={c.id} className="card" style={{margin:"14px 0",padding:18}}>
 <p className="eyebrow">{c.case_type.replaceAll("_"," ")} · {c.status.replaceAll("_"," ")}</p><h2 style={{fontSize:"1.2rem"}}>{c.summary}</h2><p className="muted">Submitted {new Date(c.created_at).toLocaleString()}</p>
 {typeof c.evidence?.original_filename==="string"&&<p>Student PDF: {c.evidence.original_filename} (private; independent verification required)</p>}
 <button type="button" className="btn btn-secondary" onClick={()=>void inspect(c.id)}>{detailId===c.id?"Close case evidence":"Review case evidence & conversation"}</button>
 {detailId===c.id&&<div style={{padding:12,background:"#f7f9fc",margin:"12px 0",borderRadius:10}}>
  {documentUrl?<p><a href={documentUrl} target="_blank" rel="noreferrer">Open private PDF for review (link expires in five minutes)</a></p>:<p>No downloadable PDF is attached to this request.</p>}
  <h3>Conversation</h3>{detailMessages.length?detailMessages.map(m=><p key={m.id}><strong>{m.sender_role}:</strong> {m.body}</p>):<p>No messages yet.</p>}
 </div>}
 <h3>Academic Agent inference</h3><p style={{whiteSpace:"pre-wrap"}}>{c.agent_recommendation||"No AI triage available; manual review required."}</p>
 {c.founder_decision&&<p><strong>Recorded founder decision:</strong> {c.founder_decision}</p>}
 {!["resolved","rejected"].includes(c.status)&&<div>
 {editing!==c.id?<button type="button" className="btn btn-primary" onClick={()=>{setEditing(c.id);setAction("needs_student");setNote("")}}>Record decision</button>:
 <div style={{display:"grid",gap:10}}>
 <label>Action<select value={action} onChange={e=>setAction(e.target.value)} style={{display:"block",padding:10}}>{actions.map(a=><option key={a.value} value={a.value}>{a.label}</option>)}</select></label>
 <label>Decision and message to student<textarea value={note} maxLength={4000} onChange={e=>setNote(e.target.value)} rows={5} style={{display:"block",width:"100%",padding:12,marginTop:6}}/></label>
 <div style={{display:"flex",gap:10}}><button type="button" className="btn btn-primary" disabled={busy||note.trim().length<8} onClick={()=>void decide(c.id)}>Save founder decision</button><button type="button" className="btn btn-secondary" disabled={busy} onClick={()=>setEditing(null)}>Cancel</button></div></div>}
 </div>}
 </section>)}
 <p><Link href="/dashboard">Student dashboard</Link></p>
 </main>;
}
