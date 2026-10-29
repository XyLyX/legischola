import {NextRequest,NextResponse} from "next/server";
import {createHash} from "node:crypto";
import {serviceClient,noStore} from "@/lib/admin-server";
export const runtime="nodejs";
export const dynamic="force-dynamic";

const CATEGORIES=new Set(["general","technical","account","academic","partnership","feedback","other"]);
const reply=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:noStore});
const validEmail=(v:string)=>/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(v)&&v.length<=254;
export async function POST(req:NextRequest){
 const length=Number(req.headers.get("content-length")||0);
 if(length>12000)return reply({error:"Message too large."},413);
 const raw=await req.text();
 if(raw.length>12000)return reply({error:"Message too large."},413);
 let body:Record<string,unknown>;
 try{body=JSON.parse(raw)}catch{return reply({error:"Invalid request."},400)}
 if(body.company_website)return reply({ok:true,message:"Message received."},202);
 const name=typeof body.name==="string"?body.name.trim():"";
 const email=typeof body.email==="string"?body.email.trim().toLowerCase():"";
 const category=typeof body.category==="string"?body.category:"general";
 const subject=typeof body.subject==="string"?body.subject.trim():"";
 const message=typeof body.message==="string"?body.message.trim():"";
 if(name.length<2||name.length>120||!validEmail(email)||!CATEGORIES.has(category)||
    subject.length<5||subject.length>180||message.length<10||message.length>4000)
   return reply({error:"Check your name, email, subject and message lengths."},400);
 if(body.consent!==true)return reply({error:"Consent is required to use your contact details to respond."},400);
 try{
  const db=serviceClient();
  let userId:string|null=null;
  const token=req.headers.get("authorization")?.replace(/^Bearer\s+/i,"");
  if(token){
   const {data:{user}}=await db.auth.getUser(token);
   if(user?.email?.trim().toLowerCase()===email&&user.email_confirmed_at)userId=user.id;
  }
  // A server-held salt avoids storing raw IPs. Limiting by verified connection
  // address (when provided by Netlify) and email slows automated submissions.
  const ip=req.headers.get("x-nf-client-connection-ip");
  const secret=process.env.SUPABASE_SERVICE_ROLE_KEY||"";
  const sourceHash=createHash("sha256").update(secret+"|"+(ip||email)).digest("hex");
  const cutoff=new Date(Date.now()-15*60000).toISOString();
  const [{count:ipCount,error:ipError},{count:mailCount,error:mailError}]=await Promise.all([
   db.from("support_cases").select("id",{head:true,count:"exact"}).eq("source_hash",sourceHash).gte("created_at",cutoff),
   db.from("support_cases").select("id",{head:true,count:"exact"}).eq("contact_email",email).gte("created_at",cutoff),
  ]);
  if(ipError||mailError)return reply({error:"Contact service unavailable. Please email support@legischola.com."},503);
  if((ipCount||0)>=4||(mailCount||0)>=3)return reply({error:"Too many messages. Please try later or email support@legischola.com."},429);
  const {data:created,error}=await db.from("support_cases")
   .insert({student_user_id:userId,contact_name:name,contact_email:email,category,subject,source_hash:sourceHash})
   .select("id").single();
  if(error||!created)return reply({error:"Your message could not be recorded. Please try again."},503);
  const {error:messageError}=await db.from("support_messages").insert({
   case_id:created.id,sender_role:userId?"student":"visitor",
   sender_user_id:userId,body:message,delivery_status:"received",
  });
  if(messageError){
   // Do not leave an empty case appearing as a successful submission.
   await db.from("support_cases").delete().eq("id",created.id);
   return reply({error:"Your message could not be recorded. Please try again."},503);
  }
  return reply({ok:true,reference:created.id,
   message:"Your enquiry has been recorded. The LegiSchola team can reply to your email."},201);
 }catch{return reply({error:"Contact service unavailable. Please email support@legischola.com."},503)}
}
