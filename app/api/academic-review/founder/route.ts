import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
export const runtime="nodejs";
const deny=(msg:string,status:number)=>NextResponse.json({error:msg},{status});
async function founderContext(req:NextRequest){
 const token=req.headers.get("authorization")?.replace(/^Bearer\s+/i,"");
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!token||!url||!publishable||!secret)return null;
 const auth=createClient(url,publishable,{auth:{persistSession:false}});
 const {data:{user},error}=await auth.auth.getUser(token);
 if(error||!user||user.app_metadata?.legischola_role!=="founder")return null;
 return {user,admin:createClient(url,secret,{auth:{persistSession:false}})};
}
export async function GET(req:NextRequest){
 const ctx=await founderContext(req);if(!ctx)return deny("Founder authorisation required",403);
 const caseId=req.nextUrl.searchParams.get("caseId");
 if(caseId){
  const {data:academicCase,error:caseError}=await ctx.admin.from("academic_review_cases").select("id,student_user_id,status,evidence,summary,agent_recommendation").eq("id",caseId).maybeSingle();
  if(caseError||!academicCase)return deny("Academic request not found",404);
  const {data:messages,error:msgError}=await ctx.admin.from("academic_case_messages").select("id,sender_role,body,created_at").eq("case_id",caseId).order("created_at");
  if(msgError)return deny("Unable to read case messages",503);
  let documentUrl:string|null=null;
  const ev=academicCase.evidence as {storage_bucket?:string;storage_path?:string}|null;
  if(ev?.storage_bucket==="legischola-student-syllabi"&&typeof ev.storage_path==="string"&&ev.storage_path.startsWith(academicCase.student_user_id+"/")){
   const {data}=await ctx.admin.storage.from(ev.storage_bucket).createSignedUrl(ev.storage_path,300);
   documentUrl=data?.signedUrl||null;
  }
  return NextResponse.json({case:academicCase,messages:messages||[],documentUrl});
 }
 const {data,error}=await ctx.admin.from("academic_review_cases").select("id,student_user_id,case_type,status,summary,evidence,agent_recommendation,founder_decision,created_at,updated_at").order("created_at",{ascending:false}).limit(100);
 if(error)return deny("Academic review queue unavailable",503);
 return NextResponse.json({cases:data||[]});
}
export async function POST(req:NextRequest){
 const ctx=await founderContext(req);if(!ctx)return deny("Founder authorisation required",403);
 const body=await req.json().catch(()=>null);
 const caseId=body?.caseId,action=body?.action,note=body?.note;
 if(typeof caseId!=="string"||typeof note!=="string"||note.trim().length<8||note.length>4000||!["needs_student","resolved","rejected","founder_review"].includes(action))return deny("Invalid academic decision",400);
 const {data:existing}=await ctx.admin.from("academic_review_cases").select("id,status").eq("id",caseId).maybeSingle();
 if(!existing)return deny("Case unavailable",404);
 if(["resolved","rejected"].includes(existing.status))return deny("This case is already finalised",409);
 const {data:updated,error}=await ctx.admin.from("academic_review_cases").update({status:action,founder_decision:note.trim(),updated_at:new Date().toISOString()}).eq("id",caseId).eq("status",existing.status).select("id,status").maybeSingle();
 if(error||!updated)return deny("Case changed; refresh before deciding",409);
 const {error:messageError}=await ctx.admin.from("academic_case_messages").insert({case_id:caseId,sender_role:"founder",sender_user_id:ctx.user.id,body:note.trim()});
 if(messageError)return NextResponse.json({ok:true,status:updated.status,warning:"Decision saved but student-visible message could not be saved. Contact support."});
 return NextResponse.json({ok:true,status:updated.status});
}
