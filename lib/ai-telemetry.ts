import "server-only";
import {createClient} from "@supabase/supabase-js";
/** Operational metadata only; never store prompts, responses or student answers. */
export async function recordAiUsage(input:{userId:string;requestId:string;feature:"tutor"|"research";unmetered:boolean;success:boolean;inputTokens?:number;outputTokens?:number}):Promise<void>{
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)return;
 const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {error}=await db.from("beta_ai_usage_events").upsert({user_id:input.userId,request_key:input.requestId,feature:input.feature,unmetered:input.unmetered,outcome:input.success?"success":"failed",input_tokens:input.inputTokens??null,output_tokens:input.outputTokens??null},{onConflict:"request_key"});
 if(error)console.error("Beta usage telemetry unavailable",error.code);
}
