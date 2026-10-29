"use client";
import {useCallback,useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {supabase} from "../../lib/supabase";
type Paper={paper_code:string;subject_name:string;paper_type:string;elective_group:string|null;source_page_start:number;source_page_end:number;source_discrepancy:string|null};
type Unit={id:string;subject_code:string;subject_name:string;unit_number:number;unit_title:string;outline:string|null};
type Curriculum={currentSemester:number;selectedSemester:number;version:{id:string;label:string};papers:Paper[];units:Unit[];choices:string[]};
export default function SemesterWorkspace(){
 const [semester,setSemester]=useState(0),[data,setData]=useState<Curriculum|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState("Loading your university syllabus…");
 const load=useCallback(async(sem:number)=>{
  if(!supabase){setMessage("Academic database is unavailable");return}
  const {data:{session}}=await supabase.auth.getSession();
  if(!session){setMessage("Sign in to access your personal syllabus");return}
  try{
   const r=await fetch("/api/curriculum/context"+(sem?"?semester="+sem:""),{headers:{Authorization:"Bearer "+session.access_token}});
   const result=await r.json();
   if(!r.ok){setMessage(result.error||"Curriculum unavailable");setData(null);return}
   setData(result as Curriculum);setSemester(result.selectedSemester);setMessage("");
  }catch{setMessage("Could not reach the academic curriculum service");}
 },[]);
 useEffect(()=>{void load(0)},[load]);
 const choices=useMemo(()=>new Set(data?.choices||[]),[data?.choices]);
 async function change(paper:Paper){
  if(!supabase||!data)return;
  setBusy(true);setMessage("");
  const {data:{session}}=await supabase.auth.getSession();
  if(!session){setMessage("Sign in again");setBusy(false);return}
  const action=choices.has(paper.paper_code)?"remove":"choose";
  try{
   const r=await fetch("/api/curriculum/context",{method:"POST",headers:{Authorization:"Bearer "+session.access_token,"Content-Type":"application/json"},body:JSON.stringify({semester:data.selectedSemester,paperCode:paper.paper_code,action})});
   const response=await r.json();
   if(!r.ok)setMessage(response.error||"Unable to save your elective");
   else await load(data.selectedSemester);
  }catch{setMessage("Could not update elective");}
  setBusy(false);
 }
 return <main className="shell" style={{maxWidth:1050,paddingTop:22,paddingBottom:60}}>
  <div className="eyebrow">Five-year BA LL.B. · Academic workspace</div>
  <h1>Your semester syllabus</h1>
  <p className="muted">Your starting semester comes from your academic profile. All subject agents use your assigned curriculum version, not an assumed first-year syllabus.</p>
  <p role="status">{message}</p>
  {!data&&<p><Link href="/onboarding">Complete academic profile or request review →</Link></p>}
  {data&&<>
   <section className="card" style={{marginBottom:18}}>
    <label htmlFor="semester-selection">Browse semester</label>
    <select id="semester-selection" value={semester} onChange={e=>void load(Number(e.target.value))} style={{display:"block",maxWidth:380,width:"100%",padding:11,marginTop:8}}>
     {Array.from({length:10},(_,i)=><option key={i+1} value={i+1}>Semester {i+1}{data.currentSemester===i+1?" · Your current semester":""}</option>)}
    </select>
    <p style={{marginBottom:0,fontSize:13}}>Currently enrolled: Semester {data.currentSemester}. Curriculum: {data.version.label}. Future semesters are available for reference, not automatically added to your study plan.</p>
   </section>
   <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:22}}>
    <Link className="btn btn-primary" href="/tutor">AI Professor</Link>
    <Link className="btn" href="/study">Cornell Notes & Progress</Link>
    <Link className="btn" href="/mock-exam">AI Examiner</Link>
    <Link className="btn" href="/revision">Personal Revision</Link>
   </div>
   {data.papers.filter(p=>p.paper_type!=="elective_catalogue").map(p=>{
    const elective=p.paper_type==="elective_option",chosen=choices.has(p.paper_code);
    const active=!elective||chosen;
    const units=data.units.filter(u=>u.subject_code===p.paper_code);
    return <section key={p.paper_code} className="card" style={{marginBottom:14,borderLeft:active?"4px solid #6e9a8c":"4px solid #cbd5e1"}}>
     <div className="eyebrow">{p.paper_type.replaceAll("_"," ")} · {p.paper_code}</div>
     <h2 style={{margin:"6px 0"}}>{p.subject_name}</h2>
     {p.source_discrepancy&&<p style={{color:"#8b4c1c",fontSize:13}}>Source discrepancy on page {p.source_page_start}; academic cross-check required. The programme schedule and detailed header differ.</p>}
     {elective&&<button type="button" disabled={busy||data.selectedSemester>data.currentSemester} className={chosen?"btn":"btn btn-primary"} onClick={()=>void change(p)} style={{margin:"8px 0"}}>{chosen?"Remove selected elective":"Choose this elective"}</button>}
     {!active&&<p className="muted">Optional elective. Its four units become active in your Professor, Examiner and Revision workspace when chosen.</p>}
     {active&&<ol style={{paddingLeft:20,marginBottom:4}}>{units.map(u=><li key={u.id} style={{marginBottom:7}}>{p.paper_type==="practical"?"Practical support": "Unit "+u.unit_number}: {u.unit_title}</li>)}</ol>}
     <p style={{fontSize:12,margin:"12px 0 0",opacity:0.7}}>Source PDF pp. {p.source_page_start}–{p.source_page_end}</p>
    </section>;
   })}
   {data.selectedSemester===9&&<p>Semester 9: choose any three elective subjects from the catalogue. Selections stay linked to your own account.</p>}
   <p><Link href="/academic-review">Report a syllabus mismatch to Academic Review →</Link> · <Link href="/onboarding">Change your academic profile →</Link></p>
  </>}
 </main>
}
