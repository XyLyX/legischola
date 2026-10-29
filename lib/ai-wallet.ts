import "server-only";
import {createClient} from "@supabase/supabase-js";

/** Trusted server-side wallet adapter. Never import in client components. */
function admin(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw new Error("AI wallet backend unavailable");
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
export async function reserveCredits(userId:string,requestId:string,feature:"tutor"|"research",credits:number){
 const {data,error}=await admin().rpc("legischola_credit_reserve",{p_user:userId,p_key:requestId,p_feature:feature,p_credits:credits});
 if(error)throw new Error("AI wallet reservation unavailable");
 return data===true;
}
export async function finishCredits(userId:string,requestId:string,success:boolean){
 const {data,error}=await admin().rpc("legischola_credit_finish",{p_user:userId,p_key:requestId,p_success:success});
 if(error||data!==true)throw new Error("AI wallet settlement unavailable");
}
