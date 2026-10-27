import {admin,ready,digest,token,response,send,escape} from "../../lib/guardian-mail.mjs";
export default async function(req){
 if(req.method!=="POST")return response({error:"Method not allowed"},405);
 if(!ready())return response({error:"Guardian email service is not configured"},503);
 const jwt=(req.headers.get("authorization")||"").replace(/^Bearer /i,"");if(!jwt)return response({error:"Sign in required"},401);
 const db=admin();const {data:{user},error:authError}=await db.auth.getUser(jwt);if(authError||!user)return response({error:"Invalid session"},401);
 const {data:p}=await db.from("student_profiles").select("display_name,guardian_email,guardian_updates_opt_in").eq("user_id",user.id).maybeSingle();
 if(!p?.guardian_updates_opt_in||!p.guardian_email)return response({error:"Enable guardian sharing first"},400);
 const email=p.guardian_email.trim().toLowerCase();
 const {data:prior}=await db.from("guardian_subscriptions").select("guardian_email,status,created_at").eq("student_id",user.id).maybeSingle();
 if(prior?.status==="confirmed"&&prior.guardian_email.toLowerCase()===email)return response({message:"Guardian already confirmed"});
 if(prior?.status==="pending"&&prior.guardian_email.toLowerCase()===email&&Date.now()-new Date(prior.created_at).getTime()<300000)return response({error:"Please wait five minutes before retrying"},429);
 const secret=token(),expires=new Date(Date.now()+48*3600000).toISOString();
 const {error}=await db.from("guardian_subscriptions").upsert({student_id:user.id,guardian_email:email,status:"pending",confirmation_token_hash:digest(secret),confirmation_expires_at:expires,confirmed_at:null,last_report_at:null,report_period:null,created_at:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:"student_id"});
 if(error)return response({error:"Unable to create invitation"},500);
 const url="https://legischola.netlify.app/.netlify/functions/guardian-confirm?token="+encodeURIComponent(secret);
 try{await send(email,"Confirm LegiSchola guardian progress updates",'<p>Hello,</p><p>'+escape(p.display_name||"A LegiSchola student")+' has invited you to receive monthly academic progress summaries. This is optional.</p><p><a href="'+url+'">Confirm that you agree to receive updates</a></p><p>This link expires in 48 hours. If you did not expect this invitation, ignore this message. Private tutor conversations and notes are never shared.</p><p>Contact privacy@legischola.com with questions.</p>');}
 catch{return response({error:"Invitation could not be delivered; please retry later"},502);}
 return response({message:"Invitation sent. The guardian must confirm within 48 hours."});
}
