import "server-only";
import {createClient} from "@supabase/supabase-js";

/** Never trust a client-provided email or role for entitlement checks. */
export async function hasFoundingTesterAccess(userId:string):Promise<boolean>{
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw new Error("Entitlement service unavailable");
 const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:identity,error:identityError}=await admin.auth.admin.getUserById(userId);
 if(identityError||!identity?.user?.email)return false;
 const email=identity.user.email.trim().toLowerCase();
 if(!identity.user.email_confirmed_at)return false;
 const {data,error}=await admin.from("founding_tester_entitlements").select("access_level").eq("email_normalized",email).is("revoked_at",null).maybeSingle();
 if(error)throw new Error("Entitlement verification unavailable");
 return data?.access_level==="full_unmetered";
}
