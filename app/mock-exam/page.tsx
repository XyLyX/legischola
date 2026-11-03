"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import Link from "next/link";
import {supabase} from "../../lib/supabase";
import {DME_REFERENCE_PATTERN,examWordCount,findPaperReference,isReferencePatternPaper,type PracticeQuestion} from "../../lib/exam-paper-reference";
import type {ExaminerPlan,ExaminerPurpose,ExaminerLevel,ExaminerSkill} from "../../lib/examiner-planner";

type Unit={id:string;subject_code:string;subject_name:string;unit_title:string};
type Exam={
 id:string;subject_name:string;duration_minutes:number;started_at:string;status:string;semester?:number;
 questions:PracticeQuestion[];answers?:Record<string,string>;total_score?:number|null;
 max_score?:number|null;report?:string|null;submitted_at?:string|null;
};
type Grade={index:number;score:number;max?:number;feedback:string;weakConcepts:string[]};
type Response={
 error?:string;exam?:Exam;saved?:boolean;savedAt?:string;plan?:ExaminerPlan;
 total?:number;max?:number;summary?:string;results?:Grade[];
};
const DEFAULT_SELECTED=[0,1,2,4,5,6];
const readSelection=(item:Exam)=>{
 if(!isReferencePatternPaper(item.questions))return item.questions.map((_,i)=>i);
 try{
  const saved=JSON.parse(item.answers?._selected||"null");
  if(Array.isArray(saved)&&saved.length===6&&saved.every((n:unknown)=>Number.isInteger(n)))
   return saved as number[];
 }catch{}
 return [...DEFAULT_SELECTED];
};

