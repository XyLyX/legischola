import { createClient } from "@supabase/supabase-js";
import { createHash, randomBytes } from "node:crypto";
const env=(key)=>process.env[key];
export const ready=()=>["SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY","ZOHO_CLIENT_ID","ZOHO_CLIENT_SECRET","ZOHO_REFRESH_TOKEN","ZOHO_ACCOUNT_ID"].every(k=>Boolean(env(k)));
export const admin=()=>createClient(env("SUPABASE_URL"),env("SUPABASE_SERVICE_ROLE_KEY"),{auth:{persistSession:false,autoRefreshToken:false}});
export const digest=(token)=>createHash("sha256").update(token).digest("hex");
export const token=()=>randomBytes(32).toString("hex");
export const response=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store","Referrer-Policy":"no-referrer"}});
export async function send(to,subject,content){
 const region=env("ZOHO_ACCOUNTS_BASE")||"https://accounts.zoho.com";
 const auth=await fetch(region+"/oauth/v2/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({refresh_token:env("ZOHO_REFRESH_TOKEN"),client_id:env("ZOHO_CLIENT_ID"),client_secret:env("ZOHO_CLIENT_SECRET"),grant_type:"refresh_token"})});
 const a=await auth.json();if(!auth.ok||!a.access_token){console.error("Guardian Zoho OAuth failure",{httpStatus:auth.status,code:String(a.error||"unknown").slice(0,80)});throw Error("ZOHO_AUTH");}
 const base=env("ZOHO_MAIL_API_BASE")||"https://mail.zoho.com";
 const sent=await fetch(base+"/api/accounts/"+encodeURIComponent(env("ZOHO_ACCOUNT_ID"))+"/messages",{method:"POST",headers:{Authorization:"Zoho-oauthtoken "+a.access_token,"Content-Type":"application/json"},body:JSON.stringify({fromAddress:env("ZOHO_FROM_ADDRESS")||"noreply@legischola.com",toAddress:to,subject,content,mailFormat:"html"})});
 const body=await sent.json().catch(()=>({}));if(!sent.ok||(body.status?.code&&Number(body.status.code)!==200)){console.error("Guardian Zoho Mail rejection",{httpStatus:sent.status,code:String(body.status?.code||body.errorCode||"unknown").slice(0,80)});throw Error("ZOHO_SEND");}return body;
}
export const escape=(s)=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
