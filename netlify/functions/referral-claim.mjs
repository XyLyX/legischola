// Legacy Netlify endpoint retained as a compatibility alias. The Next.js
// referral route is the single authority for authentication, code policy,
// attribution and verified-payment boundaries.
export default async function(request){
 if(request.method!=="POST")return Response.json({error:"Method not allowed"},{status:405});
 const bearer=request.headers.get("authorization")||"";
 if(!bearer.startsWith("Bearer "))return Response.json({error:"Sign in required"},{status:401});
 try{
  const upstream=await fetch(new URL("/api/referral-claim",request.url),{
   method:"POST",
   headers:{"authorization":bearer,...(true?{"content-type":"application/json"}:{})},
   body:await request.text(),
   signal:AbortSignal.timeout(15000),
  });
  const result=await upstream.text();
  return new Response(result,{status:upstream.status,headers:{"content-type":"application/json","cache-control":"private, no-store"}});
 }catch{
  return Response.json({error:"Referral service temporarily unavailable"},{status:503,headers:{"cache-control":"no-store"}});
 }
}
