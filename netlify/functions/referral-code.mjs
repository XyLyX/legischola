import {admin,response} from "../../lib/guardian-mail.mjs";
import {randomBytes} from "node:crypto";
export default async function(request){
 if(request.method!=="POST")return response({error:"Method not allowed"},405);
 if(!process.env.SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY)return response({error:"Service unavailable"},503);
 const bearer=request.headers.get("authorization")||"";
 if(!bearer.startsWith("Bearer "))return response({error:"Sign in required"},401);
 const db=admin();
 const {data:{user},error:authError}=await db.auth.getUser(bearer.slice(7));
 if(authError||!user)return response({error:"Invalid session"},401);
 const {data:existing,error:readError}=await db.from("referral_codes").select("code").eq("owner_user_id",user.id).maybeSingle();
 if(readError)return response({error:"Could not load referral code"},500);
 if(existing)return response({code:existing.code});
 for(let i=0;i<3;i++){
  const code="LS"+randomBytes(7).toString("hex").toUpperCase();
  const {error}=await db.from("referral_codes").insert({owner_user_id:user.id,code,reward_policy:"platform_credit"});
  if(!error)return response({code});
  if(error.code==="23505"){
   const {data:owned}=await db.from("referral_codes").select("code").eq("owner_user_id",user.id).maybeSingle();
   if(owned)return response({code:owned.code});
   continue;
  }
  return response({error:"Unable to issue referral code"},500);
 }
 return response({error:"Unable to issue referral code"},503);
}
