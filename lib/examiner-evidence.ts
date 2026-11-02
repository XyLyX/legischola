import "server-only";
import type {SupabaseClient} from "@supabase/supabase-js";
import {makeExaminerPlan,type EvidenceUnit,type ExaminerPurpose,type EvidenceAttempt,type EvidenceProgress,type EvidenceInference} from "./examiner-planner";

export class ExaminerContextError extends Error {
 constructor(message:string,readonly status:number){super(message);}
}
export async function loadExaminerContext(
 admin:SupabaseClient,userId:string,semester:unknown,subjectCode:unknown,
 purpose:ExaminerPurpose,focusUnitId:unknown
){
 if(!Number.isInteger(semester)||(semester as number)<1||(semester as number)>10 ||
   typeof subjectCode!=="string"||!subjectCode.trim()||subjectCode.length>80)
  throw new ExaminerContextError("Choose a valid semester and subject",400);
 if(focusUnitId!==null&&focusUnitId!==undefined&&(
   typeof focusUnitId!=="string"||focusUnitId.length>100))
  throw new ExaminerContextError("Choose a valid syllabus topic",400);

 const {data:profile,error:profileError}=await admin.from("student_profiles")
  .select("semester,curriculum_version_id").eq("user_id",userId).maybeSingle();
 if(profileError)throw new ExaminerContextError("Unable to verify your academic profile",503);
 if(!profile?.curriculum_version_id||!profile.semester)
  throw new ExaminerContextError("Complete onboarding to assign your verified semester syllabus",409);
 if((semester as number)>profile.semester)
  throw new ExaminerContextError("Future semester assessments are unavailable until you reach that semester",403);
 const version=profile.curriculum_version_id;
 const {data:cv,error:versionError}=await admin.from("curriculum_versions")
  .select("verification_status,published_at").eq("id",version).maybeSingle();
 if(versionError||cv?.verification_status!=="verified"||!cv.published_at)
  throw new ExaminerContextError("Your assigned curriculum is awaiting verification and publication",409);
 const {data:registeredPaper,error:paperError}=await admin.from("curriculum_papers")
  .select("paper_type,subject_name").eq("curriculum_version_id",version)
  .eq("semester",semester).eq("paper_code",subjectCode).maybeSingle();
 if(paperError||!registeredPaper||!["taught","elective_option"].includes(registeredPaper.paper_type))
  throw new ExaminerContextError("Only your enrolled, taught subjects may be assessed",403);
 if(registeredPaper.paper_type==="elective_option"){
  const {data:choice,error:choiceError}=await admin.from("student_elective_choices")
   .select("paper_code").eq("user_id",userId).eq("curriculum_version_id",version)
   .eq("semester",semester).eq("paper_code",subjectCode).maybeSingle();
  if(choiceError||!choice)throw new ExaminerContextError("Select this elective in your semester workspace before testing",403);
 }
 const {data:units,error:unitsError}=await admin.from("curriculum_units")
  .select("id,unit_title,subject_name,subject_code,unit_number,outline")
  .eq("curriculum_version_id",version).eq("semester",semester)
  .eq("subject_code",subjectCode).order("unit_number").limit(20);
 if(unitsError)throw new ExaminerContextError("Unable to load verified syllabus units",503);
 if(!units?.length)throw new ExaminerContextError("No approved units are available for this subject",404);
 if(focusUnitId&&!units.some(u=>u.id===focusUnitId))
  throw new ExaminerContextError("The selected topic is outside this enrolled subject",403);
 const ids=units.map(u=>u.id);
 const [a,p,i]=await Promise.all([
  admin.from("study_assessment_attempts")
   .select("curriculum_unit_id,score,created_at,weak_concepts")
   .eq("user_id",userId).in("curriculum_unit_id",ids)
   .order("created_at",{ascending:false}).limit(500),
  admin.from("student_topic_progress").select("curriculum_unit_id,review_due_at,status")
   .eq("user_id",userId).in("curriculum_unit_id",ids),
  admin.from("revision_inferences").select("curriculum_unit_id,concept,status,priority")
   .eq("user_id",userId).eq("semester",semester).in("curriculum_unit_id",ids).limit(500),
 ]);
 if(a.error||p.error||i.error)
  throw new ExaminerContextError("Unable to verify historical learning evidence. No exam was generated.",503);
 const selectedUnits=focusUnitId?units.filter(u=>u.id===focusUnitId):units;
 const plan=makeExaminerPlan({
  units:selectedUnits as EvidenceUnit[],
  attempts:(a.data||[]) as EvidenceAttempt[],
  progress:(p.data||[]) as EvidenceProgress[],
  inferences:(i.data||[]) as EvidenceInference[],
  purpose,
 });
 return {semester:semester as number,version,registeredPaper,units,selectedUnits,plan};
}
