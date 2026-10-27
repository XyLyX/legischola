import {admin,response} from "../../lib/guardian-mail.mjs";
export default async function(request){
 if(request.method!=="POST")return response({error:"Method not allowed"},405);
 if(!process.env.SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY)return response({error:"Service unavailable"},503);
 const bearer=request.headers.get("authorization")||"";
 if(!bearer.startsWith("Bearer "))return response({error:"Sign in required"},401);
 const db=admin();const {data:{user},error:authError}=await db.auth.getUser(bearer.slice(7));
 if(authError||!user)return response({error:"Invalid session"},401);
 let body;try{body=await request.json()}catch{return response({error:"Invalid request"},400)}
 const code=String(body?.code||"").trim().toUpperCase();
 if(!/^LS[A-F0-9]{14}$/.test(code))return response({error:"Invalid referral code"},400);
 const {data:existing}=await db.from("referral_attributions").select("referral_code_id").eq("referred_user_id",user.id).maybeSingle();
 if(existing)return response({error:"Referral already recorded for this account"},409);
 const {data:ref,error:lookupError}=await db.from("referral_codes").select("id,owner_user_id").eq("code",code).maybeSingle();
 if(lookupError||!ref)return response({error:"Referral code not found"},404);
 if(ref.owner_user_id===user.id)return response({error:"You cannot use your own code"},400);
 const {error}=await db.from("referral_attributions").insert({referred_user_id:user.id,referrer_user_id:ref.owner_user_id,referral_code_id:ref.id,status:"registered"});
 if(error)return response({error:error.code==="23505"?"Referral already recorded":"Could not save referral"},error.code==="23505"?409:500);
 return response({ok:true,message:"Referral recorded. ₹25 credit is only awarded after your first verified eligible subscription payment."});
}
