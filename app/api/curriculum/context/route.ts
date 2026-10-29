import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
export const runtime="nodejs";
const err=(message:string,status:number)=>NextResponse.json({error:message},{status});
async function context(req:NextRequest){
 const token=req.headers.get("authorization")?.replace(/^Bearer\s+/i,"");
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!token||!url||!key)return null;
 const db=createClient(url,key,{global:{headers:{Authorization:"Bearer "+token}},auth:{persistSession:false}});
 const {data:{user},error}=await db.auth.getUser(token);
 if(error||!user)return null;
 const {data:profile}=await db.from("student_profiles").select("semester,curriculum_version_id,programme_id,admission_year").eq("user_id",user.id).maybeSingle();
 return {db,user,profile};
}
export async function GET(req:NextRequest){
 const ctx=await context(req);if(!ctx)return err("Sign in required",401);
 const {db,profile,user}=ctx;
 if(!profile?.curriculum_version_id)return err("No published curriculum is assigned. Update academic profile.",409);
 const {data:version}=await db.from("curriculum_versions").select("id,version_label,verification_status,published_at").eq("id",profile.curriculum_version_id).maybeSingle();
 if(!version||version.verification_status!=="verified"||!version.published_at)return err("Curriculum still pending verification",409);
 const semester=Number(req.nextUrl.searchParams.get("semester")||profile.semester);
 if(!Number.isInteger(semester)||semester<1||semester>10)return err("Invalid semester",400);
 const [papers,units,choices]=await Promise.all([
  db.from("curriculum_papers").select("paper_code,subject_name,paper_type,elective_group,source_page_start,source_page_end,source_discrepancy").eq("curriculum_version_id",version.id).eq("semester",semester).order("source_page_start"),
  db.from("curriculum_units").select("id,semester,subject_code,subject_name,unit_number,unit_title,outline").eq("curriculum_version_id",version.id).eq("semester",semester).order("subject_code").order("unit_number"),
  db.from("student_elective_choices").select("paper_code").eq("user_id",user.id).eq("curriculum_version_id",version.id).eq("semester",semester)
 ]);
 if(papers.error||units.error||choices.error)return err("Academic curriculum data could not be loaded",503);
 const chosen=new Set((choices.data||[]).map(c=>c.paper_code));
 const activeCodes=new Set((papers.data||[]).filter(p=>p.paper_type!=="elective_catalogue"&&(p.paper_type!=="elective_option"||chosen.has(p.paper_code))).map(p=>p.paper_code));
 return NextResponse.json({currentSemester:profile.semester,selectedSemester:semester,version:{id:version.id,label:version.version_label},papers:papers.data||[],units:(units.data||[]).filter(u=>activeCodes.has(u.subject_code)),choices:[...chosen],allowedSemesterEntry:semester<=profile.semester});
}
export async function POST(req:NextRequest){
 const ctx=await context(req);if(!ctx)return err("Sign in required",401);
 const {db,user,profile}=ctx;
 if(!profile?.curriculum_version_id)return err("Academic profile missing curriculum",409);
 const body=await req.json().catch(()=>null);
 const sem=body?.semester,code=body?.paperCode,action=body?.action;
 if(!Number.isInteger(sem)||sem<7||sem>9||sem>(profile.semester||1)||typeof code!=="string"||code.length>100||!["choose","remove"].includes(action))return err("Invalid elective selection",400);
 const {data:paper}=await db.from("curriculum_papers").select("paper_type,elective_group").eq("curriculum_version_id",profile.curriculum_version_id).eq("semester",sem).eq("paper_code",code).maybeSingle();
 if(paper?.paper_type!=="elective_option"||!paper.elective_group)return err("Elective not offered by your curriculum",400);
 const base=db.from("student_elective_choices");
 if(action==="remove"){
  const {error}=await base.delete().eq("user_id",user.id).eq("curriculum_version_id",profile.curriculum_version_id).eq("semester",sem).eq("paper_code",code);
  return error?err("Could not remove elective",503):NextResponse.json({ok:true});
 }
 const max=sem===9?3:1;
 const {count,error:countError}=await db.from("student_elective_choices").select("paper_code",{count:"exact",head:true}).eq("user_id",user.id).eq("curriculum_version_id",profile.curriculum_version_id).eq("semester",sem);
 if(countError)return err("Elective choices are temporarily unavailable",503);
 if((count||0)>=max)return err("Only "+max+" elective choice(s) allowed this semester. Remove an existing choice first.",409);
 const {error}=await base.insert({user_id:user.id,curriculum_version_id:profile.curriculum_version_id,semester:sem,elective_group:paper.elective_group,paper_code:code});
 return error?err("Could not save elective: "+error.message,409):NextResponse.json({ok:true});
}
