"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {supabase} from "../../lib/supabase";

type Case={id:string;case_type:string;status:string;summary:string;created_at:string};
type AcademicMessage={id:string;sender_role:string;body:string;created_at:string};
export default function AcademicReview(){
 const [cases,setCases]=useState<Case[]>([]);
 const [summary,setSummary]=useState("");
 const [syllabusFile,setSyllabusFile]=useState<File|null>(null);
 const [kind,setKind]=useState("syllabus_upload");
 const [message,setMessage]=useState("");
 const [busy,setBusy]=useState(false);
 const [signedIn,setSignedIn]=useState<boolean|null>(null);
 const [activeCase,setActiveCase]=useState<string|null>(null),[caseMessages,setCaseMessages]=useState<AcademicMessage[]>([]),[reply,setReply]=useState("");
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
  let evidence:Record<string,unknown>={};
  if(syllabusFile){
   if(syllabusFile.size>10485760||syllabusFile.size<100||!(syllabusFile.type==="application/pdf"||syllabusFile.name.toLowerCase().endsWith(".pdf"))){setMessage("Please use a PDF smaller than 10 MB.");setBusy(false);return;}
   const header=new Uint8Array(await syllabusFile.slice(0,5).arrayBuffer());
   if(String.fromCharCode(...header)!=="%PDF-"){setMessage("The uploaded document is not a valid PDF header.");setBusy(false);return;}
   const storagePath=user.id+"/"+crypto.randomUUID()+".pdf";
   const {error:uploadError}=await supabase.storage.from("legischola-student-syllabi").upload(storagePath,syllabusFile,{contentType:"application/pdf",upsert:false});
   if(uploadError){setMessage("PDF upload failed: "+uploadError.message);setBusy(false);return;}
   evidence={storage_bucket:"legischola-student-syllabi",storage_path:storagePath,original_filename:syllabusFile.name,file_size_bytes:syllabusFile.size,source_role:"student_supplied_unverified"};
  }
  const {data:newCase,error}=await supabase.from("academic_review_cases").insert({student_user_id:user.id,case_type:kind,summary:summary.trim(),evidence}).select("id").single();
  if(error||!newCase)setMessage("Request could not be submitted: "+(error?.message||"Please retry")+"; contact academic support if you uploaded a PDF.");
  else {
   setSummary("");setSyllabusFile(null);
   let triageStatus="Your academic request is queued for review.";
   try {
    const {data:{session}}=await supabase.auth.getSession();
    if(session){const response=await fetch("/api/academic-review/triage",{method:"POST",headers:{"Authorization":"Bearer "+session.access_token,"Content-Type":"application/json"},body:JSON.stringify({caseId:newCase.id})});const result=await response.json();triageStatus=result.message||triageStatus;}
   }catch{triageStatus="Your academic request is saved. Automated triage was unavailable.";}
   setMessage(triageStatus+" Uploaded PDFs are private and never automatically approved.");await load();
  }
  setBusy(false);
 }
 async function openCase(caseId:string){
  if(!supabase)return;
  if(activeCase===caseId){setActiveCase(null);return;}
  setActiveCase(caseId);setCaseMessages([]);setReply("");
  const {data,error}=await supabase.from("academic_case_messages").select("id,sender_role,body,created_at").eq("case_id",caseId).order("created_at");
  if(error)setMessage("Unable to open academic messages: "+error.message);
  else setCaseMessages(data||[]);
 }
 async function postReply(){
  if(!supabase||!activeCase||reply.trim().length<1)return;
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return;
  const {error}=await supabase.from("academic_case_messages").insert({case_id:activeCase,sender_role:"student",sender_user_id:user.id,body:reply.trim()});
  if(error)setMessage("Unable to send reply: "+error.message);
  else {setReply("");setMessage("Reply recorded in your academic case.");const {data}=await supabase.from("academic_case_messages").select("id,sender_role,body,created_at").eq("case_id",activeCase).order("created_at");if(data)setCaseMessages(data);}
 }
 if(signedIn===null)return <main style={{padding:24}}>Checking sign-in…</main>;
 if(!signedIn)return <main style={{padding:24}}><h1>Academic review</h1><Link href="/login">Sign in to submit an academic request</Link></main>;
 return <main style={{maxWidth:760,margin:"36px auto",padding:24}}>
 <h1>Academic review</h1>
 <p>Tell the academic team about an incorrect syllabus, missing subject or curriculum mismatch. Your request stays private to your account. Your PDF is stored privately for review. Submitting it never replaces the verified curriculum for other students.</p>
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
 <label htmlFor="syllabus-pdf">Attach your university syllabus (PDF, optional, up to 10 MB)</label>
 <input id="syllabus-pdf" type="file" accept=".pdf,application/pdf" onChange={e=>setSyllabusFile(e.target.files?.[0]||null)} style={{display:"block",margin:"8px 0 20px"}} />
 <button disabled={busy} type="submit" style={{background:"#243c75",color:"white",border:0,borderRadius:8,padding:"12px 18px"}}>{busy?"Submitting…":"Submit for academic review"}</button>
 </form>
 <p role="status">{message}</p>
 <h2>Your requests</h2>
 {cases.length===0?<p>No requests recorded yet.</p>:<ul>{cases.map(c=><li key={c.id} style={{padding:"12px 0"}}><strong>{c.case_type.replaceAll("_"," ")}</strong> — {c.status.replaceAll("_"," ")}<p>{c.summary}</p><small>{new Date(c.created_at).toLocaleDateString()}</small><div><button type="button" onClick={()=>void openCase(c.id)}>{activeCase===c.id?"Close messages":"View academic messages"}</button></div>
 {activeCase===c.id&&<div style={{padding:14,background:"#f7f9fb",borderRadius:10,marginTop:10}}>{!caseMessages.length?<p>No messages yet.</p>:caseMessages.map(m=><p key={m.id}><strong>{m.sender_role.replaceAll("_"," ")}:</strong> {m.body}</p>)}
 {["pending_review","needs_student"].includes(c.status)&&<><label htmlFor={"academic-reply-"+c.id}>Reply to academic review</label><textarea id={"academic-reply-"+c.id} rows={3} maxLength={8000} value={reply} onChange={e=>setReply(e.target.value)} style={{display:"block",width:"100%",padding:8,margin:"6px 0"}}/><button type="button" disabled={!reply.trim()} onClick={()=>void postReply()}>Send reply</button></>}</div>}
 </li>)}</ul>}
 <Link href="/onboarding">Back to academic profile</Link>
 </main>;
}
