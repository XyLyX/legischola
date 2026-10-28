import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
import {hasFoundingTesterAccess} from "@/lib/founding-tester";
export const runtime="nodejs";
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const pub=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
export async function GET(req:NextRequest){
 const token=req.headers.get("authorization")?.replace(/^Bearer\s+/i,"");
 if(!token||!url||!pub||!secret)return NextResponse.json({error:"Sign in required"},{status:401});
 const client=createClient(url,pub,{auth:{persistSession:false}});
 const {data:{user},error}=await client.auth.getUser(token);
 if(error||!user)return NextResponse.json({error:"Invalid session"},{status:401});
 const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:existing}=await admin.from("referral_codes").select("code").eq("owner_user_id",user.id).limit(1).maybeSingle();
 if(existing?.code)return NextResponse.json({code:existing.code});
 const founding=await hasFoundingTesterAccess(user.id);
 if(!founding){
  // No paid student is eligible until payment verification is integrated and tested.
  return NextResponse.json({code:null,eligible:false,reason:"Your referral code activates after your first verified subscription payment."});
 }
 const code="LS"+crypto.randomUUID().replace(/-/g,"").slice(0,10).toUpperCase();
 const {data:created,error:insertError}=await admin.from("referral_codes").insert({owner_user_id:user.id,code,reward_policy:"founding_tester"}).select("code").single();
 if(insertError){const {data:retry}=await admin.from("referral_codes").select("code").eq("owner_user_id",user.id).limit(1).maybeSingle();if(retry?.code)return NextResponse.json({code:retry.code});return NextResponse.json({error:"Unable to issue referral code"},{status:503});}
 return NextResponse.json({code:created.code});
}
