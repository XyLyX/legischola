import {admin,ready,send,escape} from "../../lib/guardian-mail.mjs";

const dateInDubai=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Dubai",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
const since24h=()=>new Date(Date.now()-86400000).toISOString();
const count=async(db,table,filter)=>{
 let q=db.from(table).select("id",{head:true,count:"exact"});
 q=filter(q);
 const {count:value,error}=await q;
 if(error)throw Error("Metric unavailable: "+table);
 return value||0;
};
const html=(x)=>escape(String(x));
async function accountTotals(db,cutoff){
 let total=0,new24h=0;
 for(let page=1;page<=20;page++){
  const {data,error}=await db.auth.admin.listUsers({page,perPage:500});
  if(error)throw Error("Account registry unavailable");
  const users=data?.users||[];
  total+=users.length;
  new24h+=users.filter(u=>u.created_at>=cutoff).length;
  if(users.length<500)return {total,new24h,truncated:false};
 }
 return {total,new24h,truncated:true};
}
export default async function(){
 if(!ready())return new Response("Daily admin digest mail integration unavailable",{status:503});
 const db=admin();
 const cutoff=since24h();
 const date=dateInDubai();
 let founders=[];
 for(let page=1;page<=20;page++){
  const {data,error}=await db.auth.admin.listUsers({page,perPage:500});
  if(error)return new Response("Account directory unavailable",{status:503});
  const users=data?.users||[];
  founders.push(...users.filter(u=>u.email&&u.email_confirmed_at&&u.app_metadata?.legischola_role==="founder"));
  if(users.length<500)break;
 }
 if(founders.length===0)return new Response(JSON.stringify({date,status:"awaiting_verified_founder_account",sent:0}),{
  status:200,headers:{"content-type":"application/json","cache-control":"no-store"}
 });
 let metrics;
 try{
  const [users,supportOpen,academicOpen,institutionOpen,aiFailures,aiCalls,foundationUpdates]=await Promise.all([
   accountTotals(db,cutoff),
   count(db,"support_cases",q=>q.neq("status","resolved")),
   count(db,"academic_review_cases",q=>q.not("status","in",'("resolved","rejected")')),
   count(db,"institution_requests",q=>q.not("status","in",'("verified","rejected")')),
   count(db,"beta_ai_usage_events",q=>q.gte("recorded_at",cutoff).not("outcome","in",'("success","completed","ok","allowed")')),
   count(db,"beta_ai_usage_events",q=>q.gte("recorded_at",cutoff)),
   count(db,"curriculum_versions",q=>q.gte("created_at",cutoff)),
  ]);
  metrics={users,supportOpen,academicOpen,institutionOpen,aiFailures,aiCalls,foundationUpdates};
 }catch{return new Response("Digest metrics unavailable",{status:503})}
 let sent=0,manualReview=0,skipped=0;
 for(const founder of founders){
  const {error:claimError}=await db.from("admin_daily_digests").insert({
   report_date:date,recipient_user_id:founder.id,recipient_email:founder.email,status:"sending"
  });
  if(claimError){
   if(claimError.code==="23505"){skipped++;continue;}
   manualReview++;continue;
  }
  const lines=[
   ["Total registered accounts",metrics.users.total+(metrics.users.truncated?" (first 10,000)":"")],
   ["New registrations (24h)",metrics.users.new24h],
   ["Open public/student enquiries",metrics.supportOpen],
   ["Open academic-review cases",metrics.academicOpen],
   ["Pending college/institution requests",metrics.institutionOpen],
   ["AI requests recorded (24h)",metrics.aiCalls],
   ["AI non-success outcomes (24h)",metrics.aiFailures],
   ["Curriculum versions created (24h)",metrics.foundationUpdates],
  ];
  const rows=lines.map(([key,value])=>"<tr><td style='padding:8px 14px;border-bottom:1px solid #eee'>"+html(key)+"</td><td style='padding:8px 14px;border-bottom:1px solid #eee'><b>"+html(value)+"</b></td></tr>").join("");
  const body="<p>Hello,</p><p>Here is the daily LegiSchola founder operations briefing for <strong>"+html(date)+" (Dubai)</strong>.</p>"+
   "<table style='border-collapse:collapse'>"+rows+"</table>"+
   "<p><a href='https://legischola.com/admin'>Open restricted LegiSchola Admin Dashboard</a></p>"+
   "<p style='color:#64748b'>Contains operational counts only; no private student learning notes or conversations. Delivery is once per Dubai calendar date. Recorded AI non-success outcomes are not necessarily server outages.</p>";
  try{
   await send(founder.email,"LegiSchola daily operations — "+date,body);
   const {error}=await db.from("admin_daily_digests").update({status:"sent",sent_at:new Date().toISOString()})
    .eq("report_date",date).eq("recipient_user_id",founder.id).eq("status","sending");
   if(error)manualReview++;else sent++;
  }catch{
   // Ambiguous email-provider failures must never auto-retry.
   await db.from("admin_daily_digests").update({status:"needs_review"})
    .eq("report_date",date).eq("recipient_user_id",founder.id);
   manualReview++;
  }
 }
 return new Response(JSON.stringify({date,sent,skipped,manualReviewRequired:manualReview>0,manualReview}),{
  headers:{"content-type":"application/json","cache-control":"no-store"}
 });
}
/** 04:00 UTC = 08:00 Gulf Standard Time (Dubai), daily. */
export const config={schedule:"0 4 * * *"};
