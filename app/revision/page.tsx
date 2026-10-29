"use client";
import {useCallback,useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {supabase} from "../../lib/supabase";
type Unit={id:string;semester:number;subject_code:string;subject_name:string;unit_title:string};
type Inference={id:string;curriculum_unit_id:string;semester:number;subject_code:string;concept:string;finding:string;score:number|null;priority:number;status:string};
type Task={id:string;inference_id:string|null;curriculum_unit_id:string;semester:number;subject_code:string;title:string;activity_type:string;instructions:string;priority:number;status:string;due_at:string};
type Profile={semester:number;curriculum_version_id:string|null};
export default function Revision(){
 const [profile,setProfile]=useState<Profile|null>(null),[semester,setSemester]=useState(1),[units,setUnits]=useState<Unit[]>([]),[inferences,setInferences]=useState<Inference[]>([]),[tasks,setTasks]=useState<Task[]>([]),[minutes,setMinutes]=useState(30),[examDate,setExamDate]=useState(""),[subject,setSubject]=useState("all"),[busy,setBusy]=useState(false),[message,setMessage]=useState("Loading your revision workspace…");
 const load=useCallback(async(sem:number,version:string)=>{
  if(!supabase)return;
  const [u,i,t,p]=await Promise.all([
   supabase.from("curriculum_units").select("id,semester,subject_code,subject_name,unit_title").eq("curriculum_version_id",version).eq("semester",sem).order("subject_code").order("unit_number"),
   supabase.from("revision_inferences").select("id,curriculum_unit_id,semester,subject_code,concept,finding,score,priority,status").eq("semester",sem).order("created_at",{ascending:false}),
   supabase.from("revision_tasks").select("id,inference_id,curriculum_unit_id,semester,subject_code,title,activity_type,instructions,priority,status,due_at").eq("semester",sem).order("priority",{ascending:false}).order("due_at"),
   supabase.from("revision_preferences").select("minutes_per_day,exam_date").eq("semester",sem).maybeSingle()
  ]);
  if(u.error||i.error||t.error){setMessage(u.error?.message||i.error?.message||t.error?.message||"Unable to load revision");return}
  setUnits((u.data||[]) as Unit[]);setInferences((i.data||[]) as Inference[]);setTasks((t.data||[]) as Task[]);
  setMinutes(p.data?.minutes_per_day||30);setExamDate(p.data?.exam_date||"");
  setMessage(!u.data?.length?"This semester does not yet have an assigned syllabus. Request academic verification before generating a plan.":"Revision workspace ready.");
 },[]);
 useEffect(()=>{let active=true;(async()=>{if(!supabase){setMessage("Database unavailable");return}const {data:{user}}=await supabase.auth.getUser();if(!active)return;if(!user){setMessage("Sign in to open your personal revision workspace.");return}const {data,error}=await supabase.from("student_profiles").select("semester,curriculum_version_id").eq("user_id",user.id).maybeSingle();if(!active)return;if(error||!data){setMessage("Complete your academic profile before revision.");return}setProfile(data as Profile);setSemester(data.semester||1);if(data.curriculum_version_id)await load(data.semester||1,data.curriculum_version_id);else setMessage("A verified curriculum must be assigned before personalised revision can begin.")})();return()=>{active=false}},[load]);
 async function api(body:Record<string,unknown>){if(!supabase)throw new Error("Database unavailable");const {data:{session}}=await supabase.auth.getSession();if(!session)throw new Error("Sign in required");const r=await fetch("/api/revision",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+session.access_token},body:JSON.stringify(body)});const json=await r.json();if(!r.ok)throw new Error(json.error||"Revision unavailable");return json}
 async function refresh(){if(!profile?.curriculum_version_id)return;setBusy(true);try{const result=await api({action:"refresh",semester});await load(semester,profile.curriculum_version_id);setMessage(result.message)}catch(e){setMessage(e instanceof Error?e.message:"Unable to refresh revision")}finally{setBusy(false)}}
 async function complete(taskId:string){if(!profile?.curriculum_version_id)return;setBusy(true);try{await api({action:"complete",taskId});await load(semester,profile.curriculum_version_id);setMessage("Activity completed. Take an assessed question to verify improvement.")}catch(e){setMessage(e instanceof Error?e.message:"Unable to save progress")}finally{setBusy(false)}}
 async function savePreferences(){if(!supabase)return;setBusy(true);const {data:{user}}=await supabase.auth.getUser();if(!user){setMessage("Sign in required");setBusy(false);return}const {error}=await supabase.from("revision_preferences").upsert({user_id:user.id,semester,minutes_per_day:minutes,exam_date:examDate||null},{onConflict:"user_id,semester"});setMessage(error?error.message:"Revision preferences saved.");setBusy(false)}
 const subjects=useMemo(()=>Array.from(new Map(units.map(u=>[u.subject_code,u.subject_name])).entries()),[units]);
 const filtered=tasks.filter(t=>subject==="all"||t.subject_code===subject);
 const pending=filtered.filter(t=>t.status==="pending"),done=filtered.filter(t=>t.status==="completed");
 const relevant=inferences.filter(i=>subject==="all"||i.subject_code===subject);
 const unitName=(id:string)=>units.find(u=>u.id===id)?.unit_title||"Unit";
 return <main className="shell" style={{maxWidth:1080,paddingTop:28,paddingBottom:48}}>
 <div className="eyebrow">PERSONAL REVISION AGENT · PUBLIC BETA</div><h1 style={{fontSize:"clamp(1.9rem,4vw,2.8rem)",margin:"8px 0"}}>Your semester revision</h1>
 <p className="muted">Your Examiner findings and learning progress inform a private, evolving revision plan. Previous semesters remain available for backlog revision. Scores are indicative, not verified legal advice.</p>
 {!profile&&<p role="status">{message} <Link href="/onboarding">Academic profile →</Link></p>}
 {profile&&<><div className="card" style={{display:"flex",gap:16,flexWrap:"wrap",alignItems:"end",margin:"18px 0"}}>
 <label>Semester <select value={semester} onChange={e=>{const n=Number(e.target.value);setSemester(n);setSubject("all");if(profile.curriculum_version_id)void load(n,profile.curriculum_version_id)}}>{Array.from({length:profile.semester||1},(_,i)=><option key={i+1} value={i+1}>Semester {i+1}</option>)}</select></label>
 <label>Subject <select value={subject} onChange={e=>setSubject(e.target.value)}><option value="all">All subjects</option>{subjects.map(([code,name])=><option key={code} value={code}>{name}</option>)}</select></label>
 <label>Daily revision <select value={minutes} onChange={e=>setMinutes(Number(e.target.value))}>{[15,30,45,60,90,120].map(n=><option key={n} value={n}>{n} minutes</option>)}</select></label>
 <label>Exam date <input type="date" value={examDate} onChange={e=>setExamDate(e.target.value)}/></label>
 <button className="btn btn-secondary" disabled={busy} onClick={savePreferences}>Save preferences</button>
 <button className="btn btn-primary" disabled={busy||!units.length} onClick={refresh}>{busy?"Working…":"Update my revision plan"}</button></div>
 <p role="status">{message}</p>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,margin:"18px 0"}}>
 <div className="card"><strong>{pending.length}</strong><p className="muted">Activities to revise</p></div>
 <div className="card"><strong>{relevant.filter(x=>x.status==="open").length}</strong><p className="muted">Examiner focus areas</p></div>
 <div className="card"><strong>{done.length}</strong><p className="muted">Activities completed</p></div></div>
 <h2>Priority revision activities</h2>
 {!pending.length&&<div className="card"><p>No pending activities for this selection. If you're new, take a <Link href="/study">Study assessment</Link> first and refresh your plan.</p></div>}
 <div style={{display:"grid",gap:12}}>{pending.map(t=><article className="card" key={t.id} style={{padding:18}}>
 <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><strong>{t.title}</strong><span className="tag">Priority {t.priority===3?"high":t.priority===2?"medium":"standard"}</span></div>
 <p className="muted" style={{margin:"5px 0"}}>{unitName(t.curriculum_unit_id)} · {t.activity_type.replaceAll("_"," ")} · Due {new Date(t.due_at).toLocaleDateString()}</p>
 <p>{t.instructions}</p><div className="actions" style={{marginTop:10}}><Link className="btn btn-secondary" href="/study">Open Study / Examiner →</Link><button className="btn btn-primary" disabled={busy} onClick={()=>complete(t.id)}>Mark activity done</button></div>
 </article>)}</div>
 <h2 style={{marginTop:28}}>Examiner inferences</h2>
 {!relevant.length?<p className="muted">No assessed weaknesses recorded yet. Your first assessed response will establish a personalised baseline.</p>:<div style={{display:"grid",gap:10}}>{relevant.slice(0,30).map(i=><article className="card" key={i.id} style={{padding:16}}><strong>{i.concept}</strong> · <span>{i.status}</span><p className="muted" style={{margin:"6px 0"}}>{unitName(i.curriculum_unit_id)}{i.score!==null?" · Examiner "+i.score+"/10":""}</p><p style={{margin:0}}>{i.finding}</p></article>)}</div>}
 <p style={{marginTop:20}}><Link href="/exam-readiness">View exam readiness →</Link> · <Link href="/mock-exam">Take a mock exam →</Link></p>
 </>}</main>;
}
