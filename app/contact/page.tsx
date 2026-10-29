"use client";
import {useState,type FormEvent} from "react";
import Link from "next/link";
import {supabase} from "../../lib/supabase";

const categories=[
 ["general","General question"],["technical","Technical problem"],["account","Account and access"],
 ["academic","Syllabus or learning enquiry"],["partnership","College or partnership"],["feedback","Beta feedback"],["other","Other"]
] as const;
export default function Contact(){
 const [name,setName]=useState(""),[email,setEmail]=useState(""),[category,setCategory]=useState("general");
 const [subject,setSubject]=useState(""),[message,setMessage]=useState(""),[consent,setConsent]=useState(false);
 const [companyWebsite,setCompanyWebsite]=useState("");
 const [busy,setBusy]=useState(false),[status,setStatus]=useState(""),[reference,setReference]=useState("");
 async function submit(e:FormEvent){
  e.preventDefault();if(busy)return;setBusy(true);setStatus("");
  try{
   const session=await supabase?.auth.getSession();
   const bearer=session?.data.session?.access_token;
   const r=await fetch("/api/enquiries",{
    method:"POST",headers:{"content-type":"application/json",...(bearer?{authorization:"Bearer "+bearer}:{})},
    body:JSON.stringify({name,email,category,subject,message,consent,company_website:companyWebsite}),
   });
   const data=await r.json();
   if(!r.ok)throw Error(data.error||"Could not submit your enquiry");
   setReference(data.reference||"");setMessage("");setSubject("");setStatus(data.message||"Message sent.");
  }catch(e){setStatus(e instanceof Error?e.message:"Submission failed")}
  finally{setBusy(false)}
 }
 return <main className="shell" style={{maxWidth:850,paddingTop:36,paddingBottom:64}}>
  <div className="eyebrow">LEGISCHOLA · HELP AND FEEDBACK</div>
  <h1>Contact the LegiSchola team</h1>
  <p>Questions from students, parents, educators, colleges and beta visitors are welcome. You do not need an account. For a private university syllabus correction or PDF upload, use <Link href="/academic-review">Academic Review</Link> after signing in.</p>
  <section className="card" style={{marginTop:24}}>
   <form onSubmit={e=>void submit(e)} style={{display:"grid",gap:17}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14}}>
     <label>Full name<input required minLength={2} maxLength={120} value={name} onChange={e=>setName(e.target.value)} style={{display:"block",width:"100%",padding:11,marginTop:6}}/></label>
     <label>Email for our reply<input required type="email" maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} style={{display:"block",width:"100%",padding:11,marginTop:6}}/></label>
    </div>
    <label>What is your enquiry about?<select value={category} onChange={e=>setCategory(e.target.value)} style={{display:"block",width:"100%",padding:11,marginTop:6}}>{categories.map(([key,title])=><option key={key} value={key}>{title}</option>)}</select></label>
    <label>Subject<input required minLength={5} maxLength={180} value={subject} onChange={e=>setSubject(e.target.value)} style={{display:"block",width:"100%",padding:11,marginTop:6}}/></label>
    <label>How can we help?<textarea required minLength={10} maxLength={4000} rows={6} value={message} onChange={e=>setMessage(e.target.value)} style={{display:"block",width:"100%",padding:12,marginTop:6}} placeholder="Describe your question without passwords, private credentials or sensitive student records."/></label>
    <div style={{position:"absolute",height:0,overflow:"hidden"}} aria-hidden="true">
     <label>Company website<input type="text" tabIndex={-1} autoComplete="off" value={companyWebsite} onChange={e=>setCompanyWebsite(e.target.value)}/></label>
    </div>
    <label style={{display:"flex",alignItems:"flex-start",gap:10}}>
     <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} required style={{marginTop:5}}/>
     <span>I agree to LegiSchola using the information I provide to handle this enquiry and reply to me, as explained in the <Link href="/privacy">Privacy Notice</Link>.</span>
    </label>
    <div><button className="btn btn-primary" type="submit" disabled={busy||!consent}>{busy?"Submitting…":"Submit enquiry"}</button></div>
    {status&&<p role={reference?"status":"alert"}>{status}{reference&&<> Your reference is <code>{reference}</code>.</>}</p>}
   </form>
  </section>
  <p className="muted" style={{marginTop:20}}>Alternatively, email <a href="mailto:support@legischola.com">support@legischola.com</a>. Messages sent directly by email are handled in the support mailbox; this dashboard currently tracks enquiries submitted through the form.</p>
 </main>;
}
