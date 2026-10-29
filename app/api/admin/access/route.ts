import {NextRequest,NextResponse} from "next/server";
import {verifiedFounder,noStore} from "@/lib/admin-server";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){
 try{
  const ctx=await verifiedFounder(req);
  return NextResponse.json({allowed:Boolean(ctx),role:ctx?"founder":null},
   {status:ctx?200:403,headers:noStore});
 }catch{
  return NextResponse.json({allowed:false},{status:503,headers:noStore});
 }
}