export default function MockExam(){
 const [subjects,setSubjects]=useState<Unit[]>([]);
 const [subject,setSubject]=useState("");
 const [duration,setDuration]=useState(20);
 const [format,setFormat]=useState<"standard"|"adaptive"|"dme_reference">("adaptive");
 const [semester,setSemester]=useState(0);
 const [currentSemester,setCurrentSemester]=useState(1);
 const [curriculumUnits,setCurriculumUnits]=useState<Unit[]>([]);
 const [focusUnitId,setFocusUnitId]=useState("");
 const [purpose,setPurpose]=useState<ExaminerPurpose>("exam_readiness");
 const [level,setLevel]=useState<ExaminerLevel>("adaptive");
 const [skill,setSkill]=useState<ExaminerSkill>("mixed");
 const [plan,setPlan]=useState<ExaminerPlan|null>(null);
 const [planLoading,setPlanLoading]=useState(false);
 const [planIssue,setPlanIssue]=useState("");
 const [planRefresh,setPlanRefresh]=useState(0);
 const [exam,setExam]=useState<Exam|null>(null);
 const [answers,setAnswers]=useState<Record<string,string>>({});
 const [selected,setSelected]=useState<number[]>(DEFAULT_SELECTED);
 const [grades,setGrades]=useState<Grade[]>([]);
 const [summary,setSummary]=useState("");
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [now,setNow]=useState(Date.now());
 const [history,setHistory]=useState<Exam[]>([]);
 const [savedAt,setSavedAt]=useState<string|null>(null);
 const [saving,setSaving]=useState(false);
 const savingRef=useRef(false);
 const snapshot=useRef({exam:null as Exam|null,answers:{} as Record<string,string>,selected:DEFAULT_SELECTED});
 snapshot.current={exam,answers,selected};

 useEffect(()=>{const id=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(id)},[]);
 useEffect(()=>{
  let live=true;
  (async()=>{
   if(!supabase){if(live)setError("Authentication service unavailable");return;}
   const {data:{user}}=await supabase.auth.getUser();
   if(!user){if(live)setError("Sign in to take a mock examination");return;}
   const {data:{session}}=await supabase.auth.getSession();
   if(!session){if(live)setError("Sign in again");return;}
   try{
    const response=await fetch("/api/curriculum/context",{headers:{Authorization:"Bearer "+session.access_token}});
    const curriculum=await response.json();
    if(!response.ok)throw Error(curriculum.error||"Curriculum awaiting academic verification");
    const eligible=new Set((curriculum.papers||[]).filter((x:{paper_type:string})=>
     x.paper_type==="taught"||x.paper_type==="elective_option").map((x:{paper_code:string})=>x.paper_code));
    const units=(curriculum.units as Unit[]).filter(u=>eligible.has(u.subject_code));
    const unique=Array.from(new Map(units.map(u=>[u.subject_code,u])).values());
    const {data:exams}=await supabase.from("mock_exams")
     .select("id,semester,subject_name,duration_minutes,started_at,status,questions,answers,total_score,max_score,report,submitted_at")
     .eq("user_id",user.id).order("started_at",{ascending:false}).limit(15);
    if(live){
     setCurrentSemester(curriculum.currentSemester||1);
     setSemester(curriculum.selectedSemester||curriculum.currentSemester||1);
     setCurriculumUnits(units);
     setSubjects(unique);
     setSubject(unique[0]?.subject_code||"");
     setFormat("adaptive");
     setHistory((exams||[]) as Exam[]);
    }
   }catch(e){if(live)setError(e instanceof Error?e.message:"Mock exam setup unavailable")}
  })();
  return()=>{live=false};
 },[]);

 // Changing semester re-checks verified curriculum and elective eligibility.
 useEffect(()=>{
  if(!semester||!supabase)return;
  let live=true;
  (async()=>{
   try{
    const {data:{session}}=await supabase!.auth.getSession();
    if(!session)throw Error("Sign in to select a semester");
    const response=await fetch("/api/curriculum/context?semester="+semester,{
     headers:{Authorization:"Bearer "+session.access_token},cache:"no-store"});
    const curriculum=await response.json();
    if(!response.ok)throw Error(curriculum.error||"Semester curriculum unavailable");
    const eligible=new Set((curriculum.papers||[]).filter((p:{paper_type:string})=>
     p.paper_type==="taught"||p.paper_type==="elective_option")
     .map((p:{paper_code:string})=>p.paper_code));
    const units=(curriculum.units as Unit[]).filter(u=>eligible.has(u.subject_code));
    const subjects=Array.from(new Map(units.map(u=>[u.subject_code,u])).values());
    if(live){
     setCurriculumUnits(units);setSubjects(subjects);
     setSubject(prev=>subjects.some(s=>s.subject_code===prev)?prev:subjects[0]?.subject_code||"");
     setFocusUnitId("");setPlan(null);setPlanIssue("");
    }
   }catch(e){if(live){setPlan(null);setPlanIssue(e instanceof Error?e.message:"Semester syllabus unavailable")}}
  })();
  return()=>{live=false};
 },[semester]);

 // Read-only Examiner preview: no AI call or arbitrary claimed mastery.
 useEffect(()=>{
  if(!semester||!subject||!supabase)return;
  let live=true;setPlanLoading(true);setPlan(null);setPlanIssue("");
  (async()=>{
   try{
    const {data:{session}}=await supabase!.auth.getSession();
    if(!session)throw Error("Sign in to see your individual exam plan");
    const response=await fetch("/api/mock-exam",{method:"POST",cache:"no-store",headers:{
     "content-type":"application/json",Authorization:"Bearer "+session.access_token
    },body:JSON.stringify({mode:"plan",semester,subjectCode:subject,purpose,
      focusUnitId:focusUnitId||null})});
    const data:Response=await response.json();
    if(!response.ok)throw Error(data.error||"Unable to read recorded examination evidence");
    if(live)setPlan(data.plan||null);
   }catch(e){if(live)setPlanIssue(e instanceof Error?e.message:"No examiner plan available")}
   finally{if(live)setPlanLoading(false)}
  })();
  return()=>{live=false};
 },[semester,subject,purpose,focusUnitId,planRefresh]);
 
 const selectedSubject=subjects.find(u=>u.subject_code===subject);
 const reference=useMemo(()=>{const p=findPaperReference(subject,selectedSubject?.subject_name||"");return p&&p.semester===semester?p:null},[subject,selectedSubject?.subject_name,semester]);
 const patterned=exam?isReferencePatternPaper(exam.questions):false;
 const submitted=exam?.status==="submitted";
 const remaining=exam?Math.max(0,Math.ceil((new Date(exam.started_at).getTime()+exam.duration_minutes*60000-now)/1000)):0;
 const chosenA=selected.filter(i=>i<4).length;
 const chosenB=selected.filter(i=>i>=4&&i<8).length;
 const ready= !patterned||(chosenA===3&&chosenB===3);

 async function authRequest(body:Record<string,unknown>):Promise<Response>{
  if(!supabase)throw Error("Authentication unavailable");
  const {data:{session}}=await supabase.auth.getSession();
  if(!session)throw Error("Sign in required");
  const response=await fetch("/api/mock-exam",{method:"POST",headers:{
    "Content-Type":"application/json",Authorization:"Bearer "+session.access_token
   },body:JSON.stringify(body),cache:"no-store"});
  const raw=await response.text();
  let result:Response;
  try{result=JSON.parse(raw)}catch{throw Error("Mock exam service returned HTTP "+response.status)}
  if(!response.ok)throw Error(result.error||"Examination service unavailable");
  return result;
 }

 async function saveDraft(showNotice:boolean){
  if(savingRef.current)return;
  const data=snapshot.current;
  if(!data.exam||data.exam.status!=="in_progress"||
   Date.now()>new Date(data.exam.started_at).getTime()+data.exam.duration_minutes*60000)return;
  savingRef.current=true;
  if(showNotice)setSaving(true);
  try{
   const r=await authRequest({mode:"save",examId:data.exam.id,
    selectedIndices:isReferencePatternPaper(data.exam.questions)?data.selected:undefined,
    answers:Object.fromEntries(data.exam.questions.map((_,i)=>[String(i),data.answers[String(i)]||""]))});
   if(r.saved)setSavedAt(r.savedAt||new Date().toISOString());
  }catch(e){if(showNotice)setError(e instanceof Error?e.message:"Draft could not be saved")}
  finally{savingRef.current=false;if(showNotice)setSaving(false)}
 }

 useEffect(()=>{
  const timer=setInterval(()=>{
   const current=snapshot.current.exam;
   if(current?.status==="in_progress")void saveDraft(false);
  },30000);
  return()=>clearInterval(timer);
 },[]);

 async function request(mode:"start"|"submit"){
  if(busy)return;
  setBusy(true);setError("");
  try{
   const s=snapshot.current;
   const payload=mode==="start"?
    {mode:"start",semester,subjectCode:subject,format,durationMinutes:format===DME_REFERENCE_PATTERN?90:duration,
     purpose,level,skill,focusUnitId:focusUnitId||null}:
    {mode:"submit",examId:s.exam?.id,selectedIndices:isReferencePatternPaper(s.exam?.questions||[])?s.selected:undefined,
     answers:Object.fromEntries((s.exam?.questions||[]).map((_,i)=>[String(i),s.answers[String(i)]||""]))};
   const result=await authRequest(payload);
   if(mode==="start"&&result.exam){
    setExam(result.exam);setAnswers({});setGrades([]);setSummary("");setSavedAt(null);
    setSelected(readSelection(result.exam));setHistory(h=>[result.exam!,...h]);
   }else if(mode==="submit"){
    setGrades(result.results||[]);setSummary(result.summary||"");setPlanRefresh(v=>v+1);
    setExam(e=>e?{...e,status:"submitted",total_score:result.total,max_score:result.max,report:result.summary}:e);
    setHistory(h=>h.map(x=>x.id===s.exam?.id?{...x,status:"submitted",total_score:result.total,max_score:result.max,report:result.summary}:x));
    if(supabase){
     const {data:{session}}=await supabase.auth.getSession();
     if(session){
      const {data:profile}=await supabase.from("student_profiles").select("semester").eq("user_id",session.user.id).maybeSingle();
      if(profile?.semester){
       const revision=await fetch("/api/revision",{method:"POST",headers:{
         Authorization:"Bearer "+session.access_token,"Content-Type":"application/json"
        },body:JSON.stringify({action:"refresh",semester:s.exam?.semester||profile.semester})});
       if(!revision.ok)setError("Exam graded; revision update pending. Open Revision to refresh your learning tasks.");
      }
     }
    }
   }
  }catch(e){setError(e instanceof Error?e.message:"Exam request failed")}
  finally{setBusy(false)}
 }

 function openPrevious(item:Exam){
  setExam(item);setAnswers(item.answers||{});setSelected(readSelection(item));
  setSummary(item.report||"");setGrades([]);setSavedAt(null);setError("");
 }
 function toggleQuestion(i:number){
  if(!patterned||remaining===0||submitted)return;
  setSelected(prev=>{
   if(prev.includes(i))return prev.filter(x=>x!==i);
   const same=prev.filter(x=>(x<4)===(i<4)).length;
   if(same>=3)return prev;
   return [...prev,i].sort((a,b)=>a-b);
  });
 }

 return <main className="shell" style={{maxWidth:1000,paddingTop:18,paddingBottom:60}}>
  <h1 style={{fontSize:"1.8rem"}}>Your AI Examiner</h1>
  <p className="muted">Prepare before the actual college examination. These are original AI-generated formative practice questions aligned to your assigned verified syllabus; past papers provide format and skills evidence, not future-question predictions or official university marks.</p>
  {error&&<p role="alert" style={{color:"#9a3412"}}>{error}</p>}
  {!exam?<section className="card">
   <div className="eyebrow">YOUR PERSONAL EXAMINER AGENT</div>
   <h2 style={{marginTop:8}}>Prepare me for an exam</h2>
   <p className="muted">Choose what you want to test. Examiner checks your own recorded answers, revision priorities and learning trend before creating new questions. First-time students start with a diagnostic baseline.</p>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(225px,1fr))",gap:16}}>
    <label>1. Which semester?
     <select value={semester||""} onChange={e=>{setSemester(Number(e.target.value));setFocusUnitId("");setFormat("adaptive");}}
      style={{display:"block",width:"100%",padding:12,marginTop:7}}>
      {Array.from({length:currentSemester},(_,i)=>i+1).map(n=>
       <option key={n} value={n}>Semester {n}{n===currentSemester?" (current)":""}</option>)}
     </select>
    </label>
    <label>2. Which subject?
     <select value={subject} onChange={e=>{
      const code=e.target.value;setSubject(code);setFocusUnitId("");
      if(format===DME_REFERENCE_PATTERN&&!findPaperReference(code,subjects.find(x=>x.subject_code===code)?.subject_name||""))
       setFormat("adaptive");
     }} style={{display:"block",width:"100%",padding:12,marginTop:7}}>
      {subjects.map(u=><option key={u.subject_code} value={u.subject_code}>{u.subject_name}</option>)}
     </select>
    </label>
    <label>3. What should Examiner help with?
     <select value={purpose} onChange={e=>setPurpose(e.target.value as ExaminerPurpose)}
      style={{display:"block",width:"100%",padding:12,marginTop:7}}>
      <option value="diagnostic">Find my current level — diagnostic</option>
      <option value="improve_weaknesses">Test my weak areas and improvement</option>
      <option value="exam_readiness">Prepare me for my next exam</option>
     </select>
    </label>
    <label>4. Topic coverage
     <select value={focusUnitId} onChange={e=>setFocusUnitId(e.target.value)}
      style={{display:"block",width:"100%",padding:12,marginTop:7}}>
      <option value="">All syllabus units — Examiner chooses priorities</option>
      {curriculumUnits.filter(u=>u.subject_code===subject).map(u=>
       <option key={u.id} value={u.id}>{u.unit_title}</option>)}
     </select>
    </label>
    <label>5. Question difficulty
     <select value={level} onChange={e=>setLevel(e.target.value as ExaminerLevel)}
      style={{display:"block",width:"100%",padding:12,marginTop:7}}>
      <option value="adaptive">Adaptive — based on my recorded performance</option>
      <option value="foundation">Foundation — reinforce basics</option>
      <option value="standard">Standard — semester-level understanding</option>
      <option value="challenge">Challenge — deeper application</option>
     </select>
    </label>
    <label>6. Skill to test
     <select value={skill} onChange={e=>setSkill(e.target.value as ExaminerSkill)}
      style={{display:"block",width:"100%",padding:12,marginTop:7}}>
      <option value="mixed">Mixed knowledge and reasoning</option>
      <option value="recall">Definitions and recall</option>
      <option value="comparison">Comparison of theories and concepts</option>
      <option value="critical_analysis">Critical analysis and evaluation</option>
      <option value="application">Application to new situations</option>
      <option value="legal_reasoning">Legal reasoning and analysis</option>
     </select>
    </label>
    <label>7. Examination format
     <select value={format} onChange={e=>{
      const value=e.target.value as "standard"|"adaptive"|"dme_reference";
      setFormat(value);if(value!=="adaptive"&&duration===10)setDuration(20);
     }} style={{display:"block",width:"100%",padding:12,marginTop:7}}>
      <option value="adaptive">Personalised topic-wise skills test</option>
      <option value="standard">Quick general mock — 20–45 min</option>
      {reference&&<option value={DME_REFERENCE_PATTERN}>DME-inspired 2026 internal format — 90 min / 30 marks</option>}
     </select>
    </label>
    {format!==DME_REFERENCE_PATTERN&&<label>8. Time allowed
     <select value={duration} onChange={e=>setDuration(Number(e.target.value))}
      style={{display:"block",width:"100%",padding:12,marginTop:7}}>
      {format==="adaptive"&&<option value={10}>10-minute topic check</option>}
      <option value={20}>20 minutes</option>
      <option value={30}>30 minutes</option>
      <option value={45}>45 minutes</option>
     </select>
    </label>}
   </div>
   {format===DME_REFERENCE_PATTERN&&reference&&<p className="muted" style={{marginTop:15}}>
    This is a 90-minute formative simulation inspired by the de-identified 2026 {reference.subject} paper: Section A offers four 3-mark questions (answer three), and Section B offers four 7-mark questions (answer three). All generated questions are original and must remain inside your verified syllabus.
   </p>}
   <section className="card" aria-live="polite" style={{background:"#f8fafc",margin:"20px 0",padding:18}}>
    <h3 style={{marginTop:0}}>Examiner's assessment of your current evidence</h3>
    {planLoading?<p>Checking your recorded learning evidence…</p>:planIssue?<p role="alert">{planIssue}</p>:
     !plan?<p>No learning profile is available for this selection.</p>:<>
      <p><strong>{plan.baseline==="first_diagnostic"?"New or unassessed student — baseline diagnostic":"Returning learner — personalised using saved results"}</strong></p>
      <p>{plan.notice}</p>
      <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
       <div><strong>{plan.coverage.assessed}/{plan.coverage.total}</strong> topics assessed</div>
       <div><strong>{plan.averageLatest===null?"No evidence":plan.averageLatest+"/10"}</strong> latest-unit score average</div>
       <div><strong>{plan.trendOnRepeatedUnits===null?"Not enough repeat tests":
        (plan.trendOnRepeatedUnits>0?"+":"")+plan.trendOnRepeatedUnits+" points"}</strong> repeated-topic score change</div>
      </div>
      {plan.units.length>0&&<div style={{marginTop:16}}>
       <strong>Suggested topic priorities</strong>
       {plan.units.slice(0,5).map(u=><div key={u.unitId}
        style={{display:"flex",gap:10,justifyContent:"space-between",flexWrap:"wrap",borderTop:"1px solid #e2e8f0",padding:"9px 0"}}>
        <span>{u.unitTitle}{u.due?" · Revision due":""}</span>
        <span className="muted">{u.latestScore===null?"Unassessed":u.latestScore+"/10"}
         {" · "}{u.recommendedLevel}{" · "}{u.attempts} attempt{u.attempts===1?"":"s"}</span>
       </div>)}
      </div>}
      <p className="muted" style={{fontSize:13,marginBottom:0}}>These are formative AI scores and topic-level trends, not official grades. Lack of past evidence is not treated as failure. The next completed test updates these priorities.</p>
     </>}
   </section>
   <button className="btn btn-primary" type="button" disabled={busy||!subject||!semester||planLoading||!plan}
    onClick={()=>void request("start")}>{busy?"Examiner is preparing your paper…":"Generate my personalised test"}</button>
   {subjects.length===0&&<p className="muted">Complete onboarding and select a published semester curriculum before starting the examiner.</p>}
  </section>:<section className="card">
   <h2>{exam.subject_name}</h2>
   {exam.questions[0]?.examinerPurpose&&<p className="muted">Examiner mode: {exam.questions[0].examinerPurpose.replaceAll("_"," ")} · Difficulty: {exam.questions[0].difficulty} · Skill: {exam.questions[0].examinerSkill?.replaceAll("_"," ")} · Evidence: {exam.questions[0].evidenceBasis==="first_diagnostic"?"first diagnostic baseline":"previous attempts and revision"}</p>}
   <p>{patterned
     ?"Real-paper-inspired practice · 90 minutes · 30 total marks · six answers out of eight options"
     :`${exam.questions.length} questions · ${exam.duration_minutes} minutes · 10 marks per question`}</p>
   {patterned&&<p className="muted">Modelled on an archived 2026 DME paper, not an official examination or an expected question list. Choose exactly three questions in each section.</p>}
   {!submitted&&<div style={{display:"flex",gap:14,alignItems:"center",flexWrap:"wrap",marginBottom:18}}>
    <p role="timer"><strong>Time remaining: {Math.floor(remaining/60)}:{String(remaining%60).padStart(2,"0")}</strong>{remaining===0?" · Time elapsed; submit now.":""}</p>
    <button className="btn btn-secondary" type="button" disabled={saving||busy||remaining===0}
     onClick={()=>void saveDraft(true)}>{saving?"Saving…":"Save draft"}</button>
    <small className="muted">{savedAt?"Last saved "+new Date(savedAt).toLocaleTimeString():"Auto-saves every 30 seconds while time remains"}</small>
   </div>}
   {exam.questions.map((q,i)=>{
    const checked=!patterned||selected.includes(i);
    const marks=grades.find(g=>g.index===i);
    return <div key={i} style={{borderTop:"1px solid #d5dce3",paddingTop:17,marginTop:17}}>
     {patterned&&(i===0||i===4)&&<div style={{background:"#f1f5f9",padding:"12px 14px",borderRadius:9,margin:"0 0 15px"}}>
      <h3 style={{margin:0}}>Section {i===0?"A — short answers":"B — long answers"}</h3>
      <p className="muted" style={{margin:"5px 0 0"}}>Attempt any three of four · {i===0?"3 marks and around 100 words each":"7 marks and around 200 words each"} · Selected: {i===0?chosenA:chosenB}/3</p>
     </div>}
     <h3 style={{margin:"0 0 8px"}}>Question {patterned?(i%4+1):i+1} · {q.marks} marks</h3>
     {q.unitTitle&&<p className="muted" style={{fontSize:13}}>Syllabus topic: {q.unitTitle}{q.difficulty?" · "+q.difficulty+" level":""}</p>}
     {patterned&&<label style={{display:"flex",alignItems:"center",gap:10,margin:"4px 0 10px"}}>
      <input type="checkbox" checked={checked} disabled={submitted||remaining===0||busy||
       (!checked&&(i<4?chosenA:chosenB)>=3)}
       onChange={()=>toggleQuestion(i)}/>
      Attempt this question
     </label>}
     <p>{q.question}</p>
     <textarea aria-label={"Answer to question "+(i+1)} disabled={!checked||submitted||remaining===0||busy}
      value={answers[String(i)]||""} onChange={e=>setAnswers(a=>({...a,[String(i)]:e.target.value}))}
      maxLength={8000} style={{width:"100%",minHeight:140,padding:12}}
      placeholder={checked?"Write your own timed answer…":"Select this question to answer it."}/>
     {patterned&&<p className="muted" style={{fontSize:13}}>
      {examWordCount(answers[String(i)]||"")} words · {q.wordLimit} word {q.section==="B"?"practice target":"source limit/target"}
      {q.section==="B"&&exam.subject_name.toLowerCase().startsWith("english")?
       " (English source did not print a long-answer word cap).":""}
     </p>}
     {marks&&<p><strong>Indicative score: {marks.score}/{marks.max||10}.</strong> {marks.feedback}
      {marks.weakConcepts?.length>0&&<span className="muted"> · Review: {marks.weakConcepts.join(", ")}</span>}</p>}
    </div>;
   })}
   {!submitted?
    <div style={{marginTop:22}}>
     {patterned&&<p className="muted">Choose exactly three questions from each section. Unanswered selected questions score zero; unselected questions are excluded from the 30 marks.</p>}
     <button className="btn btn-primary" disabled={busy||!ready} onClick={()=>void request("submit")}>
      {busy?"Submitting and evaluating…":"Submit practice examination for feedback"}
     </button>
    </div>
   :<>
    <h2 style={{marginTop:25}}>Pre-exam readiness report</h2>
    <p><strong>{exam.total_score===null||exam.total_score===undefined?"Grading pending":exam.total_score+"/"+exam.max_score}</strong> — indicative AI-estimated practice marks, not official or predicted college grades.</p>
    <p>{summary||"Submitted answers are saved. If grading was interrupted, use Retry grading."}</p>
    {(exam.total_score===null||exam.total_score===undefined)&&
     <button type="button" className="btn btn-secondary" disabled={busy} onClick={()=>void request("submit")}>
      {busy?"Grading…":"Retry grading saved answers"}
     </button>}
    <p><Link href="/revision">Revise identified weak topics →</Link></p>
    <p><Link href="/exam-readiness">View mastery and revision schedule →</Link></p>
   </>}
   <p><button type="button" className="btn btn-secondary" onClick={()=>{
    setExam(null);setGrades([]);setSummary("");setError("");setSavedAt(null);setPlanRefresh(v=>v+1);
   }}>Back to mock exams</button></p>
  </section>}
  {history.length>0&&<section className="card" style={{marginTop:20}}>
   <h2>Previous mock attempts</h2>
   {history.map(h=><p key={h.id}>
    <button type="button" className="btn btn-secondary" onClick={()=>openPrevious(h)}>
     {h.subject_name} · {new Date(h.started_at).toLocaleDateString()} ·
     {" "}{h.status==="submitted"?(h.total_score===null||h.total_score===undefined?
      "Submitted; grading pending":h.total_score+"/"+h.max_score):"In progress — continue"}
    </button>
   </p>)}
  </section>}
  <p style={{marginTop:20}}><Link href="/exam-readiness">Exam readiness dashboard →</Link></p>
 </main>;
}
