import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
import {randomBytes} from "node:crypto";
import {hasFoundingTesterAccess} from "@/lib/founding-tester";
import {referralLink,referralPolicy} from "@/lib/referral-policy";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const noStore={"Cache-Control":"private, no-store"};
const json=(body:Record<string,unknown>,status=200)=>NextResponse.json(body,{status,headers:noStore});

// Codes and signup attribution are fully independent of payment. The
// referral reward ledger remains disabled until real paid conversion verifies.
export async function GET(req:NextRequest){
 const token=req.headers.get("authorization")?.replace(/^Bearer\s+/i,"");
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!token)return json({error:"Sign in to see your invitation code."},401);
 if(!url||!secret)return json({error:"Referral service unavailable."},503);
 const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error:authError}=await admin.auth.getUser(token);
 if(authError||!user)return json({error:"Sign in again to see your referral code."},401);
 if(!user.email||!user.email_confirmed_at)return json({error:"Confirm your email address before sharing an invitation.",code:null},403);
 const {data:existing,error:readError}=await admin.from("referral_codes")
  .select("code,reward_policy").eq("owner_user_id",user.id).maybeSingle();
 if(readError)return json({error:"Could not load your referral code."},503);
 const founding=await hasFoundingTesterAccess(user.id);
 const programme=founding?"founding_tester":"platform_credit";
 const respond=(code:string,policy:string)=>json({
  code,programme:policy,shareUrl:referralLink(code),
  rewardAfterVerifiedPaymentPaise:policy==="founding_tester"
    ?referralPolicy.foundingReferrerCashPaise:referralPolicy.standardReferrerCreditPaise,
  currency:"INR",earningsRequireVerifiedPayment:true,
  message:"Your invitation is active. Rewards are only earned after a qualifying verified first subscription payment.",
 });
 if(existing?.code)return respond(existing.code,existing.reward_policy);

 // The founding-tester reservation is verified against the server-side
 // entitlement record, never a display name, email supplied by the client or
 // an editable user_metadata claim.
 for(let attempt=0;attempt<4;attempt++){
  const code=founding
   ?referralPolicy.foundingTesterCode
   :"LS"+randomBytes(7).toString("hex").toUpperCase();
  const {error:insertError}=await admin.from("referral_codes")
   .insert({owner_user_id:user.id,code,reward_policy:programme});
  if(!insertError)return respond(code,programme);
  if(insertError.code!=="23505")return json({error:"Unable to issue your referral code."},503);
  const {data:owned}=await admin.from("referral_codes")
   .select("code,reward_policy").eq("owner_user_id",user.id).maybeSingle();
  if(owned?.code)return respond(owned.code,owned.reward_policy);
  // The founding code must never be reassigned to a different user.
  if(founding)return json({error:"The founding-tester invitation code needs administrator review."},409);
 }
 return json({error:"Referral code temporarily unavailable. Try again."},503);
}
