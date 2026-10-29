import {NextRequest,NextResponse} from "next/server";
import {verifiedFounder,noStore} from "@/lib/admin-server";
import {sendSupportReply,staffMailAvailable} from "@/lib/admin-email";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const respond=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:noStore});
const validUUID=(v:unknown):v is string=>typeof v==="string"&&/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(v);

export async function GET(req:NextRequest){
 let ctx;
 try{ctx=await verifiedFounder(req)}catch{return respond({error:"Admin backend unavailable"},503)}
 if(!ctx)return respond({error:"Verified founder access required"},403);
 const db=ctx.admin;
 const source=req.nextUrl.searchParams.get("source");
 const id=req.nextUrl.searchParams.get("id");
 if(source&&id){
  if(!validUUID(id))return respond({error:"Invalid enquiry ID"},400);
  if(source==="support"){
   const {data:record,error}=await db.from("support_cases")
    .select("id,contact_name,contact_email,student_user_id,category,subject,status,created_at,updated_at")
    .eq("id",id).maybeSingle();
   if(error||!record)return respond({error:"Enquiry not found"},404);
   const {data:messages,error:err}=await db.from("support_messages")
    .select("id,sender_role,body,delivery_status,created_at,sent_at")
    .eq("case_id",id).order("created_at",{ascending:true}).limit(250);
   if(err)return respond({error:"Unable to read enquiry conversation"},503);
   return respond({source,record,messages:messages||[]});
  }
  if(source==="academic"){
   const {data:record,error}=await db.from("academic_review_cases")
    .select("id,student_user_id,case_type,status,summary,evidence,agent_recommendation,founder_decision,created_at,updated_at")
    .eq("id",id).maybeSingle();
   if(error||!record)return respond({error:"Academic case not found"},404);
   const {data:messages,error:err}=await db.from("academic_case_messages")
    .select("id,sender_role,body,created_at").eq("case_id",id).order("created_at").limit(250);
   if(err)return respond({error:"Unable to read academic conversation"},503);
   return respond({source,record,messages:messages||[],academicReviewUrl:"/academic-review/founder"});
  }
  if(source==="institution"){
   const {data:record,error}=await db.from("institution_requests")
    .select("id,user_id,institution_name,city,state,institution_website,programme_name,notes,status,created_at,updated_at")
    .eq("id",id).maybeSingle();
   if(error||!record)return respond({error:"Institution request not found"},404);
   const {data:messages,error:err}=await db.from("admin_institution_replies")
    .select("id,body,delivery_status,created_at,sent_at")
    .eq("request_id",id).order("created_at").limit(250);
   if(err)return respond({error:"Unable to read correspondence"},503);
   const {data:{user}}=await db.auth.admin.getUserById(record.user_id);
   return respond({source,record:{...record,contact_email:user?.email||null},messages:messages||[]});
  }
  return respond({error:"Unknown enquiry source"},400);
 }
 const [s,a,i]=await Promise.all([
  db.from("support_cases").select("id,category,subject,status,contact_name,created_at,updated_at").order("created_at",{ascending:false}).limit(150),
  db.from("academic_review_cases").select("id,case_type,summary,status,created_at,updated_at").order("created_at",{ascending:false}).limit(150),
  db.from("institution_requests").select("id,institution_name,programme_name,status,created_at,updated_at").order("created_at",{ascending:false}).limit(150),
 ]);
 if(s.error||a.error||i.error)return respond({error:"Unable to load unified enquiry inbox"},503);
 const entries=[
  ...(s.data||[]).map(x=>({source:"support",id:x.id,category:x.category,subject:x.subject,
   status:x.status,createdAt:x.created_at,updatedAt:x.updated_at})),
  ...(a.data||[]).map(x=>({source:"academic",id:x.id,category:x.case_type,subject:x.summary,
   status:x.status,createdAt:x.created_at,updatedAt:x.updated_at})),
  ...(i.data||[]).map(x=>({source:"institution",id:x.id,category:"institution_request",
   subject:x.institution_name+(x.programme_name?" · "+x.programme_name:""),
   status:x.status,createdAt:x.created_at,updatedAt:x.updated_at})),
 ].sort((x,y)=>y.createdAt.localeCompare(x.createdAt));
 const open=entries.filter(x=>!["resolved","rejected","verified"].includes(x.status));
 return respond({entries,openCount:open.length,
  bySource:{support:(s.data||[]).length,academic:(a.data||[]).length,institution:(i.data||[]).length},
  mailConfigured:staffMailAvailable(),
  message:"Academic decisions remain in the existing founder review workflow. Institution replies acknowledge/review requests; they do not verify colleges."});
}

