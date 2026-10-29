import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
import {isReferralCode,referralPolicy} from "@/lib/referral-policy";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const reply=(body:Record<string,unknown>,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
/**
 * Register one referred account with one referring code. Payment is NOT
 * checked or simulated here; this never writes a reward or cash ledger.
 */
export async function POST(req:NextRequest){
 const token=req.headers.get("authorization")?.replace(/^Bearer\s+/i,"");
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!token)return reply({error:"Sign in to claim your invitation."},401);
 if(!url||!secret)return reply({error:"Referral service unavailable."},503);
 const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error:authError}=await admin.auth.getUser(token);
 if(authError||!user)return reply({error:"Invalid session."},401);
 if(!user.email_confirmed_at)return reply({error:"Verify your email before registering a referral."},403);
 const body=await req.json().catch(()=>null);
 const code=typeof body?.code==="string"?body.code.trim().toUpperCase():"";
 if(!isReferralCode(code))return reply({error:"Enter a valid LegiSchola invitation code."},400);
 const {data:existing,error:existingError}=await admin.from("referral_attributions")
  .select("referral_code_id").eq("referred_user_id",user.id).maybeSingle();
 if(existingError)return reply({error:"Referral service unavailable."},503);
 const {data:ref,error:refError}=await admin.from("referral_codes")
  .select("id,owner_user_id,created_at").eq("code",code).maybeSingle();
 if(refError||!ref)return reply({error:"This invitation code could not be found."},404);
 if(ref.owner_user_id===user.id)return reply({error:"You cannot refer yourself."},400);
 if(existing)return existing.referral_code_id===ref.id
  ?reply({ok:true,alreadyRecorded:true,message:"Your invitation was already registered. Rewards remain dependent on verified subscription payment."})
  :reply({error:"Your account has already registered a different referral code."},409);
 const createdAt=new Date(user.created_at).getTime();
 const age=Date.now()-createdAt;
 if(!Number.isFinite(createdAt)||age<0||age>referralPolicy.claimWindowDays*86400000){
  return reply({error:"Referral registration is available to newly created student accounts only."},409);
 }
 const {error:insertError}=await admin.from("referral_attributions")
  .insert({referred_user_id:user.id,referrer_user_id:ref.owner_user_id,referral_code_id:ref.id,status:"registered"});
 if(insertError){
  if(insertError.code==="23505")return reply({error:"A referral is already registered for your account."},409);
  return reply({error:"Your referral could not be saved. Please try again."},503);
 }
 return reply({ok:true,recorded:true,eligibleForReward:false,
  message:"Invitation registered. Both any referral reward and any welcome credit depend on a future first verified eligible subscription payment. No reward is earned during the payment-free beta."});
}
