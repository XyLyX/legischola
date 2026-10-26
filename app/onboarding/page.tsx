"use client";
import { useState } from "react";
export default function Onboarding(){
 const [college,setCollege]=useState("");const [programme,setProgramme]=useState("BA LL.B.");const [year,setYear]=useState("2026");const [semester,setSemester]=useState("1");
 return <main style={{maxWidth:620,margin:"48px auto",padding:24}}><h1>Tell us about your law school</h1><p>We will match your institution, programme and admission batch to an evidence-checked curriculum.</p>
 <form onSubmit={e=>{e.preventDefault();alert("Profile preview only. Verified institution matching and account saving are coming next.");}}>
 <label>College or university<input required value={college} onChange={e=>setCollege(e.target.value)} placeholder="Search or type your institution" style={{display:"block",width:"100%",padding:12,margin:"8px 0 20px",boxSizing:"border-box"}} /></label>
 <label>Programme<select value={programme} onChange={e=>setProgramme(e.target.value)} style={{display:"block",width:"100%",padding:12,margin:"8px 0 20px"}}>{["BA LL.B.","BBA LL.B.","LL.B. (3-year)","B.Com LL.B.","Other"].map(x=><option key={x}>{x}</option>)}</select></label>
 <label>Admission year<input type="number" min="1990" max="2100" value={year} onChange={e=>setYear(e.target.value)} style={{display:"block",padding:12,margin:"8px 0 20px"}} /></label>
 <label>Semester<select value={semester} onChange={e=>setSemester(e.target.value)} style={{display:"block",padding:12,margin:"8px 0 20px"}}>{Array.from({length:10},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}</select></label>
 <button type="submit" style={{background:"#243c75",color:"white",border:0,padding:"14px 20px",borderRadius:8,cursor:"pointer"}}>Continue</button>
 </form><p style={{fontSize:13,color:"#64748b"}}>We never claim an unverified syllabus is official.</p></main>
}
