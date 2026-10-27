import {admin,ready,send,escape} from "../../lib/guardian-mail.mjs";
export default async function(){
 if(!ready())return new Response("Email integration not configured",{status:503});
 const db=admin(),now=new Date(),previous=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()-1,1)),end=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),1)),period=previous.toISOString().slice(0,7);
 const {data:subs,error}=await db.from("guardian_subscriptions").select("student_id,guardian_email,report_period").eq("status","confirmed").limit(500);
 if(error)return new Response("Subscription query failed",{status:500});
 let sent=0,skipped=0,failed=0;
 for(const sub of subs||[]){
  if(sub.report_period===period){skipped++;continue;}
  const {data:p}=await db.from("student_profiles").select("display_name,guardian_email,guardian_updates_opt_in").eq("user_id",sub.student_id).maybeSingle();
  if(!p?.guardian_updates_opt_in||p.guardian_email?.trim().toLowerCase()!==sub.guardian_email.toLowerCase()){skipped++;continue;}
  const {count,error:countError}=await db.from("learning_sessions").select("id",{head:true,count:"exact"}).eq("user_id",sub.student_id).eq("status","completed").gte("completed_at",previous.toISOString()).lt("completed_at",end.toISOString());
  if(countError){failed++;continue;}
  const {data:claimed,error:claimError}=await db.from("guardian_subscriptions").update({report_period:period,updated_at:new Date().toISOString()}).eq("student_id",sub.student_id).eq("status","confirmed").neq("report_period",period).select("student_id").maybeSingle();
  // NULL report_period needs an explicit null-aware claim.
  let accepted=claimed;
  if(!accepted&&!claimError&&sub.report_period===null){const r=await db.from("guardian_subscriptions").update({report_period:period,updated_at:new Date().toISOString()}).eq("student_id",sub.student_id).eq("status","confirmed").is("report_period",null).select("student_id").maybeSingle();accepted=r.data;}
  if(!accepted){skipped++;continue;}
  try{await send(sub.guardian_email,"LegiSchola monthly study summary — "+period,'<p>Hello,</p><p>Here is the monthly LegiSchola study activity summary for '+escape(p.display_name||"your student")+'.</p><p><strong>Completed study sessions recorded in '+period+': '+Number(count||0)+'</strong></p><p>This is a count of recorded completed sessions, not a grade or an assessment of academic performance. No private tutor conversations or notes are included.</p><p>The student controls whether updates continue. For privacy queries contact privacy@legischola.com.</p>');const {error:recordError}=await db.from("guardian_subscriptions").update({last_report_at:new Date().toISOString()}).eq("student_id",sub.student_id).eq("report_period",period).eq("status","confirmed");if(recordError)console.error("Guardian monthly delivery recorded but timestamp update failed",{period,code:recordError.code});sent++;}
  catch(e){ // Preserve the claim: delivery may have succeeded despite a lost provider response. Never auto-resend an ambiguous failure.
   console.error("Guardian monthly delivery requires review",{period,errorType:e?.name||"Error"});failed++;
  }
 }
 return new Response(JSON.stringify({period,sent,skipped,failed,manualReviewRequired:failed>0}),{headers:{"Content-Type":"application/json"}});
}
export const config={schedule:"0 6 1 * *"};
