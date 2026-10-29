import "server-only";
import {createClient, type SupabaseClient, type User} from "@supabase/supabase-js";
import type {NextRequest} from "next/server";

export type AdminContext={admin:SupabaseClient;user:User;email:string};
export function serviceClient():SupabaseClient{
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL;
 const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!secret)throw new Error("Admin backend unavailable");
 return createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
}
/** Fail closed: fresh Auth Admin identity read, never caller-provided metadata. */
export async function verifiedFounder(req:NextRequest):Promise<AdminContext|null>{
 const token=req.headers.get("authorization")?.replace(/^Bearer\s+/i,"");
 if(!token)return null;
 const admin=serviceClient();
 const {data:{user:sessionUser},error}=await admin.auth.getUser(token);
 if(error||!sessionUser)return null;
 const {data:{user},error:adminError}=await admin.auth.admin.getUserById(sessionUser.id);
 if(adminError||!user||!user.email_confirmed_at||
    user.app_metadata?.legischola_role!=="founder")return null;
 return {admin,user,email:(user.email||"").toLowerCase()};
}

export type DashboardUser={
 id:string;name:string;email:string;verified:boolean;createdAt:string;
 lastSignIn:string|null;programme:string|null;semester:number|null;
 institution:string|null;tier:string;engaged7d:boolean;
};
export type StudentProfileInfo={user_id:string;display_name:string|null;programme_id:string|null;college_id:string|null;semester:number|null};

export async function listAccountDirectory(admin:SupabaseClient,max=5000){
 const users:User[]=[];
 for(let page=1;page<=Math.ceil(max/500);page++){
  const {data,error}=await admin.auth.admin.listUsers({page,perPage:500});
  if(error)throw new Error("Unable to read account directory");
  const found=data?.users||[];
  users.push(...found);
  if(found.length<500)return {users,truncated:false};
 }
 return {users,truncated:true};
}
export const dateISO=(v:string|Date)=>new Date(v).toISOString();
export function safeName(user:User):string{
 const n=user.user_metadata?.full_name;
 return typeof n==="string"&&n.trim()?n.trim().slice(0,120):"Not supplied";
}
export const noStore={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
