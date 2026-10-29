import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
import {revisionAgent} from "../../../lib/revision-agent";
export const runtime="nodejs";
const fail=(message:string,status=400)=>NextResponse.json({error:message},{status});
type Attempt={id:string;curriculum_unit_id:string;score:number;weak_concepts:string[]|null;created_at:string};
type Unit={id:string;semester:number;subject_code:string;subject_name:string;unit_title:string;curriculum_version_id:string};
export async function POST(req:NextRequest){
 try{
  const token=req.headers.get("authorization")?.replace(/^Bearer\s+/i,"");
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,service=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!token||!url||!key)return fail("Sign in required",401);
  const auth=createClient(url,key,{auth:{persistSession:false}});
  const {data:{user},error}=await auth.auth.getUser(token);
  if(error||!user)return fail("Invalid session",401);
  if(!service)return fail("Revision storage is unavailable",503);
  const admin=createClient(url,service,{auth:{persistSession:false}});
  const body=await req.json();
  if(body.action==="complete"){
   if(typeof body.taskId!=="string")return fail("Invalid task");
   const {data,error:e}=await admin.from("revision_tasks").update({status:"completed",completed_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",body.taskId).eq("user_id",user.id).select("id").maybeSingle();
   if(e)return fail("Unable to save revision",503);
   return data?NextResponse.json({completed:true}):fail("Revision task not found",404);
  }
  if(body.action!=="refresh"||!Number.isInteger(body.semester)||body.semester<1||body.semester>10)return fail("Invalid revision request");
  const semester=body.semester as number;
  const {data:profile}=await admin.from("student_profiles").select("semester,curriculum_version_id").eq("user_id",user.id).maybeSingle();
  if(!profile?.curriculum_version_id)return fail("Select a verified academic curriculum in onboarding before generating revision",409);
  // Prior-semester revision is allowed, but future semesters must not be silently assigned.
  if(semester>(profile.semester||1))return fail("Future-semester revision is not yet available",403);
  const {data:units,error:ue}=await admin.from("curriculum_units").select("id,semester,subject_code,subject_name,unit_title,curriculum_version_id").eq("curriculum_version_id",profile.curriculum_version_id).eq("semester",semester);
  if(ue)return fail("Curriculum unavailable",503);
  if(!units?.length)return NextResponse.json({created:0,updated:0,message:"No curriculum units are available for this semester yet."});
  const typed=units as Unit[], ids=typed.map(x=>x.id),byId=new Map(typed.map(x=>[x.id,x]));
  const [a,p,existing]=await Promise.all([
   admin.from("study_assessment_attempts").select("id,curriculum_unit_id,score,weak_concepts,created_at").eq("user_id",user.id).in("curriculum_unit_id",ids).order("created_at",{ascending:false}).limit(500),
   admin.from("student_topic_progress").select("curriculum_unit_id,review_due_at,status").eq("user_id",user.id).in("curriculum_unit_id",ids),
   admin.from("revision_inferences").select("id,source_attempt_id,concept,curriculum_unit_id,status").eq("user_id",user.id).eq("semester",semester)
  ]);
  if(a.error||p.error||existing.error)return fail("Unable to load performance history",503);
  const attempts=(a.data||[]) as Attempt[];
  const latest=new Map<string,Attempt>(),counts=new Map<string,number>();
  for(const item of attempts){counts.set(item.curriculum_unit_id,(counts.get(item.curriculum_unit_id)||0)+1);if(!latest.has(item.curriculum_unit_id))latest.set(item.curriculum_unit_id,item)}
  const existingKeys=new Set((existing.data||[]).map(x=>x.source_attempt_id+"|"+x.concept));
  const rows:{user_id:string;curriculum_unit_id:string;semester:number;subject_code:string;source_attempt_id:string|null;source_type:string;concept:string;finding:string;score:number|null;priority:number;status:string}[]=[];
  for(const unit of typed){
   const attempt=latest.get(unit.id);
   const progress=(p.data||[]).find(x=>x.curriculum_unit_id===unit.id);
   const due=Boolean(progress?.review_due_at&&new Date(progress.review_due_at).getTime()<=Date.now());
   if(!attempt&&!due)continue;
   if(attempt&&attempt.score>=8)continue;
   const concepts=attempt?.weak_concepts?.filter(x=>typeof x==="string"&&x.trim()).slice(0,4)||[];
   if(!concepts.length)concepts.push("General unit review");
   for(const concept of concepts){
    const name=concept.slice(0,150),key=(attempt?.id||"null")+"|"+name;
    if(existingKeys.has(key))continue;
    const score=attempt?.score??null;
    const priority=score!==null&&score<=4||((counts.get(unit.id)||0)>=3)?3:2;
    rows.push({user_id:user.id,curriculum_unit_id:unit.id,semester,subject_code:unit.subject_code,source_attempt_id:attempt?.id||null,source_type:attempt?"assessment":"progress",concept:name,finding:attempt?"Examiner recorded a score of "+score+"/10 and flagged this area for revision.":"A scheduled progress review is due.",score,priority,status:"open"});
   }
  }
  if(rows.length){const {error:ie}=await admin.from("revision_inferences").insert(rows);if(ie)return fail("Could not save Examiner inferences",503)}
  // Later strong assessments resolve earlier weak inferences for the same unit.
  const {data:inferences,error:re}=await admin.from("revision_inferences").select("id,curriculum_unit_id,concept,score,priority,status").eq("user_id",user.id).eq("semester",semester).limit(1000);
  if(re)return fail("Could not load revision inferences",503);
  let updated=0;
  for(const inf of inferences||[]){
   const newest=latest.get(inf.curriculum_unit_id);
   if(newest&&newest.score>=8&&inf.status!=="resolved"){
    const {error:err}=await admin.from("revision_inferences").update({status:"resolved",updated_at:new Date().toISOString()}).eq("id",inf.id).eq("user_id",user.id);
    if(!err){updated++;await admin.from("revision_tasks").update({status:"superseded",updated_at:new Date().toISOString()}).eq("inference_id",inf.id).eq("user_id",user.id).eq("status","pending");}
   }
  }
  const active=(inferences||[]).filter(x=>!(latest.get(x.curriculum_unit_id)?.score!>=8));
  const {data:oldTasks}=await admin.from("revision_tasks").select("inference_id,activity_type").eq("user_id",user.id).eq("semester",semester);
  const keys=new Set((oldTasks||[]).map(x=>x.inference_id+"|"+x.activity_type));
  const tasks:Record<string,unknown>[]=[];
  for(const inf of active.slice(0,100)){
   const unit=byId.get(inf.curriculum_unit_id);if(!unit)continue;
   const activities=revisionAgent({score:inf.score??6,concept:inf.concept,subject:unit.subject_name,unit:unit.unit_title,attemptCount:counts.get(unit.id)||0,due:false});
   for(const activity of activities){if(keys.has(inf.id+"|"+activity.type))continue;tasks.push({user_id:user.id,inference_id:inf.id,curriculum_unit_id:unit.id,semester,subject_code:unit.subject_code,title:activity.title,activity_type:activity.type,instructions:activity.instructions,priority:activity.priority,due_at:new Date(Date.now()+activity.delayDays*86400000).toISOString()})}
  }
  if(tasks.length){const {error:te}=await admin.from("revision_tasks").insert(tasks);if(te)return fail("Could not save revision plan",503)}
  return NextResponse.json({created:tasks.length,newInferences:rows.length,resolved:updated,historyAvailable:attempts.length>0,message:attempts.length?"Revision priorities updated from recorded Examiner and progress evidence.":"No assessed performance yet. Take a diagnostic assessment in Study to personalise your revision."});
 }catch{return fail("Revision Agent unavailable",500)}
}
