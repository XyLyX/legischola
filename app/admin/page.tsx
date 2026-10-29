"use client";
import {useCallback,useEffect,useState,type FormEvent} from "react";
import Link from "next/link";
import {supabase} from "../../lib/supabase";

type Counts={
 totalUsers:number;new24h:number;new7d:number;verified:number;active7d:number;
 supportOpen:number;academicOpen:number;institutionPending:number;creditRequestsOpen:number;
 aiCalls24h:number;aiFailures24h:number;aiInputTokens24h:number;aiOutputTokens24h:number;
 referralRegistrations:number;totalOpenEnquiries:number;
};
type Student={
 id:string;name:string;email:string;verified:boolean;createdAt:string;lastSignIn:string|null;
 programme:string|null;institution:string|null;semester:number|null;tier:string;engaged7d:boolean;
};
type Overview={
 counts:Counts;tierCounts:Record<string,number>;users:Student[];page:number;pages:number;
 filteredTotal:number;accountsTruncated:boolean;asOf:string;admin:string;note:string;
 digestHistory:{report_date:string;status:string;sent_at:string|null}[];
 auditHistory:{action:string;target_type:string;created_at:string}[];
};
type Entry={
 source:"support"|"academic"|"institution";id:string;category:string;subject:string;
 status:string;createdAt:string;updatedAt:string;
};
type Inbox={entries:Entry[];openCount:number;mailConfigured:boolean;message:string};
type Message={id:string;sender_role?:string;body:string;created_at:string;delivery_status?:string};
type CaseDetail={
 source:"support"|"academic"|"institution";
 record:Record<string,unknown>;messages:Message[];academicReviewUrl?:string;
};
const pretty=(s:string)=>s.replaceAll("_"," ").replace(/\b\w/g,m=>m.toUpperCase());
const when=(s?:string|null)=>s?new Date(s).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"}):"—";
const tile=(label:string,value:number|string,description:string)=>
 <div className="card admin-metric-card">
  <span className="eyebrow admin-metric-label">{label}</span>
  <strong className="admin-metric-value">{value}</strong>
  <p className="muted admin-metric-caption">{description}</p>
 </div>;

