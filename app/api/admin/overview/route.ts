import {NextRequest,NextResponse} from "next/server";
import {verifiedFounder,listAccountDirectory,safeName,noStore,type DashboardUser} from "@/lib/admin-server";
export const runtime="nodejs";
export const dynamic="force-dynamic";

const respond=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:noStore});
const iso=(days:number)=>new Date(Date.now()-days*86400000).toISOString();

export async function GET(req:NextRequest){
 let ctx;
 try{ctx=await verifiedFounder(req)}catch{return respond({error:"Admin backend unavailable"},503)}
 if(!ctx)return respond({error:"Verified founder access required"},403);
 const db=ctx.admin;
 try{
  const [
   accounts,profilesR,subscriptionsR,entitlementsR,foundingR,
   programmesR,institutionsR,sessionsR,aiR,
   supportR,academicR,institutionRequestsR,aiRequestsR,referralR,digestR,auditR,
  ]=await Promise.all([
   listAccountDirectory(db),
   db.from("student_profiles").select("user_id,display_name,programme_id,college_id,semester").limit(5000),
   db.from("student_subscriptions").select("user_id,status,current_period_end,plan_id").limit(5000),
   db.from("subscription_entitlements").select("user_id,plan").limit(5000),
   db.from("founding_tester_entitlements").select("email_normalized").is("revoked_at",null).limit(1000),
   db.from("programmes").select("id,name,institution_id").limit(1000),
   db.from("institutions").select("id,name").limit(1000),
   db.from("learning_sessions").select("user_id,started_at").gte("started_at",iso(7)).limit(5000),
   db.from("beta_ai_usage_events").select("user_id,feature,outcome,input_tokens,output_tokens,recorded_at").gte("recorded_at",iso(1)).limit(5000),
   db.from("support_cases").select("id,status,created_at").limit(5000),
   db.from("academic_review_cases").select("id,status,created_at").limit(5000),
   db.from("institution_requests").select("id,status,created_at").limit(5000),
   db.from("ai_credit_requests").select("id,status,created_at").limit(5000),
   db.from("referral_attributions").select("id,created_at").limit(5000),
   db.from("admin_daily_digests").select("report_date,status,created_at,sent_at").eq("recipient_user_id",ctx.user.id).order("report_date",{ascending:false}).limit(5),
   db.from("admin_activity_log").select("action,target_type,created_at").order("created_at",{ascending:false}).limit(20),
  ]);
  for(const r of [profilesR,subscriptionsR,entitlementsR,foundingR,
    programmesR,institutionsR,sessionsR,aiR,supportR,academicR,
    institutionRequestsR,aiRequestsR,referralR,digestR,auditR]){
   if(r.error)throw new Error("Admin query failed: "+r.error.code);
  }
  const profiles=new Map((profilesR.data||[]).map(p=>[p.user_id,p]));
  const paid=new Map((subscriptionsR.data||[]).filter(s=>
   s.status==="active"&&(!s.current_period_end||new Date(s.current_period_end).getTime()>Date.now())
  ).map(s=>[s.user_id,s.plan_id]));
  const lifetime=new Set((entitlementsR.data||[]).filter(e=>e.plan==="lifetime_complimentary").map(e=>e.user_id));
  const founding=new Set((foundingR.data||[]).map(e=>e.email_normalized.toLowerCase()));
  const programmeNames=new Map((programmesR.data||[]).map(e=>[e.id,e.name]));
  const institutionNames=new Map((institutionsR.data||[]).map(e=>[e.id,e.name]));
  const engaged=new Set((sessionsR.data||[]).map(s=>s.user_id));
  const all:DashboardUser[]=accounts.users.map(u=>{
   const p=profiles.get(u.id);
   const verified=Boolean(u.email_confirmed_at);
   const tier= !verified?"Email unverified":
    founding.has((u.email||"").toLowerCase())?"Founding Tester":
    lifetime.has(u.id)?"Lifetime Complimentary":
    paid.has(u.id)?(
     paid.get(u.id)==="founding"?"Founding Student":
     paid.get(u.id)==="plus"?"Plus":
     paid.get(u.id)==="pro"?"Pro":
     "Verified Paid · plan unspecified"):
    "Free / Public Beta";
   return {
    id:u.id,name:p?.display_name||safeName(u),email:u.email||"",
    verified,createdAt:u.created_at,lastSignIn:u.last_sign_in_at||null,
    institution:p?.college_id?institutionNames.get(p.college_id)||"Not linked":null,
    programme:p?.programme_id?programmeNames.get(p.programme_id)||"Not linked":null,
    semester:p?.semester||null,tier,engaged7d:engaged.has(u.id),
   };
  }).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  const tierCounts=Object.fromEntries(
   ["Founding Tester","Lifetime Complimentary","Founding Student","Plus","Pro","Verified Paid · plan unspecified","Free / Public Beta","Email unverified"]
    .map(t=>[t,all.filter(u=>u.tier===t).length])
  );
  const q=(req.nextUrl.searchParams.get("q")||"").trim().toLowerCase().slice(0,100);
  const tierFilter=(req.nextUrl.searchParams.get("tier")||"").trim();
  const filtered=all.filter(u=>(!q||u.name.toLowerCase().includes(q)||u.email.toLowerCase().includes(q))&&(!tierFilter||u.tier===tierFilter));
  const page=Math.max(1,Math.min(10000,Number.parseInt(req.nextUrl.searchParams.get("page")||"1",10)||1));
  const pageSize=50;
  const aiEvents=aiR.data||[];
  const errors=aiEvents.filter(e=>!["success","completed","ok","allowed"].includes((e.outcome||"").toLowerCase()));
  const counts={
   totalUsers:all.length,new24h:all.filter(u=>u.createdAt>=iso(1)).length,
   new7d:all.filter(u=>u.createdAt>=iso(7)).length,
   verified:all.filter(u=>u.verified).length,active7d:engaged.size,
   supportOpen:(supportR.data||[]).filter(c=>c.status!=="resolved").length,
   academicOpen:(academicR.data||[]).filter(c=>!["resolved","rejected"].includes(c.status)).length,
   institutionPending:(institutionRequestsR.data||[]).filter(c=>!["verified","rejected"].includes(c.status)).length,
   creditRequestsOpen:(aiRequestsR.data||[]).filter(c=>["pending","requested"].includes(c.status)).length,
   aiCalls24h:aiEvents.length,aiFailures24h:errors.length,
   aiInputTokens24h:aiEvents.reduce((n,e)=>n+Number(e.input_tokens||0),0),
   aiOutputTokens24h:aiEvents.reduce((n,e)=>n+Number(e.output_tokens||0),0),
   referralRegistrations:(referralR.data||[]).length,
  };
  return respond({asOf:new Date().toISOString(),admin:ctx.email,
   counts:{...counts,totalOpenEnquiries:counts.supportOpen+counts.academicOpen+counts.institutionPending},
   tierCounts,users:filtered.slice((page-1)*pageSize,page*pageSize),
   page,pages:Math.max(1,Math.ceil(filtered.length/pageSize)),filteredTotal:filtered.length,
   accountsTruncated:accounts.truncated,
   digestHistory:digestR.data||[],auditHistory:auditR.data||[],
   note:"Paid plans are classified only from active, verified subscriptions with a reconciled plan_id. Unknown plans stay explicitly unclassified. Beta pricing alone never creates a paid tier."});
 }catch{
  return respond({error:"Admin metrics temporarily unavailable; no student records were modified."},503);
 }
}
