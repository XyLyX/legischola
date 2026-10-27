import {admin,response} from "../../lib/guardian-mail.mjs";
import {createHmac,timingSafeEqual} from "node:crypto";
export default async function(request){
 if(request.method!=="POST")return response({error:"Method not allowed"},405);
 const secret=process.env.RAZORPAY_WEBHOOK_SECRET;
 if(!secret||!process.env.SUPABASE_SERVICE_ROLE_KEY||!process.env.SUPABASE_URL)return response({error:"Webhook not configured"},503);
 const raw=await request.text();
 if(raw.length>1000000)return response({error:"Payload too large"},413);
 const signature=request.headers.get("x-razorpay-signature")||"";
 const expected=createHmac("sha256",secret).update(raw).digest("hex");
 const supplied=/^[0-9a-f]{64}$/i.test(signature)?Buffer.from(signature,"hex"):Buffer.alloc(0);
 const valid=supplied.length===32&&timingSafeEqual(supplied,Buffer.from(expected,"hex"));
 if(!valid)return response({error:"Invalid signature"},401);
 let event;try{event=JSON.parse(raw)}catch{return response({error:"Invalid JSON"},400)}
 const eventId=request.headers.get("x-razorpay-event-id");
 if(!eventId||eventId.length>200)return response({error:"Missing event ID"},400);
 const db=admin();
 const payment=event.payload?.payment?.entity;
 const subscription=event.payload?.subscription?.entity;
 const {error}=await db.from("payment_events").insert({provider:"razorpay",provider_event_id:eventId,provider_payment_id:payment?.id||null,provider_subscription_id:subscription?.id||payment?.subscription_id||null,event_type:String(event.event||"unknown"),payload:event});
 if(error){if(error.code==="23505")return response({ok:true,duplicate:true});return response({error:"Could not record payment event"},500)}
 // Event ingestion only: no entitlement or referral credit is granted until
 // the subscription mapping and independently verified payment state are enabled.
 return response({ok:true,recorded:true});
}
