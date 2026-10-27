import {admin,ready,digest,escape} from "./guardian-shared.mjs";
export default async function(req){
 const html=(message,status=200)=>new Response('<!doctype html><html><head><meta name="referrer" content="no-referrer"><title>LegiSchola guardian confirmation</title></head><body style="font:18px system-ui;max-width:640px;margin:80px auto;padding:24px"><h1>LegiSchola</h1><p>'+escape(message)+'</p></body></html>',{status,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store","Referrer-Policy":"no-referrer"}});
 if(req.method!=="GET")return html("Method not allowed",405);
 if(!ready())return html("Confirmation is temporarily unavailable",503);
 const t=new URL(req.url).searchParams.get("token")||"";if(!/^[a-f0-9]{64}$/.test(t))return html("Invalid or expired confirmation link",400);
 const db=admin(),now=new Date().toISOString(),hash=digest(t);
 const {data:sub}=await db.from("guardian_subscriptions").select("student_id,guardian_email").eq("confirmation_token_hash",hash).eq("status","pending").gt("confirmation_expires_at",now).maybeSingle();
 if(!sub)return html("This confirmation link has expired or was already used",400);
 const {data:p}=await db.from("student_profiles").select("guardian_email,guardian_updates_opt_in").eq("user_id",sub.student_id).maybeSingle();
 if(!p?.guardian_updates_opt_in||p.guardian_email?.trim().toLowerCase()!==sub.guardian_email.toLowerCase())return html("The student has withdrawn or changed permission. No updates will be sent.",403);
 const {data:updated,error}=await db.from("guardian_subscriptions").update({status:"confirmed",confirmation_token_hash:null,confirmation_expires_at:null,confirmed_at:now,updated_at:now}).eq("student_id",sub.student_id).eq("confirmation_token_hash",hash).eq("status","pending").select("student_id").maybeSingle();
 if(error||!updated)return html("This confirmation link could not be completed",409);
 return html("Thank you. You have confirmed your choice to receive occasional academic progress summaries. The student may disable sharing at any time.");
}