export async function POST(req:NextRequest){
 let ctx;
 try{ctx=await verifiedFounder(req)}catch{return respond({error:"Admin backend unavailable"},503)}
 if(!ctx)return respond({error:"Verified founder access required"},403);
 const data=await req.json().catch(()=>null);
 if(!data||!["support","institution"].includes(data.source)||!validUUID(data.id)||
    !validUUID(data.requestId)||typeof data.message!=="string"||
    data.message.trim().length<8||data.message.length>4000)return respond({error:"Invalid reply request"},400);
 if(!staffMailAvailable())return respond({error:"Outgoing Zoho email is not configured; reply not sent."},503);
 const db=ctx.admin,source=data.source,id=data.id,body=data.message.trim();
 const table=source==="support"?"support_messages":"admin_institution_replies";
 const tokenField=source==="support"?"case_id":"request_id";
 const {data:previous}=await db.from(table).select("id,delivery_status")
  .eq("client_request_id",data.requestId).maybeSingle();
 if(previous)return respond({ok:previous.delivery_status==="sent",status:previous.delivery_status,
  message:"This reply attempt has already been recorded. Check its delivery status; do not resend blindly."},previous.delivery_status==="sent"?200:409);
 let to:string,subject:string;
 if(source==="support"){
  const {data:c,error}=await db.from("support_cases").select("contact_email,subject,status").eq("id",id).maybeSingle();
  if(error||!c)return respond({error:"Support enquiry not found"},404);
  to=c.contact_email;subject=c.subject;
 }else{
  const {data:request,error}=await db.from("institution_requests")
   .select("user_id,institution_name").eq("id",id).maybeSingle();
  if(error||!request)return respond({error:"Institution request not found"},404);
  const {data:{user}}=await db.auth.admin.getUserById(request.user_id);
  if(!user?.email||!user.email_confirmed_at)return respond({error:"The requester does not have a verified reply address."},409);
  to=user.email;subject="Institution request — "+request.institution_name;
 }
 const insert=source==="support"
  ?{case_id:id,sender_role:"staff",sender_user_id:ctx.user.id,body,delivery_status:"sending",client_request_id:data.requestId}
  :{request_id:id,admin_user_id:ctx.user.id,body,delivery_status:"sending",client_request_id:data.requestId};
 const {data:record,error:insertError}=await db.from(table).insert(insert).select("id").single();
 if(insertError||!record)return respond({error:"Could not reserve a reply. Please refresh before trying again."},409);
 try{
  await sendSupportReply(to,subject,body,id);
 }catch{
  await db.from(table).update({delivery_status:"needs_review"}).eq("id",record.id);
  await db.from("admin_activity_log").insert({admin_user_id:ctx.user.id,action:"reply_delivery_uncertain",target_type:source,target_id:id,detail:{message_id:record.id}});
  return respond({error:"Email delivery is unconfirmed. Reply saved for manual review; do not resend automatically."},502);
 }
 const now=new Date().toISOString();
 const {error:saveError}=await db.from(table).update({delivery_status:"sent",sent_at:now}).eq("id",record.id);
 if(source==="support"){
  await db.from("support_cases").update({status:"waiting_for_sender",last_admin_reply_at:now,updated_at:now}).eq("id",id);
 }else{
  await db.from("institution_requests").update({status:"reviewing",updated_at:now}).eq("id",id).eq("status","pending");
 }
 await db.from("admin_activity_log").insert({admin_user_id:ctx.user.id,action:"reply_sent",target_type:source,target_id:id,detail:{message_id:record.id}});
 return respond({ok:true,status:saveError?"sent_logging_pending":"sent",
  message:saveError?"Email sent but the delivery audit could not be finalised; review manually.":"Email sent and reply recorded."});
}

export async function PATCH(req:NextRequest){
 let ctx;
 try{ctx=await verifiedFounder(req)}catch{return respond({error:"Admin backend unavailable"},503)}
 if(!ctx)return respond({error:"Verified founder access required"},403);
 const data=await req.json().catch(()=>null);
 if(data?.source!=="support"||!validUUID(data.id)||
    !["open","in_progress","waiting_for_sender","resolved"].includes(data.status))
  return respond({error:"Invalid status update"},400);
 const {data:updated,error}=await ctx.admin.from("support_cases")
  .update({status:data.status,updated_at:new Date().toISOString()})
  .eq("id",data.id).select("id,status").maybeSingle();
 if(error||!updated)return respond({error:"Status update failed"},503);
 await ctx.admin.from("admin_activity_log").insert({
  admin_user_id:ctx.user.id,action:"support_status_updated",target_type:"support",
  target_id:data.id,detail:{status:data.status},
 });
 return respond({ok:true,status:updated.status});
}