export default function AdminDashboard(){
 const [tab,setTab]=useState<"overview"|"students"|"inbox"|"operations">("overview");
 const [overview,setOverview]=useState<Overview|null>(null),[inbox,setInbox]=useState<Inbox|null>(null);
 const [loading,setLoading]=useState(true),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const [q,setQ]=useState(""),[tier,setTier]=useState(""),[page,setPage]=useState(1);
 const [showResolved,setShowResolved]=useState(false);
 const [selected,setSelected]=useState<Entry|null>(null),[detail,setDetail]=useState<CaseDetail|null>(null);
 const [reply,setReply]=useState(""),[replyId,setReplyId]=useState(()=>crypto.randomUUID()),[action,setAction]=useState("needs_student"),[busy,setBusy]=useState(false);
 const [sourceFilter,setSourceFilter]=useState("all");
 const authFetch=useCallback(async (url:string,method="GET",body?:unknown)=>{
  if(!supabase)throw Error("Sign-in is unavailable");
  const {data:{session}}=await supabase.auth.getSession();
  if(!session)throw Error("Please sign in to a verified founder account");
  const r=await fetch(url,{method,cache:"no-store",headers:{
   Authorization:"Bearer "+session.access_token,
   ...(body?{"Content-Type":"application/json"}:{})
  },body:body?JSON.stringify(body):undefined});
  const result=await r.json().catch(()=>({}));
  if(!r.ok)throw Error(result.error||"Request failed");
  return result;
 },[]);
 const load=useCallback(async (p=page,search=q,level=tier)=>{
  setLoading(true);setError("");
  try{
   const query=new URLSearchParams({page:String(p),q:search,tier:level});
   const [stats,requests]=await Promise.all([
    authFetch("/api/admin/overview?"+query.toString()),
    authFetch("/api/admin/inbox")
   ]);
   setOverview(stats as Overview);setInbox(requests as Inbox);
  }catch(e){setError(e instanceof Error?e.message:"Admin dashboard unavailable")}
  finally{setLoading(false)}
 },[authFetch,page,q,tier]);
 useEffect(()=>{void load(1,"","")},[authFetch]);
 async function openCase(entry:Entry){
  if(selected?.id===entry.id&&selected.source===entry.source){setSelected(null);setDetail(null);return}
  setSelected(entry);setDetail(null);setReply("");setReplyId(crypto.randomUUID());setNotice("");
  try{
   const qs=new URLSearchParams({source:entry.source,id:entry.id});
   setDetail(await authFetch("/api/admin/inbox?"+qs.toString()) as CaseDetail);
  }catch(e){setError(e instanceof Error?e.message:"Unable to load enquiry")}
 }
 async function sendReply(e:FormEvent){
  e.preventDefault();
  if(!selected||reply.trim().length<8||busy)return;
  setBusy(true);setNotice("");setError("");
  try{
   if(selected.source==="academic"){
    const result=await authFetch("/api/academic-review/founder","POST",{caseId:selected.id,action,note:reply.trim()});
    setNotice(result.warning||"Academic response saved to the student's private review case.");
   }else{
    const result=await authFetch("/api/admin/inbox","POST",{
     source:selected.source,id:selected.id,requestId:replyId,message:reply.trim()
    });
    setNotice(result.message||"Reply recorded.");
   }
   setReply("");setReplyId(crypto.randomUUID());
   const qs=new URLSearchParams({source:selected.source,id:selected.id});
   const d=await authFetch("/api/admin/inbox?"+qs.toString());
   setDetail(d as CaseDetail);
   await load();
  }catch(e){setError(e instanceof Error?e.message:"Reply could not be delivered")}
  finally{setBusy(false)}
 }
 async function changeStatus(status:string){
  if(!selected||busy)return;setBusy(true);setNotice("");setError("");
  try{
   await authFetch("/api/admin/inbox","PATCH",{source:"support",id:selected.id,status});
   const qs=new URLSearchParams({source:"support",id:selected.id});
   setDetail(await authFetch("/api/admin/inbox?"+qs.toString()) as CaseDetail);
   setNotice("Support case status updated.");await load();
  }catch(e){setError(e instanceof Error?e.message:"Status could not be updated")}
  finally{setBusy(false)}
 }
 const entries=(inbox?.entries||[]).filter(e=>
  (sourceFilter==="all"||sourceFilter===e.source)&&
  (showResolved||!["resolved","rejected","verified"].includes(e.status)));
 return <main className="shell admin-dashboard" style={{maxWidth:1230,paddingTop:28,paddingBottom:75}}>
  <div className="eyebrow">LEGISCHOLA · RESTRICTED OPERATIONS</div>
  <header className="admin-dashboard-heading">
   <div className="admin-dashboard-intro">
    <h1>Admin Dashboard</h1>
    <p className="muted">Verified founder access only. Operational metrics and support correspondence; student learning notes remain private.</p>
   </div>
   <div className="admin-dashboard-actions">
    <Link className="btn btn-primary" href="/account/security">Set / change password</Link>
    <button type="button" className="btn btn-secondary" onClick={()=>void load()}>Refresh data</button>
   </div>
  </header>
  {error&&<section className="card" role="alert" style={{background:"#fff8ed",borderColor:"#e8c280",margin:"15px 0"}}>
   <strong>Access or service notice</strong><p>{error}</p>
   {error.toLowerCase().includes("founder")&&<p>Only a verified account with the server-assigned founder role can access the dashboard. No student account is upgraded automatically.</p>}
   <Link href="/login">Sign in</Link>
  </section>}
  {notice&&<p role="status" style={{padding:"10px 0",color:"#065f46"}}>{notice}</p>}
  {loading&&!overview?<p role="status">Checking private administrative access and compiling dashboard…</p>:overview&&<>
   <nav aria-label="Admin dashboard views" className="admin-view-tabs">
    {([["overview","Overview"],["students","Registered students"],["inbox",`Open enquiries (${inbox?.openCount||0})`],["operations","Daily updates & audit"]] as const)
     .map(([key,label])=><button type="button" key={key}
      aria-pressed={tab===key}
      className={"btn admin-view-tab "+(tab===key?"btn-primary":"btn-secondary")}
      onClick={()=>setTab(key)}>{label}</button>)}
   </nav>
   {tab==="overview"&&<>
    <div className="admin-metrics-grid">
     {tile("Registered users",overview.counts.totalUsers,"All Auth accounts")}
     {tile("New registrations",overview.counts.new24h,"Last 24 hours")}
     {tile("Active learners",overview.counts.active7d,"Students with learning sessions in 7 days")}
     <button type="button" className="card admin-metric-card admin-metric-card-action"
      onClick={()=>{setTab("inbox");setShowResolved(false);setSourceFilter("all")}}
      aria-label={`View ${overview.counts.totalOpenEnquiries} open enquiries`}>
      <span className="eyebrow admin-metric-label">Open enquiries</span>
      <strong className="admin-metric-value">{overview.counts.totalOpenEnquiries}</strong>
      <span className="muted admin-metric-caption">Click to inspect and reply →</span>
     </button>
     {tile("AI requests",overview.counts.aiCalls24h,"Recorded beta usage in 24 hours")}
     {tile("AI non-success",overview.counts.aiFailures24h,"Review recent outcomes")}
    </div>
    <div className="admin-overview-panels">
     <section className="card"><h2>Registrations by tier</h2>
      <p className="muted">Actual entitlement and verified-payment status; no guessed Plus/Pro memberships.</p>
      {Object.entries(overview.tierCounts).map(([label,n])=>
       <div key={label} style={{display:"flex",justifyContent:"space-between",gap:20,padding:"10px 0",borderBottom:"1px solid #e5e7eb"}}>
        <span>{label}</span><strong>{n}</strong>
       </div>)}
      <p><button type="button" className="btn btn-secondary" onClick={()=>setTab("students")}>View registered users</button></p>
     </section>
     <section className="card"><h2>Needs attention</h2>
      <div style={{display:"grid",gap:11}}>
       <button type="button" style={{textAlign:"left",border:0,background:"none",cursor:"pointer",padding:0,color:"inherit"}} onClick={()=>{setTab("inbox");setSourceFilter("support");setShowResolved(false)}}>
       <strong>{overview.counts.supportOpen}</strong> support cases →</button>
       <button type="button" style={{textAlign:"left",border:0,background:"none",cursor:"pointer",padding:0,color:"inherit"}} onClick={()=>{setTab("inbox");setSourceFilter("academic");setShowResolved(false)}}>
       <strong>{overview.counts.academicOpen}</strong> academic reviews →</button>
       <button type="button" style={{textAlign:"left",border:0,background:"none",cursor:"pointer",padding:0,color:"inherit"}} onClick={()=>{setTab("inbox");setSourceFilter("institution");setShowResolved(false)}}>
       <strong>{overview.counts.institutionPending}</strong> institution requests →</button>
       <span><strong>{overview.counts.creditRequestsOpen}</strong> unprocessed AI credit requests</span>
       <span><strong>{overview.counts.referralRegistrations}</strong> registered referrals</span>
      </div>
      <p><button type="button" className="btn btn-primary" onClick={()=>setTab("inbox")}>Open enquiry inbox</button></p>
      <p><Link href="/academic-review/founder">Academic approvals & evidence →</Link></p>
     </section>
    </div>
   </>}
   {tab==="students"&&<section className="card">
    <h2>Registered users <span className="muted" style={{fontSize:16}}>({overview.filteredTotal})</span></h2>
    <p className="muted">Account creation, verification and admission details; never includes student answers or private notes.</p>
    <form onSubmit={e=>{e.preventDefault();setPage(1);void load(1,q,tier)}} style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}>
     <input type="search" aria-label="Search student by name or email" placeholder="Search name or email" value={q} onChange={e=>setQ(e.target.value)} style={{padding:12,flex:"1 1 200px"}}/>
     <select aria-label="Filter by tier" value={tier} onChange={e=>{setTier(e.target.value);setPage(1);void load(1,q,e.target.value)}} style={{padding:12,flex:"1 1 190px"}}>
      <option value="">All tiers</option>{Object.keys(overview.tierCounts).map(t=><option key={t}>{t}</option>)}
     </select><button className="btn btn-primary" type="submit">Apply filters</button>
    </form>
    <div style={{overflowX:"auto"}}><table style={{width:"100%",minWidth:800,textAlign:"left",borderCollapse:"collapse"}}>
     <thead><tr>{["Student","Email / verification","Tier","Semester","Registered","Recent activity"].map(t=><th key={t} style={{padding:"11px 9px",borderBottom:"2px solid #cbd5e1"}}>{t}</th>)}</tr></thead>
     <tbody>{overview.users.map(u=><tr key={u.id} style={{borderBottom:"1px solid #e2e8f0"}}>
      <td style={{padding:"12px 9px"}}><strong>{u.name}</strong><div className="muted" style={{fontSize:12}}>{u.institution||"Institution not supplied"}</div></td>
      <td style={{padding:"12px 9px"}}>{u.email}<div style={{fontSize:12,color:u.verified?"#047857":"#9a3412"}}>{u.verified?"Email verified":"Unverified"}</div></td>
      <td style={{padding:"12px 9px"}}>{u.tier}</td>
      <td style={{padding:"12px 9px"}}>{u.semester??"—"}</td>
      <td style={{padding:"12px 9px"}}>{when(u.createdAt)}</td>
      <td style={{padding:"12px 9px"}}>{u.engaged7d?"Studied in past 7 days":"No recorded study session in past 7 days"}</td>
     </tr>)}</tbody>
    </table></div>
    {overview.users.length===0&&<p>No students match the filters.</p>}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,marginTop:14}}>
     <button disabled={overview.page<=1} className="btn btn-secondary" onClick={()=>{setPage(overview.page-1);void load(overview.page-1,q,tier)}}>Previous</button>
     <span>Page {overview.page} of {overview.pages}</span>
     <button disabled={overview.page>=overview.pages} className="btn btn-secondary" onClick={()=>{setPage(overview.page+1);void load(overview.page+1,q,tier)}}>Next</button>
    </div>
    {overview.accountsTruncated&&<p role="status">The account directory exceeded the current 5,000-account processing cap; totals are partial until reporting is scaled.</p>}
   </section>}
   {tab==="inbox"&&<section className="card">
    <h2>Enquiries and questions</h2>
    <p className="muted">Click any item to see the full enquiry, conversation and available reply or review actions.</p>
    <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",margin:"14px 0 20px"}}>
     <label>Source <select value={sourceFilter} onChange={e=>setSourceFilter(e.target.value)} style={{padding:9,marginLeft:8}}>
      <option value="all">All sources</option><option value="support">Public & student support</option><option value="academic">Academic review</option><option value="institution">Institution requests</option>
     </select></label>
     <label style={{display:"inline-flex",alignItems:"center",gap:8}}><input type="checkbox" checked={showResolved} onChange={e=>setShowResolved(e.target.checked)}/> Include closed</label>
     <span className="muted">Showing {entries.length} entries (latest 150 per source)</span>
    </div>
    <div style={{display:"grid",gap:10}}>
     {entries.map(entry=><div key={entry.source+entry.id} className="card" style={{padding:15,boxShadow:"none"}}>
      <button type="button" onClick={()=>void openCase(entry)} aria-expanded={selected?.id===entry.id}
       style={{display:"flex",justifyContent:"space-between",gap:12,width:"100%",textAlign:"left",background:"none",border:0,cursor:"pointer",padding:4,color:"inherit"}}>
       <span><strong>{entry.subject}</strong><span className="muted" style={{display:"block",fontSize:13}}>{pretty(entry.source)} · {pretty(entry.category)} · {when(entry.createdAt)}</span></span>
       <span style={{whiteSpace:"nowrap",fontWeight:700}}>{pretty(entry.status)} {selected?.id===entry.id?"▴":"▾"}</span>
      </button>
      {selected?.id===entry.id&&detail&&<div style={{marginTop:13,padding:12,background:"#f8fafc",borderRadius:10}}>
       <h3>Case details</h3>
       {Object.entries(detail.record).filter(([k])=>!["evidence","student_user_id","user_id"].includes(k)).map(([k,v])=>
        <p key={k} style={{margin:"5px 0",overflowWrap:"anywhere"}}><strong>{pretty(k)}:</strong> {typeof v==="string"?v:(v===null?"—":JSON.stringify(v))}</p>)}
       {detail.source==="academic"&&<>
        <p>For private PDF evidence and formal curriculum decisions, use <Link href="/academic-review/founder">Academic Review — Founder</Link>.</p>
        <p className="muted">AI recommendations are not automatically approved university sources.</p>
       </>}
       <h3 style={{marginTop:18}}>Conversation and replies</h3>
       {detail.messages.length===0?<p>No messages recorded.</p>:detail.messages.map(m=>
        <div key={m.id} style={{padding:"11px 13px",marginBottom:10,background:"#fff",border:"1px solid #e2e8f0",borderRadius:8}}>
         <div style={{display:"flex",gap:10,justifyContent:"space-between",flexWrap:"wrap"}}>
          <strong>{pretty(m.sender_role||"Admin reply")}</strong><small className="muted">{when(m.created_at)}{m.delivery_status&&" · "+pretty(m.delivery_status)}</small>
         </div>
         <p style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere",marginBottom:0}}>{m.body}</p>
        </div>)}
       {detail.source==="support"&&<div style={{display:"flex",flexWrap:"wrap",gap:10,margin:"12px 0"}}>
        {(["open","in_progress","waiting_for_sender","resolved"] as const).map(status=>
         <button key={status} type="button" disabled={busy||detail.record.status===status} onClick={()=>void changeStatus(status)} className="btn btn-secondary">{pretty(status)}</button>)}
       </div>}
       {!(detail.source==="academic"&&["resolved","rejected"].includes(String(detail.record.status)))&&<form onSubmit={e=>void sendReply(e)} style={{display:"grid",gap:10,marginTop:12}}>
        <label><strong>{detail.source==="academic"?"Reply or academic decision":"Email reply to the enquirer"}</strong>
         <textarea rows={5} minLength={8} maxLength={4000} required value={reply} onChange={e=>setReply(e.target.value)} placeholder="Write a clear, helpful response." style={{display:"block",width:"100%",padding:12,marginTop:6}}/>
        </label>
        {detail.source==="academic"&&<label>Academic action<select value={action} onChange={e=>setAction(e.target.value)} style={{display:"block",width:"100%",padding:10,marginTop:6}}>
         <option value="needs_student">Request evidence from student</option>
         <option value="founder_review">Continue reviewer discussion</option>
         <option value="resolved">Mark resolved</option>
         <option value="rejected">Reject with explanation</option>
        </select></label>}
        <p className="muted" style={{fontSize:13,margin:0}}>{detail.source==="academic"?"The response is stored in the private academic case.":"Email is sent using the configured Zoho integration. Unconfirmed deliveries are flagged for manual review, not automatically retried."}</p>
        <div><button disabled={busy||reply.trim().length<8} type="submit" className="btn btn-primary">{busy?"Sending…":detail.source==="academic"?"Save academic response":"Send email reply"}</button></div>
       </form>}
      </div>}
      {selected?.id===entry.id&&!detail&&<p role="status">Opening enquiry details…</p>}
     </div>)}
     {entries.length===0&&<p>No enquiries match this view.</p>}
    </div>
   </section>}
   {tab==="operations"&&<div className="feature-grid">
    <section className="card"><h2>Daily founder notification</h2>
     <p>Scheduled every day at <strong>8:00 AM Dubai time</strong>. Email is delivered only to registered, verified founder-role accounts. No student private conversations are included.</p>
     {overview.digestHistory.length===0?<p className="muted">No founder digest delivery has been recorded. Confirm a founder account and Zoho mail configuration.</p>:overview.digestHistory.map(h=>
      <p key={h.report_date}><strong>{h.report_date}</strong> — {pretty(h.status)}{h.sent_at&&" · "+when(h.sent_at)}</p>)}
     <p className="muted">Ambiguous delivery is held for manual review rather than retried automatically.</p>
    </section>
    <section className="card"><h2>AI usage and reliability (24h)</h2>
     <p><strong>{overview.counts.aiCalls24h}</strong> recorded AI usage events</p>
     <p><strong>{overview.counts.aiFailures24h}</strong> non-success outcomes</p>
     <p><strong>{overview.counts.aiInputTokens24h.toLocaleString("en-IN")}</strong> input tokens</p>
     <p><strong>{overview.counts.aiOutputTokens24h.toLocaleString("en-IN")}</strong> output tokens</p>
     <p><Link href="https://app.netlify.com/projects/legischola">Netlify deployments &amp; logs →</Link></p>
    </section>
    <section className="card"><h2>Recent admin audit events</h2>
     {overview.auditHistory.length===0?<p>No admin actions recorded yet.</p>:overview.auditHistory.map((e,i)=>
      <p key={e.created_at+i}><strong>{pretty(e.action)}</strong> ({e.target_type}) · {when(e.created_at)}</p>)}
    </section>
    <section className="card"><h2>Operational follow-ups</h2>
     <p><Link href="/academic-review/founder">Review private syllabus submissions</Link></p>
     <p><Link href="/contact">View public contact form</Link></p>
     <p><Link href="/referral">Referral programme</Link></p>
     <p><Link href="https://supabase.com/dashboard/project/ztfjrjviejtxubwvixsf">Supabase operations →</Link></p>
    </section>
   </div>}
   <p className="muted" style={{marginTop:22,fontSize:12}}>Last refreshed {when(overview.asOf)}. Snapshot counts use available persisted records; a lack of recorded AI usage is not evidence that no student opened the site. {overview.note}</p>
  </>}
 </main>;
}
